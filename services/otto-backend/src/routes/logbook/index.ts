import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import { extractFromVoice } from './extract-from-voice.js'

export const logbookRouter = Router()

// Todas as rotas exigem autenticação
logbookRouter.use(requireAuth)

/**
 * POST /api/logbook/extract-from-voice
 * Recebe áudio → transcreve com Whisper → extrai campos estruturados.
 * Fase 4.
 */
logbookRouter.post('/extract-from-voice', extractFromVoice)

/**
 * POST /api/logbook
 * Cria um novo log (alternativa server-side, para operações com regras complexas).
 * A criação direta via Firestore SDK também é suportada com Security Rules.
 */
logbookRouter.post('/', (_req, res) => {
  res.status(501).json({ error: 'Implementar na Fase 3.' })
})
