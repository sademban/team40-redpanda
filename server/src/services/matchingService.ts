import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { embed } from './embeddingService'

// Shape returned by raw pgvector queries (no embedding, no createdAt/authorId)
interface StoryRow {
  id: string
  city: string
  country: string
  areaLabel: string
  postalHint: string
  lat: number
  lng: number
  emotion: string
  contextTags: string[]
  excerpt: string
  fullText: string
  language: string
  year: number
  openToChat: boolean
  chatPrompt: string
}

const SELECT_COLS = `
  id, city, country, "areaLabel", "postalHint", lat, lng,
  emotion, "contextTags", excerpt, "fullText", language, year,
  "openToChat", "chatPrompt"
`

export async function findMatch(text: string): Promise<StoryRow | null> {
  const embedding = await embed(text)
  const vectorStr = `[${embedding.join(',')}]`

  const results = await prisma.$queryRaw<StoryRow[]>(Prisma.sql`
    SELECT ${Prisma.raw(SELECT_COLS)}
    FROM "Story"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> CAST(${vectorStr} AS vector)
    LIMIT 1
  `)

  return results[0] ?? null
}

export async function findChatMatches(
  text: string,
  excludeId?: string,
): Promise<{ suggested: StoryRow | null; incoming: StoryRow | null }> {
  const embedding = await embed(text)
  const vectorStr = `[${embedding.join(',')}]`
  const excludeClause = excludeId
    ? Prisma.sql`AND id != ${excludeId}`
    : Prisma.empty

  const results = await prisma.$queryRaw<StoryRow[]>(Prisma.sql`
    SELECT ${Prisma.raw(SELECT_COLS)}
    FROM "Story"
    WHERE embedding IS NOT NULL
      AND "openToChat" = true
      ${excludeClause}
    ORDER BY embedding <=> CAST(${vectorStr} AS vector)
    LIMIT 2
  `)

  return {
    suggested: results[0] ?? null,
    incoming: results[1] ?? null,
  }
}
