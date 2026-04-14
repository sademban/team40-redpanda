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
  {
    to: '/write',
    label: 'Write',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
      </svg>
    ),
  },
  {
    to: '/match',
    label: 'Matches',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    ),
  },
  {
    to: '/account',
    label: 'Account',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    to: '/about',
    label: 'About',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  },
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
      <a className="skip-link" href="#page-main">Skip to content</a>
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

      <main className="page-main" id="page-main">{children}</main>

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
            <span className="tab-bar__icon">{item.icon}</span>
            <span className="tab-bar__label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
