import { useParams, useNavigate } from 'react-router-dom'
import { useLogbook } from '../hooks/useLogbookEntry'
import { LogbookForm } from '../components/LogbookForm'
import { Spinner } from '@otto/shared-ui'
import type { LogbookFormValues } from '../schemas/logbookForm.schema'

export default function LogbookEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { log, isLoading } = useLogbook(id!)

  if (isLoading) return (
    <div className="flex items-center justify-center py-24">
      <Spinner size="lg" className="text-blue-600" />
    </div>
  )
  if (!log) return (
    <div className="flex flex-col items-center py-24 gap-3">
      <p className="text-slate-400">Registro não encontrado.</p>
      <button onClick={() => navigate('/logbook')} className="text-blue-600 hover:underline text-sm">
        Voltar ao logbook
      </button>
    </div>
  )

  // Mapear ILogbook → LogbookFormValues
  const initial: Partial<LogbookFormValues> = {
    surgeryDate:      log.surgeryDate instanceof Date
      ? log.surgeryDate.toISOString().split('T')[0]
      : String(log.surgeryDate),
    startTime:        log.startTime,
    endTime:          log.endTime,
    durationMinutes:  log.durationMinutes,
    institutionId:    log.institutionId,
    institutionName:  log.institutionName,
    operatingRoom:    log.operatingRoom,
    subspecialty:     log.subspecialty,
    procedureId:      log.procedureId,
    procedureName:    log.procedureName,
    procedureCode:    log.procedureCode,
    diagnosisCodes:   log.diagnosisCodes,
    laterality:       log.laterality,
    approachDetails:  log.approachDetails,
    patientAge:       log.patientAge,
    patientSex:       log.patientSex,
    patientASA:       log.patientASA,
    patientComorbidities: log.patientComorbidities,
    surgeonRole:      log.surgeonRole,
    supervisorName:   log.supervisorName,
    team:             log.team,
    anesthesiaType:   log.anesthesiaType,
    graftUsed:        log.graftUsed,
    implantUsed:      log.implantUsed,
    intraopFindings:  log.intraopFindings,
    estimatedBloodLossMl: log.estimatedBloodLossMl,
    complications:    log.complications,
    unplannedConversion: log.unplannedConversion,
    durationComment:  log.durationComment,
    teachingPoints:   log.teachingPoints,
    clinicalNotes:    log.clinicalNotes,
    privateNotes:     log.privateNotes,
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Editar registro</h1>
        <p className="text-slate-500 text-sm mt-1">{log.procedureName}</p>
      </div>
      <LogbookForm
        initialValues={initial}
        entryId={id}
        onSuccess={savedId => navigate(`/logbook/${savedId}`)}
      />
    </div>
  )
}


