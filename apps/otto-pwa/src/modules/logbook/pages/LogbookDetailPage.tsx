import { useParams, useNavigate } from 'react-router-dom'
import { useLogbook } from '../hooks/useLogbookEntry'
import { useQueryClient } from '@tanstack/react-query'
import { LogbookService } from '../services/LogbookService'
import { useAuth } from '@otto/shared-auth'
import { Button, Badge, Card, Spinner } from '@otto/shared-ui'
import { formatDate, formatDateTime, formatDuration } from '@otto/shared-utils'
import { GuidelineCard } from '../components/GuidelineCard'
import { SUBSPECIALTIES, SURGEON_ROLES, ANESTHESIA_TYPES, LATERALITIES } from '../schemas/logbookForm.schema'
import type { ILogbook } from '../types'
import { ENTOntologyEngine } from '@otto/shared-ontology'

const engine = new ENTOntologyEngine()

// ── Helpers de label ──────────────────────────────────────────────────────────
const lbl = <T extends { value: string | number; label: string }>(arr: readonly T[], val: string | number) =>
  arr.find(i => i.value === val)?.label ?? String(val)

// ── Linha de detalhe ──────────────────────────────────────────────────────────
function Detail({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm text-slate-800">{value}</span>
    </div>
  )
}

// ── Seção de detalhe ──────────────────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <Card padding="lg">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
        <span>{icon}</span>{title}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {children}
      </div>
    </Card>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────
