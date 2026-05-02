import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter as firestoreStartAfter,
  serverTimestamp, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore'
import { db } from '@otto/shared-firebase'
import { createTypedConverter } from '@otto/shared-firebase'
import type { ILogbook } from '../types'
import type { LogbookFilters } from '../hooks/useLogbookEntries'

const COLLECTION = 'logbooks'

export class LogbookService {
  private converter = createTypedConverter<ILogbook>()
  private col       = collection(db, COLLECTION).withConverter(this.converter)

  async listByOwner(
    ownerUid: string,
    pageSize = 20,
    afterCursor?: string,
    filters: LogbookFilters = {},
  ): Promise<{ entries: ILogbook[]; nextCursor: string | null }> {
    let q = query(
      this.col,
      where('ownerUid', '==', ownerUid),
      orderBy('surgeryDate', 'desc'),
      limit(pageSize),
    )
    if (filters.subspecialty) q = query(q, where('subspecialty', '==', filters.subspecialty))
    if (filters.surgeonRole)  q = query(q, where('surgeonRole',  '==', filters.surgeonRole))
    if (filters.isDraft !== undefined) q = query(q, where('isDraft', '==', filters.isDraft))

    if (afterCursor) {
      const pivot = await getDoc(doc(this.col, afterCursor))
      if (pivot.exists()) q = query(q, firestoreStartAfter(pivot))
    }

    const snap = await getDocs(q)
    let entries = snap.docs.map(d => d.data())

    // Filtro client-side de busca textual (procedureName)
    if (filters.search?.trim()) {
      const q2 = filters.search.toLowerCase()
      entries = entries.filter(e =>
        e.procedureName.toLowerCase().includes(q2) ||
        e.institutionName.toLowerCase().includes(q2),
      )
    }

    return {
      entries,
      nextCursor: snap.docs.length === pageSize ? (snap.docs[snap.docs.length - 1]?.id ?? null) : null,
    }
  }

  async getById(id: string): Promise<ILogbook | null> {
    const snap = await getDoc(doc(this.col, id))
    return snap.exists() ? snap.data() : null
  }

  async create(
    data: Omit<ILogbook, 'id' | 'createdAt' | 'updatedAt' | 'version'>,
  ): Promise<string> {
    const ref = await addDoc(this.col, {
      ...data,
      createdAt:  serverTimestamp() as unknown as Date,
      updatedAt:  serverTimestamp() as unknown as Date,
      version:    1,
      syncStatus: 'synced',
    } as ILogbook)
    return ref.id
  }

  async update(id: string, data: Partial<ILogbook>): Promise<void> {
    await updateDoc(doc(this.col, id), {
      ...data,
      updatedAt: serverTimestamp(),
      version:   (data.version ?? 0) + 1,
    })
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.col, id))
  }

  async saveDraft(id: string | undefined, data: Partial<ILogbook>): Promise<string> {
    if (id) {
      await this.update(id, { ...data, isDraft: true })
      return id
    }
    return this.create({ ...data, isDraft: true } as ILogbook)
  }

  async duplicate(id: string, ownerUid: string): Promise<string> {
    const original = await this.getById(id)
    if (!original) throw new Error('Registro não encontrado.')
    const { id: _id, createdAt: _c, updatedAt: _u, imageIds: _i, voiceTranscript: _v, ...rest } = original
    return this.create({ ...rest, ownerUid, isDraft: true, imageIds: [] })
  }

  // ── Exportação ────────────────────────────────────────────────────────────

  /** Busca TODOS os registros publicados do usuário (sem paginação) para exportação. */
  async listAllForExport(ownerUid: string): Promise<ILogbook[]> {
    const q = query(
      this.col,
      where('ownerUid', '==', ownerUid),
      where('isDraft', '==', false),
      orderBy('surgeryDate', 'desc'),
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => d.data())
  }

  /** Gera e faz download de um arquivo CSV com toda a casuística do usuário. */
  async exportToCSV(ownerUid: string): Promise<void> {
    const entries = await this.listAllForExport(ownerUid)
    if (entries.length === 0) throw new Error('Nenhum registro publicado para exportar.')

    const headers: (keyof ILogbook | string)[] = [
      'id', 'surgeryDate', 'institutionName', 'operatingRoom',
      'subspecialty', 'procedureName', 'procedureCode', 'laterality',
      'approachDetails', 'durationMinutes',
      'patientAge', 'patientSex', 'patientASA', 'patientComorbidities',
      'surgeonRole', 'supervisorName',
      'anesthesiaType', 'graftUsed', 'implantUsed', 'intraopFindings',
      'estimatedBloodLossMl', 'unplannedConversion',
      'complications_count', 'complications_types', 'complications_severity',
      'diagnosisCodes', 'teachingPoints', 'clinicalNotes',
      'createdAt', 'updatedAt',
    ]

    const escape = (v: unknown): string => {
      if (v === null || v === undefined) return ''
      const s = String(v).replace(/"/g, '""')
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s
    }

    const formatDate = (d: unknown): string => {
      if (!d) return ''
      if (d instanceof Date) return d.toISOString().split('T')[0]!
      if (typeof d === 'object' && 'seconds' in (d as object)) {
        // Firestore Timestamp
        return new Date((d as { seconds: number }).seconds * 1000)
          .toISOString().split('T')[0]!
      }
      return String(d)
    }

    const rows = entries.map(e => [
      escape(e.id),
      escape(formatDate(e.surgeryDate)),
      escape(e.institutionName),
      escape(e.operatingRoom),
      escape(e.subspecialty),
      escape(e.procedureName),
      escape(e.procedureCode),
      escape(e.laterality),
      escape(e.approachDetails),
      escape(e.durationMinutes),
      escape(e.patientAge),
      escape(e.patientSex),
      escape(e.patientASA),
      escape(e.patientComorbidities?.join('; ')),
      escape(e.surgeonRole),
      escape(e.supervisorName),
      escape(e.anesthesiaType),
      escape(e.graftUsed),
      escape(e.implantUsed),
      escape(e.intraopFindings),
      escape(e.estimatedBloodLossMl),
      escape(e.unplannedConversion ? 'Sim' : 'Não'),
      escape(e.complications?.length ?? 0),
      escape(e.complications?.map(c => c.type).join('; ')),
      escape(e.complications?.map(c => c.severity).join('; ')),
      escape(e.diagnosisCodes?.join('; ')),
      escape(e.teachingPoints),
      escape(e.clinicalNotes),
      escape(formatDate(e.createdAt)),
      escape(formatDate(e.updatedAt)),
    ].join(','))

    const headerRow = headers.join(',')
    const csv = [headerRow, ...rows].join('\n')
    const bom  = '﻿' // BOM UTF-8 para compatibilidade com Excel
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `otto-logbook-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  /** Exporta toda a casuística em JSON estruturado (compatível com importação futura). */
  async exportToJSON(ownerUid: string): Promise<void> {
    const entries = await this.listAllForExport(ownerUid)
    if (entries.length === 0) throw new Error('Nenhum registro publicado para exportar.')

    const payload = {
      exportedAt: new Date().toISOString(),
      version:    '1.0',
      count:      entries.length,
      entries,
    }
    const json = JSON.stringify(payload, null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `otto-logbook-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
}




