export const emotionOptions = [
  'homesick',
  'pressure',
  'lonely',
  'identity',
  'hope',
] as const

export const contextTagOptions = [
  'student',
  'new-city',
  'family-duty',
  'work-pressure',
  'distance-from-home',
] as const

export type Emotion = (typeof emotionOptions)[number]
export type ContextTag = (typeof contextTagOptions)[number]

export interface StoryEntry {
  id: string
  city: string
  country: string
  areaLabel: string
  postalHint: string
  lat: number
  lng: number
  emotion: Emotion
  contextTags: ContextTag[]
  excerpt: string
  fullText: string
  language: string
  year: number
  openToChat: boolean
  chatPrompt: string
}

export interface CityCluster {
  id: string
  city: string
  country: string
  lat: number
  lng: number
  stories: StoryEntry[]
}