export default function LogbookDetailPage() {
  const { id }         = useParams<{ id: string }>()
  const navigate       = useNavigate()
  const { user }       = useAuth()
  const queryClient    = useQueryClient()
  const { log, isLoading } = useLogbook(id!)
  const service        = new LogbookService()

  if (isLoading) return (
    <div className="flex justify-center py-24"><Spinner size="lg" className="text-blue-600" /></div>
  )
  if (!log) return (
    <div className="flex flex-col items-center py-24 gap-3">
      <p className="text-slate-400">Registro não encontrado.</p>
      <Button variant="ghost" onClick={() => navigate('/logbook')}>← Voltar</Button>
    </div>
  )

  const ontologyEntry = new ENTOntologyEngine().getById(log.procedureId)

  const handleDuplicate = async () => {
    if (!user) return
    const newId = await service.duplicate(id!, user.uid)
    void queryClient.invalidateQueries({ queryKey: ['logbook-entries'] })
    navigate(`/logbook/${newId}/edit`)
  }

  const handleDelete = async () => {
    if (!confirm('Excluir este registro permanentemente?')) return
    await service.delete(id!)
    void queryClient.invalidateQueries({ queryKey: ['logbook-entries'] })
    navigate('/logbook')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col gap-4">
      {/* Breadcrumb + ações */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/logbook')} className="text-sm text-slate-400 hover:text-slate-700">
          ← Logbook
        </button>
        <div className="flex gap-2">
          {log.isDraft && <Badge label="Rascunho" color="amber" dot />}
          <Button size="sm" variant="secondary" onClick={handleDuplicate}>Duplicar</Button>
          <Button size="sm" onClick={() => navigate(`/logbook/${id}/edit`)}>Editar</Button>
          <Button size="sm" variant="danger" onClick={() => void handleDelete()}>Excluir</Button>
        </div>
      </div>

      {/* Cabeçalho */}
      <Card padding="lg">
        <h1 className="text-xl font-bold text-slate-800">{log.procedureName}</h1>
        <p className="text-slate-400 text-sm mt-1">
          {formatDate(log.surgeryDate)} · {log.institutionName}
          {log.operatingRoom ? ` · ${log.operatingRoom}` : ''}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge label={lbl(SUBSPECIALTIES, log.subspecialty)} color="blue" />
          <Badge label={lbl(SURGEON_ROLES,  log.surgeonRole)}  color="purple" />
          {log.procedureCode && (
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              TUSS {log.procedureCode}
            </span>
          )}
        </div>
      </Card>

      {/* Guidelines (Fase 7) */}
      {((log as any).guidelines || []).length > 0 ? (
        <div>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Guidelines disponíveis
          </h2>
          <div className="flex flex-col gap-2">
            {((log as any).guidelines || []).map((g: any, i: number) => (
              <GuidelineCard key={i} guideline={g} procedureId={log.procedureId} engine={engine} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Seção 1 — Cirurgia */}
      <Section title="Cirurgia" icon="🗓">
        <Detail label="Data"        value={formatDate(log.surgeryDate)} />
        <Detail label="Início"      value={log.startTime} />
        <Detail label="Fim"         value={log.endTime} />
        <Detail label="Duração"     value={log.durationMinutes ? formatDuration(log.durationMinutes) : null} />
        <Detail label="Lateralidade" value={lbl(LATERALITIES, log.laterality)} />
        <Detail label="Abordagem"   value={log.approachDetails} />
      </Section>

      {/* Seção 2 — Paciente */}
      <Section title="Paciente" icon="👤">
        <Detail label="Idade"       value={`${log.patientAge} anos`} />
        <Detail label="Sexo"        value={({ M: 'Masculino', F: 'Feminino', other: 'Outro' } as any)[log.patientSex as any]} />
        <Detail label="ASA"         value={`ASA ${log.patientASA}`} />
        {log.patientComorbidities.length > 0 && (
          <div className="col-span-2 sm:col-span-3 flex flex-col gap-0.5">
            <span className="text-xs text-slate-400 uppercase tracking-wide">Comorbidades</span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {log.patientComorbidities.map((c: any) => (
                <span key={c} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{c}</span>
              ))}
            </div>
          </div>
        )}
      </Section>

      {/* Seção 3 — Equipe */}
      <Section title="Equipe" icon="👥">
        <Detail label="Papel"        value={lbl(SURGEON_ROLES, log.surgeonRole)} />
        <Detail label="Supervisor"   value={log.supervisorName} />
        {log.team.length > 0 && (
          <div className="col-span-2 sm:col-span-3">
            <span className="text-xs text-slate-400 uppercase tracking-wide block mb-1.5">Equipe</span>
            {log.team.map((m: any, i: number) => (
              <p key={i} className="text-sm text-slate-700">{m.name} — <span className="text-slate-400">{m.role}</span></p>
            ))}
          </div>
        )}
      </Section>

      {/* Seção 4 — Técnica */}
      <Section title="Técnica" icon="⚙️">
        <Detail label="Anestesia"    value={lbl(ANESTHESIA_TYPES, log.anesthesiaType)} />
        <Detail label="Enxerto"      value={log.graftUsed} />
        <Detail label="Implante"     value={log.implantUsed} />
        {log.intraopFindings && (
          <div className="col-span-2 sm:col-span-3 flex flex-col gap-0.5">
            <span className="text-xs text-slate-400 uppercase tracking-wide">Achados intraoperatórios</span>
            <p className="text-sm text-slate-800 whitespace-pre-line">{log.intraopFindings}</p>
          </div>
        )}
      </Section>

      {/* Seção 5 — Desfecho */}
      <Section title="Desfecho" icon="📈">
        <Detail label="Perda sanguínea" value={log.estimatedBloodLossMl != null ? `${log.estimatedBloodLossMl} mL` : null} />
        <Detail label="Conversão NP"    value={log.unplannedConversion ? 'Sim' : null} />
        <Detail label="Obs. duração"    value={log.durationComment} />
        {log.complications.length > 0 && (
          <div className="col-span-2 sm:col-span-3">
            <span className="text-xs text-slate-400 uppercase tracking-wide block mb-1.5">Intercorrências</span>
            {(log.complications || []).map((c: any, i: number) => (
              <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-2">
                <Badge label={({ minor: 'Menor', major: 'Maior', 'life-threatening': 'Risco de Vida' } as any)[c.severity as any]} color="red" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{c.type}</p>
                  <p className="text-xs text-slate-500">{c.management}</p>
                  {c.resolved && <p className="text-xs text-green-600 mt-0.5">✓ Resolvida</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Seção 6 — Notas */}
      {(log.teachingPoints || log.clinicalNotes) && (
        <Card padding="lg">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4 flex items-center gap-2">
            <span>📝</span> Notas e ensino
          </h2>
          {log.teachingPoints && (
            <div className="mb-3">
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Pontos de ensino</p>
              <p className="text-sm text-slate-800 whitespace-pre-line">{log.teachingPoints}</p>
            </div>
          )}
          {log.clinicalNotes && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Notas clínicas</p>
              <p className="text-sm text-slate-800 whitespace-pre-line">{log.clinicalNotes}</p>
            </div>
          )}
        </Card>
      )}

      {/* Footer */}
      <p className="text-xs text-slate-300 text-center pb-4">
        Criado em {formatDateTime(log.createdAt)} · v{log.version}
      </p>
    </div>
  )
}




