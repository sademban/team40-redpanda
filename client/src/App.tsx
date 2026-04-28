import { Navigate, Route, Routes } from 'react-router-dom'
import { useApp } from './contexts/AppContext.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { ComposePage } from './pages/ComposePage.tsx'
import { MatchPage } from './pages/MatchPage.tsx'
import { ChatPage } from './pages/ChatPage.tsx'
import { AboutPage } from './pages/AboutPage.tsx'
import { AuthPage } from './pages/AuthPage.tsx'
import { AccountPage } from './pages/AccountPage.tsx'

export default function App() {
  const { user, isBootstrapping } = useApp()

  if (isBootstrapping) {
    return (
      <div className="boot-splash" role="status" aria-live="polite">
        <div className="boot-splash__orb" aria-hidden="true" />
        <p className="boot-splash__brand">Echo</p>
        <p className="boot-splash__copy">Tuning the room…</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/auth" element={user?.isPersistent ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={user ? <HomePage /> : <Navigate to="/auth" replace />} />
      <Route path="/write" element={user ? <ComposePage /> : <Navigate to="/auth" replace />} />
      <Route path="/about" element={user ? <AboutPage /> : <Navigate to="/auth" replace />} />
      <Route path="/match" element={user ? <MatchPage /> : <Navigate to="/auth" replace />} />
      <Route
        path="/chat/:conversationId"
        element={user ? <ChatPage /> : <Navigate to="/auth" replace />}
      />
      <Route path="/account" element={user ? <AccountPage /> : <Navigate to="/auth" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
