import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { verifyToken } from '../services/sessionService'

export interface SessionRequest extends Request {
  userId: string
}

export interface SessionUser {
  id: string
  isPersistent: boolean
}

export async function resolveSessionUser(authorization?: string): Promise<SessionUser | null> {
  if (!authorization?.startsWith('Bearer ')) {
    return null
  }

  try {
    const { userId } = verifyToken(authorization.slice(7))
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isPersistent: true,
      },
    })
  } catch {
    return null
  }
}

export async function requireSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  const user = await resolveSessionUser(req.headers.authorization)

  if (!user && !req.headers.authorization?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' })
    return
  }

  if (!user) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }

  ;(req as SessionRequest).userId = user.id
  next()
}
