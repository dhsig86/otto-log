import { createBrowserRouter, Navigate, type RouterProviderProps } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { logbookRoutes } from './modules/logbook/routes'

// Layouts
const RootLayout = lazy(() => import('./layouts/RootLayout'))

// Páginas de autenticação (import síncrono — carregam antes do auth)
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))

export const router: RouterProviderProps['router'] = createBrowserRouter([
  // ── Autenticação (sem NavBar) ─────────────────────────────────────────────
  {
    path: '/login',
    element: (
      <Suspense fallback={null}>
        <LoginPage />
      </Suspense>
    ),
  },

  // ── App principal (com NavBar) ────────────────────────────────────────────
  {
    path: '/',
    element: (
      <Suspense fallback={null}>
        <RootLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/logbook" replace />,
      },
      // Módulo OTTO Logbook (rotas protegidas por RequireAuth internamente)
      ...logbookRoutes,
      // Rota 404
      {
        path: '*',
        lazy: () => import('./pages/NotFound').then(m => ({ Component: m.NotFound })),
      },
    ],
  },
])

