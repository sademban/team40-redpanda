import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  cityClusters,
  emotionLabels,
  inferEmotion,
} from '../data/stories'
import { FilterChips } from '../components/FilterChips'
import { GlassPanel } from '../components/GlassPanel'
import { PageShell } from '../components/PageShell'
import { RegistryMap } from '../components/RegistryMap'
import { SearchInput } from '../components/SearchInput'
import type { Emotion } from '../types/story'

type EmotionFilter = Emotion | 'all'

const landingEmotionOptions = [
  { value: 'all', label: 'Everywhere' },
  ...Object.entries(emotionLabels).map(([value, label]) => ({ value, label })),
]

export function HomePage() {
  const navigate = useNavigate()
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionFilter>('all')
  const [query, setQuery] = useState('')
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null)
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null)
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null)
  const [showAmbientCopy, setShowAmbientCopy] = useState(true)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = deferredQuery.trim().toLowerCase()
  const inferredEmotion = normalizedQuery ? inferEmotion(normalizedQuery) : null

  const filteredClusters = useMemo(
    () =>
      cityClusters
        .map((cluster) => ({
          ...cluster,
          stories: cluster.stories.filter((story) => {
            const matchesEmotion =
              selectedEmotion === 'all' || story.emotion === selectedEmotion
            const searchableText = [
              emotionLabels[story.emotion],
              story.excerpt,
              story.fullText,
              story.chatPrompt,
              story.language,
              ...story.contextTags,
            ]
              .join(' ')
              .toLowerCase()
            const matchesQuery =
              normalizedQuery.length === 0 ||
              searchableText.includes(normalizedQuery) ||
              story.emotion === inferredEmotion

            return matchesEmotion && matchesQuery
          }),
        }))
        .filter((cluster) => cluster.stories.length > 0),
    [inferredEmotion, normalizedQuery, selectedEmotion],
  )

  const selectedCluster =
    filteredClusters.find((cluster) => cluster.id === selectedClusterId) ?? null

  const activeStory =
    selectedCluster?.stories.find((story) => story.id === selectedStoryId) ??
    selectedCluster?.stories[0] ??
    null

  const hasSelection = Boolean(selectedCluster && activeStory)

  function clearIdleTimer() {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current)
      idleTimerRef.current = null
    }
  }

  function scheduleAmbientReturn(delay = 4200) {
    clearIdleTimer()

    if (hasSelection) {
      return
    }

    idleTimerRef.current = setTimeout(() => {
      setShowAmbientCopy(true)
    }, delay)
  }

  function handleMapEngage() {
    setShowAmbientCopy(false)
    scheduleAmbientReturn()
  }

  useEffect(() => {
    if (hasSelection) {
      clearIdleTimer()
      return
    }

    clearIdleTimer()
    idleTimerRef.current = setTimeout(() => {
      setShowAmbientCopy(true)
    }, 1800)

    return () => {
      clearIdleTimer()
    }
  }, [hasSelection])

  function openWriter() {
    startTransition(() => {
      navigate('/write', {
        state: { suggestedStoryId: activeStory?.id ?? null },
      })
    })
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
            <FilterChips
              onSelect={(value) => setSelectedEmotion(value as EmotionFilter)}
              options={landingEmotionOptions}
              selected={selectedEmotion}
            />
          </div>

          <div className={`discover-copy${showAmbientCopy ? '' : ' is-hidden'}`}>
            <p className="eyebrow">Map</p>
            <h1 className="display">See where someone else left a feeling.</h1>
            <p className="discover-copy__body">
              Drift. Tap a city. Stay with a voice for a minute.
            </p>
          </div>

          <RegistryMap
            clusters={filteredClusters}
            hoveredClusterId={hoveredClusterId}
            onEngage={handleMapEngage}
            onHover={setHoveredClusterId}
            selectedStoryId={selectedStoryId}
            selectedClusterId={selectedCluster?.id ?? null}
            onSelect={(clusterId, storyId) => {
              setShowAmbientCopy(false)
              clearIdleTimer()
              setSelectedClusterId(clusterId)
              const nextCluster = filteredClusters.find((cluster) => cluster.id === clusterId)
              setSelectedStoryId(storyId ?? nextCluster?.stories[0]?.id ?? null)
            }}
          />

          <div className="discover-drawer-shell">
            {filteredClusters.length === 0 ? (
              <GlassPanel className="map-invite" flat>
                <p className="panel-kicker">Nothing close yet</p>
                <h2 className="section-title">No stories surfaced for that feeling right now.</h2>
                <p className="section-copy">
                  Try a softer line, or shift the feeling filter and see what opens.
                </p>
              </GlassPanel>
            ) : hasSelection && selectedCluster && activeStory ? (
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
                        handleMapEngage()
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

                <div className="story-strip" role="list" aria-label="Stories in this city">
                  {selectedCluster.stories.map((story) => (
                    <button
                      className={`story-snippet${story.id === activeStory.id ? ' is-active' : ''}`}
                      key={story.id}
                      onClick={() => setSelectedStoryId(story.id)}
                      type="button"
                    >
                      <span className="story-snippet__mood">
                        {emotionLabels[story.emotion]}
                      </span>
                      <span className="story-snippet__place">
                        {story.areaLabel} · {story.postalHint}
                      </span>
                      <p className="story-snippet__quote">"{story.excerpt}"</p>
                      <span className="story-snippet__status">
                        {story.openToChat ? 'Open to talk' : 'Story first'}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="story-focus">
                  <div className="story-focus__copy">
                    <p className="story-focus__place">
                      {activeStory.areaLabel} · {activeStory.postalHint}
                    </p>
                    <p className="story-focus__lead">{activeStory.chatPrompt}</p>
                    <p className="story-focus__text">{activeStory.fullText}</p>
                  </div>

                  <div className="story-focus__actions">
                    <button className="button button--primary" onClick={openWriter} type="button">
                      Write your own
                    </button>
                    <button
                      className="button button--ghost"
                      onClick={() => navigate('/about')}
                      type="button"
                    >
                      Why Echo exists
                    </button>
                  </div>
                </div>
              </GlassPanel>
            ) : (
              <GlassPanel className="map-invite" flat>
                <p className="panel-kicker">Start here</p>
                <h2 className="section-title">Touch a city to open what was left there.</h2>
                <p className="section-copy">
                  The larger rings are cities. The smaller points are individual stories nearby.
                </p>
              </GlassPanel>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
