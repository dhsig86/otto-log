import { useQuery } from '@tanstack/react-query'
import { LogbookService } from '../services/LogbookService'
import type { ILogbook } from '../types'

export function useLogbook(id: string) {
  const service = new LogbookService()

  const query = useQuery<ILogbook | null>({
    queryKey: ['logbook', id],
    queryFn: () => service.getById(id),
    enabled: !!id,
  })

  return {
    log: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
