import 'dotenv/config'
import { PrismaClient, Emotion } from '@prisma/client'
import { embed } from '../src/services/embeddingService'

const prisma = new PrismaClient()

const stories = [
  {
    city: 'New York', country: 'United States', areaLabel: 'Long Island City',
    postalHint: '11101', lat: 40.7447, lng: -73.9485, emotion: Emotion.pressure,
    contextTags: ['student', 'family-duty', 'distance-from-home'],
    excerpt: 'I keep sounding steady on the phone and then unraveling the second the call ends.',
    fullText: "Everyone back home says I sound strong, so I keep sounding strong. Then the room goes quiet and I can hear how tired I really am. I know why I came here. I know how many people helped me get here. Some nights that gratitude turns into pressure so heavy it feels like another person sitting on my chest.",
    language: 'English', year: 2025, openToChat: true,
    chatPrompt: 'I want to talk with someone who knows what duty can do to the body.',
  },
  {
    city: 'New York', country: 'United States', areaLabel: 'Jackson Heights',
    postalHint: '11372', lat: 40.7557, lng: -73.8831, emotion: Emotion.identity,
    contextTags: ['new-city', 'distance-from-home'],
    excerpt: "I switch voices all day and by night I can't tell which one is mine.",
    fullText: "At work I am quick and polished. On video calls home I soften everything so no one worries. With friends here I explain my life like subtitles. Some days I can feel the split happening in real time. It is not dramatic. It is just tiring to belong in pieces.",
    language: 'English + Nepali', year: 2024, openToChat: false,
    chatPrompt: 'I need a conversation where I do not have to translate myself first.',
  },
  {
    city: 'London', country: 'United Kingdom', areaLabel: 'Wembley',
    postalHint: 'HA9', lat: 51.556, lng: -0.279, emotion: Emotion.homesick,
    contextTags: ['student', 'distance-from-home'],
    excerpt: 'I miss the version of silence that belongs to ghar.',
    fullText: "London is loud in a way that somehow still leaves me alone. I miss the familiar sounds of home: pressure cooker whistles, the lane outside, someone calling my name without warning. Here everything is efficient and no one knows the shape of my day. I did not realize homesickness could live in the body like weather.",
    language: 'English + Nepali', year: 2024, openToChat: true,
    chatPrompt: 'If you know what it means to miss ghar in your body, I would listen.',
  },
  {
    city: 'London', country: 'United Kingdom', areaLabel: 'Canary Wharf',
    postalHint: 'E14', lat: 51.5054, lng: -0.0235, emotion: Emotion.pressure,
    contextTags: ['work-pressure', 'family-duty'],
    excerpt: 'The more stable I look, the harder it becomes to admit I am barely keeping up.',
    fullText: "My paychecks look like progress from far away. People hear that I am in London and fill in the rest of the story for themselves. I do not want to ruin that image, so I keep performing okayness even when my body is begging me to stop. The strange part is that success can make confession harder.",
    language: 'English', year: 2025, openToChat: true,
    chatPrompt: 'I want to talk with someone who is tired of performing okayness.',
  },
  {
    city: 'Toronto', country: 'Canada', areaLabel: 'Parkdale',
    postalHint: 'M6K', lat: 43.6404, lng: -79.4369, emotion: Emotion.lonely,
    contextTags: ['new-city', 'distance-from-home'],
    excerpt: 'I am always around people and still somehow carrying every hard thing alone.',
    fullText: "I have classmates, coworkers, roommates, and a city full of noise outside. Still, loneliness keeps finding me in the smallest moments: grocery aisles, cold train platforms, the walk home after everyone else has somewhere to be. I do not need a crowd. I just need one place where I do not have to explain why this feels hard.",
    language: 'English', year: 2025, openToChat: false,
    chatPrompt: 'I could use a quiet conversation with someone who understands this kind of loneliness.',
  },
  {
    city: 'Toronto', country: 'Canada', areaLabel: 'North York',
    postalHint: 'M2N', lat: 43.7615, lng: -79.4111, emotion: Emotion.hope,
    contextTags: ['student', 'new-city'],
    excerpt: 'Nothing got easier all at once. I just learned that one honest sentence can keep a day from collapsing.',
    fullText: "I used to think hope had to feel big. These days it feels smaller and more practical. It is eating, texting back, opening the curtain, telling one friend the real version instead of the polished one. Maybe hope is not brightness. Maybe it is just not leaving yourself alone with the whole weight of it.",
    language: 'English', year: 2023, openToChat: true,
    chatPrompt: 'If your hope is small and practical right now, I think we could talk.',
  },
  {
    city: 'Doha', country: 'Qatar', areaLabel: 'Al Sadd',
    postalHint: 'Zone 38', lat: 25.2858, lng: 51.5073, emotion: Emotion.pressure,
    contextTags: ['work-pressure', 'family-duty'],
    excerpt: 'I send money home and still feel guilty for every day I am not physically there.',
    fullText: "Work is exhausting, but the harder part is the distance. When something happens at home, I feel how little a transfer receipt can actually hold. I am helping, yes, but I am also missing birthdays, hospital visits, arguments, ordinary evenings. It is a strange life to be useful and absent at the same time.",
    language: 'English', year: 2024, openToChat: true,
    chatPrompt: 'I want to talk with someone who understands being useful and absent at once.',
  },
  {
    city: 'Melbourne', country: 'Australia', areaLabel: 'Carlton',
    postalHint: '3053', lat: -37.8005, lng: 144.9668, emotion: Emotion.hope,
    contextTags: ['distance-from-home', 'new-city'],
    excerpt: 'The first time I told the truth, nothing broke. That changed more than advice ever did.',
    fullText: "I kept waiting for honesty to create damage. Instead it made room. My aunt still loves me. My friend did not think less of me. The problem was never that I was too much; it was that I had been carrying too much alone. I still struggle, but I do not disappear inside it the way I used to.",
    language: 'English', year: 2023, openToChat: true,
    chatPrompt: 'If you need a first honest conversation, I would meet you there.',
  },
  {
    city: 'Sydney', country: 'Australia', areaLabel: 'Parramatta',
    postalHint: '2150', lat: -33.815, lng: 151.0011, emotion: Emotion.homesick,
    contextTags: ['student', 'distance-from-home'],
    excerpt: 'I can explain the city to everyone back home, but I still have not found where to put my own sadness in it.',
    fullText: "Sydney is bright and open and everyone says I should feel lucky here. I do feel lucky. That is part of the problem. It is hard to speak about loneliness when gratitude is sitting beside it, asking you to be quieter. I think a lot of us in bidesh become fluent in silence before we realize it.",
    language: 'English + Nepali', year: 2025, openToChat: false,
    chatPrompt: 'I want to hear from someone who understands how gratitude and sadness can live together.',
  },
  {
    city: 'Boston', country: 'United States', areaLabel: 'Allston',
    postalHint: '02134', lat: 42.3539, lng: -71.1328, emotion: Emotion.pressure,
    contextTags: ['student', 'family-duty'],
    excerpt: 'I keep treating rest like something I have to earn from people who are not even in the room.',
    fullText: "The deadline is never just the deadline. It is also my parents' sacrifice, my younger cousins watching, and every version of me that promised I would make it worth it. I am learning that pressure can sound like ambition when everyone else is praising it. Inside the body, though, it feels much more like fear.",
    language: 'English', year: 2025, openToChat: true,
    chatPrompt: 'If your ambition has started sounding like fear, I would talk with you.',
  },
  {
    city: 'Dallas', country: 'United States', areaLabel: 'Irving',
    postalHint: '75039', lat: 32.8913, lng: -96.9587, emotion: Emotion.lonely,
    contextTags: ['work-pressure', 'distance-from-home'],
    excerpt: 'The hardest part is having no ordinary witness to my life here.',
    fullText: "People ask how work is going and I can answer that. What I cannot answer quickly is how strange it feels to build a whole life somewhere no one has known you since childhood. There is no effortless version of me here. Some days I would trade all the networking in the world for one walk with someone who already knows my silences.",
    language: 'English', year: 2024, openToChat: false,
    chatPrompt: 'I want a conversation that does not start with small talk.',
  },
  {
    city: 'Lisbon', country: 'Portugal', areaLabel: 'Arroios',
    postalHint: '1170', lat: 38.7297, lng: -9.1359, emotion: Emotion.identity,
    contextTags: ['new-city', 'distance-from-home'],
    excerpt: 'I wanted reinvention. I did not expect how much grief could hide inside it.',
    fullText: "Moving gave me room to become someone new, but it also took away the people who could recognize me without explanation. Freedom can feel beautiful and lonely at the same time. I am still figuring out which parts of me changed because I grew, and which parts changed because I got tired of translating myself.",
    language: 'English', year: 2023, openToChat: true,
    chatPrompt: 'If reinvention has also made you lonely, I think we would understand each other.',
  },
  {
    city: 'Boston', country: 'United States', areaLabel: 'Cambridge',
    postalHint: '02139', lat: 42.3601, lng: -71.0942, emotion: Emotion.lonely,
    contextTags: ['student', 'new-city'],
    excerpt: 'I have learned to perform being fine so well that I am starting to believe my own performance.',
    fullText: "There is a version of me that shows up to class, goes to the library, makes small talk in the kitchen. That version is fine. She is always fine. The problem is that after a while you forget there is supposed to be another version. I do not want to be fixed. I just want to be known, briefly, by someone who does not need me to be fine.",
    language: 'English', year: 2025, openToChat: true,
    chatPrompt: 'If you also know how to perform fine, we do not have to do that here.',
  },
]

async function main() {
  console.log('Clearing existing stories...')
  await prisma.story.deleteMany()

  console.log(`Seeding ${stories.length} stories...`)

  for (const [i, data] of stories.entries()) {
    process.stdout.write(`  [${i + 1}/${stories.length}] ${data.city} — generating embedding...`)

    let embedding: number[] | null = null
    try {
      embedding = await embed(`${data.excerpt} ${data.fullText}`)
    } catch (err) {
      console.error(` FAILED (${err})`)
    }

    const story = await prisma.story.create({ data })

    if (embedding) {
      const vectorStr = `[${embedding.join(',')}]`
      await prisma.$executeRawUnsafe(
        `UPDATE "Story" SET embedding = '${vectorStr}'::vector WHERE id = '${story.id}'`,
      )
      console.log(' done')
    } else {
      console.log(' stored without embedding')
    }
  }

  console.log('Seed complete.')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
