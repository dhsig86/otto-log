import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy } from 'react'

// Layout principal
const RootLayout = lazy(() => import('./layouts/RootLayout'))

// OTTO Logbook (lazy-loaded)
const { logbookRoutes } = await import('./modules/logbook/routes')

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/logbook" replace />,
      },
      // Módulo OTTO Logbook
      ...logbookRoutes,
      // Rota 404
      {
        path: '*',
        lazy: () => import('./pages/NotFound').then(m => ({ Component: m.NotFound })),
      },
    ],
  },
])
