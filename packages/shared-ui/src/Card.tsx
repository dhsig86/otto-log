import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

const paddingClasses = { sm: 'p-3', md: 'p-4', lg: 'p-6' }

export function Card({ children, className = '', padding = 'md', onClick }: CardProps) {
  const base = `bg-white border border-slate-200 rounded-xl shadow-sm ${paddingClasses[padding]}`
  return onClick ? (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => e.key === 'Enter' && onClick()}
      className={`${base} cursor-pointer hover:shadow-md hover:border-slate-300 transition-all duration-150 ${className}`}
    >
      {children}
    </div>
  ) : (
    <div className={`${base} ${className}`}>{children}</div>
  )
}
