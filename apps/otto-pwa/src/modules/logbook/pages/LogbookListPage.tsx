import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogbookEntries } from '../hooks/useLogbookEntries'
import { Card, Badge, Button, EmptyState, Spinner } from '@otto/shared-ui'
import { formatDate, formatDuration } from '@otto/shared-utils'
import { SUBSPECIALTIES, SURGEON_ROLES } from '../schemas/logbookForm.schema'
import { LogbookService } from '../services/LogbookService'
import { useAuth } from '@otto/shared-auth'
import type { ILogbook } from '../types'

// ── Helpers ───────────────────────────────────────────────────────────────────
const subspecialtyLabel = (val: string) =>
  SUBSPECIALTIES.find(s => s.value === val)?.label ?? val

const roleLabel = (val: string) =>
  SURGEON_ROLES.find(r => r.value === val)?.label ?? val

const roleColor = (role: string): 'blue' | 'purple' | 'amber' | 'slate' => {
  if (role === 'attending') return 'blue'
  if (role === 'resident-primary') return 'purple'
  if (role === 'fellow') return 'amber'
  return 'slate'
}

// ── LogbookCard ───────────────────────────────────────────────────────────────
function LogbookCard({ entry, onClick }: { entry: ILogbook; onClick: () => void }) {
  return (
    <Card onClick={onClick} className="hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 truncate">{entry.procedureName}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {formatDate(entry.surgeryDate)} · {entry.institutionName}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {entry.isDraft && <Badge label="Rascunho" color="amber" dot />}
          <Badge label={roleLabel(entry.surgeonRole)} color={roleColor(entry.surgeonRole)} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
          {subspecialtyLabel(entry.subspecialty)}
        </span>
        {entry.laterality !== 'na' && (
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">
            {entry.laterality === 'right' ? 'D' : entry.laterality === 'left' ? 'E' : entry.laterality}
          </span>
        )}
        {entry.durationMinutes && (
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            ⏱ {formatDuration(entry.durationMinutes)}
          </span>
        )}
        {entry.complications.length > 0 && (
          <Badge label={`${entry.complications.length} intercorrência(s)`} color="red" dot />
        )}
      </div>
    </Card>
  )
}

// ── FilterBar ─────────────────────────────────────────────────────────────────
interface Filters { subspecialty: string; surgeonRole: string; search: string }

function FilterBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <input
        type="search"
        value={filters.search}
        onChange={e => onChange({ ...filters, search: e.target.value })}
        placeholder="Buscar procedimento ou instituição…"
        className="flex-1 min-w-[200px] rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={filters.subspecialty}
        onChange={e => onChange({ ...filters, subspecialty: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todas as subespecialidades</option>
        {SUBSPECIALTIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      <select
        value={filters.surgeonRole}
        onChange={e => onChange({ ...filters, surgeonRole: e.target.value })}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos os papéis</option>
        {SURGEON_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
      </select>
      {(filters.subspecialty || filters.surgeonRole || filters.search) && (
        <button
          onClick={() => onChange({ subspecialty: '', surgeonRole: '', search: '' })}
          className="text-sm text-slate-400 hover:text-slate-700 px-2"
        >
          Limpar filtros ✕
        </button>
      )}
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function LogbookListPage() {
  const navigate = useNavigate()
  const { firebaseUser } = useAuth()
  const [filters, setFilters] = useState<Filters>({ subspecialty: '', surgeonRole: '', search: '' })
  const [exporting, setExporting] = useState<'csv' | 'json' | null>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useLogbookEntries({
      subspecialty: filters.subspecialty || undefined,
      surgeonRole:  filters.surgeonRole  || undefined,
      search:       filters.search       || undefined,
    })

  // Infinite scroll via IntersectionObserver
  const sentinelRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const setSentinel = useCallback((node: HTMLDivElement | null) => {
    // @ts-ignore
    if ((observerRef as any).current) ((observerRef as any).current as any).disconnect()
    if (!node) return
    // @ts-ignore
    Object.assign(observerRef, { current: new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage()
      }
    }, { threshold: 0.1 }) })
    (observerRef as any).current.observe(node)
    (sentinelRef as any).current = node
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const allEntries = data?.pages.flatMap(p => p.entries) ?? []
  const total = allEntries.length

  const handleExport = async (format: 'csv' | 'json') => {
    if (!firebaseUser) return
    setExporting(format)
    try {
      const svc = new LogbookService()
      if (format === 'csv') await svc.exportToCSV(firebaseUser.uid)
      else await svc.exportToJSON(firebaseUser.uid)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao exportar.')
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">OTTO Logbook</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {isLoading ? 'Carregando…' : `${total} registro${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Exportação */}
          {total > 0 && (
            <div className="relative group">
              <button
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-300 rounded-lg px-3 py-2 bg-white hover:bg-slate-50 transition-colors"
                disabled={!!exporting}
              >
                {exporting ? '⏳ Exportando…' : '⬇ Exportar'}
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 hidden group-hover:block min-w-[140px]">
                <button
                  onClick={() => void handleExport('csv')}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  disabled={!!exporting}
                >
                  📄 Baixar CSV
                </button>
                <button
                  onClick={() => void handleExport('json')}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  disabled={!!exporting}
                >
                  🗂 Baixar JSON
                </button>
              </div>
            </div>
          )}
          <Button onClick={() => navigate('/logbook/new')} leftIcon={<span>+</span>}>
            Nova entrada
          </Button>
        </div>
      </header>

      {/* Filtros */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Lista */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" className="text-blue-600" />
        </div>
      ) : allEntries.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Nenhuma cirurgia registrada ainda."
          description="Comece registrando seu primeiro procedimento."
          action={
            <Button size="sm" onClick={() => navigate('/logbook/new')}>
              Registrar primeira cirurgia
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {allEntries.map(entry => (
            <LogbookCard
              key={entry.id}
              entry={entry}
              onClick={() => navigate(`/logbook/${entry.id}`)}
            />
          ))}

          {/* Sentinel para infinite scroll */}
          <div ref={setSentinel} className="h-4" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Spinner className="text-blue-600" />
            </div>
          )}
          {!hasNextPage && total > 10 && (
            <p className="text-center text-xs text-slate-400 py-2">
              Todos os {total} registros carregados.
            </p>
          )}
        </div>
      )}
    </div>
  )
}












