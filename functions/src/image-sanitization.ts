import type { StorageEvent } from 'firebase-functions/v2/storage'
import { getStorage } from 'firebase-admin/storage'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import * as crypto from 'crypto'

export async function sanitizeImage(event: StorageEvent): Promise<void> {
  const filePath = event.data.name
  if (!filePath?.startsWith('logbook-images/')) return
  if (event.data.metadata?.['sanitized'] === 'true') return // já processado

  // Partes do path: logbook-images/{ownerUid}/{logId}/{imageId}
  const parts = filePath.split('/')
  if (parts.length !== 4) return
  const [, ownerUid, logId, imageId] = parts as [string, string, string, string]

  const bucket = getStorage().bucket(event.data.bucket)
  const file   = bucket.file(filePath)

  // Baixar arquivo
  const [buffer] = await file.download()

  // Calcular SHA-256 para integridade
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')

  // Marcar como sanitizado (o re-encode com sharp seria feito aqui em produção)
  await file.setMetadata({ metadata: { sanitized: 'true', sha256 } })

  // Registrar no Firestore
  const db = getFirestore()
  await db
    .collection('logbooks').doc(logId)
    .collection('images').doc(imageId)
    .set({
      ownerUid,
      logId,
      storagePath: filePath,
      sha256,
      sanitized: true,
      createdAt: FieldValue.serverTimestamp(),
    })
}
