import { Router } from 'express'
import { createAnonymousSession } from '../services/authService'

const router = Router()

router.post('/session', async (_req, res) => {
  try {
    res.json(await createAnonymousSession())
  } catch (err) {
    console.error('POST /auth/session', err)
    res.status(500).json({ error: 'Failed to create session' })
  }
})

export default router
