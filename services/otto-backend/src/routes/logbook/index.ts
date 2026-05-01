import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import { validate } from '../../middleware/validate.js'
import { CreateLogbookEntrySchema, UpdateLogbookEntrySchema } from '../../schemas/logbook.schema.js'
import { extractFromVoice } from './extract-from-voice.js'
import type { AuthRequest } from '../../middleware/requireAuth.js'
import type { Response } from 'express'
import { adminDb } from '../../services/firebase-admin.js'
import { FieldValue } from 'firebase-admin/firestore'

export const logbookRouter = Router()
logbookRouter.use(requireAuth)

const COLLECTION = 'logbooks'

/** POST /api/logbook — criar registro */
logbookRouter.post('/', validate(CreateLogbookEntrySchema), async (req: AuthRequest, res: Response) => {
  const data = req.body as Record<string, unknown>
  const ref = await adminDb.collection(COLLECTION).add({
    ...data,
    ownerUid: req.uid,
    imageIds: [],
    voiceTranscript: null,
    privateNotes: null,
    version: 1,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return res.status(201).json({ id: ref.id })
})

/** GET /api/logbook — listar (paginado, filtrado) */
logbookRouter.get('/', async (req: AuthRequest, res: Response) => {
  const { subspecialty, surgeonRole, limit = '20', startAfter } = req.query as Record<string, string>

  let q = adminDb.collection(COLLECTION)
    .where('ownerUid', '==', req.uid)
    .orderBy('surgeryDate', 'desc')
    .limit(parseInt(limit, 10))

  if (subspecialty) q = q.where('subspecialty', '==', subspecialty) as typeof q
  if (surgeonRole)  q = q.where('surgeonRole',  '==', surgeonRole)  as typeof q
  if (startAfter) {
    const snap = await adminDb.collection(COLLECTION).doc(startAfter).get()
    if (snap.exists) q = q.startAfter(snap) as typeof q
  }

  const snapshot = await q.get()
  const entries = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  return res.json({ entries, nextCursor: snapshot.docs.at(-1)?.id ?? null })
})

/** GET /api/logbook/:id */
logbookRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  const snap = await adminDb.collection(COLLECTION).doc(req.params.id).get()
  if (!snap.exists) return res.status(404).json({ error: 'Registro não encontrado.' })
  const data = snap.data()!
  if (data['ownerUid'] !== req.uid) return res.status(403).json({ error: 'Acesso negado.' })
  return res.json({ id: snap.id, ...data })
})

/** PATCH /api/logbook/:id */
logbookRouter.patch('/:id', validate(UpdateLogbookEntrySchema), async (req: AuthRequest, res: Response) => {
  const snap = await adminDb.collection(COLLECTION).doc(req.params.id).get()
  if (!snap.exists) return res.status(404).json({ error: 'Registro não encontrado.' })
  if (snap.data()!['ownerUid'] !== req.uid) return res.status(403).json({ error: 'Acesso negado.' })

  await snap.ref.update({
    ...req.body,
    updatedAt: FieldValue.serverTimestamp(),
    version: FieldValue.increment(1),
  })
  return res.json({ id: snap.id })
})

/** DELETE /api/logbook/:id */
logbookRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  const snap = await adminDb.collection(COLLECTION).doc(req.params.id).get()
  if (!snap.exists) return res.status(404).json({ error: 'Registro não encontrado.' })
  if (snap.data()!['ownerUid'] !== req.uid) return res.status(403).json({ error: 'Acesso negado.' })
  await snap.ref.delete()
  return res.status(204).send()
})

/** POST /api/logbook/:id/duplicate */
logbookRouter.post('/:id/duplicate', async (req: AuthRequest, res: Response) => {
  const snap = await adminDb.collection(COLLECTION).doc(req.params.id).get()
  if (!snap.exists) return res.status(404).json({ error: 'Registro não encontrado.' })
  if (snap.data()!['ownerUid'] !== req.uid) return res.status(403).json({ error: 'Acesso negado.' })

  const { id: _id, createdAt: _c, updatedAt: _u, voiceTranscript: _v, imageIds: _i, ...rest } = snap.data()! as Record<string, unknown>
  const ref = await adminDb.collection(COLLECTION).add({
    ...rest,
    isDraft: true,
    imageIds: [],
    version: 1,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
  return res.status(201).json({ id: ref.id })
})

/** POST /api/logbook/extract-from-voice */
logbookRouter.post('/extract-from-voice', extractFromVoice)
