import { Routes, Route, Navigate } from 'react-router-dom'
import './styles/global.css'
import VideoBackground from './components/VideoBackground'
import HomePage from './pages/HomePage.jsx'
import MatchPage from './pages/MatchPage.jsx'
import ConnectPage from './pages/ConnectPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import CrisisPage from './pages/CrisisPage.jsx'

export default function App() {
  return (
    <>
      <VideoBackground />
      <Routes>
      <Route path="/"              element={<HomePage />} />
      <Route path="/match"         element={<MatchPage />} />
      <Route path="/connect"       element={<ConnectPage />} />
      <Route path="/chat/:roomId"  element={<ChatPage />} />
      <Route path="/crisis"        element={<CrisisPage />} />

      {/* Catch-all → home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}