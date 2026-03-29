import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAppSession } from './auth/session.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { ComposePage } from './pages/ComposePage.tsx'
import { MatchPage } from './pages/MatchPage.tsx'
import { ChatPage } from './pages/ChatPage.tsx'
import { AboutPage } from './pages/AboutPage.tsx'
import { AuthPage } from './pages/AuthPage.tsx'
import { OnboardingPage } from './pages/OnboardingPage.tsx'
import { ProfilePage } from './pages/ProfilePage.tsx'

function AuthOnlyRoute({ children }: { children: ReactNode }) {
  const { session } = useAppSession()

  if (session.isAuthenticated) {
    return <Navigate to={session.onboardingComplete ? '/' : '/onboarding'} replace />
  }

  return children
}

function OnboardingOnlyRoute({ children }: { children: ReactNode }) {
  const { session } = useAppSession()

  if (!session.isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (session.onboardingComplete) {
    return <Navigate to="/" replace />
  }

  return children
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session } = useAppSession()

  if (!session.isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  if (!session.onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/auth"
        element={(
          <AuthOnlyRoute>
            <AuthPage />
          </AuthOnlyRoute>
        )}
      />
      <Route
        path="/onboarding"
        element={(
          <OnboardingOnlyRoute>
            <OnboardingPage />
          </OnboardingOnlyRoute>
        )}
      />
      <Route
        path="/"
        element={(
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/write"
        element={(
          <ProtectedRoute>
            <ComposePage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/about"
        element={(
          <ProtectedRoute>
            <AboutPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/match"
        element={(
          <ProtectedRoute>
            <MatchPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/chat/:storyId"
        element={(
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/profile"
        element={(
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
