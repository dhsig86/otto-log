import { Link } from 'react-router-dom'
import { useAuth } from '@otto/shared-auth'

interface ModuleCard {
  id:          string
  title:       string
  subtitle:    string
  icon:        string
  path:        string
  status:      'active' | 'soon' | 'external'
  externalUrl?: string
  color:       string
}

const MODULES: ModuleCard[] = [
  {
    id:       'logbook',
    title:    'OTTO Logbook',
    subtitle: 'Registro cirúrgico pessoal em ORL. Casuística, procedimentos e aprendizados.',
    icon:     '📋',
    path:     '/logbook',
    status:   'active',
    color:    'emerald',
  },
  {
    id:       'procod',
    title:    'OTTO Procod',
    subtitle: 'Codificação de procedimentos ORL — TUSS, CBHPM, SIGTAP.',
    icon:     '🔢',
    path:     '/procod',
    status:   'soon',
    color:    'blue',
  },
  {
    id:       'atlas',
    title:    'OTTO Atlas',
    subtitle: 'Atlas anatômico e cirúrgico interativo para ORL.',
    icon:     '🧠',
    path:     '/atlas',
    status:   'soon',
    color:    'violet',
  },
  {
    id:       'guidelines',
    title:    'OTTO Guidelines',
    subtitle: 'Protocolos clínicos e diretrizes atualizadas para ORL.',
    icon:     '📚',
    path:     '/guidelines',
    status:   'soon',
    color:    'amber',
  },
]

const colorMap: Record<string, { bg: string; border: string; icon: string; badge: string }> = {
  emerald: {
    bg:     'hover:bg-emerald-50',
    border: 'hover:border-emerald-300',
    icon:   'bg-emerald-100 text-emerald-700',
    badge:  'bg-emerald-100 text-emerald-800',
  },
  blue: {
    bg:     'hover:bg-blue-50',
    border: 'hover:border-blue-300',
    icon:   'bg-blue-100 text-blue-700',
    badge:  'bg-blue-100 text-blue-800',
  },
  violet: {
    bg:     'hover:bg-violet-50',
    border: 'hover:border-violet-300',
    icon:   'bg-violet-100 text-violet-700',
    badge:  'bg-violet-100 text-violet-800',
  },
  amber: {
    bg:     'hover:bg-amber-50',
    border: 'hover:border-amber-300',
    icon:   'bg-amber-100 text-amber-700',
    badge:  'bg-amber-100 text-amber-800',
  },
}

export function HomePage() {
  const { user } = useAuth()

  const firstName = user?.displayName?.split(' ')[0] ?? 'Doutor(a)'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950">
      {/* Header */}
      <header className="px-6 pt-10 pb-8 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="text-4xl font-black text-white tracking-tight">OTTO</span>
          <span className="text-xs font-medium bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded-full uppercase tracking-widest">
            Ecossistema
          </span>
        </div>
        <p className="text-slate-400 text-sm">
          Bem-vindo, <span className="text-emerald-400 font-medium">{firstName}</span>
        </p>
        <p className="text-slate-500 text-xs mt-1">
          Plataforma de suporte clínico para Otorrinolaringologia
        </p>
      </header>

      {/* Módulos */}
      <main className="max-w-2xl mx-auto px-4 pb-16">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-4 text-center font-medium">
          Módulos disponíveis
        </p>

        <div className="grid gap-3">
          {MODULES.map(mod => {
            const colors = colorMap[mod.color] ?? colorMap['emerald']!
            const isActive = mod.status === 'active'

            const cardClasses = [
              'group flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 cursor-pointer',
              'bg-white/5 border-white/10 backdrop-blur-sm',
              isActive
                ? `${colors.bg} ${colors.border} hover:bg-white/10 hover:border-white/20`
                : 'opacity-60 cursor-default',
            ].join(' ')

            const content = (
              <div className={cardClasses}>
                {/* Ícone */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors.icon} bg-opacity-20`}>
                  {mod.icon}
                </div>

                {/* Texto */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-white font-semibold text-base leading-tight">
                      {mod.title}
                    </h2>
                    {mod.status === 'soon' && (
                      <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                        Em breve
                      </span>
                    )}
                    {mod.status === 'active' && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{mod.subtitle}</p>
                </div>

                {/* Seta (apenas módulos ativos) */}
                {isActive && (
                  <div className="flex-shrink-0 text-slate-500 group-hover:text-emerald-400 transition-colors mt-1">
                    →
                  </div>
                )}
              </div>
            )

            return isActive
              ? <Link key={mod.id} to={mod.path}>{content}</Link>
              : <div key={mod.id}>{content}</div>
          })}
        </div>

        {/* Rodapé */}
        <p className="text-center text-slate-600 text-xs mt-10">
          OTTO © {new Date().getFullYear()} — Uso clínico pessoal
        </p>
      </main>
    </div>
  )
}
