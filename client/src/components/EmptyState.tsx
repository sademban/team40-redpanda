import type { ReactNode } from 'react'

type EmptyStateVariant = 'inbox' | 'match' | 'map' | 'chat'

interface EmptyStateProps {
  variant: EmptyStateVariant
  title: string
  body?: string
  action?: ReactNode
}

const illustrations: Record<EmptyStateVariant, ReactNode> = {
  inbox: (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="es-inbox-grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent-soft)" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="100" rx="42" ry="6" fill="var(--color-accent-soft)" opacity="0.5" />
      <path d="M22 50h76l-8 36a8 8 0 01-7.9 6.6H37.9A8 8 0 0130 86z" fill="url(#es-inbox-grad)" stroke="var(--color-accent-strong)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M22 50l12-22a6 6 0 015.3-3.2h41.4A6 6 0 0186 28l12 22" stroke="var(--color-accent-strong)" strokeWidth="1.6" strokeLinejoin="round" fill="rgba(255,255,255,0.5)" />
      <path d="M40 50v6a4 4 0 004 4h32a4 4 0 004-4v-6" stroke="var(--color-accent-strong)" strokeWidth="1.6" strokeLinejoin="round" fill="rgba(255,255,255,0.7)" />
    </svg>
  ),
  match: (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="es-match-grad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent-soft)" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="102" rx="40" ry="5.5" fill="var(--color-accent-soft)" opacity="0.5" />
      <circle cx="42" cy="50" r="22" fill="url(#es-match-grad)" stroke="var(--color-accent-strong)" strokeWidth="1.6" />
      <circle cx="78" cy="62" r="22" fill="rgba(255,255,255,0.7)" stroke="var(--color-accent-strong)" strokeWidth="1.6" />
      <path d="M60 56h0" stroke="var(--color-accent-strong)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  map: (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <ellipse cx="60" cy="102" rx="40" ry="5.5" fill="var(--color-accent-soft)" opacity="0.5" />
      <path d="M28 36l24-8 16 8 24-8v52l-24 8-16-8-24 8z" fill="rgba(255,255,255,0.6)" stroke="var(--color-accent-strong)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M52 28v52M68 36v52" stroke="var(--color-accent-strong)" strokeWidth="1.4" strokeDasharray="3 4" />
      <circle cx="60" cy="48" r="6" fill="var(--color-accent)" stroke="white" strokeWidth="1.8" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <ellipse cx="60" cy="102" rx="40" ry="5.5" fill="var(--color-accent-soft)" opacity="0.5" />
      <path d="M22 38a8 8 0 018-8h44a8 8 0 018 8v22a8 8 0 01-8 8H46l-12 10v-10h-4a8 8 0 01-8-8z" fill="rgba(255,255,255,0.7)" stroke="var(--color-accent-strong)" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M50 50a8 8 0 018-8h32a8 8 0 018 8v18a8 8 0 01-8 8h-2v8l-10-8H58a8 8 0 01-8-8z" fill="var(--color-accent-soft)" stroke="var(--color-accent-strong)" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
}

export function EmptyState({ variant, title, body, action }: EmptyStateProps) {
  return (
    <div className={`es-card es-card--${variant}`} role="status">
      <div className="es-card__art">{illustrations[variant]}</div>
      <h3 className="es-card__title">{title}</h3>
      {body ? <p className="es-card__body">{body}</p> : null}
      {action ? <div className="es-card__action">{action}</div> : null}
    </div>
  )
}
