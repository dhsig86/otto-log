import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar'

// AuthProvider foi movido para App.tsx para ser compartilhado por todas as rotas
// (login + logbook + futuras), garantindo um único contexto de auth
export default function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <NavBar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
    </div>
  )
}
