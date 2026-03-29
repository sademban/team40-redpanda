import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MoodBackground, type MoodVariant } from './MoodBackground'

interface PageShellProps {
  variant: MoodVariant
  children: ReactNode
  note?: string
}

const navigationItems = [
  { to: '/', label: 'Map' },
  { to: '/write', label: 'Write' },
  { to: '/match', label: 'Matches' },
  { to: '/about', label: 'About' },
]

export function PageShell({
  variant,
  children,
  note = 'One true thing can be enough.',
}: PageShellProps) {
  const location = useLocation()
  const isMapRoute = location.pathname === '/'
  const navigationLinks = isMapRoute
    ? navigationItems.filter((item) => item.to !== '/')
    : navigationItems

  return (
    <div className="page-shell">
      <MoodBackground variant={variant} />
      <header className="app-topbar">
        <div className="app-topbar__panel">
          <NavLink className="brand-pill" to="/">
            <span className="brand-pill__orb" />
            <span className="brand-pill__text">
              <span className="brand-pill__name">Echo</span>
            </span>
          </NavLink>

          <p className="app-topbar__note">{note}</p>
        </div>
      </header>

      <main className="page-main">{children}</main>

      <nav className={`tab-bar${isMapRoute ? ' tab-bar--map' : ''}`} aria-label="Primary">
        {isMapRoute ? (
          <NavLink
            aria-label="Echo home"
            className="tab-bar__home"
            to="/"
          >
            <span className="tab-bar__home-orb" />
          </NavLink>
        ) : null}

        {navigationLinks.map((item) => (
          <NavLink
            className={() => {
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : item.to === '/match'
                    ? location.pathname === '/match' || location.pathname.startsWith('/chat/')
                    : location.pathname === item.to

              return `tab-bar__link${isActive ? ' active' : ''}`
            }}
            end={item.to === '/'}
            key={item.to}
            to={item.to}
          >
            <span className="tab-bar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
