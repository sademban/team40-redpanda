import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { createPortal } from 'react-dom'
import {
  acceptChatRequest,
  declineChatRequest,
  listChatRequests,
  listConversations,
} from '../lib/api'
import type { ChatRequestSummary, ConversationSummary } from '../types/chat'
import { EmptyState } from '../components/EmptyState'
import { GlassPanel } from '../components/GlassPanel'
import { PageShell } from '../components/PageShell'
import { useApp } from '../contexts/AppContext'

interface AccountLocationState {
  message?: string
}

type InboxTab = 'incoming' | 'conversations' | 'outgoing'

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function AccountPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, token, logout } = useApp()
  const state = location.state as AccountLocationState | null

  const [message, setMessage] = useState<string | null>(state?.message ?? null)
  const [isLoadingInbox, setIsLoadingInbox] = useState(false)
  const [inboxError, setInboxError] = useState<string | null>(null)
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false)
  const [isInboxModalOpen, setIsInboxModalOpen] = useState(false)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [decliningId, setDecliningId] = useState<string | null>(null)
  const [selectedIncomingRequest, setSelectedIncomingRequest] = useState<ChatRequestSummary | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<ConversationSummary | null>(null)
  const [selectedOutgoingRequest, setSelectedOutgoingRequest] = useState<ChatRequestSummary | null>(null)
  const [activeInboxTab, setActiveInboxTab] = useState<InboxTab>('incoming')
  const [incomingRequests, setIncomingRequests] = useState<ChatRequestSummary[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<ChatRequestSummary[]>([])
  const [conversations, setConversations] = useState<ConversationSummary[]>([])

  const canUpgrade = Boolean(user && !user.isPersistent)
  const modalRoot = typeof document !== 'undefined' ? document.body : null

  async function refreshInbox(nextToken = token) {
    if (!nextToken) {
      return
    }

    setIsLoadingInbox(true)
    setInboxError(null)

    try {
      const [requests, conversationList] = await Promise.all([
        listChatRequests(nextToken),
        listConversations(nextToken),
      ])

      setIncomingRequests(requests.incoming)
      setOutgoingRequests(requests.outgoing)
      setConversations(conversationList)
    } catch (refreshError) {
      setInboxError(refreshError instanceof Error ? refreshError.message : 'Failed to load inbox')
    } finally {
      setIsLoadingInbox(false)
    }
  }

  useEffect(() => {
    if (state?.message) {
      setMessage(state.message)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, navigate, state])

  useEffect(() => {
    if (!message) {
      return
    }

    const timer = window.setTimeout(() => {
      setMessage(null)
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [message])

  useEffect(() => {
    if (!token) {
      setIncomingRequests([])
      setOutgoingRequests([])
      setConversations([])
      setInboxError(null)
      return
    }

    void refreshInbox(token)
  }, [token])

  useEffect(() => {
    if (!token || !isInboxModalOpen) return
    const id = window.setInterval(() => void refreshInbox(), 30_000)
    return () => window.clearInterval(id)
  }, [token, isInboxModalOpen])

  useEffect(() => {
    if (!isConfirmingLogout && !isInboxModalOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsConfirmingLogout(false)
        setIsInboxModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isConfirmingLogout, isInboxModalOpen])

  async function handleAccept(requestId: string) {
    if (!token) {
      return
    }

    setInboxError(null)
    setAcceptingId(requestId)

    try {
      const conversation = await acceptChatRequest(token, requestId)
      await refreshInbox()
      navigate(`/chat/${conversation.id}`)
    } catch (requestError) {
      setInboxError(requestError instanceof Error ? requestError.message : 'Failed to accept request')
    } finally {
      setAcceptingId(null)
    }
  }

  async function handleDecline(requestId: string) {
    if (!token) {
      return
    }

    setInboxError(null)
    setDecliningId(requestId)

    try {
      await declineChatRequest(token, requestId)
      await refreshInbox()
    } catch (requestError) {
      setInboxError(requestError instanceof Error ? requestError.message : 'Failed to decline request')
    } finally {
      setDecliningId(null)
    }
  }

  function handleOpenInboxTab(tab: InboxTab) {
    setActiveInboxTab(tab)
    setIsInboxModalOpen(true)
  }

  function handleLogout() {
    if (canUpgrade) {
      setIsConfirmingLogout(true)
      return
    }

    logout()
    setIncomingRequests([])
    setOutgoingRequests([])
    setConversations([])
    setInboxError(null)
    navigate('/auth', {
      replace: true,
      state: {
        message: canUpgrade
          ? 'Guest session cleared on this browser. If it was not saved, that identity can no longer be recovered here.'
          : 'You are signed out on this browser.',
      },
    })
  }

  function handleConfirmGuestLogout() {
    logout()
    setIncomingRequests([])
    setOutgoingRequests([])
    setConversations([])
    setInboxError(null)
    setIsConfirmingLogout(false)
    navigate('/auth', {
      replace: true,
      state: {
        message:
          'Guest session cleared on this browser. If it was not saved, that identity can no longer be recovered here.',
      },
    })
  }

  const pendingIncoming = useMemo(
    () => incomingRequests.filter((request) => request.status === 'pending'),
    [incomingRequests],
  )

  const pendingOutgoing = useMemo(
    () => outgoingRequests.filter((request) => request.status === 'pending'),
    [outgoingRequests],
  )

  useEffect(() => {
    if (pendingIncoming.length > 0) {
      setActiveInboxTab('incoming')
      return
    }

    if (conversations.length > 0) {
      setActiveInboxTab('conversations')
      return
    }

    if (pendingOutgoing.length > 0) {
      setActiveInboxTab('outgoing')
      return
    }

    setActiveInboxTab('incoming')
  }, [conversations.length, pendingIncoming.length, pendingOutgoing.length])

  useEffect(() => {
    if (activeInboxTab === 'incoming') {
      if (pendingIncoming.length === 0) {
        setSelectedIncomingRequest(null)
        return
      }

      setSelectedIncomingRequest((current) => {
        const matched = current ? pendingIncoming.find((request) => request.id === current.id) : null
        return matched ?? pendingIncoming[0]
      })
      return
    }

    if (activeInboxTab === 'conversations') {
      if (conversations.length === 0) {
        setSelectedConversation(null)
        return
      }

      setSelectedConversation((current) => {
        const matched = current ? conversations.find((conversation) => conversation.id === current.id) : null
        return matched ?? conversations[0]
      })
      return
    }

    if (pendingOutgoing.length === 0) {
      setSelectedOutgoingRequest(null)
      return
    }

    setSelectedOutgoingRequest((current) => {
      const matched = current ? pendingOutgoing.find((request) => request.id === current.id) : null
      return matched ?? pendingOutgoing[0]
    })
  }, [activeInboxTab, conversations, pendingIncoming, pendingOutgoing])

  const activeTabTitle = useMemo(() => {
    if (activeInboxTab === 'incoming') {
      return 'Incoming requests'
    }

    if (activeInboxTab === 'conversations') {
      return 'Active conversations'
    }

    return 'Outgoing requests'
  }, [activeInboxTab])

  const activeTabCount = useMemo(() => {
    if (activeInboxTab === 'incoming') {
      return pendingIncoming.length
    }

    if (activeInboxTab === 'conversations') {
      return conversations.length
    }

    return pendingOutgoing.length
  }, [activeInboxTab, conversations.length, pendingIncoming.length, pendingOutgoing.length])

  const inboxWorkspace = (
    <div className="account-stream account-stream--single">
      <section className="account-block account-block--list">
        <div className="account-block__header">
          <p className="panel-kicker">
            {activeTabTitle}
            {activeTabCount > 0 ? ` (${activeTabCount})` : ''}
          </p>
        </div>

        {activeInboxTab === 'incoming' ? (
          pendingIncoming.length > 0 ? (
            <div className="account-stack account-stack--list">
              {pendingIncoming.map((request) => (
                <button
                  className={`account-list-item${selectedIncomingRequest?.id === request.id ? ' is-active' : ''}`}
                  key={request.id}
                  onClick={() => setSelectedIncomingRequest(request)}
                  type="button"
                >
                  <p className="account-list-item__title">
                    {request.requester.handle} · {request.story.city}
                  </p>
                  <p className="account-list-item__meta">
                    {request.story.areaLabel} · {formatTimestamp(request.createdAt)}
                  </p>
                  <p className="account-list-item__snippet">"{request.story.excerpt}"</p>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              variant="inbox"
              title="Inbox is quiet"
              body="No one has reached out yet. When someone wants to talk, their request will land here."
            />
          )
        ) : null}

        {activeInboxTab === 'conversations' ? (
          conversations.length > 0 ? (
            <div className="account-stack account-stack--list">
              {conversations.map((conversation) => (
                <button
                  className={`account-list-item${selectedConversation?.id === conversation.id ? ' is-active' : ''}`}
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  type="button"
                >
                  <p className="account-list-item__title">{conversation.otherParticipant.handle}</p>
                  <p className="account-list-item__meta">
                    {conversation.story.city}, {conversation.story.country}
                  </p>
                  <p className="account-list-item__snippet">
                    {conversation.latestMessage?.text ?? 'No messages yet. Open the conversation to begin.'}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              variant="chat"
              title="No conversations yet"
              body="Once a request is accepted, the thread will live here. Soft, slow, yours."
            />
          )
        ) : null}

        {activeInboxTab === 'outgoing' ? (
          pendingOutgoing.length > 0 ? (
            <div className="account-stack account-stack--list">
              {pendingOutgoing.map((request) => (
                <button
                  className={`account-list-item${selectedOutgoingRequest?.id === request.id ? ' is-active' : ''}`}
                  key={request.id}
                  onClick={() => setSelectedOutgoingRequest(request)}
                  type="button"
                >
                  <p className="account-list-item__title">Waiting on {request.recipient.handle}</p>
                  <p className="account-list-item__meta">
                    {request.story.city}, {request.story.country} · {formatTimestamp(request.createdAt)}
                  </p>
                  <p className="account-list-item__snippet">"{request.story.excerpt}"</p>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              variant="match"
              title="No outgoing requests"
              body="When you reach out to someone, the pending request will sit here until they answer."
            />
          )
        ) : null}
      </section>

      <section className="account-block account-block--detail">
        {activeInboxTab === 'incoming' ? (
          selectedIncomingRequest ? (
            <article className="account-card">
              <p className="panel-kicker">Incoming request</p>
              <p className="account-card__title">
                {selectedIncomingRequest.requester.handle} wants to talk about {selectedIncomingRequest.story.city}
              </p>
              <p className="account-card__meta">
                {selectedIncomingRequest.story.areaLabel} · {formatTimestamp(selectedIncomingRequest.createdAt)}
              </p>
              <p className="account-card__quote">"{selectedIncomingRequest.story.excerpt}"</p>
              {selectedIncomingRequest.note ? (
                <p className="account-card__note">"{selectedIncomingRequest.note}"</p>
              ) : null}
              <div className="action-row">
                <button
                  className="button button--primary"
                  disabled={acceptingId === selectedIncomingRequest.id || decliningId === selectedIncomingRequest.id}
                  onClick={() => void handleAccept(selectedIncomingRequest.id)}
                  type="button"
                >
                  {acceptingId === selectedIncomingRequest.id ? 'Accepting...' : 'Accept'}
                </button>
                <button
                  className="button button--secondary"
                  disabled={acceptingId === selectedIncomingRequest.id || decliningId === selectedIncomingRequest.id}
                  onClick={() => void handleDecline(selectedIncomingRequest.id)}
                  type="button"
                >
                  {decliningId === selectedIncomingRequest.id ? 'Declining...' : 'Decline'}
                </button>
              </div>
            </article>
          ) : (
            <p className="account-detail-hint">Pick an incoming request to preview details here.</p>
          )
        ) : null}

        {activeInboxTab === 'conversations' ? (
          selectedConversation ? (
            <article className="account-card">
              <p className="panel-kicker">Conversation</p>
              <p className="account-card__title">{selectedConversation.otherParticipant.handle}</p>
              <p className="account-card__meta">
                {selectedConversation.story.city}, {selectedConversation.story.country}
              </p>
              <p className="account-card__quote">"{selectedConversation.story.excerpt}"</p>
              <p className="account-card__note">
                {selectedConversation.latestMessage?.text ?? 'No messages yet. Open the conversation to begin.'}
              </p>
              <div className="action-row">
                <button
                  className="button button--primary"
                  onClick={() => navigate(`/chat/${selectedConversation.id}`)}
                  type="button"
                >
                  Open conversation
                </button>
              </div>
            </article>
          ) : (
            <p className="account-detail-hint">Pick a conversation to preview details here.</p>
          )
        ) : null}

        {activeInboxTab === 'outgoing' ? (
          selectedOutgoingRequest ? (
            <article className="account-card">
              <p className="panel-kicker">Outgoing request</p>
              <p className="account-card__title">Waiting on {selectedOutgoingRequest.recipient.handle}</p>
              <p className="account-card__meta">
                {selectedOutgoingRequest.story.city}, {selectedOutgoingRequest.story.country} · {formatTimestamp(selectedOutgoingRequest.createdAt)}
              </p>
              <p className="account-card__quote">"{selectedOutgoingRequest.story.excerpt}"</p>
              {selectedOutgoingRequest.note ? (
                <p className="account-card__note">"{selectedOutgoingRequest.note}"</p>
              ) : null}
            </article>
          ) : (
            <p className="account-detail-hint">Pick an outgoing request to preview details here.</p>
          )
        ) : null}
      </section>
    </div>
  )

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return (
    <PageShell note="Stay anonymous until you decide your data should follow you." variant="about">
      <>
        <section className="account-page">
          <GlassPanel className="account-panel" flat>
            <p className="eyebrow">Account</p>
            <h1 className="display account-panel__title">Keep this identity, or let it stay light.</h1>
            <p className="section-copy">
              {canUpgrade
                  ? 'This browser is using a guest identity. Save it only when you want recovery across refreshes, devices, and follow-up.'
                  : 'This identity is already persistent. You can recover it later with the same email and password.'}
            </p>

            <div className="account-status">
              <span className="soft-badge">Handle {user.handle}</span>
              <span className="soft-badge">
                {user.isPersistent ? 'Saved account' : 'Guest session'}
              </span>
              {user.email ? <span className="soft-badge">{user.email}</span> : null}
            </div>

            <div className="account-actions">
              {canUpgrade ? (
                <button
                  className="button button--primary"
                  onClick={() => navigate('/auth', { state: { mode: 'register', message: 'Save this guest account to keep the same identity and inbox later.' } })}
                  type="button"
                >
                  Save this account
                </button>
              ) : null}
              <button className="button button--ghost" onClick={handleLogout} type="button">
                Logout
              </button>
            </div>

          </GlassPanel>

          <GlassPanel className="account-panel account-panel--secondary" flat>
            <div className="account-panel__header">
              <div>
                <p className="panel-kicker">Inbox</p>
                <h2 className="section-title">Requests and conversations</h2>
              </div>
              {user ? (
                <button className="button button--secondary" onClick={() => void refreshInbox()} type="button">
                  Refresh
                </button>
              ) : null}
            </div>

            {!user.isPersistent ? (
              <p className="section-copy">
                Guest chat works, but if this token disappears you lose access to the inbox. Save the account if you want recovery later.
              </p>
            ) : null}

            {inboxError ? <p className="account-feedback account-feedback--error">{inboxError}</p> : null}
            {isLoadingInbox ? <p className="inbox-loading-hint">Refreshing inbox<span className="inbox-loading-hint__dots" /></p> : null}

            <div className="inbox-tabs" role="tablist" aria-label="Inbox views">
              <button
                aria-selected={activeInboxTab === 'incoming'}
                className={`chip${activeInboxTab === 'incoming' ? ' is-active' : ''}`}
                onClick={() => handleOpenInboxTab('incoming')}
                role="tab"
                type="button"
              >
                Incoming
                {pendingIncoming.length > 0 ? ` (${pendingIncoming.length})` : ''}
              </button>
              <button
                aria-selected={activeInboxTab === 'conversations'}
                className={`chip${activeInboxTab === 'conversations' ? ' is-active' : ''}`}
                onClick={() => handleOpenInboxTab('conversations')}
                role="tab"
                type="button"
              >
                Conversations
                {conversations.length > 0 ? ` (${conversations.length})` : ''}
              </button>
              <button
                aria-selected={activeInboxTab === 'outgoing'}
                className={`chip${activeInboxTab === 'outgoing' ? ' is-active' : ''}`}
                onClick={() => handleOpenInboxTab('outgoing')}
                role="tab"
                type="button"
              >
                Outgoing
                {pendingOutgoing.length > 0 ? ` (${pendingOutgoing.length})` : ''}
              </button>
            </div>

            <div className="account-stream account-stream--summary">
              <p className="section-copy">Open a tab to manage inbox in a focused modal list view.</p>
            </div>
          </GlassPanel>
        </section>

        {message ? (
          <div aria-live="polite" className="app-toast app-toast--success" role="status">
            <p className="app-toast__text">{message}</p>
            <button
              aria-label="Dismiss notification"
              className="app-toast__close"
              onClick={() => setMessage(null)}
              type="button"
            >
              Close
            </button>
          </div>
        ) : null}

        {isConfirmingLogout && modalRoot
          ? createPortal(
              <div
                aria-modal="true"
                className="modal-backdrop"
                onClick={() => setIsConfirmingLogout(false)}
                role="dialog"
              >
                <div className="modal-frame" onClick={(event) => event.stopPropagation()}>
                  <GlassPanel className="modal-card account-warning" flat>
                    <p className="account-warning__title">This guest session is not saved yet.</p>
                    <p className="account-warning__copy">
                      Logging out now will remove this browser&apos;s access to this identity, its inbox, and its conversations.
                    </p>
                    <div className="action-row">
                      <button className="button button--primary" onClick={handleConfirmGuestLogout} type="button">
                        Logout and lose guest access
                      </button>
                      <button
                        className="button button--secondary"
                        onClick={() => setIsConfirmingLogout(false)}
                        type="button"
                      >
                        Keep this guest session
                      </button>
                    </div>
                  </GlassPanel>
                </div>
              </div>,
              modalRoot
            )
          : null}

        {isInboxModalOpen && modalRoot
          ? createPortal(
              <div
                aria-modal="true"
                className="modal-backdrop modal-backdrop--inbox"
                onClick={() => setIsInboxModalOpen(false)}
                role="dialog"
              >
                <div className="modal-frame modal-frame--wide" onClick={(event) => event.stopPropagation()}>
                  <GlassPanel className="modal-card account-inbox-modal" flat>
                    <div className="account-panel__header">
                      <div>
                        <p className="panel-kicker">Inbox</p>
                        <h2 className="section-title">Requests and conversations</h2>
                      </div>
                      <div className="action-row action-row--tight">
                        <button className="button button--secondary" onClick={() => void refreshInbox()} type="button">
                          Refresh
                        </button>
                        <button className="button button--ghost" onClick={() => setIsInboxModalOpen(false)} type="button">
                          Close
                        </button>
                      </div>
                    </div>

                    <div className="inbox-tabs" role="tablist" aria-label="Inbox views">
                      <button
                        aria-selected={activeInboxTab === 'incoming'}
                        className={`chip${activeInboxTab === 'incoming' ? ' is-active' : ''}`}
                        onClick={() => setActiveInboxTab('incoming')}
                        role="tab"
                        type="button"
                      >
                        Incoming
                        {pendingIncoming.length > 0 ? ` (${pendingIncoming.length})` : ''}
                      </button>
                      <button
                        aria-selected={activeInboxTab === 'conversations'}
                        className={`chip${activeInboxTab === 'conversations' ? ' is-active' : ''}`}
                        onClick={() => setActiveInboxTab('conversations')}
                        role="tab"
                        type="button"
                      >
                        Conversations
                        {conversations.length > 0 ? ` (${conversations.length})` : ''}
                      </button>
                      <button
                        aria-selected={activeInboxTab === 'outgoing'}
                        className={`chip${activeInboxTab === 'outgoing' ? ' is-active' : ''}`}
                        onClick={() => setActiveInboxTab('outgoing')}
                        role="tab"
                        type="button"
                      >
                        Outgoing
                        {pendingOutgoing.length > 0 ? ` (${pendingOutgoing.length})` : ''}
                      </button>
                    </div>

                    {inboxWorkspace}
                  </GlassPanel>
                </div>
              </div>,
              modalRoot
            )
          : null}
      </>
    </PageShell>
  )
}
