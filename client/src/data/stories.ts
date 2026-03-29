import type { CityCluster, ContextTag, Emotion, StoryEntry } from '../types/story'
import { emotionOptions } from '../types/story'

export const emotionLabels: Record<Emotion, string> = {
  homesick: 'Homesick',
  pressure: 'Pressure',
  lonely: 'Lonely',
  identity: 'Identity',
  hope: 'Hope',
}

export const contextLabels: Record<ContextTag, string> = {
  student: 'Student',
  'new-city': 'New city',
  'family-duty': 'Family duty',
  'work-pressure': 'Work pressure',
  'distance-from-home': 'Far from home',
}

export const defaultEntry =
  "I feel like I'm doing everything right and still falling apart."

export const stories: StoryEntry[] = [
  {
    id: 'nyc-pressure-1',
    city: 'New York',
    country: 'United States',
    lat: 40.7128,
    lng: -74.006,
    emotion: 'pressure',
    contextTags: ['student', 'family-duty', 'distance-from-home'],
    excerpt:
      'I keep sounding steady on the phone and then unraveling the second the call ends.',
    fullText:
      "Everyone back home says I sound strong, so I keep sounding strong. Then the room goes quiet and I can hear how tired I really am. I know why I came here. I know how many people helped me get here. Some nights that gratitude turns into pressure so heavy it feels like another person sitting on my chest.",
    language: 'English',
    year: 2025,
    openToChat: true,
    chatPrompt: 'I want to talk with someone who knows what duty can do to the body.',
  },
  {
    id: 'nyc-identity-1',
    city: 'New York',
    country: 'United States',
    lat: 40.7128,
    lng: -74.006,
    emotion: 'identity',
    contextTags: ['new-city', 'distance-from-home'],
    excerpt:
      "I switch voices all day and by night I can't tell which one is mine.",
    fullText:
      "At work I am quick and polished. On video calls home I soften everything so no one worries. With friends here I explain my life like subtitles. Some days I can feel the split happening in real time. It is not dramatic. It is just tiring to belong in pieces.",
    language: 'English + Nepali',
    year: 2024,
    openToChat: false,
    chatPrompt: 'I need a conversation where I do not have to translate myself first.',
  },
  {
    id: 'london-homesick-1',
    city: 'London',
    country: 'United Kingdom',
    lat: 51.5072,
    lng: -0.1276,
    emotion: 'homesick',
    contextTags: ['student', 'distance-from-home'],
    excerpt: 'I miss the version of silence that belongs to ghar.',
    fullText:
      "London is loud in a way that somehow still leaves me alone. I miss the familiar sounds of home: pressure cooker whistles, the lane outside, someone calling my name without warning. Here everything is efficient and no one knows the shape of my day. I did not realize homesickness could live in the body like weather.",
    language: 'English + Nepali',
    year: 2024,
    openToChat: true,
    chatPrompt: 'If you know what it means to miss ghar in your body, I would listen.',
  },
  {
    id: 'london-pressure-1',
    city: 'London',
    country: 'United Kingdom',
    lat: 51.5072,
    lng: -0.1276,
    emotion: 'pressure',
    contextTags: ['work-pressure', 'family-duty'],
    excerpt:
      'The more stable I look, the harder it becomes to admit I am barely keeping up.',
    fullText:
      "My paychecks look like progress from far away. People hear that I am in London and fill in the rest of the story for themselves. I do not want to ruin that image, so I keep performing okayness even when my body is begging me to stop. The strange part is that success can make confession harder.",
    language: 'English',
    year: 2025,
    openToChat: true,
    chatPrompt: 'I want to talk with someone who is tired of performing okayness.',
  },
  {
    id: 'toronto-lonely-1',
    city: 'Toronto',
    country: 'Canada',
    lat: 43.6532,
    lng: -79.3832,
    emotion: 'lonely',
    contextTags: ['new-city', 'distance-from-home'],
    excerpt:
      'I am always around people and still somehow carrying every hard thing alone.',
    fullText:
      "I have classmates, coworkers, roommates, and a city full of noise outside. Still, loneliness keeps finding me in the smallest moments: grocery aisles, cold train platforms, the walk home after everyone else has somewhere to be. I do not need a crowd. I just need one place where I do not have to explain why this feels hard.",
    language: 'English',
    year: 2025,
    openToChat: false,
    chatPrompt: 'I could use a quiet conversation with someone who understands this kind of loneliness.',
  },
  {
    id: 'toronto-hope-1',
    city: 'Toronto',
    country: 'Canada',
    lat: 43.6532,
    lng: -79.3832,
    emotion: 'hope',
    contextTags: ['student', 'new-city'],
    excerpt:
      'Nothing got easier all at once. I just learned that one honest sentence can keep a day from collapsing.',
    fullText:
      "I used to think hope had to feel big. These days it feels smaller and more practical. It is eating, texting back, opening the curtain, telling one friend the real version instead of the polished one. Maybe hope is not brightness. Maybe it is just not leaving yourself alone with the whole weight of it.",
    language: 'English',
    year: 2023,
    openToChat: true,
    chatPrompt: 'If your hope is small and practical right now, I think we could talk.',
  },
  {
    id: 'doha-family-duty-1',
    city: 'Doha',
    country: 'Qatar',
    lat: 25.2854,
    lng: 51.531,
    emotion: 'pressure',
    contextTags: ['work-pressure', 'family-duty'],
    excerpt:
      'I send money home and still feel guilty for every day I am not physically there.',
    fullText:
      "Work is exhausting, but the harder part is the distance. When something happens at home, I feel how little a transfer receipt can actually hold. I am helping, yes, but I am also missing birthdays, hospital visits, arguments, ordinary evenings. It is a strange life to be useful and absent at the same time.",
    language: 'English',
    year: 2024,
    openToChat: true,
    chatPrompt: 'I want to talk with someone who understands being useful and absent at once.',
  },
  {
    id: 'melbourne-hope-1',
    city: 'Melbourne',
    country: 'Australia',
    lat: -37.8136,
    lng: 144.9631,
    emotion: 'hope',
    contextTags: ['distance-from-home', 'new-city'],
    excerpt:
      'The first time I told the truth, nothing broke. That changed more than advice ever did.',
    fullText:
      "I kept waiting for honesty to create damage. Instead it made room. My aunt still loves me. My friend did not think less of me. The problem was never that I was too much; it was that I had been carrying too much alone. I still struggle, but I do not disappear inside it the way I used to.",
    language: 'English',
    year: 2023,
    openToChat: true,
    chatPrompt: 'If you need a first honest conversation, I would meet you there.',
  },
  {
    id: 'sydney-homesick-1',
    city: 'Sydney',
    country: 'Australia',
    lat: -33.8688,
    lng: 151.2093,
    emotion: 'homesick',
    contextTags: ['student', 'distance-from-home'],
    excerpt:
      'I can explain the city to everyone back home, but I still have not found where to put my own sadness in it.',
    fullText:
      "Sydney is bright and open and everyone says I should feel lucky here. I do feel lucky. That is part of the problem. It is hard to speak about loneliness when gratitude is sitting beside it, asking you to be quieter. I think a lot of us in bidesh become fluent in silence before we realize it.",
    language: 'English + Nepali',
    year: 2025,
    openToChat: false,
    chatPrompt: 'I want to hear from someone who understands how gratitude and sadness can live together.',
  },
  {
    id: 'boston-pressure-1',
    city: 'Boston',
    country: 'United States',
    lat: 42.3601,
    lng: -71.0589,
    emotion: 'pressure',
    contextTags: ['student', 'family-duty'],
    excerpt:
      'I keep treating rest like something I have to earn from people who are not even in the room.',
    fullText:
      "The deadline is never just the deadline. It is also my parents' sacrifice, my younger cousins watching, and every version of me that promised I would make it worth it. I am learning that pressure can sound like ambition when everyone else is praising it. Inside the body, though, it feels much more like fear.",
    language: 'English',
    year: 2025,
    openToChat: true,
    chatPrompt: 'If your ambition has started sounding like fear, I would talk with you.',
  },
  {
    id: 'dallas-work-1',
    city: 'Dallas',
    country: 'United States',
    lat: 32.7767,
    lng: -96.797,
    emotion: 'lonely',
    contextTags: ['work-pressure', 'distance-from-home'],
    excerpt:
      'The hardest part is having no ordinary witness to my life here.',
    fullText:
      "People ask how work is going and I can answer that. What I cannot answer quickly is how strange it feels to build a whole life somewhere no one has known you since childhood. There is no effortless version of me here. Some days I would trade all the networking in the world for one walk with someone who already knows my silences.",
    language: 'English',
    year: 2024,
    openToChat: false,
    chatPrompt: 'I want a conversation that does not start with small talk.',
  },
  {
    id: 'lisbon-identity-1',
    city: 'Lisbon',
    country: 'Portugal',
    lat: 38.7223,
    lng: -9.1393,
    emotion: 'identity',
    contextTags: ['new-city', 'distance-from-home'],
    excerpt:
      'I wanted reinvention. I did not expect how much grief could hide inside it.',
    fullText:
      "Moving gave me room to become someone new, but it also took away the people who could recognize me without explanation. Freedom can feel beautiful and lonely at the same time. I am still figuring out which parts of me changed because I grew, and which parts changed because I got tired of translating myself.",
    language: 'English',
    year: 2023,
    openToChat: true,
    chatPrompt: 'If reinvention has also made you lonely, I think we would understand each other.',
  },
]

