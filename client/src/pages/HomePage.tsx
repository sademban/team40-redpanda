import { startTransition, useDeferredValue, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  emotionLabels,
  getContextLabel,
  getMapClusters,
  getRelatedCitySuggestions,
} from '../data/stories'
import { FilterChips } from '../components/FilterChips'
import { GlassPanel } from '../components/GlassPanel'
import { PageShell } from '../components/PageShell'
import { RegistryMap } from '../components/RegistryMap'
import { SearchInput } from '../components/SearchInput'
import { useApp } from '../contexts/AppContext'
import { ApiError, createChatRequest } from '../lib/api'
import type { Emotion } from '../types/story'

const MAP_INTRO_KEY = 'echo-map-intro-seen'

type EmotionFilter = Emotion | 'all'

const landingEmotionOptions = [
  { value: 'all', label: 'Everywhere' },
  ...Object.entries(emotionLabels).map(([value, label]) => ({ value, label })),
]

function getInitialIntroVisibility() {
  if (typeof window === 'undefined') {
    return true
  }

  return window.sessionStorage.getItem(MAP_INTRO_KEY) !== '1'
}

export function HomePage() {
  const navigate = useNavigate()
  const { clusters, dataError, isBootstrapping, isRefreshingStories, token, user } = useApp()
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionFilter>('all')
  const [query, setQuery] = useState('')
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null)
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null)
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null)
  const [resetViewToken, setResetViewToken] = useState(0)
  const [showAmbientCopy, setShowAmbientCopy] = useState(getInitialIntroVisibility)
  const [isRequestingChat, setIsRequestingChat] = useState(false)
  const [chatActionError, setChatActionError] = useState<string | null>(null)
  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = deferredQuery.trim()

  const filteredClusters = useMemo(
    () => getMapClusters(clusters, selectedEmotion, normalizedQuery),
    [clusters, normalizedQuery, selectedEmotion],
  )

  const selectedCluster =
    filteredClusters.find((cluster) => cluster.id === selectedClusterId) ?? null

  const activeMatch =
    selectedCluster?.matches.find((match) => match.story.id === selectedStoryId) ??
    selectedCluster?.matches[0] ??
    null

  const activeStory = activeMatch?.story ?? null
  const hasSelection = Boolean(selectedCluster && activeStory)
  const hasActiveDiscovery = normalizedQuery.length > 0 || selectedEmotion !== 'all'
  const showAmbientLayer =
    showAmbientCopy &&
    !hasSelection &&
    !hasActiveDiscovery &&
    hoveredClusterId === null
  const showHoverStatus = !hasSelection && !showAmbientLayer && hoveredClusterId !== null
  const showMapInvite =
    !hasSelection &&
    !showAmbientLayer &&
    !hasActiveDiscovery &&
    hoveredClusterId === null &&
    filteredClusters.length > 0

  const relatedCities = useMemo(
    () =>
      activeStory && selectedCluster
        ? getRelatedCitySuggestions(activeStory, selectedCluster.id, filteredClusters)
        : [],
    [activeStory, filteredClusters, selectedCluster],
  )

  function markIntroSeen() {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(MAP_INTRO_KEY, '1')
    }
  }

  function handleMapEngage() {
    if (!showAmbientCopy) {
      return
    }

    markIntroSeen()
    setShowAmbientCopy(false)
  }

  function selectCluster(clusterId: string, storyId?: string | null) {
    handleMapEngage()
    setHoveredClusterId(null)
    setSelectedClusterId(clusterId)

    const nextCluster = filteredClusters.find((cluster) => cluster.id === clusterId)
    const nextStory =
      nextCluster?.matches.find((match) => match.story.id === storyId)?.story ??
      nextCluster?.matches[0]?.story ??
      null

    setSelectedStoryId(nextStory?.id ?? null)
  }

  function openWriter(overrides?: { entry?: string; suggestedStoryId?: string | null }) {
    startTransition(() => {
      navigate('/write', {
        state: {
          suggestedStoryId: activeStory?.id ?? null,
          ...overrides,
        },
      })
    })
  }

  function handleResetDiscovery() {
    handleMapEngage()
    setQuery('')
    setSelectedEmotion('all')
    setHoveredClusterId(null)
  }

  function handleResetWorld() {
    handleMapEngage()
    setHoveredClusterId(null)
    setSelectedClusterId(null)
    setSelectedStoryId(null)
    setResetViewToken((value) => value + 1)
  }

  async function handleSendChatRequest(storyId: string, city: string) {
    if (!token) {
      navigate('/auth')
      return
    }

    setIsRequestingChat(true)
    setChatActionError(null)

    try {
      await createChatRequest(token, storyId)
      navigate('/account', {
        state: {
          message: `Chat request sent to ${city}. It will appear in their inbox until they accept.`,
        },
      })
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 409) {
        navigate('/account', {
          state: {
            message: 'A request or conversation for this story already exists. Check your inbox.',
          },
        })
        return
      }

      setChatActionError(
        requestError instanceof Error ? requestError.message : 'Failed to send chat request',
      )
    } finally {
      setIsRequestingChat(false)
    }
  }

  return (
    <PageShell
      note="A softer map of what people carry quietly."
      variant="map"
    >
      <section className="discover-page">
        <div className="discover-surface">
          <div className="discover-surface__top">
            <SearchInput
              className="search-shell--semantic"
              onChange={setQuery}
              onFocus={handleMapEngage}
              placeholder="Search a feeling, memory, or line"
              value={query}
            />

            <div className="discover-surface__filters">
              <FilterChips
                onSelect={(value) => {
                  handleMapEngage()
                  setSelectedEmotion(value as EmotionFilter)
                }}
                options={landingEmotionOptions}
                selected={selectedEmotion}
              />

              {hasActiveDiscovery ? (
                <button
                  className="discover-clear"
                  onClick={handleResetDiscovery}
                  type="button"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          <div className={`discover-copy${showAmbientLayer ? '' : ' is-hidden'}`}>
            <p className="eyebrow discover-copy__eyebrow">Map</p>
            <h1 className="display discover-copy__headline">See where someone else left a feeling.</h1>
            <p className="discover-copy__body">
              Drift. Tap a city. Stay with a voice for a minute.
            </p>
          </div>

          <RegistryMap
            clusters={filteredClusters}
            hoveredClusterId={hoveredClusterId}
            onEngage={handleMapEngage}
            onHover={setHoveredClusterId}
            onResetWorld={handleResetWorld}
            onSelect={selectCluster}
            resetViewToken={resetViewToken}
            showAmbientStatus={showHoverStatus}
            selectedStoryId={selectedStoryId}
            selectedClusterId={selectedCluster?.id ?? null}
          />

          <div className="discover-drawer-shell">
            {filteredClusters.length === 0 ? (
              <GlassPanel className="map-invite" flat>
                <p className="panel-kicker">Nothing close yet</p>
                <h2 className="section-title">No stories surfaced for that feeling yet.</h2>
                <p className="section-copy">
                  Leave one true line behind. The next person may need exactly that.
                </p>
                <div className="action-row">
                    <button
                      className="button button--primary"
                    onClick={() =>
                      openWriter({
                        entry: normalizedQuery || undefined,
                        suggestedStoryId: null,
                      })
                    }
                    type="button"
                    >
                      Write your own
                    </button>
                  </div>
                  {isBootstrapping || isRefreshingStories ? (
                    <p className="section-copy">Loading the map from the backend.</p>
                  ) : null}
                  {dataError ? <p className="account-feedback account-feedback--error">{dataError}</p> : null}
                </GlassPanel>
            ) : hasSelection && selectedCluster && activeStory && activeMatch ? (
              <GlassPanel className="discover-drawer" flat>
                <div className="discover-drawer__header">
                  <div>
                    <p className="panel-kicker">
                      {selectedCluster.city}, {selectedCluster.country}
                    </p>
                    <h2 className="section-title">Stories waiting here.</h2>
                  </div>

                  <div className="discover-drawer__actions">
                    <button
                      className="button button--secondary"
                      onClick={() =>
                        navigate('/match', {
                          state: { suggestedStoryId: activeStory.id },
                        })
                      }
                      type="button"
                    >
                      Explore matches
                    </button>
                    <button
                      aria-label="Close story sheet"
                      className="sheet-dismiss"
                      onClick={() => {
                        setSelectedClusterId(null)
                        setSelectedStoryId(null)
                        setHoveredClusterId(null)
                      }}
                      type="button"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="discover-drawer__content">
                  <div className="story-strip" role="list" aria-label="Stories in this city">
                    {selectedCluster.matches.map((match) => (
                      <button
                        className={`story-snippet${match.story.id === activeStory.id ? ' is-active' : ''}`}
                        key={match.story.id}
                        onClick={() => setSelectedStoryId(match.story.id)}
                        type="button"
                      >
                        <span className="story-snippet__mood">
                          {emotionLabels[match.story.emotion]}
                        </span>
                        <span className="story-snippet__place">
                          {match.story.areaLabel} · {match.story.postalHint}
                        </span>
                        <p className="story-snippet__quote">"{match.story.excerpt}"</p>
                        <span className="story-snippet__status">
                          {match.story.openToChat ? 'Open to talk' : 'Story first'}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="story-focus">
                    <div className="story-focus__body" key={activeStory.id}>
                      <div className="story-focus__meta">
                        <span className="soft-badge">{emotionLabels[activeStory.emotion]}</span>
                        <span className="soft-badge">
                          {activeStory.openToChat ? 'Open to talk' : 'Story first'}
                        </span>
                        <span className="soft-badge">{activeStory.language}</span>
                        <span className="soft-badge">
                          {activeStory.areaLabel} · {activeStory.postalHint}
                        </span>
                      </div>

                      <div className="story-focus__tags" aria-label="Context tags">
                        {activeStory.contextTags.map((tag) => (
                          <span className="story-focus__tag" key={tag}>
                            {getContextLabel(tag)}
                          </span>
                        ))}
                      </div>

                      {normalizedQuery.length > 0 && activeMatch.whySurfaced ? (
                        <p className="story-focus__why">{activeMatch.whySurfaced}</p>
                      ) : null}

                      <p className="story-focus__lead">{activeStory.chatPrompt}</p>
                      <p className="story-focus__text">{activeStory.fullText}</p>
                    </div>

                    {chatActionError ? (
                      <p className="account-feedback account-feedback--error">{chatActionError}</p>
                    ) : null}

                    <div className="story-focus__actions">
                      {activeStory.openToChat ? (
                        <button
                          className="button button--primary"
                          disabled={isRequestingChat}
                          onClick={() => handleSendChatRequest(activeStory.id, activeStory.city)}
                          type="button"
                        >
                          {isRequestingChat ? 'Sending request...' : 'Send chat request'}
                        </button>
                      ) : (
                        <button
                          className="button button--primary"
                          onClick={() =>
                            navigate('/match', {
                              state: { suggestedStoryId: activeStory.id },
                            })
                          }
                          type="button"
                        >
                          Explore matches
                        </button>
                      )}
                      <button className="button button--ghost" onClick={() => openWriter()} type="button">
                        Write your own
                      </button>
                    </div>
                    {!user?.isPersistent ? (
                      <p className="section-copy">
                        Guests can send requests, but losing this token loses the chat. Save your account later for recovery.
                      </p>
                    ) : null}
                  </div>

                  {relatedCities.length > 0 ? (
                    <div className="related-cities">
                      <p className="panel-kicker">Elsewhere this feeling appears</p>
                      <div className="related-cities__list" role="list" aria-label="Related cities">
                        {relatedCities.map((suggestion) => (
                          <button
                            className="related-city"
                            key={suggestion.clusterId}
                            onClick={() => selectCluster(suggestion.clusterId, suggestion.storyId)}
                            type="button"
                          >
                            <div>
                              <p className="related-city__place">
                                {suggestion.city}, {suggestion.country}
                              </p>
                              <p className="related-city__reason">{suggestion.reason}</p>
                            </div>
                            <span className="related-city__status">
                              {suggestion.openToChat ? 'Open to talk' : suggestion.areaLabel}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </GlassPanel>
            ) : showMapInvite ? (
              <GlassPanel className="map-invite" flat>
                <p className="panel-kicker">Start here</p>
                <h2 className="section-title">Touch a city to open what was left there.</h2>
                <p className="section-copy">
                  Larger rings are cities. Smaller points appear when a city opens.
                </p>
              </GlassPanel>
            ) : null}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
