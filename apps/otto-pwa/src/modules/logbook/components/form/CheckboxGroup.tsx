interface CheckboxGroupProps {
  options: string[]
  value: string[]
  onChange: (next: string[]) => void
  columns?: 2 | 3 | 4
}

export function CheckboxGroup({ options, value, onChange, columns = 3 }: CheckboxGroupProps) {
  const toggle = (item: string) => {
    onChange(value.includes(item) ? value.filter(v => v !== item) : [...value, item])
  }
  const colClass = { 2: 'grid-cols-2', 3: 'grid-cols-2 sm:grid-cols-3', 4: 'grid-cols-2 sm:grid-cols-4' }[columns]
  return (
    <div className={`grid ${colClass} gap-2`}>
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={value.includes(opt)}
            onChange={() => toggle(opt)}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-slate-700 group-hover:text-slate-900">{opt}</span>
        </label>
      ))}
    </div>
  )
}
