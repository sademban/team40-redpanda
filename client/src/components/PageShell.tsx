import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAppSession } from '../auth/session.tsx'
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
  const { session } = useAppSession()
  const location = useLocation()
  const isMapRoute = location.pathname === '/'
  const navigationLinks = navigationItems.filter((item) => item.to !== '/')
  const profile = session.profile
  const showProfileLink = session.isAuthenticated && session.onboardingComplete && profile
  const initials = profile
    ? profile.displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
    : ''

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

          <div className="app-topbar__right">
            <p className="app-topbar__note">{note}</p>

            {showProfileLink ? (
              <NavLink
                aria-label="Open profile"
                className={`profile-link${location.pathname === '/profile' ? ' active' : ''}`}
                to="/profile"
              >
                <span className="profile-link__avatar">{initials}</span>
              </NavLink>
            ) : null}
          </div>
        </div>
      </header>

      <main className="page-main">{children}</main>

      <nav className="tab-bar tab-bar--map" aria-label="Primary">
        <NavLink
          aria-label="Echo home"
          className={`tab-bar__home${isMapRoute ? ' active' : ''}`}
          to="/"
        >
          <span className="tab-bar__home-orb" />
        </NavLink>

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
