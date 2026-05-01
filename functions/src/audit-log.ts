import type { FirestoreEvent, Change, DocumentSnapshot } from 'firebase-functions/v2/firestore'
import { getFirestore } from 'firebase-admin/firestore'

export async function auditLogbookWrite(
  event: FirestoreEvent<Change<DocumentSnapshot> | undefined>
): Promise<void> {
  const db = getFirestore()
  const { before, after } = event.data ?? {}

  const action = !before?.exists ? 'CREATE' : !after?.exists ? 'DELETE' : 'UPDATE'
  const ownerUid = (after?.data() ?? before?.data())?.[  'ownerUid'] as string | undefined

  await db.collection('auditLogs').add({
    collection:  'logbooks',
    documentId:  event.params.logId,
    action,
    ownerUid:    ownerUid ?? 'unknown',
    changedAt:   new Date().toISOString(),
    afterSnap:   action !== 'DELETE' ? after?.data() ?? null : null,
  })
}
