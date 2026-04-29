import { useParams, useNavigate } from 'react-router-dom'
import { useLogbook } from '../hooks/useLogbook'

/**
 * Página de detalhes de uma cirurgia.
 * TODO Fase 3: Layout completo com todas as seções e galeria de imagens.
 */
export default function LogbookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { log, isLoading } = useLogbook(id!)

  if (isLoading) return <div className="flex items-center justify-center py-16">Carregando...</div>
  if (!log) return <div className="flex items-center justify-center py-16 text-slate-400">Cirurgia não encontrada.</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-otto-primary mb-4 text-sm">
        ← Voltar
      </button>
      <h1 className="text-2xl font-bold text-otto-primary">{log.procedureName}</h1>
      <p className="text-slate-500 mt-1">{log.institutionName}</p>
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => navigate(`/logbook/${id}/edit`)}
          className="bg-otto-accent text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
        >
          Editar
        </button>
      </div>
    </div>
  )
}
