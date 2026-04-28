import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ApiError,
  createChatRequest,
  findChatMatches,
  findNarrativeMatch as requestNarrativeMatch,
} from '../lib/api'
import { defaultEntry, emotionLabels } from '../data/stories'
import { EmptyState } from '../components/EmptyState'
import { GlassPanel } from '../components/GlassPanel'
import { PageShell } from '../components/PageShell'
import { Skeleton, SkeletonLines } from '../components/Skeleton'
import { useApp } from '../contexts/AppContext'
import type { StoryEntry } from '../types/story'

type OpeningMode = 'suggested' | 'incoming'

interface MatchLocationState {
  entry?: string
  suggestedStoryId?: string | null
}

export function MatchPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { getStoryById, token, user } = useApp()
  const state = location.state as MatchLocationState | null
  const entry = state?.entry?.trim() || defaultEntry
  const preferredNarrative = getStoryById(state?.suggestedStoryId)

  const [selectedMode, setSelectedMode] = useState<OpeningMode>('suggested')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chatActionError, setChatActionError] = useState<string | null>(null)
  const [isRequestingChat, setIsRequestingChat] = useState(false)
  const [narrativeReference, setNarrativeReference] = useState<StoryEntry | null>(preferredNarrative)
  const [suggestedMatch, setSuggestedMatch] = useState<StoryEntry | null>(null)
  const [incomingMatch, setIncomingMatch] = useState<StoryEntry | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadMatches() {
      setIsLoading(true)
      setError(null)

      try {
        let reference = preferredNarrative

        if (!reference) {
          try {
            reference = await requestNarrativeMatch(entry)
          } catch (requestError) {
            if (!(requestError instanceof ApiError) || requestError.status !== 404) {
              throw requestError
            }
          }
        }

        let chatMatches: { suggested: StoryEntry | null; incoming: StoryEntry | null } | null = null

        try {
          chatMatches = await findChatMatches(entry, reference?.id)
        } catch (requestError) {
          if (!(requestError instanceof ApiError) || requestError.status !== 404) {
            throw requestError
          }
        }

        if (cancelled) {
          return
        }

        setNarrativeReference(reference ?? null)
        setSuggestedMatch(chatMatches?.suggested ?? null)
        setIncomingMatch(chatMatches?.incoming ?? null)

        if (!reference && !chatMatches?.suggested && !chatMatches?.incoming) {
          setError('No stories are available for matching yet.')
        }
      } catch (requestError) {
        if (cancelled) {
          return
        }

        setError(requestError instanceof Error ? requestError.message : 'Matching failed')
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadMatches()

    return () => {
      cancelled = true
    }
  }, [entry, preferredNarrative])

  const openings = useMemo(
    () =>
      [
        suggestedMatch
          ? {
              mode: 'suggested' as const,
              title: 'Maybe you should talk with this person',
              summary:
                'The emotional shape is close, even if the life details are not identical.',
              story: suggestedMatch,
            }
          : null,
        incomingMatch
          ? {
              mode: 'incoming' as const,
              title: 'Someone wants to talk to you',
              summary:
                'This person is already open. The door does not have to be pushed open from your side.',
              story: incomingMatch,
            }
          : null,
      ].filter((opening): opening is NonNullable<typeof opening> => opening !== null),
    [incomingMatch, suggestedMatch],
  )

  const activeOpening = openings.find((opening) => opening.mode === selectedMode) ?? openings[0] ?? null
  const activeStory = activeOpening?.story ?? null

  async function handleRequestChat() {
    if (!activeStory || !token) {
      navigate('/account', {
        state: { message: 'Your session needs to be ready before chat can start.' },
      })
      return
    }

    setIsRequestingChat(true)
    setChatActionError(null)

    try {
      await createChatRequest(token, activeStory.id, entry.slice(0, 500))
      navigate('/account', {
        state: {
          message: `Chat request sent to ${activeStory.city}. It will appear in the other person's inbox until they accept.`,
        },
      })
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 409) {
        navigate('/account', {
          state: {
            message: 'A request or conversation for this story already exists. Check your account inbox.',
          },
        })
        return
      }

      setChatActionError(requestError instanceof Error ? requestError.message : 'Failed to send chat request')
    } finally {
      setIsRequestingChat(false)
    }
  }

  return (
    <PageShell note="Not a result. Just a softer place to begin." variant="match">
      <section className="matches-page">
        <div className="page-intro">
          <p className="eyebrow">Matches</p>
          <h1 className="display">The feeling feels close. The people are real.</h1>
          <p className="entry-pill">"{entry}"</p>
        </div>

        {isLoading ? (
          <GlassPanel className="match-focus" flat>
            <p className="panel-kicker">Matching</p>
            <Skeleton width="68%" height="1.6rem" radius="10px" />
            <div style={{ marginTop: '0.8rem' }}>
              <SkeletonLines lines={4} />
            </div>
            <div style={{ marginTop: '1.2rem', display: 'flex', gap: '0.6rem' }}>
              <Skeleton width="6.5rem" height="1.4rem" radius="999px" />
              <Skeleton width="5rem" height="1.4rem" radius="999px" />
            </div>
          </GlassPanel>
        ) : error ? (
          <GlassPanel className="match-focus" flat>
            <EmptyState
              variant="match"
              title="No match yet"
              body={error}
              action={
                <div className="action-row">
                  <button
                    className="button button--primary"
                    onClick={() => navigate('/write', { state: { entry } })}
                    type="button"
                  >
                    Back to writing
                  </button>
                  <button className="button button--secondary" onClick={() => navigate('/account')} type="button">
                    Save this account first
                  </button>
                </div>
              }
            />
          </GlassPanel>
        ) : activeStory ? (
          <>
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
                <p className="panel-kicker">{activeOpening?.title}</p>
                <h2 className="section-title">
                  {activeStory.city}, {activeStory.country}
                </h2>
                <div className="match-focus__meta">
                  <span className="soft-badge">{emotionLabels[activeStory.emotion]}</span>
                  <span className="soft-badge">{activeStory.language}</span>
                </div>
                <p className="section-copy">{activeOpening?.summary}</p>
                <p className="match-focus__prompt">{activeStory.chatPrompt}</p>
                <p className="match-focus__story">{activeStory.fullText}</p>
                {chatActionError ? (
                  <p className="account-feedback account-feedback--error">{chatActionError}</p>
                ) : null}
                {!user?.isPersistent ? (
                  <p className="section-copy">
                    Guests can send requests too, but if this token is lost the conversation will
                    be lost with it. Save the account later if you want recovery.
                  </p>
                ) : null}

                <div className="action-row">
                  <button
                    className="button button--primary"
                    disabled={isRequestingChat}
                    onClick={handleRequestChat}
                    type="button"
                  >
                    {isRequestingChat ? 'Sending request...' : 'Send chat request'}
                  </button>
                  <button
                    className="button button--secondary"
                    onClick={() =>
                      navigate('/write', {
                        state: { entry, suggestedStoryId: narrativeReference?.id ?? null },
                      })
                    }
                    type="button"
                  >
                    Rewrite your line
                  </button>
                </div>
              </GlassPanel>
            </div>

            {narrativeReference ? (
              <GlassPanel className="narrative-reference" flat>
                <p className="panel-kicker">The story that first stayed close</p>
                <p className="narrative-reference__quote">"{narrativeReference.excerpt}"</p>
                <p className="narrative-reference__meta">
                  {narrativeReference.city}, {narrativeReference.country}
                </p>
              </GlassPanel>
            ) : null}
          </>
        ) : null}
      </section>
    </PageShell>
  )
}
