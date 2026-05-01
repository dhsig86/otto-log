import { useState, type ReactNode } from 'react'

interface FormSectionProps {
  title: string
  subtitle?: string
  icon?: string
  defaultOpen?: boolean
  hasError?: boolean
  children: ReactNode
}

export function FormSection({ title, subtitle, icon, defaultOpen = false, hasError, children }: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={[
      'border rounded-xl overflow-hidden transition-all',
      hasError ? 'border-red-300' : 'border-slate-200',
    ].join(' ')}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={[
          'w-full flex items-center justify-between px-5 py-4',
          'bg-white hover:bg-slate-50 transition-colors text-left',
          open ? 'border-b border-slate-200' : '',
        ].join(' ')}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-xl">{icon}</span>}
          <div>
            <p className="font-semibold text-slate-800 text-sm">{title}</p>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasError && <span className="text-red-500 text-xs font-medium">Campos obrigatórios</span>}
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {open && <div className="p-5 bg-white grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>}
    </div>
  )
}

export function FullWidth({ children }: { children: ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>
}
