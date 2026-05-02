import { useInfiniteQuery } from '@tanstack/react-query'
import { useAuth } from '@otto/shared-auth'
import { LogbookService } from '../services/LogbookService'
import type { ILogbook } from '../types'

export interface LogbookFilters {
  subspecialty?: string
  surgeonRole?:  string
  isDraft?:      boolean
  search?:       string
}

const service = new LogbookService()

export function useLogbookEntries(filters: LogbookFilters = {}) {
  const { user } = useAuth()

  return useInfiniteQuery<{ entries: ILogbook[]; nextCursor: string | null }>({
    queryKey: ['logbook-entries', user?.uid, filters],
    queryFn:  ({ pageParam }) =>
      service.listByOwner(user!.uid, 20, pageParam as string | undefined, filters),
    getNextPageParam: last => last.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  })
}
