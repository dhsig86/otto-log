import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@otto/shared-auth'
import { LogbookService } from '../services/LogbookService'
import type { ILogbook } from '../types'

export function useCreateLogbook() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const service = new LogbookService()

  return useMutation({
    mutationFn: (data: Omit<ILogbook, 'id' | 'ownerUid' | 'createdAt' | 'updatedAt' | 'version'>) =>
      service.create({ ...data, ownerUid: user!.uid }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['logbooks', user?.uid] })
    },
  })
}
