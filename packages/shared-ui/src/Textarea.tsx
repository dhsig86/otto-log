import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = '', ...props }, ref) => (
    <textarea
      ref={ref}
      className={[
        'block w-full rounded-lg border px-3 py-2 text-sm text-slate-900',
        'placeholder:text-slate-400 resize-y min-h-[80px]',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
        'disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors duration-150',
        error
          ? 'border-red-400 bg-red-50 focus:ring-red-500'
          : 'border-slate-300 bg-white',
        className,
      ].join(' ')}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'
