import type {
  CityCluster,
  ContextTag,
  Emotion,
  MapCityCluster,
  RelatedCitySuggestion,
  StoryCluster,
  StoryEntry,
  StoryMatchResult,
} from '../types/story'
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

const emotionKeywords: Array<[Emotion, string[]]> = [
  ['homesick', ['home', 'ghar', 'miss', 'homesick', 'distance', 'return']],
  ['pressure', ['pressure', 'expectation', 'failing', 'deadline', 'burden', 'sacrifice']],
  ['lonely', ['alone', 'lonely', 'empty', 'isolated', 'witness', 'invisible']],
  ['identity', ['between', 'belong', 'identity', 'split', 'translate', 'version']],
  ['hope', ['hope', 'better', 'light', 'tomorrow', 'healing', 'honest']],
]

function normalize(input: string) {
  return input.trim().toLowerCase()
}

function tokenize(input: string) {
  return normalize(input)
    .split(/[^a-z0-9]+/i)
    .filter((token) => token.length >= 3)
}

function includesQuery(haystack: string, normalizedQuery: string) {
  return normalizedQuery.length > 0 && normalize(haystack).includes(normalizedQuery)
}

function includesAnyToken(haystack: string, tokens: string[]) {
  const normalizedHaystack = normalize(haystack)
  return tokens.some((token) => normalizedHaystack.includes(token))
}

function getStorySignals(story: StoryEntry) {
  return normalize(
    [
      story.contextTags.map((tag) => contextLabels[tag]).join(' '),
      story.excerpt,
      story.fullText,
      story.chatPrompt,
      story.city,
      story.areaLabel,
      story.postalHint,
    ].join(' '),
  )
}

function enrichCityCluster(cluster: StoryCluster): CityCluster {
  return {
    ...cluster,
    hasOpenConversation: cluster.stories.some((story) => story.openToChat),
    availableLocalStories: cluster.stories.filter((story) => story.openToChat).length,
  }
}

function scoreStoryForEntry(story: StoryEntry, entry: string, inferredEmotion: Emotion | null) {
  const normalizedEntry = normalize(entry)
  const queryTokens = tokenize(entry)
  let score = 0

  if (inferredEmotion && story.emotion === inferredEmotion) {
    score += 8
  }

  const matchingContext = story.contextTags.find((tag) =>
    includesAnyToken(contextLabels[tag], queryTokens) ||
    includesQuery(contextLabels[tag], normalizedEntry),
  )

  if (matchingContext) {
    score += 4
  }

  if (includesQuery(story.excerpt, normalizedEntry) || includesQuery(story.chatPrompt, normalizedEntry)) {
    score += 4
  }

  if (includesAnyToken(getStorySignals(story), queryTokens)) {
    score += 3
  }

  return score
}

function buildWhySurfaced(
  story: StoryEntry,
  normalizedQuery: string,
  queryTokens: string[],
  inferredEmotion: Emotion | null,
) {
  if (!normalizedQuery) {
    return null
  }

  const contextMatch = story.contextTags.find((tag) => {
    const label = contextLabels[tag]
    return includesQuery(label, normalizedQuery) || includesAnyToken(label, queryTokens)
  })

  if (contextMatch) {
    return `Holds ${contextLabels[contextMatch].toLowerCase()}.`
  }

  if (includesQuery(story.excerpt, normalizedQuery) || includesQuery(story.chatPrompt, normalizedQuery)) {
    return 'A line here stays close to your words.'
  }

  if (inferredEmotion && story.emotion === inferredEmotion) {
    return `Carries the same feeling: ${emotionLabels[story.emotion].toLowerCase()}.`
  }

  if (includesAnyToken(`${story.fullText} ${story.excerpt} ${story.chatPrompt}`, queryTokens)) {
    return 'A nearby voice carries part of this feeling.'
  }

  return null
}

function getSharedContextTags(left: StoryEntry, right: StoryEntry) {
  return left.contextTags.filter((tag) => right.contextTags.includes(tag))
}

function buildRelatedReason(source: StoryEntry, candidate: StoryEntry) {
  const sharedContext = getSharedContextTags(source, candidate)
  if (sharedContext.length > 0) {
    return `Also carries ${contextLabels[sharedContext[0]].toLowerCase()}.`
  }

  if (candidate.emotion === source.emotion) {
    return `Another city holding ${emotionLabels[source.emotion].toLowerCase()}.`
  }

  return `A nearby story from ${candidate.areaLabel}.`
}

