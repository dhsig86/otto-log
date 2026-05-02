import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'
import { RequireAuth } from '@otto/shared-auth'

const LogbookListPage = lazy(() => import('./pages/LogbookListPage'))
const LogbookNewPage = lazy(() => import('./pages/LogbookNewPage'))
const LogbookDetailPage = lazy(() => import('./pages/LogbookDetailPage'))
const LogbookEditPage = lazy(() => import('./pages/LogbookEditPage'))
const LogbookDashboardPage = lazy(() => import('./pages/LogbookDashboardPage'))

export const logbookRoutes: RouteObject[] = [
  {
    path: 'logbook',
    children: [
      {
        index: true,
        element: (
          <RequireAuth>
            <LogbookListPage />
          </RequireAuth>
        ),
      },
      {
        path: 'new',
        element: (
          <RequireAuth>
            <LogbookNewPage />
          </RequireAuth>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <RequireAuth>
            <LogbookDashboardPage />
          </RequireAuth>
        ),
      },
      {
        path: ':id',
        element: (
          <RequireAuth>
            <LogbookDetailPage />
          </RequireAuth>
        ),
      },
      {
        path: ':id/edit',
        element: (
          <RequireAuth>
            <LogbookEditPage />
          </RequireAuth>
        ),
      },
    ],
  },
]
