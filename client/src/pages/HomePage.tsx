import { startTransition, useDeferredValue, useState } from 'react'
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
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(
    cityClusters[0]?.id ?? null,
  )
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(
    cityClusters[0]?.stories[0]?.id ?? null,
  )
  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = deferredQuery.trim().toLowerCase()

  const filteredClusters = cityClusters
    .map((cluster) => ({
      ...cluster,
      stories: cluster.stories.filter((story) => {
        const matchesEmotion =
          selectedEmotion === 'all' || story.emotion === selectedEmotion
        const matchesQuery =
          normalizedQuery.length === 0 ||
          story.city.toLowerCase().includes(normalizedQuery) ||
          story.country.toLowerCase().includes(normalizedQuery)

        return matchesEmotion && matchesQuery
      }),
    }))
    .filter((cluster) => cluster.stories.length > 0)

  const selectedCluster =
    filteredClusters.find((cluster) => cluster.id === selectedClusterId) ??
    filteredClusters[0] ??
    null

  const activeStory =
    selectedCluster?.stories.find((story) => story.id === selectedStoryId) ??
    selectedCluster?.stories[0] ??
    null

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
            onSelect={(clusterId) => {
              setSelectedClusterId(clusterId)
              const nextCluster = filteredClusters.find((cluster) => cluster.id === clusterId)
              setSelectedStoryId(nextCluster?.stories[0]?.id ?? null)
            }}
            selectedClusterId={selectedCluster?.id ?? selectedClusterId}
          />

          <button className="floating-compose" onClick={openWriter} type="button">
            Say one true thing
          </button>

          <GlassPanel className="discover-drawer" flat>
            {selectedCluster && activeStory ? (
              <>
                <div className="discover-drawer__header">
                  <div>
                    <p className="panel-kicker">
                      {selectedCluster.city}, {selectedCluster.country}
                    </p>
                    <h2 className="section-title">Voices resting here.</h2>
                  </div>

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
                      <p className="story-snippet__quote">"{story.excerpt}"</p>
                      <span className="story-snippet__status">
                        {story.openToChat ? 'Open to talk' : 'Story first'}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="story-focus">
                  <div className="story-focus__copy">
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
              </>
            ) : (
              <div className="empty-state">
                <p className="panel-kicker">No city yet</p>
                <h2 className="section-title">Try another feeling or place.</h2>
                <p className="section-copy">
                  Nothing is gone. The map just needs a gentler search.
                </p>
              </div>
            )}
          </GlassPanel>
        </div>
      </section>
    </PageShell>
  )
}
