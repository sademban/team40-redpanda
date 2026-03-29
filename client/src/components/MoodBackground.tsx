export type MoodVariant = 'map' | 'write' | 'match' | 'chat' | 'about'

interface MoodBackgroundProps {
  variant: MoodVariant
}

export function MoodBackground({ variant }: MoodBackgroundProps) {
  return (
    <div className={`mood-background mood-background--${variant}`} aria-hidden="true">
      <div className="mood-background__wash" />
      <div className="mood-background__bloom" />
      <div className="mood-background__sheen" />
      <div className="mood-background__grain" />
    </div>
  )
}
