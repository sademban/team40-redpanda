import { Router } from 'express'
import { findMatch, findChatMatches } from '../services/matchingService'

const router = Router()

// POST /api/match
router.post('/', async (req, res) => {
  try {
    const { text } = req.body

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'text is required' })
      return
    }

    const story = await findMatch(text.trim())

    if (!story) {
      res.status(404).json({ error: 'No stories available for matching' })
      return
    }

    res.json(story)
  } catch (err) {
    console.error('POST /match', err)
    res.status(500).json({ error: 'Matching failed' })
  }
})

// POST /api/match/chat
router.post('/chat', async (req, res) => {
  try {
    const { text, excludeId } = req.body

    if (!text || typeof text !== 'string' || !text.trim()) {
      res.status(400).json({ error: 'text is required' })
      return
    }

    const matches = await findChatMatches(
      text.trim(),
      typeof excludeId === 'string' ? excludeId : undefined,
    )

    if (!matches.suggested) {
      res.status(404).json({ error: 'No open-to-chat stories available' })
      return
    }

    res.json(matches)
  } catch (err) {
    console.error('POST /match/chat', err)
    res.status(500).json({ error: 'Matching failed' })
  }
})

export default router
