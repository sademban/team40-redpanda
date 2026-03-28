/**
 * Text formatting & transformation utilities
 * Reusable functions for consistent text formatting across the app
 */

/**
 * Convert ISO timestamp to human-readable relative time
 * @param {string} isoString - ISO 8601 timestamp string
 * @returns {string} Human-readable relative time (e.g., "3 days ago")
 */
export function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`

  const months = Math.floor(days / 30)
  return `${months} month${months > 1 ? 's' : ''} ago`
}
