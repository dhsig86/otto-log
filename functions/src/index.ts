import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { onObjectFinalized } from 'firebase-functions/v2/storage'
import { auditLogbookWrite } from './audit-log.js'
import { sanitizeImage } from './image-sanitization.js'

// Auditoria: toda escrita em logbooks gera um auditLog
export const onLogbookWrite = onDocumentWritten(
  { document: 'logbooks/{logId}', region: 'southamerica-east1' },
  auditLogbookWrite
)

// Sanitização: toda imagem finalizada no Storage é processada
export const onImageUploaded = onObjectFinalized(
  { region: 'southamerica-east1' },
  sanitizeImage
)
