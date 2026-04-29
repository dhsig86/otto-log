import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import { logbookRouter } from './routes/logbook/index.js'
import { imagesRouter } from './routes/images/index.js'
import { authRouter } from './routes/auth/index.js'
import { initFirebaseAdmin } from './services/firebase-admin.js'

// Inicializa Firebase Admin SDK
initFirebaseAdmin()

const app = express()
const PORT = process.env.PORT ?? 3001

// ─── Middlewares globais ───
app.use(helmet())
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS ?? '').split(',').map(o => o.trim()),
  credentials: true,
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '5mb' }))

// Rate limiting global
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
}))

// ─── Rotas ───
app.get('/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }))
app.use('/api/logbook', logbookRouter)
app.use('/api/images', imagesRouter)
app.use('/api/auth', authRouter)

// 404
app.use((_req, res) => res.status(404).json({ error: 'Rota não encontrada.' }))

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message)
  res.status(500).json({ error: 'Erro interno do servidor.' })
})

app.listen(PORT, () => {
  console.info(`[OTTO Backend] Rodando na porta ${PORT} — ${process.env.NODE_ENV ?? 'development'}`)
})

export default app
