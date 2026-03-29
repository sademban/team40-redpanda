import { prisma } from '../lib/prisma'
import { HttpError } from '../lib/httpError'
import { hashPassword, verifyPassword } from './passwordService'
import { generateHandle, signToken } from './sessionService'

interface RegisterInput {
  email?: unknown
  password?: unknown
}

interface LoginInput {
  email?: unknown
  password?: unknown
}

function normalizeEmail(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, 'email is required')
  }

  const email = value.trim().toLowerCase()
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(email)) {
    throw new HttpError(400, 'email must be valid')
  }

  return email
}

function normalizePassword(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(400, 'password is required')
  }

  if (value.length < 8) {
    throw new HttpError(400, 'password must be at least 8 characters')
  }

  return value
}

async function generateUniqueHandle() {
  let handle = generateHandle()

  while (await prisma.user.findUnique({ where: { handle } })) {
    handle = generateHandle()
  }

  return handle
}

function toPublicUser(user: {
  id: string
  handle: string
  email: string | null
  isPersistent: boolean
}) {
  return {
    id: user.id,
    handle: user.handle,
    email: user.email,
    isPersistent: user.isPersistent,
  }
}

export async function createAnonymousSession() {
  const handle = await generateUniqueHandle()

  const user = await prisma.user.create({ data: { handle } })
  const token = signToken(user.id)

  return {
    token,
    user: toPublicUser({ ...user, email: null, isPersistent: false }),
  }
}

export async function registerPersistentUser(
  input: RegisterInput,
  currentUserId?: string,
) {
  const email = normalizeEmail(input.email)
  const password = normalizePassword(input.password)

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw new HttpError(409, 'email is already registered')
  }

  const passwordHash = hashPassword(password)

  if (currentUserId) {
    const user = await prisma.user.findUnique({ where: { id: currentUserId } })
    if (!user) {
      throw new HttpError(401, 'session user not found')
    }

    if (user.isPersistent) {
      throw new HttpError(409, 'account is already persistent')
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        passwordHash,
        isPersistent: true,
      },
    })

    return {
      token: signToken(updatedUser.id),
      user: toPublicUser(updatedUser),
    }
  }

  const handle = await generateUniqueHandle()
  const user = await prisma.user.create({
    data: {
      handle,
      email,
      passwordHash,
      isPersistent: true,
    },
  })

  return {
    token: signToken(user.id),
    user: toPublicUser(user),
  }
}

export async function loginPersistentUser(input: LoginInput) {
  const email = normalizeEmail(input.email)
  const password = normalizePassword(input.password)

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user?.passwordHash || !user.isPersistent) {
    throw new HttpError(401, 'invalid email or password')
  }

  if (!verifyPassword(password, user.passwordHash)) {
    throw new HttpError(401, 'invalid email or password')
  }

  return {
    token: signToken(user.id),
    user: toPublicUser(user),
  }
}

export async function getAuthenticatedUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    throw new HttpError(404, 'user not found')
  }

  return toPublicUser(user)
}
