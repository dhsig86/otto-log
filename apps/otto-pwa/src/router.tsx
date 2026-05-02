import { createBrowserRouter, type RouterProviderProps } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { logbookRoutes } from './modules/logbook/routes'
import { RequireAuth } from '@otto/shared-auth'

// Layouts
const RootLayout = lazy(() => import('./layouts/RootLayout'))

// Páginas
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const HomePage  = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })))

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

  // ── Raiz — pai sem layout próprio ─────────────────────────────────────────
  {
    path: '/',
    children: [
      // Home: painel de módulos (sem NavBar, tela escura própria)
      {
        index: true,
        element: (
          <Suspense fallback={null}>
            <RequireAuth redirectTo="/login">
              <HomePage />
            </RequireAuth>
          </Suspense>
        ),
      },

      // Módulos com NavBar — wrappados em RootLayout sem path
      {
        element: (
          <Suspense fallback={null}>
            <RootLayout />
          </Suspense>
        ),
        children: [
          // Módulo OTTO Logbook (RequireAuth interno nas rotas)
          ...logbookRoutes,
          // Rota 404
          {
            path: '*',
            lazy: () => import('./pages/NotFound').then(m => ({ Component: m.NotFound })),
          },
        ],
      },
    ],
  },
])

