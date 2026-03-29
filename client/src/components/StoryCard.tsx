import type { StoryEntry } from '../types/story'

interface StoryCardProps {
  story: StoryEntry
  expanded?: boolean
  onToggle?: () => void
  note?: string
}

export function StoryCard({
  story,
  expanded = false,
  onToggle,
  note,
}: StoryCardProps) {
  return (
    <article className="story-card">
      <div className="story-card__meta">
        <span>
          {story.city}, {story.country}
        </span>
        <span className="mono">{story.year}</span>
      </div>

      <p className="story-card__quote">"{story.excerpt}"</p>

      {note ? <p className="story-card__note">{note}</p> : null}

      {expanded ? <p className="story-card__full">{story.fullText}</p> : null}

      <p className="story-card__status">
        {story.openToChat ? 'Open to conversation' : 'Story first, then silence if needed'}
      </p>

      {onToggle ? (
        <button className="button button--secondary" onClick={onToggle} type="button">
          {expanded ? 'Close story' : 'Sit with this story'}
        </button>
      ) : null}
    </article>
  )
}
