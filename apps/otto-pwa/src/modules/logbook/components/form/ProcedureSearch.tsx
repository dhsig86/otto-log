import { useState, useRef, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { ENTOntologyEngine } from '@otto/shared-ontology'
import type { ENTOntologyEntry } from '@otto/shared-types'
import type { LogbookFormValues } from '../../schemas/logbookForm.schema'

const engine = new ENTOntologyEngine()

interface ProcedureSearchProps {
  subspecialty: string
}

export function ProcedureSearch({ subspecialty }: ProcedureSearchProps) {
  const { setValue, watch, formState: { errors } } = useFormContext<LogbookFormValues>()
  const procedureName = watch('procedureName')
  const [query, setQuery] = useState(procedureName ?? '')
  const [results, setResults] = useState<ENTOntologyEntry[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sub = subspecialty as Parameters<typeof engine.search>[1]
    const hits = engine.search(query, sub || undefined)
    setResults(hits)
    setOpen(hits.length > 0 && query.length > 1)
  }, [query, subspecialty])

  // Fechar ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (entry: ENTOntologyEntry) => {
    setValue('procedureId',   entry.id,   { shouldValidate: true })
    setValue('procedureName', entry.name, { shouldValidate: true })
    setValue('procedureCode', entry.codes.find(c => c.system === 'TUSS')?.code ?? '')
    const cids = entry.codes.filter(c => c.system === 'CID-10').map(c => c.code)
    if (cids.length) setValue('diagnosisCodes', cids)
    setQuery(entry.name)
    setOpen(false)
  }

  const error = errors.procedureId?.message

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setValue('procedureId', '') }}
        placeholder="Buscar procedimento (ex: timpanoplastia, FESS…)"
        className={[
          'block w-full rounded-lg border px-3 py-2 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          error ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white',
        ].join(' ')}
      />
      {error && <p className="text-xs text-red-600 mt-1">⚠ {error}</p>}

      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map(entry => (
            <li
              key={entry.id}
              onMouseDown={() => select(entry)}
              className="px-3 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-0"
            >
              <p className="text-sm font-medium text-slate-800">{entry.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {entry.codes.find(c => c.system === 'TUSS')?.code} ·{' '}
                <span className="capitalize">{entry.subspecialty}</span> ·{' '}
                Complexidade {'★'.repeat(entry.complexity)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
