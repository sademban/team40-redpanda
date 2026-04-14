import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createStory } from '../lib/api'
import { GlassPanel } from '../components/GlassPanel'
import { PageShell } from '../components/PageShell'
import { useApp } from '../contexts/AppContext'
import { findSupportedLocation, supportedLocations } from '../data/locations'
import {
  contextTagOptions,
  emotionOptions,
  type ContextTag,
  type CreateStoryPayload,
  type Emotion,
} from '../types/story'

type ComposeStep = 'place' | 'shape' | 'story' | 'door'
const EXCERPT_MAX_CHARS = 220

const composeSteps: Array<{ id: ComposeStep; label: string; title: string; description: string }> = [
  {
    id: 'place',
    label: 'Place',
    title: 'Start with where this feeling lives.',
    description: 'Keep it soft enough for privacy, but specific enough to feel anchored.',
  },
  {
    id: 'shape',
    label: 'Shape',
    title: 'Name the emotional shape of it.',
    description: 'Choose the feeling, the context, and the short line someone first sees.',
  },
  {
    id: 'story',
    label: 'Story',
    title: 'Write the part that usually stays inside.',
    description: 'This becomes the fuller story used for matching and for people who open it.',
  },
  {
    id: 'door',
    label: 'Door',
    title: 'Decide whether this story should stay open.',
    description: 'If you want conversation, add the line someone meets when they reach out.',
  },
]

const emotionLabels: Record<Emotion, string> = {
  homesick: 'Homesick',
  pressure: 'Pressure',
  lonely: 'Lonely',
  identity: 'Identity',
  hope: 'Hope',
}

const contextLabels: Record<ContextTag, string> = {
  student: 'Student',
  'new-city': 'New city',
  'family-duty': 'Family duty',
  'work-pressure': 'Work pressure',
  'distance-from-home': 'Distance from home',
}

