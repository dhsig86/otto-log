import type { Subspecialty } from './user'

export interface MedicalCode {
  system: 'TUSS' | 'CID-10' | 'CPT' | 'MeSH'
  code: string
  display: string
}

export interface ENTOntologyEntry {
  id: string
  name: string
  nameEN: string
  subspecialty: Subspecialty
  codes: MedicalCode[]
  meshTerms: string[]
  guidelines?: OntologyGuideline[]
  commonDiagnoses: string[] // CID-10 codes frequentemente associados
  avgDurationMinutes?: number
  complexity: 1 | 2 | 3 | 4 | 5
}

export interface OntologyGuideline {
  title: string
  organization: string
  year: number
  url: string
}
