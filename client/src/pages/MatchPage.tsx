import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  defaultEntry,
  findConversationMatch,
  findNarrativeMatch,
  findSuggestedChatMatch,
  getStoryById,
  emotionLabels,
} from '../data/stories'
import { GlassPanel } from '../components/GlassPanel'
import { PageShell } from '../components/PageShell'

type OpeningMode = 'suggested' | 'incoming'

interface MatchLocationState {
  entry?: string
  suggestedStoryId?: string | null
}

export function MatchPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as MatchLocationState | null
  const entry = state?.entry?.trim() || defaultEntry
  const narrativeReference =
    getStoryById(state?.suggestedStoryId) ?? findNarrativeMatch(entry)
  const suggestedMatch = findSuggestedChatMatch(entry, narrativeReference.id)
  const incomingMatch = findConversationMatch(entry, suggestedMatch.id)
  const [selectedMode, setSelectedMode] = useState<OpeningMode>('suggested')

  const openings = [
    {
      mode: 'suggested' as const,
      title: 'Maybe you should talk with this person',
      summary: 'The emotional shape is close, even if the life details are not identical.',
      story: suggestedMatch,
    },
    {
      mode: 'incoming' as const,
      title: 'Someone wants to talk to you',
      summary: 'This person is already open. The door does not have to be pushed open from your side.',
      story: incomingMatch,
    },
  ]

  const activeOpening =
    openings.find((opening) => opening.mode === selectedMode) ?? openings[0]
  const activeStory = activeOpening.story

  return (
    <PageShell note="Not a result. Just a softer place to begin." variant="match">
      <section className="matches-page">
        <div className="page-intro">
          <p className="eyebrow">Matches</p>
          <h1 className="display">The feeling feels close. The people are real.</h1>
          <p className="entry-pill">"{entry}"</p>
        </div>

        <div className="matches-layout">
          <div className="opening-list" role="list" aria-label="Ways this could begin">
            {openings.map((opening) => (
              <button
                className={`opening-card${opening.mode === selectedMode ? ' is-active' : ''}`}
                key={opening.mode}
                onClick={() => setSelectedMode(opening.mode)}
                type="button"
              >
                <p className="opening-card__label">{opening.title}</p>
                <h2 className="opening-card__city">
                  {opening.story.city}, {opening.story.country}
                </h2>
                <p className="opening-card__summary">{opening.summary}</p>
                <p className="opening-card__quote">"{opening.story.excerpt}"</p>
              </button>
            ))}
          </div>

          <GlassPanel className="match-focus" flat>
            <p className="panel-kicker">{activeOpening.title}</p>
            <h2 className="section-title">
              {activeStory.city}, {activeStory.country}
            </h2>
            <div className="match-focus__meta">
              <span className="soft-badge">{emotionLabels[activeStory.emotion]}</span>
              <span className="soft-badge">{activeStory.language}</span>
            </div>
            <p className="section-copy">{activeOpening.summary}</p>
            <p className="match-focus__prompt">{activeStory.chatPrompt}</p>
            <p className="match-focus__story">{activeStory.fullText}</p>

            <div className="action-row">
              <button
                className="button button--primary"
                onClick={() =>
                  navigate(`/chat/${activeStory.id}`, {
                    state: { entry, mode: activeOpening.mode },
                  })
                }
                type="button"
              >
                Open chat
              </button>
              <button
                className="button button--secondary"
                onClick={() =>
                  navigate('/write', {
                    state: { entry, suggestedStoryId: narrativeReference.id },
                  })
                }
                type="button"
              >
                Rewrite your line
              </button>
            </div>
          </GlassPanel>
        </div>

        <GlassPanel className="narrative-reference" flat>
          <p className="panel-kicker">The story that first stayed close</p>
          <p className="narrative-reference__quote">"{narrativeReference.excerpt}"</p>
          <p className="narrative-reference__meta">
            {narrativeReference.city}, {narrativeReference.country}
          </p>
        </GlassPanel>
      </section>
    </PageShell>
  )
}
