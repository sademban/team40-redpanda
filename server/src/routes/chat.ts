import { Router, type Request } from 'express'
import { HttpError } from '../lib/httpError'
import { requireSession, type SessionRequest } from '../middleware/requireSession'
import {
  acceptChatRequest,
  createChatRequest,
  declineChatRequest,
  getConversationMessages,
  listChatRequests,
  listConversations,
  sendConversationMessage,
} from '../services/chatService'

const router = Router()

router.use(requireSession)

function getSessionUserId(req: Request) {
  return (req as SessionRequest).userId
}

router.get('/requests', async (req, res) => {
  try {
    const userId = getSessionUserId(req)
    res.json(await listChatRequests(userId))
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }

    console.error('GET /chat/requests', err)
    res.status(500).json({ error: 'Failed to fetch chat requests' })
  }
})

router.post('/requests', async (req, res) => {
  try {
    const userId = getSessionUserId(req)
    res.status(201).json(await createChatRequest(userId, req.body))
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }

    console.error('POST /chat/requests', err)
    res.status(500).json({ error: 'Failed to create chat request' })
  }
})

router.post('/requests/:id/accept', async (req, res) => {
  try {
    const userId = getSessionUserId(req)
    res.json(await acceptChatRequest(userId, req.params.id))
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }

    console.error('POST /chat/requests/:id/accept', err)
    res.status(500).json({ error: 'Failed to accept chat request' })
  }
})

router.post('/requests/:id/decline', async (req, res) => {
  try {
    const userId = getSessionUserId(req)
    res.json(await declineChatRequest(userId, req.params.id))
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }

    console.error('POST /chat/requests/:id/decline', err)
    res.status(500).json({ error: 'Failed to decline chat request' })
  }
})

router.get('/conversations', async (req, res) => {
  try {
    const userId = getSessionUserId(req)
    res.json(await listConversations(userId))
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }

    console.error('GET /chat/conversations', err)
    res.status(500).json({ error: 'Failed to fetch conversations' })
  }
})

router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const userId = getSessionUserId(req)
    res.json(await getConversationMessages(userId, req.params.id))
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }

    console.error('GET /chat/conversations/:id/messages', err)
    res.status(500).json({ error: 'Failed to fetch conversation messages' })
  }
})

router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const userId = getSessionUserId(req)
    res.status(201).json(await sendConversationMessage(userId, req.params.id, req.body))
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }

    console.error('POST /chat/conversations/:id/messages', err)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

export default router
