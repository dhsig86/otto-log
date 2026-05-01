import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { useLogbookStats } from '../hooks/useLogbookStats'
import { Spinner } from '@otto/shared-ui'
import { useAuth } from '@otto/shared-auth'
import { LogbookService } from '../services/LogbookService'
import { useState } from 'react'
import type { ReactElement } from 'react'

// ── Paleta ────────────────────────────────────────────────────────────────────
const COLORS_BLUE   = ['#3b82f6','#60a5fa','#93c5fd','#bfdbfe','#dbeafe','#eff6ff','#1d4ed8','#2563eb']
const COLORS_ACCENT = ['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe','#ede9fe']

// ── Cartão de resumo ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = 'blue' }: {
  icon: string; label: string; value: string | number; sub?: string
  color?: 'blue' | 'purple' | 'amber' | 'green' | 'red'
}) {
  const bg: Record<string, string> = {
    blue:   'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    amber:  'bg-amber-50 border-amber-200',
    green:  'bg-green-50 border-green-200',
    red:    'bg-red-50 border-red-200',
  }
  const text: Record<string, string> = {
    blue: 'text-blue-700', purple: 'text-purple-700',
    amber: 'text-amber-700', green: 'text-green-700', red: 'text-red-700',
  }
  return (
    <div className={`rounded-xl border p-4 ${bg[color]}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className={`text-2xl font-bold ${text[color]}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Wrapper de seção ──────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h2 className="text-sm font-semibold text-slate-600 mb-4 uppercase tracking-wide">{title}</h2>
      {children}
    </div>
  )
}

// ── Tooltip customizado ───────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean; payload?: { value: number }[]; label?: string
}) {
  if (!active || !payload?.length) return null
  const v = payload[0]?.value ?? 0
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="font-medium text-slate-700">{label}</p>
      <p className="text-blue-600">{v} caso{v !== 1 ? 's' : ''}</p>
    </div>
  )
}

