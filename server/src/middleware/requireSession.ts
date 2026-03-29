import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../services/sessionService'

export interface SessionRequest extends Request {
  userId: string
}

export function requireSession(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' })
    return
  }

  try {
    const { userId } = verifyToken(auth.slice(7))
    ;(req as SessionRequest).userId = userId
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' })
  }
}
