import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type QueryDocumentSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@otto/shared-firebase'
import { createTypedConverter } from '@otto/shared-firebase'
import type { ILogbook } from '../types'

const COLLECTION = 'logbooks'

export class LogbookService {
  private converter = createTypedConverter<ILogbook>()
  private col = collection(db, COLLECTION).withConverter(this.converter)

  async listByOwner(ownerUid: string, pageSize = 20, after?: QueryDocumentSnapshot): Promise<ILogbook[]> {
    let q = query(
      this.col,
      where('ownerUid', '==', ownerUid),
      orderBy('surgeryDate', 'desc'),
      limit(pageSize)
    )
    if (after) q = query(q, startAfter(after))

    const snap = await getDocs(q)
    return snap.docs.map(d => d.data())
  }

  async getById(id: string): Promise<ILogbook | null> {
    const snap = await getDoc(doc(this.col, id))
    return snap.exists() ? snap.data() : null
  }

  async create(
    data: Omit<ILogbook, 'id' | 'createdAt' | 'updatedAt' | 'version'>
  ): Promise<string> {
    const ref = await addDoc(this.col, {
      ...data,
      createdAt: serverTimestamp() as unknown as Date,
      updatedAt: serverTimestamp() as unknown as Date,
      version: 1,
      syncStatus: 'synced',
    } as ILogbook)
    return ref.id
  }

  async update(id: string, data: Partial<ILogbook>): Promise<void> {
    await updateDoc(doc(this.col, id), {
      ...data,
      updatedAt: serverTimestamp(),
      version: (data.version ?? 1) + 1,
    })
  }

  async saveDraft(id: string | undefined, data: Partial<ILogbook>): Promise<string> {
    if (id) {
      await this.update(id, { ...data, isDraft: true })
      return id
    }
    return this.create({ ...data, isDraft: true } as ILogbook)
  }
}
