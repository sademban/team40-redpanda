import jwt from 'jsonwebtoken'

const ADJECTIVES = ['quiet', 'soft', 'gentle', 'still', 'warm', 'calm', 'distant', 'tender']
const NOUNS = ['walker', 'river', 'light', 'wave', 'field', 'voice', 'shore', 'leaf']

export function generateHandle(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  const num = Math.floor(Math.random() * 99) + 1
  return `${adj}${noun}-${num}`
}

function secret(): string {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET is not set')
  return s
}

export function signToken(userId: string): string {
  return jwt.sign({ userId }, secret(), { expiresIn: '90d' })
}

export function verifyToken(token: string): { userId: string } {
  return jwt.verify(token, secret()) as { userId: string }
}
