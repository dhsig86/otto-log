import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { UserRole } from '@otto/shared-types'

interface RequireRoleProps {
  children: ReactNode
  role: UserRole | UserRole[]
  fallback?: ReactNode
}

export function RequireRole({ children, role, fallback }: RequireRoleProps) {
  const { user } = useAuth()
  const allowedRoles = Array.isArray(role) ? role : [role]

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback ? <>{fallback}</> : <Navigate to="/" replace />
  }

  return <>{children}</>
}
