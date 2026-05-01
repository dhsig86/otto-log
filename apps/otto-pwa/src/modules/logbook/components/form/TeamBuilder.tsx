import { useFieldArray, useFormContext } from 'react-hook-form'
import { Input } from '@otto/shared-ui'
import type { LogbookFormValues } from '../../schemas/logbookForm.schema'

const TEAM_ROLES = [
  'Anestesiologista','Instrumentadora','Circulante',
  'Residente auxiliar','Fellow auxiliar','Intensivista',
]

export function TeamBuilder() {
  const { register, control } = useFormContext<LogbookFormValues>()
  const { fields, append, remove } = useFieldArray({ control, name: 'team' })

  return (
    <div className="flex flex-col gap-2">
      {fields.map((field, i) => (
        <div key={field.id} className="flex gap-2 items-start bg-slate-50 rounded-lg p-3">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <Input
              {...register(`team.${i}.name`)}
              placeholder="Nome"
              className="text-sm"
            />
            <input
              {...register(`team.${i}.role`)}
              list="team-roles"
              placeholder="Função"
              className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-slate-400 hover:text-red-500 mt-2 transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
      <datalist id="team-roles">
        {TEAM_ROLES.map(r => <option key={r} value={r} />)}
      </datalist>
      <button
        type="button"
        onClick={() => append({ name: '', role: '', institution: '' })}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mt-1 self-start"
      >
        + Adicionar membro
      </button>
    </div>
  )
}
