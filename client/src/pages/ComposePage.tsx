import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  defaultEntry,
  emotionLabels,
  findNarrativeMatch,
  getStoryById,
  inferEmotion,
} from '../data/stories'
import { GlassPanel } from '../components/GlassPanel'
import { PageShell } from '../components/PageShell'

interface ComposeLocationState {
  entry?: string
  suggestedStoryId?: string | null
}

export function ComposePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as ComposeLocationState | null
  const [entry, setEntry] = useState(state?.entry?.trim() || defaultEntry)

  const referencedStory = getStoryById(state?.suggestedStoryId)
  const previewStory = referencedStory ?? findNarrativeMatch(entry)
  const inferredEmotion = emotionLabels[inferEmotion(entry)]

  return (
    <PageShell note="Start privately. Let the words do the work." variant="write">
      <section className="compose-page">
        <GlassPanel className="compose-panel" flat>
          <p className="eyebrow">Write</p>
          <h1 className="display">What feels hard to carry today?</h1>
          <div className="prompt-bubble">
            <span className="prompt-bubble__mark">Echo</span>
            <p>How are you feeling right now?</p>
          </div>

          <label className="field compose-field">
            <span className="sr-only">How are you feeling right now?</span>
            <textarea
              className="field__textarea field__textarea--large"
              onChange={(event) => setEntry(event.target.value)}
              placeholder="I feel like..."
              value={entry}
            />
          </label>

          <div className="compose-panel__footer">
            <span className="soft-badge">{inferredEmotion}</span>
            <div className="action-row">
              <button
                className="button button--primary"
                onClick={() =>
                  navigate('/match', {
                    state: {
                      entry,
                      suggestedStoryId: previewStory.id,
                    },
                  })
                }
                type="button"
              >
                Find someone close to this
              </button>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="compose-preview" flat>
          <p className="panel-kicker">A nearby voice</p>
          <h2 className="section-title">
            {previewStory.city}, {previewStory.country}
          </h2>
          <p className="compose-preview__quote">"{previewStory.excerpt}"</p>
          <p className="section-copy">{previewStory.fullText}</p>
        </GlassPanel>
      </section>
    </PageShell>
  )
}