const emotionKeywords: Array<[Emotion, string[]]> = [
  ['homesick', ['home', 'ghar', 'miss', 'homesick', 'distance']],
  ['pressure', ['pressure', 'expectation', 'failing', 'falling apart', 'drowning']],
  ['lonely', ['alone', 'lonely', 'empty', 'nobody', 'isolated']],
  ['identity', ['between', 'belong', 'disappearing', 'identity', 'split']],
  ['hope', ['hope', 'better', 'light', 'tomorrow', 'healing']],
]

function normalize(input: string) {
  return input.trim().toLowerCase()
}

function groupStoriesByCity(entries: StoryEntry[]) {
  const groups = new Map<string, CityCluster>()

  for (const story of entries) {
    const key = `${story.city}-${story.country}`.toLowerCase().replaceAll(' ', '-')
    const existing = groups.get(key)

    if (existing) {
      existing.stories.push(story)
      continue
    }

    groups.set(key, {
      id: key,
      city: story.city,
      country: story.country,
      lat: story.lat,
      lng: story.lng,
      stories: [story],
    })
  }

  return [...groups.values()].sort((left, right) => {
    if (right.stories.length !== left.stories.length) {
      return right.stories.length - left.stories.length
    }

    return left.city.localeCompare(right.city)
  })
}

