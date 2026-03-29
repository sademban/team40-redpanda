import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MoodBackground, type MoodVariant } from './MoodBackground'
import { useApp } from '../contexts/AppContext'
import { listChatRequests } from '../lib/api'

interface PageShellProps {
  variant: MoodVariant
  children: ReactNode
  note?: string
}

const navigationItems = [
  { to: '/', label: 'Map' },
  { to: '/write', label: 'Write' },
  { to: '/match', label: 'Matches' },
  { to: '/account', label: 'Account' },
  { to: '/about', label: 'About' },
]

export function PageShell({
  variant,
  children,
  note = 'One true thing can be enough.',
}: PageShellProps) {
  const location = useLocation()
  const { user, token, isBootstrapping } = useApp()
  const isMapRoute = location.pathname === '/'
  const navigationLinks = navigationItems.filter((item) => item.to !== '/')
  const [pendingInboxCount, setPendingInboxCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadInboxCount() {
      if (!token) {
        setPendingInboxCount(0)
        return
      }

      try {
        const requests = await listChatRequests(token)
        if (!cancelled) {
          setPendingInboxCount(requests.incoming.filter((request) => request.status === 'pending').length)
        }
      } catch {
        if (!cancelled) {
          setPendingInboxCount(0)
        }
      }
    }

    void loadInboxCount()

    return () => {
      cancelled = true
    }
  }, [location.pathname, token])

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

          <div className="app-topbar__meta">
            <p className="app-topbar__note">{note}</p>
            <div className="app-topbar__right">
              {user ? (
                <NavLink aria-label="Open inbox" className="inbox-link" to="/account">
                  <span className="inbox-link__icon" aria-hidden="true" />
                  {pendingInboxCount > 0 ? <span className="inbox-link__badge">{pendingInboxCount}</span> : null}
                </NavLink>
              ) : null}
              <NavLink className="account-pill" to="/account">
                <span className="account-pill__handle">
                  {isBootstrapping ? 'Connecting' : user?.handle ?? 'guest'}
                </span>
                <span className="account-pill__status">
                  {user?.isPersistent ? 'saved' : 'guest'}
                </span>
              </NavLink>
            </div>
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
