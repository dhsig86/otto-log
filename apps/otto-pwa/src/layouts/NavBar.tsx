import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@otto/shared-auth'

const NAV_ITEMS = [
  { path: '/logbook',           label: 'Logbook',    icon: '📋' },
  { path: '/logbook/dashboard', label: 'Casuística', icon: '📊' },
]

export function NavBar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()

  return (
    <nav className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-lg">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="text-emerald-400">OTTO</span>
          <span className="text-slate-300 font-normal text-sm">Logbook</span>
        </Link>
        <div className="hidden sm:flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const active = pathname.startsWith(item.path) &&
              (item.path !== '/logbook' || pathname === '/logbook' || !pathname.startsWith('/logbook/dashboard'))
            return (
              <Link
                key={item.path}
                to={item.path}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors',
                  active
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white',
                ].join(' ')}
              >
                <span className="text-base leading-none">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/logbook/new"
          className="hidden sm:flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
        >
          + Nova entrada
        </Link>
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden md:block truncate max-w-[140px]">
              {user.displayName || user.email}
            </span>
            <button
              onClick={() => void logout()}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
