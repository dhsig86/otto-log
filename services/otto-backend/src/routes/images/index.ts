import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import type { AuthRequest } from '../../middleware/requireAuth.js'
import type { Response } from 'express'
import { adminStorage } from '../../services/firebase-admin.js'

export const imagesRouter = Router()
imagesRouter.use(requireAuth)

/**
 * POST /api/images/signed-upload-url
 * Gera uma URL assinada para upload direto ao Firebase Storage.
 * O cliente valida o arquivo antes de chamar este endpoint.
 * Fase 5.
 */
imagesRouter.post('/signed-upload-url', async (req: AuthRequest, res: Response) => {
  const { logId, imageId, contentType } = req.body as {
    logId?: string
    imageId?: string
    contentType?: string
  }

  if (!logId || !imageId || !contentType) {
    return res.status(400).json({ error: 'logId, imageId e contentType são obrigatórios.' })
  }

  if (!contentType.startsWith('image/')) {
    return res.status(400).json({ error: 'Apenas imagens são permitidas.' })
  }

  const path = `logbook-images/${req.uid}/${logId}/${imageId}`
  const file = adminStorage.bucket().file(path)

  const [signedUrl] = await file.getSignedUrl({
    action: 'write',
    expires: Date.now() + 5 * 60 * 1000, // 5 min
    contentType,
  })

  return res.json({ signedUrl, path })
})
