import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useForm, FormProvider, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { LogbookFormSchema, LogbookFormValues,
         SUBSPECIALTIES, SURGEON_ROLES, ANESTHESIA_TYPES,
         LATERALITIES, ASA_CLASSES, COMMON_COMORBIDITIES, COMMON_GRAFTS } from '../schemas/logbookForm.schema'
import { FormSection, FullWidth } from './form/FormSection'
import { ProcedureSearch } from './form/ProcedureSearch'
import { CheckboxGroup } from './form/CheckboxGroup'
import { TagInput } from './form/TagInput'
import { TeamBuilder } from './form/TeamBuilder'
import { ComplicationsBuilder } from './form/ComplicationsBuilder'
import { FormField, Input, Textarea, Select, Button, Badge } from '@otto/shared-ui'
import { LogbookService } from '../services/LogbookService'
import type { ILogbook } from '../types'
import { useAuth } from '@otto/shared-auth'
import { ENTOntologyEngine } from '@otto/shared-ontology'
import { GuidelinesInline } from './GuidelineCard'

// Instância singleton do motor de ontologia (não precisa de estado)
const ontologyEngine = new ENTOntologyEngine()

// ── Valores padrão ────────────────────────────────────────────────────────────
const today = new Date().toISOString().split('T')[0]!

