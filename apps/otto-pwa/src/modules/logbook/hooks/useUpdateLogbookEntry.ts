import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@otto/shared-auth'
import { LogbookService } from '../services/LogbookService'
import type { ILogbook } from '../types'

export function useUpdateLogbook(id: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const service = new LogbookService()

  return useMutation({
    mutationFn: (data: Partial<ILogbook>) => service.update(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['logbook', id] })
      void queryClient.invalidateQueries({ queryKey: ['logbooks', user?.uid] })
    },
  })
}
