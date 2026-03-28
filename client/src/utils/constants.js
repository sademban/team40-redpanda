/**
 * Application constants and configuration
 * Shared values used throughout the app
 */

// Text input constraints
export const TEXT_LIMITS = {
  ENTRY_MAX_LENGTH: 500,
  MESSAGE_MAX_LENGTH: 500,
  ENTRY_MIN_LENGTH: 3,
}

// Loading state durations (milliseconds)
export const DELAYS = {
  ENTRY_SUBMIT: 1200, // Time to simulate finding a match
  SEND_MESSAGE: 1200, // Time to simulate sending a message
  CHAT_RESPONSE: 1000, // Time to simulate chat response
  MATCH_LOADING: 1500, // Time to simulate matching algorithm
}

// Animation timing
export const ANIMATION_DELAYS = {
  D1: 0,
  D2: 100,
  D3: 200,
}

// Match probability
export const MATCH_PROBABILITY = {
  NO_MATCH_CHANCE: 0.15, // 15% chance of no match
}
