import { Router } from 'express'
import { HttpError } from '../lib/httpError'
import { requireSession, type SessionRequest } from '../middleware/requireSession'
import {
  createStory,
  getStoryById,
  listStories,
  listStoryClusters,
} from '../services/storyService'

const router = Router()

// GET /api/stories
router.get('/', async (req, res) => {
  try {
    res.json(await listStories(req.query as Record<string, string>))
  } catch (err) {
    console.error('GET /stories', err)
    res.status(500).json({ error: 'Failed to fetch stories' })
  }
})

// GET /api/stories/clusters
router.get('/clusters', async (_req, res) => {
  try {
    res.json(await listStoryClusters())
  } catch (err) {
    console.error('GET /stories/clusters', err)
    res.status(500).json({ error: 'Failed to fetch clusters' })
  }
})

// GET /api/stories/:id
router.get('/:id', async (req, res) => {
  try {
    res.json(await getStoryById(req.params.id))
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }

    console.error('GET /stories/:id', err)
    res.status(500).json({ error: 'Failed to fetch story' })
  }
})

// POST /api/stories
router.post('/', requireSession, async (req, res) => {
  try {
    const userId = (req as SessionRequest).userId
    res.status(201).json(await createStory(userId, req.body))
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ error: err.message })
      return
    }

    console.error('POST /stories', err)
    res.status(500).json({ error: 'Failed to create story' })
  }
})

export default router