export function ComposePage() {
  const navigate = useNavigate()
  const { token, refreshStories } = useApp()
  const [activeStep, setActiveStep] = useState<ComposeStep>('place')
  const [city, setCity] = useState('Kathmandu')
  const [areaLabel, setAreaLabel] = useState('Somewhere nearby')
  const [postalHint, setPostalHint] = useState('Kept soft for privacy')
  const [emotion, setEmotion] = useState<Emotion>('pressure')
  const [contextTags, setContextTags] = useState<ContextTag[]>(['new-city'])
  const [excerpt, setExcerpt] = useState(
    'I keep performing okayness long after the room has stopped asking me to.'
  )
  const [fullText, setFullText] = useState(
    'I keep looking fine from far away, but up close everything feels heavier than I want to admit.'
  )
  const [language, setLanguage] = useState('English')
  const [openToChat, setOpenToChat] = useState(true)
  const [chatPrompt, setChatPrompt] = useState('How are you feeling right now?')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedLocation = useMemo(() => findSupportedLocation(city), [city])
  const excerptCount = excerpt.trim().length

  useEffect(() => {
    const isDirty =
      areaLabel !== 'Somewhere nearby' ||
      excerpt !== 'I keep performing okayness long after the room has stopped asking me to.' ||
      fullText !== 'I keep looking fine from far away, but up close everything feels heavier than I want to admit.'
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [areaLabel, excerpt, fullText])
  const activeStepIndex = composeSteps.findIndex((step) => step.id === activeStep)
  const activeStepMeta = composeSteps[activeStepIndex]

  function toggleContextTag(tag: ContextTag) {
    setContextTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag]
    )
  }

  function validateStep(step: ComposeStep) {
    if (step === 'place') {
      if (!selectedLocation) {
        return 'Choose a supported city so the story can be placed on the map.'
      }

      if (!areaLabel.trim()) {
        return 'Add an area label so the story feels grounded.'
      }

      if (!postalHint.trim()) {
        return 'Add a soft location hint instead of leaving the place blank.'
      }

      if (!language.trim()) {
        return 'Tell Echo which language this story is written in.'
      }
    }

    if (step === 'shape') {
      if (!excerpt.trim()) {
        return 'Add a short excerpt for the map and matching cards.'
      }

      if (excerpt.trim().length > EXCERPT_MAX_CHARS) {
        return `Excerpt must stay under ${EXCERPT_MAX_CHARS} characters.`
      }

      if (contextTags.length === 0) {
        return 'Choose at least one context tag.'
      }
    }

    if (step === 'story' && !fullText.trim()) {
      return 'Write the fuller story before you continue.'
    }

    if (step === 'door' && openToChat && !chatPrompt.trim()) {
      return 'Add the line someone would meet if they try to talk to you.'
    }

    return null
  }

  function goToNextStep() {
    const validationError = validateStep(activeStep)

    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)

    const nextStep = composeSteps[activeStepIndex + 1]
    if (nextStep) {
      setActiveStep(nextStep.id)
    }
  }

  function goToPreviousStep() {
    setError(null)
    const previousStep = composeSteps[activeStepIndex - 1]
    if (previousStep) {
      setActiveStep(previousStep.id)
    }
  }

  async function handleSubmit() {
    if (!token) {
      navigate('/auth', {
        state: {
          message: 'Start a guest or saved session before submitting a story.',
        },
      })
      return
    }

    const validationError = validateStep('place') ?? validateStep('shape') ?? validateStep('story') ?? validateStep('door')

    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmitting(true)
    setError(null)

    const payload: CreateStoryPayload = {
      city: selectedLocation!.city,
      country: selectedLocation!.country,
      areaLabel: areaLabel.trim(),
      postalHint: postalHint.trim(),
      lat: selectedLocation!.lat,
      lng: selectedLocation!.lng,
      emotion,
      contextTags,
      excerpt: excerpt.trim(),
      fullText: fullText.trim(),
      language: language.trim(),
      openToChat,
      chatPrompt: openToChat ? chatPrompt.trim() : 'Story first, conversation later.',
    }

    try {
      const story = await createStory(token, payload)
      await refreshStories()

      navigate('/match', {
        state: {
          entry: `${payload.excerpt} ${payload.fullText}`.trim(),
          suggestedStoryId: story.id,
        },
      })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save story')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageShell note="Write it once. Save it softly. Then see who answers nearby." variant="write">
      <section className="compose-page">
        <GlassPanel className="compose-panel" flat>
          <GlassPanel className={`compose-stage compose-stage--${activeStep}`} flat>
            <div className="compose-steps" aria-label={`Step ${activeStepIndex + 1} of ${composeSteps.length}`}>
              {composeSteps.map((step, index) => (
                <span
                  key={step.id}
                  className={`compose-steps__dot${index === activeStepIndex ? ' is-active' : ''}${index < activeStepIndex ? ' is-done' : ''}`}
                  title={step.label}
                />
              ))}
            </div>
            <p className="panel-kicker">{activeStepMeta.label}</p>
            <h2 className="compose-stage__title">{activeStepMeta.title}</h2>
            <p className="section-copy compose-stage__copy">{activeStepMeta.description}</p>

            <div className="compose-stage__body">
              {activeStep === 'place' ? (
                <div className="compose-form-grid">
                  <label className="field">
                    <span className="field-label">City</span>
                    <select className="field__select" onChange={(event) => setCity(event.target.value)} value={city}>
                      {supportedLocations.map((location) => (
                        <option key={`${location.city}-${location.country}`} value={location.city}>
                          {location.city}, {location.country}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span className="field-label">Country</span>
                    <input
                      className="field__input field__input--plain field__input--readonly"
                      readOnly
                      value={selectedLocation?.country ?? ''}
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">Area label</span>
                    <input
                      className="field__input field__input--plain"
                      onChange={(event) => setAreaLabel(event.target.value)}
                      placeholder="Patan, Hongdae, Canary Wharf..."
                      value={areaLabel}
                    />
                  </label>

                  <label className="field">
                    <span className="field-label">Postal hint</span>
                    <input
                      className="field__input field__input--plain"
                      onChange={(event) => setPostalHint(event.target.value)}
                      placeholder="A soft location hint"
                      value={postalHint}
                    />
                  </label>

                  <label className="field compose-form-grid__full">
                    <span className="field-label">Language</span>
                    <input
                      className="field__input field__input--plain"
                      onChange={(event) => setLanguage(event.target.value)}
                      placeholder="English"
                      value={language}
                    />
                  </label>
                </div>
              ) : null}

              {activeStep === 'shape' ? (
                <div className="compose-stage__stack">
                  <div className="compose-form-grid">
                    <label className="field compose-field--short">
                      <span className="field-label">Emotion</span>
                      <select
                        className="field__select"
                        onChange={(event) => setEmotion(event.target.value as Emotion)}
                        value={emotion}
                      >
                        {emotionOptions.map((option) => (
                          <option key={option} value={option}>
                            {emotionLabels[option]}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="field compose-tags">
                    <span className="field-label">Context tags</span>
                    <div className="compose-tags__list">
                      {contextTagOptions.map((tag) => {
                        const isActive = contextTags.includes(tag)

                        return (
                          <button
                            aria-pressed={isActive}
                            className={`chip${isActive ? ' is-active' : ''}`}
                            key={tag}
                            onClick={() => toggleContextTag(tag)}
                            type="button"
                          >
                            {contextLabels[tag]}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <label className="field">
                    <span className="field-label">Excerpt</span>
                    <textarea
                      className="field__textarea compose-field__excerpt"
                      onChange={(event) => setExcerpt(event.target.value)}
                      placeholder="One short line that can sit on the map."
                      value={excerpt}
                    />
                    <p className="field-note">{excerptCount}/{EXCERPT_MAX_CHARS} characters</p>
                  </label>
                </div>
              ) : null}

              {activeStep === 'story' ? (
                <label className="field compose-story-field">
                  <span className="field-label">Full story</span>
                  <textarea
                    className="field__textarea field__textarea--large compose-field__story"
                    onChange={(event) => setFullText(event.target.value)}
                    placeholder="What feels heavy right now?"
                    value={fullText}
                  />
                </label>
              ) : null}

              {activeStep === 'door' ? (
                <div className="compose-stage__stack">
                  <label className="compose-toggle">
                    <input
                      checked={openToChat}
                      onChange={(event) => setOpenToChat(event.target.checked)}
                      type="checkbox"
                    />
                    <span className="compose-toggle__copy">
                      <span className="compose-toggle__title">Open to chat</span>
                      <span className="compose-toggle__text">
                        Let someone send a request after the match if this story should stay open.
                      </span>
                    </span>
                  </label>

                  <label className="field">
                    <span className="field-label">Opening line for chat</span>
                    <input
                      className="field__input field__input--plain"
                      disabled={!openToChat}
                      onChange={(event) => setChatPrompt(event.target.value)}
                      placeholder="How are you feeling right now?"
                      value={chatPrompt}
                    />
                  </label>
                </div>
              ) : null}

              {error ? <p className="account-feedback account-feedback--error">{error}</p> : null}
            </div>

            <div className="compose-stage__actions">
              <button
                className="button button--secondary"
                disabled={activeStepIndex === 0}
                onClick={goToPreviousStep}
                type="button"
              >
                Back
              </button>

              {activeStep !== 'door' ? (
                <button className="button button--primary" onClick={goToNextStep} type="button">
                  Next
                </button>
              ) : (
                <button
                  className="button button--primary"
                  disabled={isSubmitting}
                  onClick={() => void handleSubmit()}
                  type="button"
                >
                  {isSubmitting ? 'Saving story...' : 'Save story and find a match'}
                </button>
              )}
            </div>
          </GlassPanel>
        </GlassPanel>

        <GlassPanel className="compose-preview" flat>
          <p className="panel-kicker">Preview</p>
          <h2 className="compose-preview__title">
            {selectedLocation?.city}, {selectedLocation?.country}
          </h2>
          <div className="compose-preview__meta">
            <span className="soft-badge">{emotionLabels[emotion]}</span>
            <span className="soft-badge">{language || 'Language'}</span>
            <span className="soft-badge">{areaLabel || 'Area label'}</span>
          </div>
          <p className="compose-preview__quote">"{excerpt.trim() || 'Your excerpt will appear here.'}"</p>
          <p className="section-copy">{fullText.trim() || 'Your full story will appear here before it is saved.'}</p>
          <div className="compose-preview__stack">
            <p className="panel-kicker">Context</p>
            <div className="compose-tags__list">
              {contextTags.length > 0 ? (
                contextTags.map((tag) => (
                  <span className="soft-badge" key={tag}>
                    {contextLabels[tag]}
                  </span>
                ))
              ) : (
                <span className="soft-badge">No tags yet</span>
              )}
            </div>
          </div>
          <div className="compose-preview__stack">
            <p className="panel-kicker">Chat opening</p>
            <p className="compose-preview__prompt">
              {openToChat ? chatPrompt.trim() || 'No opening line yet.' : 'This story will stay closed to chat.'}
            </p>
          </div>
        </GlassPanel>
      </section>
    </PageShell>
  )
}
