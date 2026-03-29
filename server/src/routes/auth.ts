import { Router } from 'express'
import { HttpError } from '../lib/httpError'
import { requireSession, type SessionRequest } from '../middleware/requireSession'
import {
  createAnonymousSession,
  getAuthenticatedUser,
  loginPersistentUser,
  registerPersistentUser,
} from '../services/authService'
import { verifyToken } from '../services/sessionService'

const router = Router()

function getOptionalSessionUserId(authorization?: string) {
  if (!authorization?.startsWith('Bearer ')) {
    return undefined
  }

  try {
    return verifyToken(authorization.slice(7)).userId
  } catch {
    return undefined
  }
}

router.post('/session', async (_req, res) => {
  try {
    res.json(await createAnonymousSession())
  } catch (err) {
    console.error('POST /auth/session', err)
    res.status(500).json({ error: 'Failed to create session' })
  }
})

router.post('/register', async (req, res) => {
  try {
    const currentUserId = getOptionalSessionUserId(req.headers.authorization)
    res.status(201).json(await registerPersistentUser(req.body, currentUserId))
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }

    console.error('POST /auth/register', err)
    res.status(500).json({ error: 'Failed to register account' })
  }
})

router.post('/login', async (req, res) => {
  try {
    res.json(await loginPersistentUser(req.body))
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }

    console.error('POST /auth/login', err)
    res.status(500).json({ error: 'Failed to login' })
  }
})

router.get('/me', requireSession, async (req, res) => {
  try {
    const userId = (req as SessionRequest).userId
    res.json(await getAuthenticatedUser(userId))
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }

    console.error('GET /auth/me', err)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

export default router
