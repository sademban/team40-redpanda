import { Router } from 'express'
import { Emotion } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { embed } from '../services/embeddingService'
import { requireSession, type SessionRequest } from '../middleware/requireSession'
import type { Request } from 'express'

const router = Router()

const STORY_SELECT = {
  id: true,
  city: true,
  country: true,
  areaLabel: true,
  postalHint: true,
  lat: true,
  lng: true,
  emotion: true,
  contextTags: true,
  excerpt: true,
  fullText: true,
  language: true,
  year: true,
  openToChat: true,
  chatPrompt: true,
} as const

const VALID_EMOTIONS = new Set(Object.values(Emotion))
const VALID_CONTEXT_TAGS = new Set([
  'student',
  'new-city',
  'family-duty',
  'work-pressure',
  'distance-from-home',
])

// GET /api/stories
router.get('/', async (req, res) => {
  try {
    const { emotion, city, q } = req.query as Record<string, string>

    const where: Record<string, unknown> = {}

    if (emotion && VALID_EMOTIONS.has(emotion as Emotion)) {
      where.emotion = emotion as Emotion
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }

    if (q) {
      where.OR = [
        { excerpt: { contains: q, mode: 'insensitive' } },
        { fullText: { contains: q, mode: 'insensitive' } },
      ]
    }

    const stories = await prisma.story.findMany({ where, select: STORY_SELECT, orderBy: { createdAt: 'desc' } })
    res.json(stories)
  } catch (err) {
    console.error('GET /stories', err)
    res.status(500).json({ error: 'Failed to fetch stories' })
  }
})

// GET /api/stories/clusters
router.get('/clusters', async (_req, res) => {
  try {
    const stories = await prisma.story.findMany({ select: STORY_SELECT })

    const groups = new Map<string, {
      id: string
      city: string
      country: string
      latSum: number
      lngSum: number
      stories: typeof stories
    }>()

    for (const story of stories) {
      const key = `${story.city}-${story.country}`.toLowerCase().replaceAll(' ', '-')
      const existing = groups.get(key)

      if (existing) {
        existing.stories.push(story)
        existing.latSum += story.lat
        existing.lngSum += story.lng
      } else {
        groups.set(key, {
          id: key,
          city: story.city,
          country: story.country,
          latSum: story.lat,
          lngSum: story.lng,
          stories: [story],
        })
      }
    }

    const clusters = [...groups.values()]
      .map((g) => ({
        id: g.id,
        city: g.city,
        country: g.country,
        lat: g.latSum / g.stories.length,
        lng: g.lngSum / g.stories.length,
        stories: g.stories,
      }))
      .sort((a, b) => {
        if (b.stories.length !== a.stories.length) return b.stories.length - a.stories.length
        return a.city.localeCompare(b.city)
      })

    res.json(clusters)
  } catch (err) {
    console.error('GET /stories/clusters', err)
    res.status(500).json({ error: 'Failed to fetch clusters' })
  }
})

// GET /api/stories/:id
router.get('/:id', async (req, res) => {
  try {
    const story = await prisma.story.findUnique({
      where: { id: req.params.id },
      select: STORY_SELECT,
    })

    if (!story) {
      res.status(404).json({ error: 'Story not found' })
      return
    }

    res.json(story)
  } catch (err) {
    console.error('GET /stories/:id', err)
    res.status(500).json({ error: 'Failed to fetch story' })
  }
})

// POST /api/stories
router.post('/', requireSession, async (req: Request, res) => {
  try {
    const userId = (req as SessionRequest).userId
    const {
      city, country, areaLabel, postalHint, lat, lng,
      emotion, contextTags, excerpt, fullText, language,
      openToChat, chatPrompt,
    } = req.body

    // Basic validation
    if (!city || !country || !areaLabel || !postalHint || lat == null || lng == null ||
        !emotion || !contextTags || !excerpt || !fullText || !language || !chatPrompt) {
      res.status(400).json({ error: 'Missing required fields' })
      return
    }

    if (!VALID_EMOTIONS.has(emotion)) {
      res.status(400).json({ error: `Invalid emotion. Must be one of: ${[...VALID_EMOTIONS].join(', ')}` })
      return
    }

    if (!Array.isArray(contextTags) || contextTags.some((t: unknown) => !VALID_CONTEXT_TAGS.has(t as string))) {
      res.status(400).json({ error: `Invalid contextTags. Must be from: ${[...VALID_CONTEXT_TAGS].join(', ')}` })
      return
    }

    const story = await prisma.story.create({
      data: {
        city, country, areaLabel, postalHint,
        lat: Number(lat), lng: Number(lng),
        emotion: emotion as Emotion,
        contextTags,
        excerpt, fullText, language,
        year: new Date().getFullYear(),
        openToChat: Boolean(openToChat),
        chatPrompt,
        authorId: userId,
      },
      select: STORY_SELECT,
    })

    // Generate and store embedding asynchronously (don't block the response)
    const embeddingText = `${excerpt} ${fullText}`
    embed(embeddingText)
      .then((vector) => {
        const vectorStr = `[${vector.join(',')}]`
        return prisma.$executeRawUnsafe(
          `UPDATE "Story" SET embedding = '${vectorStr}'::vector WHERE id = '${story.id}'`,
        )
      })
      .catch((err) => console.error(`Failed to embed story ${story.id}:`, err))

    res.status(201).json(story)
  } catch (err) {
    console.error('POST /stories', err)
    res.status(500).json({ error: 'Failed to create story' })
  }
})

export default router
