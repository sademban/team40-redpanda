import type { AuthSession, AuthUser } from '../types/auth'
import type {
  ChatRequestSummary,
  ChatRequestsResponse,
  ConversationMessage,
  ConversationMessagesResponse,
  ConversationSummary,
} from '../types/chat'
import type { CreateStoryPayload, StoryCluster, StoryEntry } from '../types/story'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

interface RequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: unknown
  headers?: HeadersInit
  token?: string | null
}

interface ChatMatches {
  suggested: StoryEntry | null
  incoming: StoryEntry | null
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers)

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`)
  }

  const response = await fetch(path, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const payload = (await response.json()) as { error?: string }
      if (payload.error) {
        message = payload.error
      }
    } catch {
      // Keep the default error message for non-JSON responses.
    }

    throw new ApiError(message, response.status)
  }

  return (await response.json()) as T
}

export function createAnonymousSession() {
  return request<AuthSession>('/api/auth/session', { method: 'POST' })
}

export function registerPersistentUser(
  email: string,
  password: string,
  token?: string | null,
) {
  return request<AuthSession>('/api/auth/register', {
    method: 'POST',
    body: { email, password },
    token,
  })
}

export function loginPersistentUser(email: string, password: string) {
  return request<AuthSession>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function getCurrentUser(token: string) {
  return request<AuthUser>('/api/auth/me', { token })
}

export function listStoryClusters() {
  return request<StoryCluster[]>('/api/stories/clusters')
}

export function getStory(storyId: string) {
  return request<StoryEntry>(`/api/stories/${storyId}`)
}

export function createStory(token: string, payload: CreateStoryPayload) {
  return request<StoryEntry>('/api/stories', {
    method: 'POST',
    token,
    body: payload,
  })
}

export function findNarrativeMatch(text: string) {
  return request<StoryEntry>('/api/match', {
    method: 'POST',
    body: { text },
  })
}

export function findChatMatches(text: string, excludeId?: string | null) {
  return request<ChatMatches>('/api/match/chat', {
    method: 'POST',
    body: { text, excludeId: excludeId ?? undefined },
  })
}

export function listChatRequests(token: string) {
  return request<ChatRequestsResponse>('/api/chat/requests', { token })
}

export function createChatRequest(
  token: string,
  storyId: string,
  note?: string,
) {
  return request<ChatRequestSummary>('/api/chat/requests', {
    method: 'POST',
    token,
    body: {
      storyId,
      note,
    },
  })
}

export function acceptChatRequest(token: string, requestId: string) {
  return request<ConversationSummary>(`/api/chat/requests/${requestId}/accept`, {
    method: 'POST',
    token,
  })
}

export function declineChatRequest(token: string, requestId: string) {
  return request<ChatRequestSummary>(`/api/chat/requests/${requestId}/decline`, {
    method: 'POST',
    token,
  })
}

export function listConversations(token: string) {
  return request<ConversationSummary[]>('/api/chat/conversations', { token })
}

export function getConversationMessages(token: string, conversationId: string) {
  return request<ConversationMessagesResponse>(`/api/chat/conversations/${conversationId}/messages`, {
    token,
  })
}

export function sendConversationMessage(
  token: string,
  conversationId: string,
  text: string,
) {
  return request<ConversationMessage>(`/api/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    token,
    body: { text },
  })
}
