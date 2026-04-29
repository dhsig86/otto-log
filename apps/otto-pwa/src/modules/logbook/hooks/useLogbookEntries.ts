import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@otto/shared-auth'
import { LogbookService } from '../services/LogbookService'
import type { ILogbook } from '../types'

export function useLogbookEntries() {
  const { user } = useAuth()
  const service = new LogbookService()

  const query = useQuery<ILogbook[]>({
    queryKey: ['logbooks', user?.uid],
    queryFn: () => service.listByOwner(user!.uid),
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 min
  })

  return {
    logs: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  }
}
