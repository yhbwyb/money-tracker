import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/bills', label: '账单', icon: '📋' },
  { to: '/stats', label: '统计', icon: '📊' },
  { to: '/settings', label: '配置', icon: '⚙️' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-md mx-auto">
        <Outlet />
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-40">
        <div className="max-w-md mx-auto flex">
          {tabs.map(tab => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-xs gap-0.5 ${
                  isActive ? 'text-blue-700' : 'text-gray-500'
                }`
              }
            >
              <span className="text-xl">{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
