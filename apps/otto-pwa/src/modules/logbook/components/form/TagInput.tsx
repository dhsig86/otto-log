import { useState, type KeyboardEvent } from 'react'

interface TagInputProps {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  label?: string
}

export function TagInput({ value, onChange, placeholder = 'Adicionar…', label }: TagInputProps) {
  const [input, setInput] = useState('')

  const add = () => {
    const trimmed = input.trim().toUpperCase()
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed])
    setInput('')
  }

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add() }
    if (e.key === 'Backspace' && !input && value.length) onChange(value.slice(0, -1))
  }

  return (
    <div className="flex flex-wrap gap-1.5 items-center border border-slate-300 rounded-lg px-3 py-2 min-h-[40px] bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
      {value.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
          {tag}
          <button type="button" onClick={() => onChange(value.filter(v => v !== tag))} className="hover:text-blue-900">×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[100px] text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
        aria-label={label}
      />
    </div>
  )
}
