import { NavLink, Outlet, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/bills', label: '流水', icon: '簿' },
  { to: '/stats', label: '账目', icon: '图' },
  { to: '/settings', label: '印鉴', icon: '印' },
]

export default function Layout() {
  const location = useLocation()
  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: 'var(--color-paper)' }}>
      <div className="max-w-md mx-auto">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom"
        style={{ backgroundColor: 'rgba(253, 248, 240, 0.92)', backdropFilter: 'blur(12px)' }}
      >
        <div className="max-w-md mx-auto">
          {/* Top border */}
          <div className="h-px mx-4 opacity-30" style={{
            background: 'linear-gradient(to right, transparent, #c4b998, transparent)',
          }} />
          <div className="flex px-6 py-2">
            {tabs.map(tab => {
              const active = location.pathname.startsWith(tab.to)
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className="flex-1 flex flex-col items-center py-1 gap-0.5"
                  style={{
                    color: active ? 'var(--color-vermillion)' : 'var(--color-ink-muted)',
                    transition: 'color 0.2s ease',
                  }}
                >
                  <span
                    className="text-lg font-serif"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: active ? '1.35rem' : '1.15rem',
                      fontWeight: active ? 700 : 400,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {tab.icon}
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: active ? 500 : 400,
                      letterSpacing: '0.15em',
                    }}
                  >
                    {tab.label}
                  </span>
                </NavLink>
              )
            })}
          </div>
        </div>
      </nav>
    </div>
  )
}
