import { startTransition, useDeferredValue, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  cityClusters,
  emotionLabels,
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
  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = deferredQuery.trim().toLowerCase()

  const filteredClusters = useMemo(
    () =>
      cityClusters
        .map((cluster) => ({
          ...cluster,
          stories: cluster.stories.filter((story) => {
            const matchesEmotion =
              selectedEmotion === 'all' || story.emotion === selectedEmotion
            const matchesQuery =
              normalizedQuery.length === 0 ||
              story.areaLabel.toLowerCase().includes(normalizedQuery) ||
              story.postalHint.toLowerCase().includes(normalizedQuery) ||
              story.city.toLowerCase().includes(normalizedQuery) ||
              story.country.toLowerCase().includes(normalizedQuery)

            return matchesEmotion && matchesQuery
          }),
        }))
        .filter((cluster) => cluster.stories.length > 0),
    [normalizedQuery, selectedEmotion],
  )

  const selectedCluster =
    filteredClusters.find((cluster) => cluster.id === selectedClusterId) ?? null

  const activeStory =
    selectedCluster?.stories.find((story) => story.id === selectedStoryId) ??
    selectedCluster?.stories[0] ??
    null

  const hasSelection = Boolean(selectedCluster && activeStory)

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
            <SearchInput onChange={setQuery} value={query} />
            <FilterChips
              onSelect={(value) => setSelectedEmotion(value as EmotionFilter)}
              options={landingEmotionOptions}
              selected={selectedEmotion}
            />
          </div>

          <div className="discover-copy">
            <p className="eyebrow">Map</p>
            <h1 className="display">See where someone else left a feeling.</h1>
            <p className="discover-copy__body">
              Drift. Tap a city. Stay with a voice for a minute.
            </p>
          </div>

          <RegistryMap
            clusters={filteredClusters}
            hoveredClusterId={hoveredClusterId}
            onHover={setHoveredClusterId}
            selectedStoryId={selectedStoryId}
            selectedClusterId={selectedCluster?.id ?? null}
            onSelect={(clusterId, storyId) => {
              setSelectedClusterId(clusterId)
              const nextCluster = filteredClusters.find((cluster) => cluster.id === clusterId)
              setSelectedStoryId(storyId ?? nextCluster?.stories[0]?.id ?? null)
            }}
          />

          <button className="floating-compose" onClick={openWriter} type="button">
            Say one true thing
          </button>

          <div className="discover-drawer-shell">
            {hasSelection && selectedCluster && activeStory ? (
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