export const cityClusters = groupStoriesByCity(stories)

export const featuredCities = cityClusters.slice(0, 4)

export function inferEmotion(entry: string): Emotion {
  const normalizedEntry = normalize(entry)

  for (const [emotion, keywords] of emotionKeywords) {
    if (keywords.some((keyword) => normalizedEntry.includes(keyword))) {
      return emotion
    }
  }

  return 'pressure'
}

export function findNarrativeMatch(entry: string) {
  const inferredEmotion = inferEmotion(entry)
  const exactMatch = stories.find((story) => story.emotion === inferredEmotion)
  return exactMatch ?? stories.find((story) => story.emotion === emotionOptions[0]) ?? stories[0]
}

export function getStoryById(storyId: string | null | undefined) {
  if (!storyId) return null
  return stories.find((story) => story.id === storyId) ?? null
}

export function findSuggestedChatMatch(entry: string, preferredId?: string | null) {
  const preferredStory = getStoryById(preferredId)

  if (preferredStory?.openToChat) {
    return preferredStory
  }

  const inferredEmotion = inferEmotion(entry)
  const directOpenMatch = stories.find(
    (story) => story.id !== preferredId && story.emotion === inferredEmotion && story.openToChat,
  )

  if (directOpenMatch) {
    return directOpenMatch
  }

  return stories.find((story) => story.id !== preferredId && story.openToChat) ?? stories[0]
}

export function findConversationMatch(entry: string, excludeId?: string | null) {
  const inferredEmotion = inferEmotion(entry)
  const directOpenMatch = stories.find(
    (story) => story.id !== excludeId && story.emotion === inferredEmotion && story.openToChat,
  )

  if (directOpenMatch) {
    return directOpenMatch
  }

  return stories.find((story) => story.id !== excludeId && story.openToChat) ?? stories[0]
}
