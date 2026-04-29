import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

interface RequireAuthProps {
  children: ReactNode
  redirectTo?: string
}

export function RequireAuth({ children, redirectTo = '/login' }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <div className="flex items-center justify-center h-screen">Carregando...</div>
  if (!isAuthenticated) return <Navigate to={redirectTo} state={{ from: location }} replace />

  return <>{children}</>
}
