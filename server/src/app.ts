import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth'
import storiesRouter from './routes/stories'
import matchRouter from './routes/match'

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRouter)
app.use('/api/stories', storiesRouter)
app.use('/api/match', matchRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

export default app
