import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@otto/shared-auth'
import { LogbookService } from '../services/LogbookService'
import { SUBSPECIALTIES, SURGEON_ROLES, ANESTHESIA_TYPES } from '../schemas/logbookForm.schema'
import type { ILogbook } from '../types'

// ── Tipos de resultado ────────────────────────────────────────────────────────
export interface MonthlyCount  { month: string; casos: number }
export interface LabeledCount  { name: string; count: number }

export interface LogbookStats {
  // Resumo
  totalPublished:    number
  totalDrafts:       number
  complicationRate:  number   // %
  avgDurationMin:    number | null

  // Séries temporais (últimos 18 meses)
  byMonth:           MonthlyCount[]

  // Distribuições
  bySubspecialty:    LabeledCount[]
  byRole:            LabeledCount[]
  byAnesthesia:      LabeledCount[]

  // Rankings
  topProcedures:     LabeledCount[]   // top 8
  topInstitutions:   LabeledCount[]   // top 5

  // Detalhe de complicações
  complicationsBySeverity: LabeledCount[]
}

// ── Helper: rótulo legível de data como "Jan/25" ─────────────────────────────
function toMonthKey(date: Date): string {
  const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  return `${months[date.getMonth()]}/${String(date.getFullYear()).slice(2)}`
}

function toDate(raw: unknown): Date {
  if (raw instanceof Date) return raw
  if (raw && typeof raw === 'object' && 'seconds' in raw) {
    return new Date((raw as { seconds: number }).seconds * 1000)
  }
  return new Date(raw as string)
}

// ── Cálculo de estatísticas ───────────────────────────────────────────────────
function computeStats(entries: ILogbook[]): LogbookStats {
  const published = entries.filter(e => !e.isDraft)
  const drafts    = entries.filter(e => e.isDraft)

  // Taxa de complicações
  const withComplications = published.filter(e => e.complications?.length > 0)
  const complicationRate  = published.length > 0
    ? Math.round((withComplications.length / published.length) * 100)
    : 0

  // Duração média
  const withDuration = published.filter(e => e.durationMinutes && e.durationMinutes > 0)
  const avgDurationMin = withDuration.length > 0
    ? Math.round(withDuration.reduce((s, e) => s + (e.durationMinutes ?? 0), 0) / withDuration.length)
    : null

  // ── Por mês (últimos 18 meses) ────────────────────────────────────────────
  const now = new Date()
  const monthKeys: string[] = []
  for (let i = 17; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthKeys.push(toMonthKey(d))
  }
  const monthMap = new Map<string, number>(monthKeys.map(k => [k, 0]))

  for (const e of published) {
    try {
      const key = toMonthKey(toDate(e.surgeryDate))
      if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) ?? 0) + 1)
    } catch { /* ignora datas inválidas */ }
  }
  const byMonth: MonthlyCount[] = monthKeys.map(month => ({ month, casos: monthMap.get(month) ?? 0 }))

  // ── Por subespecialidade ──────────────────────────────────────────────────
  const subCount = new Map<string, number>()
  for (const e of published) {
    const label = SUBSPECIALTIES.find(s => s.value === e.subspecialty)?.label ?? e.subspecialty
    subCount.set(label, (subCount.get(label) ?? 0) + 1)
  }
  const bySubspecialty: LabeledCount[] = [...subCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // ── Por papel do cirurgião ────────────────────────────────────────────────
  const roleCount = new Map<string, number>()
  for (const e of published) {
    const label = SURGEON_ROLES.find(r => r.value === e.surgeonRole)?.label ?? e.surgeonRole
    roleCount.set(label, (roleCount.get(label) ?? 0) + 1)
  }
  const byRole: LabeledCount[] = [...roleCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // ── Por anestesia ─────────────────────────────────────────────────────────
  const anesthCount = new Map<string, number>()
  for (const e of published) {
    if (!e.anesthesiaType) continue
    const label = ANESTHESIA_TYPES.find(a => a.value === e.anesthesiaType)?.label ?? e.anesthesiaType
    anesthCount.set(label, (anesthCount.get(label) ?? 0) + 1)
  }
  const byAnesthesia: LabeledCount[] = [...anesthCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  // ── Top procedimentos ─────────────────────────────────────────────────────
  const procCount = new Map<string, number>()
  for (const e of published) {
    if (e.procedureName) {
      procCount.set(e.procedureName, (procCount.get(e.procedureName) ?? 0) + 1)
    }
  }
  const topProcedures: LabeledCount[] = [...procCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  // ── Top instituições ──────────────────────────────────────────────────────
  const instCount = new Map<string, number>()
  for (const e of published) {
    if (e.institutionName) {
      instCount.set(e.institutionName, (instCount.get(e.institutionName) ?? 0) + 1)
    }
  }
  const topInstitutions: LabeledCount[] = [...instCount.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // ── Complicações por severidade ───────────────────────────────────────────
  const sevCount = new Map<string, number>()
  for (const e of published) {
    for (const c of (e.complications ?? [])) {
      const label = c.severity === 'minor' ? 'Leve'
        : c.severity === 'major' ? 'Grave'
        : 'Risco de Vida'
      sevCount.set(label, (sevCount.get(label) ?? 0) + 1)
    }
  }
  const complicationsBySeverity: LabeledCount[] = [...sevCount.entries()]
    .map(([name, count]) => ({ name, count }))

  return {
    totalPublished:    published.length,
    totalDrafts:       drafts.length,
    complicationRate,
    avgDurationMin,
    byMonth,
    bySubspecialty,
    byRole,
    byAnesthesia,
    topProcedures,
    topInstitutions,
    complicationsBySeverity,
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
const service = new LogbookService()

export function useLogbookStats() {
  const { firebaseUser } = useAuth()

  return useQuery({
    queryKey:  ['logbook-stats', firebaseUser?.uid],
    enabled:   !!firebaseUser,
    staleTime: 1000 * 60 * 5, // 5 min — estatísticas não precisam ser realtime
    queryFn:   async () => {
      if (!firebaseUser) throw new Error('Não autenticado')
      // Busca todos os registros (publicados + rascunhos) para contar os dois
      const [published, allDrafts] = await Promise.all([
        service.listAllForExport(firebaseUser.uid),
        service.listByOwner(firebaseUser.uid, 200, undefined, { isDraft: true }),
      ])
      const all = [...published, ...allDrafts.entries]
      return computeStats(all)
    },
  })
}