const DEFAULT_VALUES: Partial<LogbookFormValues> = {
  surgeryDate:          today,
  subspecialty:         '',
  procedureId:          '',
  procedureName:        '',
  laterality:           'na',
  patientAge:           undefined,
  patientSex:           undefined,   // optional — sem valor padrão
  patientASA:           undefined,   // optional — sem valor padrão
  patientComorbidities: [],
  surgeonRole:          undefined,
  team:                 [],
  anesthesiaType:       undefined,
  complications:        [],
  diagnosisCodes:       [],
  unplannedConversion:  false,
  isDraft:              false,
  syncStatus:           'synced',
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface LogbookFormProps {
  initialValues?: Partial<LogbookFormValues>
  entryId?: string          // presente em modo edição
  onSuccess?: (id: string) => void
}

// ── Componente ────────────────────────────────────────────────────────────────
export function LogbookForm({ initialValues, entryId, onSuccess }: LogbookFormProps) {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const service   = new LogbookService()
  const draftRef  = useRef<string | undefined>(entryId)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const methods = useForm<LogbookFormValues>({
    resolver:      zodResolver(LogbookFormSchema),
    defaultValues: { ...DEFAULT_VALUES, ...initialValues },
    mode:          'onBlur',
  })

  const { register, handleSubmit, watch, control,
          formState: { errors, isSubmitting, isDirty } } = methods

  const subspecialty  = watch('subspecialty')
  const surgeonRole   = watch('surgeonRole')
  const procedureId   = watch('procedureId')

  // Entrada de ontologia para o procedimento selecionado (para exibir guidelines)
  const selectedProcedure = useMemo(
    () => procedureId ? ontologyEngine.getById(procedureId) : undefined,
    [procedureId],
  )

  // ── Auto-save rascunho a cada 10s ─────────────────────────────────────────
  const saveDraft = useCallback(async () => {
    const values = methods.getValues()
    if (!user) return
    try {
      const id = await service.saveDraft(draftRef.current, {
        ...values,
        ownerUid:    user.uid,
        isDraft:     true,
        syncStatus:  'synced',
        imageIds:    [],
        createdAt:   new Date(),
        updatedAt:   new Date(),
        version:     1,
      } as unknown as ILogbook)
      draftRef.current = id
    } catch { /* silent */ }
  }, [user, methods, service])

  useEffect(() => {
    const sub = watch(() => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => { void saveDraft() }, 10_000)
    })
    return () => { sub.unsubscribe(); if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [watch, saveDraft])

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (values: LogbookFormValues) => {
    if (!user) return
    // @ts-ignore
    const payload: ILogbook = {
      ...values,
      ownerUid:   user.uid,
      isDraft:    false,
      syncStatus: 'synced',
      imageIds:   [],
      createdAt:  new Date(),
      updatedAt:  new Date(),
      version:    1,
      patientASA: values.patientASA as 1|2|3|4|5,
    }
    let id: string
    if (entryId) {
      await service.update(entryId, payload)
      id = entryId
    } else {
      id = await service.create(payload)
      if (draftRef.current && draftRef.current !== id) {
        // Apagar rascunho anterior se havia um
        void service.update(draftRef.current, { isDraft: false } as Partial<ILogbook>)
      }
    }
    onSuccess ? onSuccess(id) : navigate(`/logbook/${id}`)
  }

  const saveDraftNow = async () => {
    await saveDraft()
    navigate('/logbook')
  }

  // ── Erros por seção ────────────────────────────────────────────────────────
  const s1Err = false
  const s2Err = false
  const s3Err = false
  const s4Err = false
  const s5Err = false

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-3">

        {/* ── Seção 1: Cirurgia ── */}
        <FormSection title="Cirurgia" icon="🗓" subtitle="Data, horário e local" defaultOpen hasError={s1Err}>
          <FormField label="Data" htmlFor="surgeryDate" hint="Recomendado preencher">
            <Input id="surgeryDate" type="date" {...register('surgeryDate')} />
          </FormField>
          <FormField label="Instituição" htmlFor="institutionName" hint="Recomendado preencher">
            <Input id="institutionName"
              {...register('institutionName', {
                onChange: e => methods.setValue('institutionId', e.target.value.toLowerCase().replace(/\s+/g, '-'))
              })}
              placeholder="Ex: HC-FMUSP, Santa Casa…"
            />
          </FormField>
          <FormField label="Duração (min)" htmlFor="durationMinutes">
            <Input id="durationMinutes" type="number" min={1} max={600} {...register('durationMinutes')}
              placeholder="90" />
          </FormField>
          <FormField label="Sala cirúrgica" htmlFor="operatingRoom">
            <Input id="operatingRoom" {...register('operatingRoom')} placeholder="Ex: Sala 3" />
          </FormField>
        </FormSection>

        {/* ── Seção 2: Procedimento ── */}
        <FormSection title="Procedimento" icon="🔬" subtitle="Subespecialidade, código e lateralidade" hasError={s2Err}>
          <FormField label="Subespecialidade" htmlFor="subspecialty" hint="Recomendado preencher">
            <Controller name="subspecialty" control={control} render={({ field }) => (
              <Select {...field} id="subspecialty" placeholder="Selecionar…"
                options={SUBSPECIALTIES.map(s => ({ value: s.value, label: s.label }))} />
            )} />
          </FormField>
          <FormField label="Lateralidade" htmlFor="laterality">
            <Controller name="laterality" control={control} render={({ field }) => (
              <Select {...field} id="laterality" placeholder="Selecionar…"
                options={LATERALITIES.map(l => ({ value: l.value, label: l.label }))} />
            )} />
          </FormField>
          <FullWidth>
            <FormField label="Procedimento" hint="Digite para buscar na ontologia ENT (TUSS, CID-10)">
              <ProcedureSearch subspecialty={subspecialty} />
            </FormField>
            {/* Guidelines e links PubMed exibidos automaticamente ao selecionar procedimento */}
            <GuidelinesInline entry={selectedProcedure} engine={ontologyEngine} />
          </FullWidth>
          <FullWidth>
            <FormField label="CIDs (pressione Enter para adicionar)"
              hint="Ex: H72, J32. Preenchidos automaticamente ao selecionar procedimento.">
              <Controller name="diagnosisCodes" control={control} render={({ field }) => (
                <TagInput value={field.value} onChange={field.onChange}
                  placeholder="Adicionar CID-10…" />
              )} />
            </FormField>
          </FullWidth>
          <FullWidth>
            <FormField label="Detalhes da abordagem" htmlFor="approachDetails">
              <Input id="approachDetails" {...register('approachDetails')}
                placeholder="Ex: endoscópica, microscópica, combinada…" />
            </FormField>
          </FullWidth>
        </FormSection>

        {/* ── Seção 3: Paciente ── */}
        <FormSection title="Paciente" icon="👤" subtitle="Dados clínicos — sem identificação" hasError={s3Err}>
          <FormField label="Idade" htmlFor="patientAge">
            <Input id="patientAge" type="number" min={0} max={120} {...register('patientAge')}
              placeholder="Ex: 42" />
          </FormField>
          <FormField label="Sexo" htmlFor="patientSex" error={errors.patientSex?.message}>
            <Controller name="patientSex" control={control} render={({ field }) => (
              <Select
                id="patientSex"
                placeholder="Selecionar…"
                value={field.value ?? ''}
                onChange={e => field.onChange(e.target.value || undefined)}
                onBlur={field.onBlur}
                name={field.name}
                options={[{ value: 'M', label: 'Masculino' }, { value: 'F', label: 'Feminino' }, { value: 'other', label: 'Outro' }]}
                error={errors.patientSex?.message} />
            )} />
          </FormField>
          <FormField label="ASA" htmlFor="patientASA" error={errors.patientASA?.message}>
            <Controller name="patientASA" control={control} render={({ field }) => (
              <Select
                id="patientASA"
                placeholder="Selecionar…"
                value={field.value ?? ''}
                onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                onBlur={field.onBlur}
                name={field.name}
                options={ASA_CLASSES.map(a => ({ value: a.value, label: a.label }))}
                error={errors.patientASA?.message} />
            )} />
          </FormField>
          <FullWidth>
            <FormField label="Comorbidades" hint="Marque as aplicáveis">
              <Controller name="patientComorbidities" control={control} render={({ field }) => (
                <CheckboxGroup options={COMMON_COMORBIDITIES} value={field.value} onChange={field.onChange} columns={3} />
              )} />
            </FormField>
          </FullWidth>
        </FormSection>

        {/* ── Seção 4: Equipe ── */}
        <FormSection title="Equipe" icon="👥" subtitle="Papel cirúrgico e membros" hasError={s4Err}>
          <FormField label="Seu papel" htmlFor="surgeonRole" hint="Recomendado preencher">
            <Controller name="surgeonRole" control={control} render={({ field }) => (
              <Select {...field} id="surgeonRole" placeholder="Selecionar…"
                options={SURGEON_ROLES.map(r => ({ value: r.value, label: r.label }))} />
            )} />
          </FormField>
          {(surgeonRole === 'resident-primary' || surgeonRole === 'first-assistant') && (
            <FormField label="Supervisor / Preceptor" htmlFor="supervisorName">
              <Input id="supervisorName" {...register('supervisorName')} placeholder="Nome do supervisor" />
            </FormField>
          )}
          <FullWidth>
            <FormField label="Membros da equipe" hint="Anestesiologista, instrumentadora, auxiliares…">
              <TeamBuilder />
            </FormField>
          </FullWidth>
        </FormSection>

        {/* ── Seção 5: Técnica ── */}
        <FormSection title="Técnica cirúrgica" icon="⚙️" subtitle="Anestesia, enxertos, achados" hasError={s5Err}>
          <FormField label="Anestesia" htmlFor="anesthesiaType">
            <Controller name="anesthesiaType" control={control} render={({ field }) => (
              <Select {...field} id="anesthesiaType" placeholder="Selecionar…"
                options={ANESTHESIA_TYPES.map(a => ({ value: a.value, label: a.label }))} />
            )} />
          </FormField>
          <FormField label="Enxerto / Biomaterial" htmlFor="graftUsed">
            <input {...register('graftUsed')} id="graftUsed" list="grafts-list"
              placeholder="Ex: fáscia temporal, cartilagem…"
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <datalist id="grafts-list">{COMMON_GRAFTS.map(g => <option key={g} value={g} />)}</datalist>
          </FormField>
          <FormField label="Implante / Prótese" htmlFor="implantUsed">
            <Input id="implantUsed" {...register('implantUsed')} placeholder="Ex: prótese TORP, implante coclear…" />
          </FormField>
          <FullWidth>
            <FormField label="Achados intraoperatórios" htmlFor="intraopFindings">
              <Textarea id="intraopFindings" {...register('intraopFindings')} rows={3}
                placeholder="Descreva os achados relevantes do intraoperatório…" />
            </FormField>
          </FullWidth>
        </FormSection>

        {/* ── Seção 6: Desfecho ── */}
        <FormSection title="Desfecho" icon="📈" subtitle="Complicações e resultado">
          <FormField label="Perda sanguínea estimada (mL)" htmlFor="estimatedBloodLossMl">
            <Input id="estimatedBloodLossMl" type="number" min={0} {...register('estimatedBloodLossMl')}
              placeholder="Ex: 50" />
          </FormField>
          <FormField label="Comentário sobre duração" htmlFor="durationComment">
            <Input id="durationComment" {...register('durationComment')}
              placeholder="Ex: mais longo por aderências" />
          </FormField>
          <FullWidth>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" {...register('unplannedConversion')}
                className="w-4 h-4 rounded border-slate-300 text-blue-600" />
              Conversão não planejada (ex: laparoscópica → aberta)
            </label>
          </FullWidth>
          <FullWidth>
            <FormField label="Intercorrências">
              <ComplicationsBuilder />
            </FormField>
          </FullWidth>
        </FormSection>

        {/* ── Seção 7: Notas ── */}
        <FormSection title="Notas e ensino" icon="📝" subtitle="Aprendizados, referências, observações privadas">
          <FullWidth>
            <FormField label="Pontos de ensino" htmlFor="teachingPoints"
              hint="O que este caso ensina? Técnica, anatomia, decisão clínica…">
              <Textarea id="teachingPoints" {...register('teachingPoints')} rows={3}
                placeholder="Ex: Identificação do n. facial em plano subfascial facilitada por…" />
            </FormField>
          </FullWidth>
          <FullWidth>
            <FormField label="Notas clínicas" htmlFor="clinicalNotes">
              <Textarea id="clinicalNotes" {...register('clinicalNotes')} rows={3}
                placeholder="Observações clínicas adicionais sobre o caso…" />
            </FormField>
          </FullWidth>
          <FullWidth>
            <FormField label="Notas privadas" htmlFor="privateNotes"
              hint="Não sincronizadas com APIs externas.">
              <Textarea id="privateNotes" {...register('privateNotes')} rows={2}
                placeholder="Anotações pessoais (não exportadas)…" />
            </FormField>
          </FullWidth>
        </FormSection>

        {/* ── Ações ── */}
        <div className="flex items-center justify-between pt-2 pb-6">
          <Button type="button" variant="ghost" onClick={saveDraftNow}>
            Salvar rascunho
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {entryId ? 'Salvar alterações' : 'Registrar cirurgia'}
            </Button>
          </div>
        </div>

      </form>
    </FormProvider>
  )
}








