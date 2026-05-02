import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  placeholder?: string
  options: { value: string | number; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, placeholder, options, className = '', ...props }, ref) => (
    <select
      ref={ref}
      className={[
        'block w-full rounded-lg border px-3 py-2 text-sm text-slate-900',
        'focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
        'disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors duration-150',
        'bg-white appearance-none',
        error
          ? 'border-red-400 bg-red-50 focus:ring-red-500'
          : 'border-slate-300',
        className,
      ].join(' ')}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
)
Select.displayName = 'Select'
