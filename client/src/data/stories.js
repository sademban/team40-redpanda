import { MATCH_PROBABILITY, DELAYS } from '../utils/constants'

/**
 * Collection of stories written by users
 * Each story has an id, text body, and timestamp
 */
export const stories = [
  {
    id: 's1',
    text: "I kept telling myself I just needed one good night's sleep and everything would feel manageable again. That was six months ago.",
    writtenAt: '2026-03-10T08:22:00Z',
  },
  {
    id: 's2',
    text: "Everyone around me seemed to know what they were doing. I was just copying their posture and hoping no one noticed.",
    writtenAt: '2026-03-18T14:05:00Z',
  },
  {
    id: 's3',
    text: "I cried in the bathroom at work and then walked back to my desk and answered emails. I don't know what that makes me.",
    writtenAt: '2026-03-21T11:47:00Z',
  },
  {
    id: 's4',
    text: "There's a version of me that exists only in other people's heads — calm, steady, has it together. I've been maintaining her for years.",
    writtenAt: '2026-03-24T19:30:00Z',
  },
  {
    id: 's5',
    text: "I'm not sad exactly. I just feel like I'm watching my own life from a few feet away and I can't find the door back in.",
    writtenAt: '2026-03-26T09:15:00Z',
  },
]

/**
 * mockMatchStory - Simulates a backend call to find a matching story
 * Returns a random story or null based on probability
 *
 * @param {string} _entry - User's entry text (unused but kept for consistency with API pattern)
 * @returns {Promise<Object|null>} - Story object or null if no match
 */
export async function mockMatchStory(_entry) {
  // Wait to simulate backend matching algorithm
  await new Promise((resolve) => setTimeout(resolve, DELAYS.MATCH_LOADING))

  // ~15% chance of no match (user gets "beacon" message instead)
  if (Math.random() < MATCH_PROBABILITY.NO_MATCH_CHANCE) return null

  // Return a random story from the collection
  return stories[Math.floor(Math.random() * stories.length)]
}
