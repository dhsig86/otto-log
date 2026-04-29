import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold text-otto-primary">404</h1>
      <p className="text-slate-600">Página não encontrada.</p>
      <Link to="/" className="text-otto-accent hover:underline">
        Voltar ao início
      </Link>
    </div>
  )
}
