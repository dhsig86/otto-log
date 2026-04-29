import type { ENTOntologyEntry, Subspecialty } from '@otto/shared-types'
import { ENT_PROCEDURES_SEED } from './seed'

export class ENTOntologyEngine {
  private entries: ENTOntologyEntry[]

  constructor(customEntries?: ENTOntologyEntry[]) {
    this.entries = customEntries ?? ENT_PROCEDURES_SEED
  }

  /** Busca full-text por nome, código TUSS ou CID */
  search(query: string, subspecialty?: Subspecialty): ENTOntologyEntry[] {
    const q = query.toLowerCase().trim()
    if (!q) return []
    return this.entries
      .filter(e => {
        const matchesSubspecialty = subspecialty ? e.subspecialty === subspecialty : true
        const matchesQuery =
          e.name.toLowerCase().includes(q) ||
          e.nameEN.toLowerCase().includes(q) ||
          e.codes.some(c => c.code.includes(q) || c.display.toLowerCase().includes(q)) ||
          e.meshTerms.some(m => m.toLowerCase().includes(q))
        return matchesSubspecialty && matchesQuery
      })
      .slice(0, 20)
  }

  getById(id: string): ENTOntologyEntry | undefined {
    return this.entries.find(e => e.id === id)
  }

  getBySubspecialty(subspecialty: Subspecialty): ENTOntologyEntry[] {
    return this.entries.filter(e => e.subspecialty === subspecialty)
  }

  /** Sugere procedimentos a partir de uma transcrição de voz */
  suggestFromTranscript(transcript: string): ENTOntologyEntry[] {
    const words = transcript.toLowerCase().split(/\s+/)
    const scores = this.entries.map(entry => {
      let score = 0
      const text = `${entry.name} ${entry.nameEN} ${entry.meshTerms.join(' ')}`.toLowerCase()
      for (const word of words) {
        if (word.length > 4 && text.includes(word)) score++
      }
      return { entry, score }
    })
    return scores
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => s.entry)
  }

  buildPubMedQuery(entryId: string): string {
    const entry = this.getById(entryId)
    if (!entry) return ''
    const meshQuery = entry.meshTerms.map(t => `"${t}"[MeSH]`).join(' OR ')
    return `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(meshQuery)}`
  }
}
