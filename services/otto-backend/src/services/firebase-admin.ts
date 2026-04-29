import { initializeApp, cert, getApps, type ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { getAuth } from 'firebase-admin/auth'

export function initFirebaseAdmin() {
  if (getApps().length > 0) return

  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_JSON ?? '', 'base64').toString('utf-8')
  ) as ServiceAccount

  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    projectId: process.env.FIREBASE_PROJECT_ID,
  })
}

export const adminDb = getFirestore()
export const adminStorage = getStorage()
export const adminAuth = getAuth()
