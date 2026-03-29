import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage.tsx'
import { ComposePage } from './pages/ComposePage.tsx'
import { MatchPage } from './pages/MatchPage.tsx'
import { ChatPage } from './pages/ChatPage.tsx'
import { AboutPage } from './pages/AboutPage.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/write" element={<ComposePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/match" element={<MatchPage />} />
      <Route path="/chat/:storyId" element={<ChatPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
