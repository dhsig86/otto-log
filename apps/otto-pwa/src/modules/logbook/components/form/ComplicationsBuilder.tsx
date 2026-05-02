import { useFieldArray, useFormContext } from 'react-hook-form'
import { Input, Select } from '@otto/shared-ui'
import type { LogbookFormValues } from '../../schemas/logbookForm.schema'

const SEVERITY_OPTIONS = [
  { value: 'minor',            label: 'Menor' },
  { value: 'major',            label: 'Maior' },
  { value: 'life-threatening', label: 'Risco de vida' },
]

export function ComplicationsBuilder() {
  const { register, control, watch } = useFormContext<LogbookFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'complications' })

  const noComplications = fields.length === 0

  return (
    <div className="flex flex-col gap-3">
      {noComplications ? (
        <p className="text-sm text-slate-400 italic">Sem intercorrências registradas.</p>
      ) : (
        fields.map((field, i) => (
          <div key={field.id} className="bg-red-50 border border-red-200 rounded-lg p-3 grid grid-cols-2 gap-2">
            <Input
              {...register(`complications.${i}.type`)}
              placeholder="Tipo (ex: sangramento)"
              className="col-span-2 text-sm"
            />
            <Select
              {...register(`complications.${i}.severity`)}
              options={SEVERITY_OPTIONS}
              placeholder="Gravidade"
              className="text-sm"
            />
            <Input
              {...register(`complications.${i}.management`)}
              placeholder="Conduta"
              className="text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600 col-span-2">
              <input type="checkbox" {...register(`complications.${i}.resolved`)}
                className="w-4 h-4 rounded text-green-600" />
              Resolvida
            </label>
            <button type="button" onClick={() => remove(i)}
              className="col-span-2 text-xs text-red-500 hover:text-red-700 self-start">
              Remover intercorrência
            </button>
          </div>
        ))
      )}
      <button
        type="button"
        onClick={() => append({ type: '', severity: 'minor', management: '', resolved: false })}
        className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium self-start"
      >
        + Registrar intercorrência
      </button>
    </div>
  )
}

