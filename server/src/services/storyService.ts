import { Emotion, Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { HttpError } from '../lib/httpError'
import { embed } from './embeddingService'

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

type StoryRecord = Prisma.StoryGetPayload<{ select: typeof STORY_SELECT }>

interface StoryFilters {
  emotion?: string
  city?: string
  q?: string
}

interface CreateStoryInput {
  city?: unknown
  country?: unknown
  areaLabel?: unknown
  postalHint?: unknown
  lat?: unknown
  lng?: unknown
  emotion?: unknown
  contextTags?: unknown
  excerpt?: unknown
  fullText?: unknown
  language?: unknown
  openToChat?: unknown
  chatPrompt?: unknown
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, `${field} is required`)
  }

  return value.trim()
}

function requireNumber(value: unknown, field: string): number {
  const numberValue =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : Number.NaN

  if (!Number.isFinite(numberValue)) {
    throw new HttpError(400, `${field} must be a valid number`)
  }

  return numberValue
}

function validateEmotion(value: unknown): Emotion {
  if (typeof value !== 'string' || !VALID_EMOTIONS.has(value as Emotion)) {
    throw new HttpError(
      400,
      `Invalid emotion. Must be one of: ${[...VALID_EMOTIONS].join(', ')}`,
    )
  }

  return value as Emotion
}

function validateContextTags(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new HttpError(400, 'contextTags must be a non-empty array')
  }

  const tags = value.map((item) => {
    if (typeof item !== 'string' || !VALID_CONTEXT_TAGS.has(item)) {
      throw new HttpError(
        400,
        `Invalid contextTags. Must be from: ${[...VALID_CONTEXT_TAGS].join(', ')}`,
      )
    }

    return item
  })

  return tags
}

function buildStoryData(input: CreateStoryInput, userId: string) {
  return {
    city: requireString(input.city, 'city'),
    country: requireString(input.country, 'country'),
    areaLabel: requireString(input.areaLabel, 'areaLabel'),
    postalHint: requireString(input.postalHint, 'postalHint'),
    lat: requireNumber(input.lat, 'lat'),
    lng: requireNumber(input.lng, 'lng'),
    emotion: validateEmotion(input.emotion),
    contextTags: validateContextTags(input.contextTags),
    excerpt: requireString(input.excerpt, 'excerpt'),
    fullText: requireString(input.fullText, 'fullText'),
    language: requireString(input.language, 'language'),
    openToChat: Boolean(input.openToChat),
    chatPrompt: requireString(input.chatPrompt, 'chatPrompt'),
    year: new Date().getFullYear(),
    authorId: userId,
  }
}

function scheduleEmbeddingUpdate(storyId: string, text: string) {
  embed(text)
    .then((vector) => {
      const vectorStr = `[${vector.join(',')}]`

      return prisma.$executeRaw(
        Prisma.sql`UPDATE "Story" SET embedding = CAST(${vectorStr} AS vector) WHERE id = ${storyId}`,
      )
    })
    .catch((err) => {
      console.error(`Failed to embed story ${storyId}:`, err)
    })
}

export async function listStories(filters: StoryFilters) {
  const where: Prisma.StoryWhereInput = {}

  if (filters.emotion && VALID_EMOTIONS.has(filters.emotion as Emotion)) {
    where.emotion = filters.emotion as Emotion
  }

  if (filters.city) {
    where.city = { contains: filters.city, mode: 'insensitive' }
  }

  if (filters.q) {
    where.OR = [
      { excerpt: { contains: filters.q, mode: 'insensitive' } },
      { fullText: { contains: filters.q, mode: 'insensitive' } },
    ]
  }

  return prisma.story.findMany({
    where,
    select: STORY_SELECT,
    orderBy: { createdAt: 'desc' },
  })
}

export async function listStoryClusters() {
  const stories = await prisma.story.findMany({ select: STORY_SELECT })
  const groups = new Map<
    string,
    {
      id: string
      city: string
      country: string
      latSum: number
      lngSum: number
      stories: StoryRecord[]
    }
  >()

  for (const story of stories) {
    const key = `${story.city}-${story.country}`.toLowerCase().replace(/ /g, '-')
    const existing = groups.get(key)

    if (existing) {
      existing.stories.push(story)
      existing.latSum += story.lat
      existing.lngSum += story.lng
      continue
    }

    groups.set(key, {
      id: key,
      city: story.city,
      country: story.country,
      latSum: story.lat,
      lngSum: story.lng,
      stories: [story],
    })
  }

  return [...groups.values()]
    .map((group) => ({
      id: group.id,
      city: group.city,
      country: group.country,
      lat: group.latSum / group.stories.length,
      lng: group.lngSum / group.stories.length,
      stories: group.stories,
    }))
    .sort((left, right) => {
      if (right.stories.length !== left.stories.length) {
        return right.stories.length - left.stories.length
      }

      return left.city.localeCompare(right.city)
    })
}

export async function getStoryById(storyId: string) {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: STORY_SELECT,
  })

  if (!story) {
    throw new HttpError(404, 'Story not found')
  }

  return story
}

export async function createStory(userId: string, input: CreateStoryInput) {
  const storyData = buildStoryData(input, userId)
  const story = await prisma.story.create({
    data: storyData,
    select: STORY_SELECT,
  })

  scheduleEmbeddingUpdate(story.id, `${story.excerpt} ${story.fullText}`)

  return story
}
