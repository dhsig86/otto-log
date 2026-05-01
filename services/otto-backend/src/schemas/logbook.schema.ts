import { z } from 'zod'

const SurgeonRoleEnum = z.enum(['attending', 'first-assistant', 'second-assistant', 'resident-primary', 'fellow'])
const AnesthesiaEnum  = z.enum(['general', 'regional', 'local', 'sedation', 'combined'])
const LateralityEnum  = z.enum(['right', 'left', 'bilateral', 'midline', 'na'])
const SyncStatusEnum  = z.enum(['synced', 'pending', 'conflict'])

const SurgicalComplicationSchema = z.object({
  type:       z.string().min(1),
  severity:   z.enum(['minor', 'major', 'life-threatening']),
  management: z.string(),
  resolved:   z.boolean(),
})

const TeamMemberSchema = z.object({
  name:        z.string().min(1),
  role:        z.string().min(1),
  institution: z.string().optional(),
})

export const CreateLogbookEntrySchema = z.object({
  isDraft:              z.boolean().default(false),
  surgeryDate:          z.string().datetime({ offset: true }),
  startTime:            z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime:              z.string().regex(/^\d{2}:\d{2}$/).optional(),
  durationMinutes:      z.number().int().positive().optional(),
  institutionId:        z.string().min(1),
  institutionName:      z.string().min(1),
  operatingRoom:        z.string().optional(),
  subspecialty:         z.string().min(1),
  procedureId:          z.string().min(1),
  procedureName:        z.string().min(1),
  procedureCode:        z.string().optional(),
  diagnosisCodes:       z.array(z.string()).default([]),
  laterality:           LateralityEnum,
  approachDetails:      z.string().optional(),
  patientAge:           z.number().int().min(0).max(120),
  patientSex:           z.enum(['M', 'F', 'other']),
  patientASA:           z.number().int().min(1).max(5) as z.ZodType<1|2|3|4|5>,
  patientComorbidities: z.array(z.string()).default([]),
  surgeonRole:          SurgeonRoleEnum,
  supervisorName:       z.string().optional(),
  team:                 z.array(TeamMemberSchema).default([]),
  anesthesiaType:       AnesthesiaEnum,
  graftUsed:            z.string().optional(),
  implantUsed:          z.string().optional(),
  intraopFindings:      z.string().optional(),
  estimatedBloodLossMl: z.number().int().min(0).optional(),
  complications:        z.array(SurgicalComplicationSchema).default([]),
  unplannedConversion:  z.boolean().default(false),
  durationComment:      z.string().optional(),
  teachingPoints:       z.string().optional(),
  clinicalNotes:        z.string().optional(),
  syncStatus:           SyncStatusEnum.default('synced'),
})

export const UpdateLogbookEntrySchema = CreateLogbookEntrySchema.partial()

export type CreateLogbookEntryDTO = z.infer<typeof CreateLogbookEntrySchema>
export type UpdateLogbookEntryDTO = z.infer<typeof UpdateLogbookEntrySchema>
