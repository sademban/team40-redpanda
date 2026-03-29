import { prisma } from '../lib/prisma'
import { generateHandle, signToken } from './sessionService'

export async function createAnonymousSession() {
  let handle = generateHandle()

  while (await prisma.user.findUnique({ where: { handle } })) {
    handle = generateHandle()
  }

  const user = await prisma.user.create({ data: { handle } })
  const token = signToken(user.id)

  return {
    token,
    user: {
      id: user.id,
      handle: user.handle,
    },
  }
}

