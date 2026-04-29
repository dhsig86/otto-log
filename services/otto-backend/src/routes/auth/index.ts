import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import type { AuthRequest } from '../../middleware/requireAuth.js'
import type { Response } from 'express'

export const authRouter = Router()

/** GET /api/auth/me — retorna dados do usuário autenticado */
authRouter.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ uid: req.uid, email: req.email })
})
