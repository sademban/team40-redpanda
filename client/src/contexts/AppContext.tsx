import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  ApiError,
  createAnonymousSession,
  getCurrentUser,
  getStory,
  listChatRequests,
  listStoryClusters,
  loginPersistentUser,
  registerPersistentUser,
} from '../lib/api'
import type { AuthSession, AuthUser } from '../types/auth'
import type { CityCluster, StoryEntry } from '../types/story'
import { enrichCityClusters } from '../data/stories'

const INBOX_POLL_MS = 60_000

const AUTH_TOKEN_STORAGE_KEY = 'echo.auth.token'

interface AppContextValue {
  token: string | null
  user: AuthUser | null
  stories: StoryEntry[]
  clusters: CityCluster[]
  isBootstrapping: boolean
  isRefreshingStories: boolean
  authError: string | null
  dataError: string | null
  pendingInboxCount: number
  refreshInboxCount: () => Promise<void>
  refreshStories: () => Promise<void>
  continueAsGuest: () => Promise<AuthSession>
  logout: () => void
  register: (email: string, password: string) => Promise<AuthSession>
  login: (email: string, password: string) => Promise<AuthSession>
  getStoryById: (storyId: string | null | undefined) => StoryEntry | null
  loadStoryById: (storyId: string) => Promise<StoryEntry>
}

const AppContext = createContext<AppContextValue | null>(null)

function persistToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
}

function clearToken() {
  window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
}

function getStoredToken() {
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
}

function flattenStories(clusters: CityCluster[]) {
  const storiesById = new Map<string, StoryEntry>()

  for (const cluster of clusters) {
    for (const story of cluster.stories) {
      storiesById.set(story.id, story)
    }
  }

  return [...storiesById.values()]
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [clusters, setClusters] = useState<CityCluster[]>([])
  const [stories, setStories] = useState<StoryEntry[]>([])
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isRefreshingStories, setIsRefreshingStories] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [dataError, setDataError] = useState<string | null>(null)
  const [pendingInboxCount, setPendingInboxCount] = useState(0)

  const refreshInboxCount = useCallback(async () => {
    if (!token) {
      setPendingInboxCount(0)
      return
    }

    try {
      const requests = await listChatRequests(token)
      setPendingInboxCount(
        requests.incoming.filter((request) => request.status === 'pending').length,
      )
    } catch {
      setPendingInboxCount(0)
    }
  }, [token])

  const syncStories = useCallback(async () => {
    setIsRefreshingStories(true)
    setDataError(null)

    try {
      const nextClusters = enrichCityClusters(await listStoryClusters())
      setClusters(nextClusters)
      setStories(flattenStories(nextClusters))
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Failed to load stories')
    } finally {
      setIsRefreshingStories(false)
    }
  }, [])

  const applySession = useCallback((session: AuthSession) => {
    setToken(session.token)
    setUser(session.user)
    persistToken(session.token)
    setAuthError(null)
    return session
  }, [])

  const createGuestSession = useCallback(async () => applySession(await createAnonymousSession()), [applySession])

  const logout = useCallback(() => {
    clearToken()
    setToken(null)
    setUser(null)
    setAuthError(null)
  }, [])

  const restoreOrCreateSession = useCallback(async () => {
    const storedToken = getStoredToken()

    if (!storedToken) {
      return null
    }

    try {
      const nextUser = await getCurrentUser(storedToken)
      const nextSession = { token: storedToken, user: nextUser }
      return applySession(nextSession)
    } catch (error) {
      clearToken()
      setToken(null)
      setUser(null)

      if (error instanceof ApiError && error.status !== 401) {
        setAuthError(error.message)
      }

      return null
    }
  }, [applySession])

  const register = useCallback(async (email: string, password: string) => {
    const session = await registerPersistentUser(email, password, token)
    return applySession(session)
  }, [applySession, token])

  const login = useCallback(async (email: string, password: string) => {
    const session = await loginPersistentUser(email, password)
    return applySession(session)
  }, [applySession])

  const getStoryById = useCallback((storyId: string | null | undefined) => {
    if (!storyId) {
      return null
    }

    return stories.find((story) => story.id === storyId) ?? null
  }, [stories])

  const loadStoryById = useCallback(async (storyId: string) => {
    const existingStory = getStoryById(storyId)
    if (existingStory) {
      return existingStory
    }

    const story = await getStory(storyId)

    setStories((currentStories) => {
      if (currentStories.some((entry) => entry.id === story.id)) {
        return currentStories
      }

      return [story, ...currentStories]
    })

    return story
  }, [getStoryById])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        await restoreOrCreateSession()

        if (!cancelled) {
          await syncStories()
        }
      } catch (error) {
        if (!cancelled) {
          setAuthError(error instanceof Error ? error.message : 'Failed to create session')
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false)
        }
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [restoreOrCreateSession, syncStories])

  useEffect(() => {
    if (!token) {
      setPendingInboxCount(0)
      return
    }

    void refreshInboxCount()
    const interval = window.setInterval(() => {
      void refreshInboxCount()
    }, INBOX_POLL_MS)

    return () => {
      window.clearInterval(interval)
    }
  }, [token, refreshInboxCount])

  const value = useMemo<AppContextValue>(
    () => ({
      token,
      user,
      stories,
      clusters,
      isBootstrapping,
      isRefreshingStories,
      authError,
      dataError,
      pendingInboxCount,
      refreshInboxCount,
      refreshStories: syncStories,
      continueAsGuest: createGuestSession,
      logout,
      register,
      login,
      getStoryById,
      loadStoryById,
    }),
    [
      authError,
      clusters,
      dataError,
      getStoryById,
      isBootstrapping,
      isRefreshingStories,
      loadStoryById,
      logout,
      login,
      pendingInboxCount,
      refreshInboxCount,
      register,
      stories,
      createGuestSession,
      syncStories,
      token,
      user,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useApp must be used inside AppProvider')
  }

  return context
}
