import { z } from 'zod'

export const SUBSPECIALTIES = [
  { value: 'otology',         label: 'Otologia' },
  { value: 'rhinology',       label: 'Rinologia / Seios Paranasais' },
  { value: 'laryngology',     label: 'Laringologia / Voz' },
  { value: 'head-neck',       label: 'Cabeça e Pescoço' },
  { value: 'pediatric-ent',   label: 'Pediátrica' },
  { value: 'sleep-surgery',   label: 'Cirurgia do Sono' },
  { value: 'facial-plastics', label: 'Plástica Facial' },
  { value: 'neurotology',     label: 'Neurotologia' },
  { value: 'general',         label: 'Geral' },
] as const

export const SURGEON_ROLES = [
  { value: 'attending',        label: 'Cirurgião principal' },
  { value: 'first-assistant',  label: '1º auxiliar' },
  { value: 'second-assistant', label: '2º auxiliar' },
  { value: 'resident-primary', label: 'Residente operador' },
  { value: 'fellow',           label: 'Fellow' },
] as const

export const ANESTHESIA_TYPES = [
  { value: 'general',  label: 'Geral' },
  { value: 'regional', label: 'Regional / Bloqueio' },
  { value: 'local',    label: 'Local' },
  { value: 'sedation', label: 'Sedação' },
  { value: 'combined', label: 'Combinada' },
] as const

export const LATERALITIES = [
  { value: 'right',     label: 'Direito' },
  { value: 'left',      label: 'Esquerdo' },
  { value: 'bilateral', label: 'Bilateral' },
  { value: 'midline',   label: 'Linha média' },
  { value: 'na',        label: 'N/A' },
] as const

export const ASA_CLASSES = [
  { value: 1, label: 'I — Saudável' },
  { value: 2, label: 'II — Doença sistêmica leve' },
  { value: 3, label: 'III — Doença sistêmica grave' },
  { value: 4, label: 'IV — Ameaça constante à vida' },
  { value: 5, label: 'V — Moribundo' },
] as const

export const COMMON_COMORBIDITIES = [
  'HAS','DM2','DPOC','Asma','Insuficiência cardíaca',
  'Cardiopatia isquêmica','FA','Obesidade mórbida','IRC',
  'Imunossupressão','Coagulopatia','Hipotireoidismo',
]

export const COMMON_GRAFTS = [
  'Fáscia temporal','Pericôndrio auricular','Gordura abdominal',
  'Cartilagem auricular','Cartilagem septal','Fascia lata',
  'Dura-máter bovina',
]

const TeamMemberSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  role: z.string().min(1, 'Função obrigatória'),
  institution: z.string().optional(),
})

const ComplicationSchema = z.object({
  type:       z.string().min(1),
  severity:   z.enum(['minor','major','life-threatening']),
  management: z.string(),
  resolved:   z.boolean(),
})

export const LogbookFormSchema = z.object({
  surgeryDate:     z.string().min(1, 'Data obrigatória'),
  startTime:       z.string().optional(),
  endTime:         z.string().optional(),
  durationMinutes: z.coerce.number().int().positive().optional(),
  institutionId:   z.string().min(1, 'Instituição obrigatória'),
  institutionName: z.string().min(1),
  operatingRoom:   z.string().optional(),

  subspecialty:    z.string().min(1, 'Subespecialidade obrigatória'),
  procedureId:     z.string().min(1, 'Procedimento obrigatório'),
  procedureName:   z.string().min(1),
  procedureCode:   z.string().optional(),
  diagnosisCodes:  z.array(z.string()).default([]),
  laterality:      z.enum(['right','left','bilateral','midline','na'], {
    required_error: 'Lateralidade obrigatória',
  }),
  approachDetails: z.string().optional(),

  patientAge: z.coerce.number({ required_error: 'Idade obrigatória' }).int().min(0).max(120).optional(),
  patientSex: z.enum(['M','F','other']).optional(),
  patientASA: z.coerce.number().int().min(1).max(5).optional(),
  patientComorbidities: z.array(z.string()).default([]),

  surgeonRole:    z.enum(['attending','first-assistant','second-assistant','resident-primary','fellow'], {
    required_error: 'Papel obrigatório',
  }),
  supervisorName: z.string().optional(),
  team:           z.array(TeamMemberSchema).default([]),

  anesthesiaType: z.enum(['general','regional','local','sedation','combined'], {
    required_error: 'Tipo de anestesia obrigatório',
  }),
  graftUsed:       z.string().optional(),
  implantUsed:     z.string().optional(),
  intraopFindings: z.string().optional(),

  estimatedBloodLossMl: z.coerce.number().int().min(0).optional(),
  complications:        z.array(ComplicationSchema).default([]),
  unplannedConversion:  z.boolean().default(false),
  durationComment:      z.string().optional(),

  teachingPoints: z.string().optional(),
  clinicalNotes:  z.string().optional(),
  privateNotes:   z.string().optional(),

  isDraft:    z.boolean().default(false),
  syncStatus: z.enum(['synced','pending','conflict']).default('synced'),
})

export type LogbookFormValues = z.infer<typeof LogbookFormSchema>
