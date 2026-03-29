import type { ElementType, ReactNode } from 'react'

interface GlassPanelProps {
  as?: ElementType
  children: ReactNode
  className?: string
  flat?: boolean
}

export function GlassPanel({
  as: Tag = 'section',
  children,
  className = '',
  flat = false,
}: GlassPanelProps) {
  const classes = ['glass-panel', flat ? 'glass-panel--flat' : '', className]
    .filter(Boolean)
    .join(' ')

  return <Tag className={classes}>{children}</Tag>
}
