import type { Request, Response, NextFunction } from 'express'
import { adminAuth } from '../services/firebase-admin.js'

export interface AuthRequest extends Request {
  uid?: string
  email?: string
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação ausente.' })
  }

  const token = authHeader.slice(7)
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    req.uid = decoded.uid
    req.email = decoded.email
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' })
  }
}
