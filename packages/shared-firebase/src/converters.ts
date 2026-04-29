import {
  type FirestoreDataConverter,
  type DocumentData,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  Timestamp,
} from 'firebase/firestore'

/**
 * Cria um Firestore converter tipado para uma coleção.
 * Automaticamente converte Timestamps para Date e vice-versa.
 */
export function createTypedConverter<T extends { id?: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(data: T): DocumentData {
      const { id: _id, ...rest } = data
      return convertDatesToTimestamps(rest as DocumentData)
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T {
      const data = snapshot.data(options)
      return {
        id: snapshot.id,
        ...convertTimestampsToDates(data),
      } as T
    },
  }
}

function convertDatesToTimestamps(obj: DocumentData): DocumentData {
  const result: DocumentData = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Date) {
      result[key] = Timestamp.fromDate(value)
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = convertDatesToTimestamps(value as DocumentData)
    } else {
      result[key] = value
    }
  }
  return result
}

function convertTimestampsToDates(obj: DocumentData): DocumentData {
  const result: DocumentData = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate()
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = convertTimestampsToDates(value as DocumentData)
    } else {
      result[key] = value
    }
  }
  return result
}

/** Helper: adiciona o id do documento ao objeto tipado */
export function withId<T>(snapshot: QueryDocumentSnapshot<T>): T & { id: string } {
  return { ...snapshot.data(), id: snapshot.id }
}
