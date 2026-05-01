import type { Request, Response } from 'express'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const EXTRACT_PROMPT = `
Você é um assistente que extrai informações estruturadas de relatos cirúrgicos em otorrinolaringologia.
A partir da transcrição abaixo, extraia os campos disponíveis e retorne um JSON com a estrutura exata:
{
  "procedureName": string | null,
  "laterality": "right" | "left" | "bilateral" | "midline" | "na" | null,
  "patientAge": number | null,
  "patientSex": "M" | "F" | null,
  "anesthesiaType": "general" | "regional" | "local" | "sedation" | "combined" | null,
  "graftUsed": string | null,
  "durationMinutes": number | null,
  "surgeonRole": "attending" | "first-assistant" | "resident-primary" | null,
  "intraopFindings": string | null,
  "complications": string[] | null,
  "estimatedBloodLossMl": number | null,
  "teachingPoints": string | null,
  "confidence": { [field]: "high" | "medium" | "low" }
}
Retorne APENAS o JSON, sem markdown, sem explicações.
Transcrição:
`

export async function extractFromVoice(req: Request, res: Response) {
  // Fase 4 — implementação completa
  // Por ora, apenas o endpoint stub para testes de integração
  const { transcript } = req.body as { transcript?: string }

  if (!transcript) {
    return res.status(400).json({ error: 'Campo "transcript" obrigatório.' })
  }

  try {
    const completion = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: EXTRACT_PROMPT + transcript,
        },
      ],
    })

    const text = completion.content[0]?.type === 'text' ? completion.content[0].text : '{}'
    const extracted = JSON.parse(text) as Record<string, unknown>

    return res.json({ ...extracted, rawTranscript: transcript })
  } catch (err) {
    console.error('[extract-from-voice]', err)
    return res.status(500).json({ error: 'Falha na extração estruturada.' })
  }
}
