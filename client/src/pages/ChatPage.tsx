import { useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { defaultEntry, getStoryById } from '../data/stories'
import { GlassPanel } from '../components/GlassPanel'
import { PageShell } from '../components/PageShell'

type ChatMode = 'suggested' | 'incoming'

interface ChatLocationState {
  entry?: string
  mode?: ChatMode
}

interface ChatMessage {
  id: string
  sender: 'them' | 'you'
  text: string
}

function seedMessages(mode: ChatMode, entry: string, prompt: string): ChatMessage[] {
  return [
    {
      id: 'them-1',
      sender: 'them',
      text: prompt,
    },
    {
      id: 'them-2',
      sender: 'them',
      text:
        mode === 'incoming'
          ? 'You do not have to answer perfectly. Start wherever feels honest.'
          : `I stayed with what you wrote: "${entry}". You can keep this small.`,
    },
  ]
}

export function ChatPage() {
  const navigate = useNavigate()
  const { storyId } = useParams()
  const location = useLocation()
  const state = location.state as ChatLocationState | null
  const story = getStoryById(storyId)
  const safeStory = story ?? getStoryById('nyc-pressure-1')
  const entry = state?.entry?.trim() || defaultEntry
  const mode = state?.mode ?? 'suggested'
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(
    seedMessages(mode, entry, safeStory?.chatPrompt ?? 'Start anywhere that feels true.'),
  )

  if (!story || !safeStory) {
    return <Navigate to="/match" replace />
  }

  function sendMessage() {
    const nextMessage = draft.trim()

    if (!nextMessage) {
      return
    }

    setMessages((current) => [
      ...current,
      {
        id: `you-${current.length + 1}`,
        sender: 'you',
        text: nextMessage,
      },
    ])
    setDraft('')
  }

  return (
    <PageShell note="This can stay small. One real sentence at a time." variant="chat">
      <section className="chat-page">
        <GlassPanel className="chat-sidebar" flat>
          <p className="panel-kicker">
            {mode === 'incoming' ? 'They reached first' : 'You reached because it felt close'}
          </p>
          <h1 className="section-title">
            {story.city}, {story.country}
          </h1>
          <p className="chat-sidebar__quote">"{story.excerpt}"</p>
          <p className="chat-sidebar__copy">{story.fullText}</p>
          <p className="entry-pill entry-pill--soft">"{entry}"</p>
          <button className="button button--secondary" onClick={() => navigate('/match')} type="button">
            Back to matches
          </button>
        </GlassPanel>

        <GlassPanel className="chat-room" flat>
          <div className="chat-room__header">
            <p className="panel-kicker">{story.language}</p>
            <h2 className="section-title">Chat</h2>
          </div>

          <div className="chat-thread">
            {messages.map((message) => (
              <div
                className={`chat-message chat-message--${message.sender}`}
                key={message.id}
              >
                <p>{message.text}</p>
              </div>
            ))}
          </div>

          <div className="chat-composer">
            <label className="field">
              <span className="sr-only">Write a message</span>
              <textarea
                className="field__textarea"
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Write back softly."
                value={draft}
              />
            </label>

            <div className="action-row">
              <button className="button button--primary" onClick={sendMessage} type="button">
                Send
              </button>
            </div>
          </div>
        </GlassPanel>
      </section>
    </PageShell>
  )
}
