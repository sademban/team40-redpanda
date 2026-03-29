export type ChatRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled'

export interface ChatParticipant {
  id: string
  handle: string
}

export interface ChatStorySummary {
  id: string
  city: string
  country: string
  areaLabel: string
  excerpt: string
  openToChat: boolean
}

export interface ChatRequestSummary {
  id: string
  note: string | null
  status: ChatRequestStatus
  createdAt: string
  updatedAt: string
  story: ChatStorySummary
  requester: ChatParticipant
  recipient: ChatParticipant
  conversationId: string | null
}

export interface ConversationMessage {
  id: string
  text: string
  senderId: string
  createdAt: string
}

export interface ConversationSummary {
  id: string
  createdAt: string
  requestId: string
  story: ChatStorySummary
  otherParticipant: ChatParticipant
  latestMessage: ConversationMessage | null
}

export interface ChatRequestsResponse {
  incoming: ChatRequestSummary[]
  outgoing: ChatRequestSummary[]
}

export interface ConversationMessagesResponse {
  conversation: ConversationSummary
  messages: ConversationMessage[]
}
