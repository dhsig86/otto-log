import { LogbookForm } from '../components/LogbookForm'

export default function LogbookNewPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Nova entrada</h1>
        <p className="text-slate-500 text-sm mt-1">
          Preencha as seções abaixo. O rascunho é salvo automaticamente a cada 10 segundos.
        </p>
      </div>
      <LogbookForm />
    </div>
  )
}
