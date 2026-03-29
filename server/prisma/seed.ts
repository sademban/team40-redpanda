import 'dotenv/config'
import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Emotion, PrismaClient } from '@prisma/client'
import { embed } from '../src/services/embeddingService'
import { hashPassword } from '../src/services/passwordService'

const prisma = new PrismaClient()

const SEED_USER_COUNT = 40
const DEFAULT_PASSWORD = 'EchoSeed!2026'
const CREDENTIALS_FILENAME = 'seed-users-credentials.csv'

interface SeedUser {
  handle: string
  email: string
  password: string
}

interface StorySeed {
  city: string
  country: string
  areaLabel: string
  postalHint: string
  lat: number
  lng: number
  emotion: Emotion
  contextTags: string[]
  excerpt: string
  fullText: string
  language: string
  year: number
  openToChat: boolean
  chatPrompt: string
}

const locationPresets = [
  { city: 'New York', country: 'United States', areaLabel: 'Long Island City', postalHint: '11101', lat: 40.7447, lng: -73.9485 },
  { city: 'Boston', country: 'United States', areaLabel: 'Allston', postalHint: '02134', lat: 42.3539, lng: -71.1328 },
  { city: 'Dallas', country: 'United States', areaLabel: 'Irving', postalHint: '75039', lat: 32.8913, lng: -96.9587 },
  { city: 'London', country: 'United Kingdom', areaLabel: 'Wembley', postalHint: 'HA9', lat: 51.556, lng: -0.279 },
  { city: 'Toronto', country: 'Canada', areaLabel: 'Parkdale', postalHint: 'M6K', lat: 43.6404, lng: -79.4369 },
  { city: 'Lisbon', country: 'Portugal', areaLabel: 'Arroios', postalHint: '1170', lat: 38.7297, lng: -9.1359 },
  { city: 'Melbourne', country: 'Australia', areaLabel: 'Carlton', postalHint: '3053', lat: -37.8005, lng: 144.9668 },
  { city: 'Sydney', country: 'Australia', areaLabel: 'Parramatta', postalHint: '2150', lat: -33.815, lng: 151.0011 },
  { city: 'Doha', country: 'Qatar', areaLabel: 'Al Sadd', postalHint: 'Zone 38', lat: 25.2858, lng: 51.5073 },
  { city: 'Berlin', country: 'Germany', areaLabel: 'Neukolln', postalHint: '12043', lat: 52.4771, lng: 13.4397 },
  { city: 'Auckland', country: 'New Zealand', areaLabel: 'Mount Eden', postalHint: '1024', lat: -36.8796, lng: 174.7653 },
  { city: 'Tokyo', country: 'Japan', areaLabel: 'Shinjuku', postalHint: '160-0022', lat: 35.6938, lng: 139.7034 },
] as const

const emotionCycle: Emotion[] = [
  Emotion.pressure,
  Emotion.identity,
  Emotion.homesick,
  Emotion.lonely,
  Emotion.hope,
]

const contextTagSets: string[][] = [
  ['student', 'family-duty', 'distance-from-home'],
  ['work-pressure', 'new-city', 'distance-from-home'],
  ['identity-shift', 'language', 'new-city'],
  ['career', 'immigration', 'belonging'],
  ['homesick', 'distance-from-home', 'quiet-life'],
  ['hope', 'small-wins', 'community'],
]

const excerptTemplates = [
  'I look stable from the outside, but most days still feel like a balancing act.',
  'I am learning a new city while trying not to lose the parts of me that matter.',
  'Some nights feel heavier than they should, even when nothing is technically wrong.',
  'I can explain my plans clearly, but not always the loneliness behind them.',
  'Hope has become practical for me: one honest message, one steady breath, one meal.',
]

const fullTextTemplates = [
  'I moved for a clear reason and still feel the cost of that choice every week. This post is me choosing honesty over performance for a minute.',
  'I call home, say I am fine, and then sit with everything I did not say. I know many of us in bidesh carry that same split.',
  'The outside story sounds like progress, but inside it is mostly adaptation and quiet effort. I am writing this so I do not disappear inside routine.',
  'Being useful to people you love from far away is its own kind of weight. I am grateful and tired at the same time.',
  'I do not need advice right now, just a place where this can be true without being reduced. If this resonates, I am open to a real conversation.',
]

