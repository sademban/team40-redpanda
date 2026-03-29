import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { generateHandle, signToken } from '../services/sessionService'

const router = Router()

router.post('/session', async (_req, res) => {
  try {
    let handle = generateHandle()
    while (await prisma.user.findUnique({ where: { handle } })) {
      handle = generateHandle()
    }

    const user = await prisma.user.create({ data: { handle } })
    const token = signToken(user.id)

    res.json({ token, user: { id: user.id, handle: user.handle } })
  } catch (err) {
    console.error('POST /auth/session', err)
    res.status(500).json({ error: 'Failed to create session' })
  }
})

export default router
