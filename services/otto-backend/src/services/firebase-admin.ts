import { initializeApp, cert, getApps, type ServiceAccount } from 'firebase-admin/app'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'
import { getStorage, type Storage } from 'firebase-admin/storage'
import { getAuth, type Auth } from 'firebase-admin/auth'

// Exportados como variáveis — preenchidas em initFirebaseAdmin().
// Os handlers das rotas só são chamados DEPOIS que initFirebaseAdmin() rodou
// no server.ts, então nunca chegam undefined no momento do uso.
export let adminDb:      Firestore
export let adminStorage: Storage
export let adminAuth:    Auth

export function initFirebaseAdmin() {
  if (getApps().length > 0) return  // já inicializado

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? ''
  if (!raw) {
    throw new Error('[firebase-admin] FIREBASE_SERVICE_ACCOUNT_JSON não definido. Configure no Render.')
  }

  // Aceita três formatos:
  // 1. JSON puro:   { "type": "service_account", ... }
  // 2. Base64:      eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwgLi4ufQ==
  // 3. JSON escapado com \" (alguns dashboards convertem aspas)
  let serviceAccount: ServiceAccount | undefined

  // Tentativa 1: base64 → JSON
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf-8')
    const parsed  = JSON.parse(decoded) as Record<string, unknown>
    if (parsed['type'] === 'service_account') {
      serviceAccount = parsed as unknown as ServiceAccount
    }
  } catch { /* não era base64 válido */ }

  // Tentativa 2: JSON direto
  if (!serviceAccount) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      if (parsed['type'] === 'service_account') {
        serviceAccount = parsed as unknown as ServiceAccount
      }
    } catch { /* não era JSON válido */ }
  }

  if (!serviceAccount) {
    throw new Error(
      '[firebase-admin] Não foi possível parsear FIREBASE_SERVICE_ACCOUNT_JSON. ' +
      'Use o valor base64 gerado pelo comando PowerShell.'
    )
  }

  initializeApp({
    credential:    cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    projectId:     process.env.FIREBASE_PROJECT_ID,
  })

  // Preenche as variáveis após initializeApp — ESM live bindings propagam
  adminDb      = getFirestore()
  adminStorage = getStorage()
  adminAuth    = getAuth()
}