const chatPromptTemplates = [
  'If this feels familiar, we can talk honestly.',
  'I am open to a grounded conversation from someone who understands this.',
  'No performance needed. A calm, direct chat is welcome.',
  'If you are carrying something similar, I am willing to listen.',
]

function zeroPad(value: number): string {
  return value.toString().padStart(2, '0')
}

function buildSeedUsers(count: number, password: string): SeedUser[] {
  return Array.from({ length: count }, (_, index) => {
    const userNumber = index + 1
    const padded = zeroPad(userNumber)

    return {
      handle: `echo-seed-${padded}`,
      email: `seed.user${padded}@echo.local`,
      password,
    }
  })
}

function buildStorySeed(user: SeedUser, index: number): StorySeed {
  const location = locationPresets[index % locationPresets.length]
  const emotion = emotionCycle[index % emotionCycle.length]
  const contextTags = contextTagSets[index % contextTagSets.length]
  const excerpt = `${excerptTemplates[index % excerptTemplates.length]} (${location.city})`
  const fullText = `${fullTextTemplates[index % fullTextTemplates.length]} This was shared by ${user.handle} from ${location.areaLabel}, ${location.city}.`
  const chatPrompt = chatPromptTemplates[index % chatPromptTemplates.length]

  return {
    ...location,
    emotion,
    contextTags,
    excerpt,
    fullText,
    language: index % 4 === 0 ? 'English + Nepali' : 'English',
    year: 2023 + (index % 3),
    openToChat: index % 2 === 0,
    chatPrompt,
  }
}

async function writeSeedCredentials(users: SeedUser[]): Promise<string> {
  const outputPath = path.resolve(process.cwd(), 'prisma', CREDENTIALS_FILENAME)
  const content = [
    'email,password,handle',
    ...users.map((user) => `${user.email},${user.password},${user.handle}`),
  ].join('\n')

  await writeFile(outputPath, `${content}\n`, 'utf8')
  return outputPath
}

async function main() {
  console.log('Clearing existing chat data and stories...')
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.chatRequest.deleteMany()
  await prisma.story.deleteMany()
  await prisma.user.deleteMany()

  const seedPassword = (process.env.SEED_USER_PASSWORD ?? DEFAULT_PASSWORD).trim()
  const seedUsers = buildSeedUsers(SEED_USER_COUNT, seedPassword)
  const credentialsPath = await writeSeedCredentials(seedUsers)

  console.log(`Ensuring ${seedUsers.length} sample persistent users...`)
  const seededUsers = await Promise.all(
    seedUsers.map((seedUser) =>
      prisma.user.upsert({
        where: { email: seedUser.email },
        update: {
          handle: seedUser.handle,
          passwordHash: hashPassword(seedUser.password),
          isPersistent: true,
        },
        create: {
          handle: seedUser.handle,
          email: seedUser.email,
          passwordHash: hashPassword(seedUser.password),
          isPersistent: true,
        },
      }),
    ),
  )

  let shouldGenerateEmbeddings = Boolean(process.env.OPENROUTER_API_KEY?.trim())
  if (!shouldGenerateEmbeddings) {
    console.log('OPENROUTER_API_KEY is not set. Stories will be seeded without embeddings.')
  }

  console.log(`Seeding ${seededUsers.length} stories...`)
  for (const [index, seededUser] of seededUsers.entries()) {
    const storyData = buildStorySeed(seedUsers[index], index)
    process.stdout.write(`  [${index + 1}/${seededUsers.length}] ${seededUser.email} -> ${storyData.city}`)

    let embedding: number[] | null = null
    if (shouldGenerateEmbeddings) {
      try {
        embedding = await embed(`${storyData.excerpt} ${storyData.fullText}`)
      } catch (err) {
        console.error(` embedding failed (${err})`)
        console.log('Embedding disabled for remaining stories in this seed run.')
        shouldGenerateEmbeddings = false
      }
    }

    const story = await prisma.story.create({
      data: {
        ...storyData,
        authorId: seededUser.id,
      },
    })

    if (embedding) {
      const vectorStr = `[${embedding.join(',')}]`
      await prisma.$executeRawUnsafe(
        `UPDATE "Story" SET embedding = '${vectorStr}'::vector WHERE id = '${story.id}'`,
      )
      console.log(' with embedding')
    } else {
      console.log(' stored')
    }
  }

  console.log('Seed complete.')
  console.log(`Credentials written to: ${credentialsPath}`)
  console.log(`Default password for seeded users: ${seedPassword}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
