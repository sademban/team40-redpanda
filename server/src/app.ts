import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth'
import storiesRouter from './routes/stories'
import matchRouter from './routes/match'
import chatRouter from './routes/chat'

const app = express()

const corsOriginList = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: corsOriginList.includes('*') ? true : corsOriginList,
  }),
)
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRouter)
app.use('/api/stories', storiesRouter)
app.use('/api/match', matchRouter)
app.use('/api/chat', chatRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

export default app
