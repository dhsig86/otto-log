import { useNavigate } from 'react-router-dom'
import { useLogbookEntries } from '../hooks/useLogbookEntries'

/**
 * Página principal do OTTO Logbook — listagem de cirurgias.
 * TODO Fase 3: Implementar filtros, busca por procedimento, paginação infinita.
 */
export default function LogbookListPage() {
  const navigate = useNavigate()
  const { logs, isLoading } = useLogbookEntries()

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-otto-primary">OTTO Logbook</h1>
          <p className="text-slate-500 text-sm mt-1">Registro completo de procedimentos cirúrgicos</p>
        </div>
        <button
          onClick={() => navigate('/logbook/new')}
          className="bg-otto-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          + Nova cirurgia
        </button>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">Carregando...</div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
          <p className="text-lg">Nenhuma cirurgia registrada ainda.</p>
          <button
            onClick={() => navigate('/logbook/new')}
            className="text-otto-accent hover:underline text-sm"
          >
            Registrar primeira cirurgia →
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {logs.map(log => (
            <li
              key={log.id}
              onClick={() => navigate(`/logbook/${log.id}`)}
              className="bg-white border border-otto-border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-otto-primary">{log.procedureName}</p>
                  <p className="text-slate-500 text-sm mt-1">
                    {log.institutionName} — {log.surgeryDate.toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {log.isDraft && (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                    Rascunho
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