export function enrichCityClusters(clusters: StoryCluster[]) {
  return clusters.map(enrichCityCluster)
}

export function inferEmotion(entry: string): Emotion {
  const normalizedEntry = normalize(entry)

  for (const [emotion, keywords] of emotionKeywords) {
    if (keywords.some((keyword) => normalizedEntry.includes(keyword))) {
      return emotion
    }
  }

  return 'pressure'
}

export function getStoryById(stories: StoryEntry[], storyId: string | null | undefined) {
  if (!storyId) {
    return null
  }

  return stories.find((story) => story.id === storyId) ?? null
}

export function findNarrativeMatch(
  stories: StoryEntry[],
  entry: string,
  preferredStoryId?: string | null,
) {
  const preferredStory = getStoryById(stories, preferredStoryId)

  if (preferredStory) {
    return preferredStory
  }

  const inferredEmotion = inferEmotion(entry)
  const scoredMatches = stories
    .map((story) => ({ story, score: scoreStoryForEntry(story, entry, inferredEmotion) }))
    .sort((left, right) => right.score - left.score || left.story.city.localeCompare(right.story.city))

  return (
    scoredMatches.find(({ score }) => score > 0)?.story ??
    stories.find((story) => story.emotion === inferredEmotion) ??
    stories.find((story) => story.emotion === emotionOptions[0]) ??
    stories[0] ??
    null
  )
}

export function getMapClusters(
  clusters: CityCluster[],
  selectedEmotion: Emotion | 'all',
  query: string,
): MapCityCluster[] {
  const normalizedQuery = normalize(query)
  const queryTokens = tokenize(query)
  const inferredEmotion = normalizedQuery ? inferEmotion(normalizedQuery) : null

  return clusters
    .map<MapCityCluster | null>((cluster) => {
      const matches = cluster.stories.flatMap<StoryMatchResult>((story) => {
        const matchesEmotion = selectedEmotion === 'all' || story.emotion === selectedEmotion

        if (!matchesEmotion) {
          return []
        }

        const whySurfaced = buildWhySurfaced(
          story,
          normalizedQuery,
          queryTokens,
          inferredEmotion,
        )

        if (normalizedQuery.length > 0 && !whySurfaced) {
          return []
        }

        return [{ story, whySurfaced }]
      })

      if (matches.length === 0) {
        return null
      }

      const matchedStories = matches.map((match) => match.story)

      return {
        ...cluster,
        stories: matchedStories,
        matches,
        hasOpenConversation: matchedStories.some((story) => story.openToChat),
        availableLocalStories: matchedStories.filter((story) => story.openToChat).length,
      }
    })
    .filter((cluster): cluster is MapCityCluster => cluster !== null)
}

export function getRelatedCitySuggestions(
  story: StoryEntry,
  currentClusterId: string,
  candidateClusters: CityCluster[],
  limit = 3,
): RelatedCitySuggestion[] {
  return candidateClusters
    .filter((cluster) => cluster.id !== currentClusterId)
    .flatMap((cluster) => {
      const candidates = cluster.stories
        .map((candidate) => {
          const sharedContext = getSharedContextTags(story, candidate).length
          const sharedEmotion = candidate.emotion === story.emotion ? 1 : 0
          const sharedSignal = tokenize(story.excerpt).some((token) =>
            getStorySignals(candidate).includes(token),
          )
            ? 1
            : 0

          const score =
            sharedEmotion * 5 +
            sharedContext * 3 +
            sharedSignal * 2 +
            (candidate.openToChat ? 1 : 0)

          return { candidate, cluster, score }
        })
        .filter(({ score }) => score > 0)
        .sort((left, right) => right.score - left.score)

      const best = candidates[0]

      if (!best) {
        return []
      }

      return [
        {
          clusterId: cluster.id,
          storyId: best.candidate.id,
          city: cluster.city,
          country: cluster.country,
          areaLabel: best.candidate.areaLabel,
          reason: buildRelatedReason(story, best.candidate),
          openToChat: best.candidate.openToChat,
          score: best.score,
        },
      ]
    })
    .sort((left, right) => right.score - left.score || left.city.localeCompare(right.city))
    .slice(0, limit)
    .map(({ clusterId, storyId, city, country, areaLabel, reason, openToChat }) => ({
      clusterId,
      storyId,
      city,
      country,
      areaLabel,
      reason,
      openToChat,
    }))
}
