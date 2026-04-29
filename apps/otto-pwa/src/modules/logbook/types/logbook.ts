import type { Subspecialty } from '@otto/shared-types'

export type SurgeonRole = 'attending' | 'first-assistant' | 'second-assistant' | 'resident-primary' | 'fellow'
export type AnesthesiaType = 'general' | 'regional' | 'local' | 'sedation' | 'combined'
export type Laterality = 'right' | 'left' | 'bilateral' | 'midline' | 'na'
export type ASAClass = 1 | 2 | 3 | 4 | 5
export type SyncStatus = 'synced' | 'pending' | 'conflict'
export type ComplexityRating = 1 | 2 | 3 | 4 | 5

export interface SurgicalComplication {
  type: string
  severity: 'minor' | 'major' | 'life-threatening'
  management: string
  resolved: boolean
}

export interface SurgicalTeamMember {
  name: string
  role: string // 'anesthesiologist', 'scrub-nurse', 'resident', etc.
  institution?: string
}

export interface LogbookImage {
  id: string
  logId: string
  ownerUid: string
  storagePath: string
  downloadURL: string
  caption?: string
  anatomicalRegion?: string
  sha256: string
  sanitized: boolean
  createdAt: Date
}

export interface ILogbook {
  id?: string
  ownerUid: string
  isDraft: boolean
  syncStatus: SyncStatus

  // ── Dados da cirurgia ──
  surgeryDate: Date
  startTime?: string // HH:mm
  endTime?: string   // HH:mm
  durationMinutes?: number
  institutionId: string
  institutionName: string // denormalizado para exibição offline
  operatingRoom?: string

  // ── Procedimento ──
  subspecialty: Subspecialty
  procedureId: string   // ENTOntologyEntry.id
  procedureName: string // denormalizado
  procedureCode?: string // TUSS
  diagnosisCodes: string[] // CID-10
  laterality: Laterality
  approachDetails?: string // 'endoscópica', 'aberta', 'combinada', etc.

  // ── Paciente (sem PII) ──
  patientAge: number
  patientSex: 'M' | 'F' | 'other'
  patientASA: ASAClass
  patientComorbidities: string[]

  // ── Equipe ──
  surgeonRole: SurgeonRole
  supervisorName?: string // para residentes
  team: SurgicalTeamMember[]

  // ── Detalhes técnicos ──
  anesthesiaType: AnesthesiaType
  graftUsed?: string // 'fáscia temporal', 'pericôndrio', etc.
  implantUsed?: string
  intraopFindings?: string

  // ── Desfecho ──
  estimatedBloodLossMl?: number
  complications: SurgicalComplication[]
  unplannedConversion: boolean // ex: laparoscópica → aberta
  durationComment?: string

  // ── Ensino e notas ──
  teachingPoints?: string
  clinicalNotes?: string
  privateNotes?: string // nunca sincronizado com external APIs
  voiceTranscript?: string // transcrição original do Whisper

  // ── Mídia ──
  imageIds: string[]

  // ── Metadados ──
  createdAt: Date
  updatedAt: Date
  version: number // para controle de conflito offline
}

/** DTO retornado pelo endpoint extract-from-voice */
export type VoiceExtractedLog = Partial<
  Pick<
    ILogbook,
    | 'procedureId'
    | 'procedureName'
    | 'subspecialty'
    | 'laterality'
    | 'patientAge'
    | 'patientSex'
    | 'patientASA'
    | 'anesthesiaType'
    | 'graftUsed'
    | 'durationMinutes'
    | 'surgeonRole'
    | 'intraopFindings'
    | 'complications'
    | 'estimatedBloodLossMl'
    | 'teachingPoints'
  >
> & {
  confidence: Record<string, 'high' | 'medium' | 'low'>
  rawTranscript: string
}
