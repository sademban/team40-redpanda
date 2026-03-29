import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const KEY_LENGTH = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = scryptSync(password, salt, KEY_LENGTH).toString('hex')
  return `${salt}:${derivedKey}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':')
  if (!salt || !key) {
    return false
  }

  const incoming = scryptSync(password, salt, KEY_LENGTH)
  const original = Buffer.from(key, 'hex')

  if (incoming.length !== original.length) {
    return false
  }

  return timingSafeEqual(incoming, original)
}

