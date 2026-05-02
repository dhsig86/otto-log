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

  // Aceita JSON puro ou JSON codificado em base64
  let serviceAccount: ServiceAccount
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf-8')
    serviceAccount = JSON.parse(decoded.startsWith('{') ? decoded : raw) as ServiceAccount
  } catch {
    serviceAccount = JSON.parse(raw) as ServiceAccount
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
