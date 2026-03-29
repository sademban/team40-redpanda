/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'echo-mock-session-v1'

export interface StoredProfile {
  username: string
  displayName: string
  city: string
  country: string
  lat: number
  lng: number
}

export interface StoredSession {
  isAuthenticated: boolean
  username: string | null
  onboardingComplete: boolean
  profile: StoredProfile | null
}

interface AppSessionContextValue {
  session: StoredSession
  login: (username: string, password: string) => boolean
  logout: () => void
  completeOnboarding: (profile: StoredProfile) => void
  updateProfile: (profile: StoredProfile) => void
  resetOnboarding: () => void
}

const emptySession: StoredSession = {
  isAuthenticated: false,
  username: null,
  onboardingComplete: false,
  profile: null,
}

const AppSessionContext = createContext<AppSessionContextValue | null>(null)

function isStoredProfile(value: unknown): value is StoredProfile {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<StoredProfile>

  return (
    typeof candidate.username === 'string' &&
    typeof candidate.displayName === 'string' &&
    typeof candidate.city === 'string' &&
    typeof candidate.country === 'string' &&
    typeof candidate.lat === 'number' &&
    typeof candidate.lng === 'number'
  )
}

function readStoredSession(): StoredSession {
  if (typeof window === 'undefined') {
    return emptySession
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return emptySession
    }

    const parsed = JSON.parse(raw) as Partial<StoredSession>

    return {
      isAuthenticated: Boolean(parsed.isAuthenticated),
      username: typeof parsed.username === 'string' ? parsed.username : null,
      onboardingComplete: Boolean(parsed.onboardingComplete),
      profile: isStoredProfile(parsed.profile) ? parsed.profile : null,
    }
  } catch {
    return emptySession
  }
}

export function AppSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession>(readStoredSession)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    if (!session.isAuthenticated && !session.profile && !session.onboardingComplete) {
      window.localStorage.removeItem(STORAGE_KEY)
      return
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }, [session])

  const value = useMemo<AppSessionContextValue>(
    () => ({
      session,
      login(username, password) {
        if (username.trim() !== 'test' || password.trim() !== 'test') {
          return false
        }

        setSession((current) => ({
          ...current,
          isAuthenticated: true,
          username: 'test',
        }))

        return true
      },
      logout() {
        setSession(emptySession)
      },
      completeOnboarding(profile) {
        setSession({
          isAuthenticated: true,
          username: profile.username,
          onboardingComplete: true,
          profile,
        })
      },
      updateProfile(profile) {
        setSession((current) => ({
          ...current,
          username: profile.username,
          onboardingComplete: true,
          profile,
        }))
      },
      resetOnboarding() {
        setSession(emptySession)
      },
    }),
    [session],
  )

  return <AppSessionContext.Provider value={value}>{children}</AppSessionContext.Provider>
}

export function useAppSession() {
  const context = useContext(AppSessionContext)

  if (!context) {
    throw new Error('useAppSession must be used within AppSessionProvider')
  }

  return context
}
