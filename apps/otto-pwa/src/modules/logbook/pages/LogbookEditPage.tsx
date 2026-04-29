import { useParams } from 'react-router-dom'

/** TODO Fase 3: Reutiliza o mesmo form da página New, pre-populado com os dados do log. */
export default function LogbookEditPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-otto-primary">Editar Registro</h1>
      <p className="text-slate-400">Formulário de edição (ID: {id}) — implementação na Fase 3.</p>
    </div>
  )
}
