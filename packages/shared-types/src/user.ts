export type UserRole = 'surgeon' | 'resident' | 'fellow' | 'admin'

export interface OttoUser {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  role: UserRole
  institutionIds: string[]
  subspecialties: Subspecialty[]
  residencyYear?: number // 1-4, apenas para residents
  createdAt: Date
  updatedAt: Date
}

export type Subspecialty =
  | 'otology'
  | 'rhinology'
  | 'laryngology'
  | 'head-neck'
  | 'pediatric-ent'
  | 'sleep-surgery'
  | 'facial-plastics'
  | 'neurotology'
  | 'general'
