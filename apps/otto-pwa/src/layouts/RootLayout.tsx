import { Outlet } from 'react-router-dom'

/**
 * Layout raiz da aplicação OTTO.
 * Inclui: navigation bar, sidebar mobile, providers de contexto de UI.
 * TODO: Implementar NavBar e Sidebar na Fase 3.
 */
export default function RootLayout() {
  return (
    <div className="min-h-screen bg-otto-surface">
      {/* NavBar global — implementar na Fase 3 */}
      <main className="h-full">
        <Outlet />
      </main>
    </div>
  )
}
