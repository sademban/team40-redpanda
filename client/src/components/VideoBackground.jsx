import { videoConfig } from '../data/video'

/**
 * VideoBackground Component
 * Renders a full-screen, looping background video that plays automatically and silently.
 * Used to create ambient, calming atmosphere for the healing app.
 */
export default function VideoBackground() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        zIndex: -1,
        opacity: videoConfig.opacity,
      }}
    >
      <source src={videoConfig.source} type={videoConfig.type} />
      {videoConfig.fallbackText}
    </video>
  )
}
