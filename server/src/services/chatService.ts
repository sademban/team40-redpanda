import { ChatRequestStatus, Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { HttpError } from '../lib/httpError'

interface CreateChatRequestInput {
  storyId?: unknown
  note?: unknown
}

interface SendMessageInput {
  text?: unknown
}

const CHAT_USER_SELECT = {
  id: true,
  handle: true,
} as const

const CHAT_STORY_SELECT = {
  id: true,
  city: true,
  country: true,
  areaLabel: true,
  excerpt: true,
  openToChat: true,
} as const

const CHAT_REQUEST_SELECT = {
  id: true,
  note: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  story: {
    select: CHAT_STORY_SELECT,
  },
  requester: {
    select: CHAT_USER_SELECT,
  },
  recipient: {
    select: CHAT_USER_SELECT,
  },
  conversation: {
    select: {
      id: true,
      createdAt: true,
    },
  },
} as const

const CONVERSATION_SELECT = {
  id: true,
  createdAt: true,
  requesterId: true,
  recipientId: true,
  requester: {
    select: CHAT_USER_SELECT,
  },
  recipient: {
    select: CHAT_USER_SELECT,
  },
  request: {
    select: {
      id: true,
      story: {
        select: CHAT_STORY_SELECT,
      },
    },
  },
  messages: {
    orderBy: { createdAt: 'desc' as const },
    take: 1,
    select: {
      id: true,
      text: true,
      senderId: true,
      createdAt: true,
    },
  },
} as const

type ChatRequestRecord = Prisma.ChatRequestGetPayload<{ select: typeof CHAT_REQUEST_SELECT }>
type ConversationRecord = Prisma.ConversationGetPayload<{ select: typeof CONVERSATION_SELECT }>

function requireString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${field} is required`)
  }

  return value.trim()
}

function normalizeOptionalNote(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  if (typeof value !== 'string') {
    throw new HttpError(400, 'note must be a string')
  }

  const note = value.trim()
  if (!note) {
    return null
  }

  if (note.length > 500) {
    throw new HttpError(400, 'note must be 500 characters or fewer')
  }

  return note
}

async function requireChatUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      handle: true,
    },
  })

  if (!user) {
    throw new HttpError(401, 'session user not found')
  }

  return user
}

async function requireChatTarget(storyId: string, requesterId: string) {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: {
      id: true,
      city: true,
      country: true,
      areaLabel: true,
      excerpt: true,
      openToChat: true,
      authorId: true,
      author: {
        select: {
          id: true,
          handle: true,
        },
      },
    },
  })

  if (!story) {
    throw new HttpError(404, 'story not found')
  }

  if (!story.openToChat) {
    throw new HttpError(409, 'story is not open to chat')
  }

  if (!story.authorId || !story.author) {
    throw new HttpError(409, 'story has no reachable author')
  }

  if (story.authorId === requesterId) {
    throw new HttpError(409, 'cannot start a chat with your own story')
  }

  return story
}

function toChatRequestSummary(request: ChatRequestRecord) {
  return {
    id: request.id,
    note: request.note,
    status: request.status,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    story: request.story,
    requester: request.requester,
    recipient: request.recipient,
    conversationId: request.conversation?.id ?? null,
  }
}

function toConversationSummary(conversation: ConversationRecord, currentUserId: string) {
  const otherParticipant =
    conversation.requesterId === currentUserId
      ? conversation.recipient
      : conversation.requester

  return {
    id: conversation.id,
    createdAt: conversation.createdAt,
    requestId: conversation.request.id,
    story: conversation.request.story,
    otherParticipant,
    latestMessage: conversation.messages[0] ?? null,
  }
}

async function requireConversationParticipant(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      ...CONVERSATION_SELECT,
    },
  })

  if (!conversation) {
    throw new HttpError(404, 'conversation not found')
  }

  if (conversation.requesterId !== userId && conversation.recipientId !== userId) {
    throw new HttpError(403, 'not allowed to access this conversation')
  }

  return conversation
}

export async function createChatRequest(userId: string, input: CreateChatRequestInput) {
  await requireChatUser(userId)

  const storyId = requireString(input.storyId, 'storyId')
  const note = normalizeOptionalNote(input.note)
  const story = await requireChatTarget(storyId, userId)

  const existingRequest = await prisma.chatRequest.findFirst({
    where: {
      storyId,
      requesterId: userId,
      recipientId: story.authorId!,
      status: {
        in: [ChatRequestStatus.pending, ChatRequestStatus.accepted],
      },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
    },
  })

  if (existingRequest?.status === ChatRequestStatus.pending) {
    throw new HttpError(409, 'chat request is already pending for this story')
  }

  if (existingRequest?.status === ChatRequestStatus.accepted) {
    throw new HttpError(409, 'a conversation already exists for this story')
  }

  const request = await prisma.chatRequest.create({
    data: {
      storyId,
      requesterId: userId,
      recipientId: story.authorId!,
      note,
    },
    select: CHAT_REQUEST_SELECT,
  })

  return toChatRequestSummary(request)
}

export async function listChatRequests(userId: string) {
  await requireChatUser(userId)

  const [incoming, outgoing] = await Promise.all([
    prisma.chatRequest.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      select: CHAT_REQUEST_SELECT,
    }),
    prisma.chatRequest.findMany({
      where: { requesterId: userId },
      orderBy: { createdAt: 'desc' },
      select: CHAT_REQUEST_SELECT,
    }),
  ])

  return {
    incoming: incoming.map(toChatRequestSummary),
    outgoing: outgoing.map(toChatRequestSummary),
  }
}

export async function acceptChatRequest(userId: string, requestId: string) {
  await requireChatUser(userId)

  const request = await prisma.chatRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      requesterId: true,
      recipientId: true,
      status: true,
      conversation: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!request) {
    throw new HttpError(404, 'chat request not found')
  }

  if (request.recipientId !== userId) {
    throw new HttpError(403, 'only the recipient can accept this chat request')
  }

  if (request.status === ChatRequestStatus.accepted && request.conversation?.id) {
    const conversation = await requireConversationParticipant(request.conversation.id, userId)
    return toConversationSummary(conversation, userId)
  }

  if (request.status !== ChatRequestStatus.pending) {
    throw new HttpError(409, `chat request is already ${request.status}`)
  }

  const conversation = await prisma.$transaction(async (tx) => {
    await tx.chatRequest.update({
      where: { id: request.id },
      data: { status: ChatRequestStatus.accepted },
    })

    return tx.conversation.create({
      data: {
        requestId: request.id,
        requesterId: request.requesterId,
        recipientId: request.recipientId,
      },
      select: CONVERSATION_SELECT,
    })
  })

  return toConversationSummary(conversation, userId)
}

export async function declineChatRequest(userId: string, requestId: string) {
  await requireChatUser(userId)

  const request = await prisma.chatRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      recipientId: true,
      status: true,
    },
  })

  if (!request) {
    throw new HttpError(404, 'chat request not found')
  }

  if (request.recipientId !== userId) {
    throw new HttpError(403, 'only the recipient can decline this chat request')
  }

  if (request.status !== ChatRequestStatus.pending) {
    throw new HttpError(409, `chat request is already ${request.status}`)
  }

  const declinedRequest = await prisma.chatRequest.update({
    where: { id: request.id },
    data: { status: ChatRequestStatus.declined },
    select: CHAT_REQUEST_SELECT,
  })

  return toChatRequestSummary(declinedRequest)
}

export async function listConversations(userId: string) {
  await requireChatUser(userId)

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ requesterId: userId }, { recipientId: userId }],
    },
    orderBy: { createdAt: 'desc' },
    select: CONVERSATION_SELECT,
  })

  return conversations.map((conversation) => toConversationSummary(conversation, userId))
}

export async function getConversationMessages(userId: string, conversationId: string) {
  await requireChatUser(userId)

  const conversation = await requireConversationParticipant(conversationId, userId)
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      text: true,
      senderId: true,
      createdAt: true,
    },
  })

  return {
    conversation: toConversationSummary(conversation, userId),
    messages,
  }
}

export async function sendConversationMessage(
  userId: string,
  conversationId: string,
  input: SendMessageInput,
) {
  await requireChatUser(userId)
  await requireConversationParticipant(conversationId, userId)

  const text = requireString(input.text, 'text')

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      text,
    },
    select: {
      id: true,
      text: true,
      senderId: true,
      createdAt: true,
    },
  })

  return message
}