// ── Label do pie chart ────────────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
  cx: number; cy: number; midAngle: number
  innerRadius: number; outerRadius: number; percent: number
}): ReactElement | null {
  if (percent < 0.06) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${Math.round(percent * 100)}%`}
    </text>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function LogbookDashboardPage() {
  const navigate = useNavigate()
  const { firebaseUser } = useAuth()
  const { data: stats, isLoading, isError } = useLogbookStats()
  const [exporting, setExporting] = useState<'csv' | 'json' | null>(null)

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    )
  }

  if (isError || !stats) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-red-500 text-sm">Erro ao carregar estatísticas. Tente novamente.</p>
      </div>
    )
  }

  const isEmpty = stats.totalPublished === 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">

      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Minha Casuística</h1>
          <p className="text-slate-400 text-sm mt-0.5">Análise dos seus registros cirúrgicos em ORL</p>
        </div>
        {!isEmpty && (
          <div className="relative group">
            <button
              disabled={!!exporting}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-300 rounded-lg px-3 py-2 bg-white hover:bg-slate-50 transition-colors"
            >
              {exporting ? '⏳ Exportando…' : '⬇ Exportar'}
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 hidden group-hover:block min-w-[140px]">
              <button onClick={() => void handleExport('csv')} disabled={!!exporting}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                📄 Baixar CSV
              </button>
              <button onClick={() => void handleExport('json')} disabled={!!exporting}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                🗂 Baixar JSON
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Estado vazio */}
      {isEmpty ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">Nenhum dado ainda</h2>
          <p className="text-slate-400 text-sm mb-5">
            Registre sua primeira cirurgia para ver as estatísticas aqui.
          </p>
          <button
            onClick={() => navigate('/logbook/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors"
          >
            Registrar primeiro caso
          </button>
        </div>
      ) : (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              icon="🔪" label="Cirurgias publicadas"
              value={stats.totalPublished}
              sub={stats.totalDrafts > 0 ? `+ ${stats.totalDrafts} rascunho${stats.totalDrafts !== 1 ? 's' : ''}` : undefined}
              color="blue"
            />
            <StatCard
              icon="⚠️" label="Taxa de complicações"
              value={`${stats.complicationRate}%`}
              sub={`${stats.complicationsBySeverity.reduce((s, c) => s + c.count, 0)} ocorrência(s)`}
              color={stats.complicationRate > 10 ? 'red' : stats.complicationRate > 5 ? 'amber' : 'green'}
            />
            <StatCard
              icon="⏱" label="Duração média"
              value={stats.avgDurationMin ? `${stats.avgDurationMin} min` : '—'}
              sub="por cirurgia"
              color="purple"
            />
            <StatCard
              icon="🏥" label="Instituições"
              value={stats.topInstitutions.length}
              sub={stats.topInstitutions[0]?.name ?? ''}
              color="blue"
            />
          </div>

          {/* Casos por mês */}
          <Section title="Evolução temporal — casos por mês">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.byMonth} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="casos" fill="#3b82f6" radius={[4,4,0,0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Section>

          {/* Subespecialidade + Papel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Section title="Distribuição por subespecialidade">
              {stats.bySubspecialty.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats.bySubspecialty} dataKey="count" nameKey="name"
                      cx="50%" cy="50%" outerRadius={80}
                      labelLine={false} label={PieLabel}
                    >
                      {stats.bySubspecialty.map((_, i) => (
                        <Cell key={i} fill={COLORS_BLUE[i % COLORS_BLUE.length]} />
                      ))}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                    <Tooltip formatter={(v: number) => [`${v} caso${v !== 1 ? 's' : ''}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 text-sm text-center py-8">Sem dados</p>
              )}
            </Section>

            <Section title="Papel do cirurgião">
              {stats.byRole.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats.byRole} dataKey="count" nameKey="name"
                      cx="50%" cy="50%" outerRadius={80}
                      labelLine={false} label={PieLabel}
                    >
                      {stats.byRole.map((_, i) => (
                        <Cell key={i} fill={COLORS_ACCENT[i % COLORS_ACCENT.length]} />
                      ))}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                    <Tooltip formatter={(v: number) => [`${v} caso${v !== 1 ? 's' : ''}`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-400 text-sm text-center py-8">Sem dados</p>
              )}
            </Section>
          </div>

          {/* Top procedimentos */}
          {stats.topProcedures.length > 0 && (
            <Section title="Procedimentos mais frequentes">
              <ResponsiveContainer width="100%" height={Math.max(180, stats.topProcedures.length * 36)}>
                <BarChart data={stats.topProcedures} layout="vertical"
                  margin={{ top: 0, right: 32, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis
                    type="category" dataKey="name" width={200}
                    tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={false}
                    tickFormatter={(v: string) => v.length > 28 ? v.slice(0, 28) + '…' : v}
                  />
                  <Tooltip formatter={(v: number) => [`${v} caso${v !== 1 ? 's' : ''}`, '']} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[0,4,4,0]} maxBarSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </Section>
          )}

          {/* Anestesia + Complicações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {stats.byAnesthesia.length > 0 && (
              <Section title="Tipo de anestesia">
                <div className="space-y-2">
                  {stats.byAnesthesia.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="text-xs text-slate-600 w-32 shrink-0 truncate">{item.name}</div>
                      <div className="flex-1 bg-slate-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-400"
                          style={{ width: `${Math.round(item.count / stats.totalPublished * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-8 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {stats.complicationsBySeverity.length > 0 ? (
              <Section title="Complicações por severidade">
                <div className="space-y-2">
                  {stats.complicationsBySeverity.map((item, i) => {
                    const total = stats.complicationsBySeverity.reduce((s, c) => s + c.count, 0)
                    const colorMap: Record<string, string> = {
                      'Leve': 'bg-amber-400',
                      'Grave': 'bg-orange-500',
                      'Risco de Vida': 'bg-red-600',
                    }
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <div className="text-xs text-slate-600 w-24 shrink-0">{item.name}</div>
                        <div className="flex-1 bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${colorMap[item.name] ?? 'bg-blue-400'}`}
                            style={{ width: `${Math.round(item.count / total * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400 w-8 text-right">{item.count}</span>
                      </div>
                    )
                  })}
                </div>
              </Section>
            ) : (
              <Section title="Complicações">
                <div className="flex flex-col items-center justify-center h-24 text-center">
                  <p className="text-green-600 font-semibold text-sm">✓ Nenhuma complicação registrada</p>
                  <p className="text-slate-400 text-xs mt-1">Excelente casuística!</p>
                </div>
              </Section>
            )}
          </div>

          {/* Top instituições */}
          {stats.topInstitutions.length > 1 && (
            <Section title="Atividade por instituição">
              <div className="space-y-2">
                {stats.topInstitutions.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="text-xs text-slate-600 flex-1 truncate">{item.name}</div>
                    <div className="w-40 bg-slate-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-400"
                        style={{ width: `${Math.round(item.count / (stats.topInstitutions[0]?.count ?? 1) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  )
}
