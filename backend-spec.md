# Echo — Backend Specification

## Overview

Node.js + Express backend for Echo, a diaspora community app where users share emotional
stories and connect with others. The backend replaces all hardcoded client-side data and
enables persistent stories and semantic embedding-based matching.

**Stack:** Node.js · Express · TypeScript · PostgreSQL + pgvector · Prisma ORM · JWT · OpenRouter (embeddings)

---

## Auth Strategy

### Anonymous Sessions (no sign-up required)

Every visitor silently receives an anonymous identity on first load:

1. Frontend calls `POST /api/auth/session` on app mount (if no token in localStorage)
2. Backend creates a `User` record with an auto-generated handle (e.g. `quietwalker-42`)
3. Backend returns a signed JWT containing `userId`
4. Frontend stores the JWT in `localStorage` and sends it as `Authorization: Bearer <token>` on protected requests

This keeps the app fully anonymous — no email, no password, no visible "account" — while
giving each visitor a stable identity needed to attribute story authorship.

### Protected vs. Public Routes

| Route | Auth Required |
|---|---|
| `GET /api/stories` | No |
| `GET /api/stories/clusters` | No |
| `GET /api/stories/:id` | No |
| `POST /api/stories` | Yes (session JWT) |
| `POST /api/match` | No |
| `POST /api/match/chat` | No |

---

## Embedding Strategy

Matching is powered entirely by semantic similarity — no keyword inference.

**Model:** `nvidia/llama-nemotron-embed-vl-1b-v2:free` via OpenRouter
**Dimensions:** 2048
**Similarity metric:** Cosine distance (pgvector `<=>` operator)

### When embeddings are generated
- `POST /api/stories` — embed `excerpt + " " + fullText` before inserting
- `prisma/seed.ts` — embed all 13 seeded stories at seed time

### How matching works
1. User submits text on the frontend (ComposePage / MatchPage)
2. Backend calls OpenRouter to embed the submitted text
3. pgvector finds the N most similar stories by cosine distance against stored embeddings
4. Top result returned as the match

**Note:** The `emotion` field on `Story` is still stored and displayed as a UI badge and
used for filtering (`GET /api/stories?emotion=`), but it plays no role in matching logic.

---

## Database Schema (Prisma)

Requires the `pgvector` extension enabled in PostgreSQL:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### User

```prisma
model User {
  id        String   @id @default(uuid())
  handle    String   @unique  // e.g. "quietwalker-42"
  createdAt DateTime @default(now())
  stories   Story[]
}
```

### Story

```prisma
model Story {
  id          String     @id @default(uuid())
  city        String
  country     String
  areaLabel   String
  postalHint  String
  lat         Float
  lng         Float
  emotion     Emotion
  contextTags ContextTag[]
  excerpt     String     @db.VarChar(300)
  fullText    String     @db.Text
  language    String
  year        Int
  openToChat  Boolean    @default(false)
  chatPrompt  String
  embedding   Unsupported("vector(1536)")?  // pgvector; null until embedded
  authorId    String?
  author      User?      @relation(fields: [authorId], references: [id])
  createdAt   DateTime   @default(now())
}

enum Emotion {
  homesick
  pressure
  lonely
  identity
  hope
}

enum ContextTag {
  student
  new_city           // mapped to "new-city"
  family_duty        // mapped to "family-duty"
  work_pressure      // mapped to "work-pressure"
  distance_from_home // mapped to "distance-from-home"
}
```

**Index for fast similarity search:**
```sql
CREATE INDEX ON "Story" USING ivfflat (embedding vector_cosine_ops);
```

---

## API Endpoints

### Auth

#### `POST /api/auth/session`
Creates a new anonymous user and returns a JWT. Called once on app load if no token exists.

**Request body:** none

**Response:**
```json
{
  "token": "<jwt>",
  "user": {
    "id": "uuid",
    "handle": "quietwalker-42"
  }
}
```

---

### Stories

#### `GET /api/stories`
Returns all stories. Supports filtering and search.

**Query params:**
- `emotion` — filter by emotion enum value
- `city` — filter by city name (case-insensitive)
- `q` — full-text search across `excerpt` and `fullText`

**Response:** `StoryEntry[]` (embedding field excluded from all responses)

---

#### `GET /api/stories/clusters`
Returns stories grouped by city with averaged lat/lng for the map. Mirrors the client-side
`groupStoriesByCity()` logic currently in `stories.ts`.

**Response:** `CityCluster[]`

---

#### `GET /api/stories/:id`
Returns a single story by ID.

**Response:** `StoryEntry` or `404`

---

#### `POST /api/stories`
Submits a new story. Requires session JWT. Triggers embedding generation before insert.

**Request body:**
```json
{
  "city": "string",
  "country": "string",
  "areaLabel": "string",
  "postalHint": "string",
  "lat": 0.0,
  "lng": 0.0,
  "emotion": "homesick | pressure | lonely | identity | hope",
  "contextTags": ["student", "new-city"],
  "excerpt": "string (max 300 chars)",
  "fullText": "string",
  "language": "string",
  "year": 2025,
  "openToChat": true,
  "chatPrompt": "string"
}
```

**Response:** `StoryEntry` (201)

---

### Matching

#### `POST /api/match`
Embeds the submitted text and returns the single most semantically similar story.

**Request body:**
```json
{ "text": "string" }
```

**Response:** `StoryEntry`

---

#### `POST /api/match/chat`
Embeds the submitted text and returns two semantically similar stories that have
`openToChat: true` — one as "suggested", one as "incoming" (excluding the suggested result).

**Request body:**
```json
{
  "text": "string",
  "excludeId": "optional story id to exclude from both results"
}
```

**Response:**
```json
{
  "suggested": StoryEntry,
  "incoming": StoryEntry
}
```

---

## File Structure

```
server/
├── src/
│   ├── index.ts                  # Entry: starts HTTP server
│   ├── app.ts                    # Express app, middleware, route mounting
│   ├── routes/
│   │   ├── auth.ts               # POST /api/auth/session
│   │   ├── stories.ts            # GET/POST /api/stories
│   │   └── match.ts              # POST /api/match, /api/match/chat
│   ├── services/
│   │   ├── embeddingService.ts   # OpenRouter embed() call; returns number[]
│   │   ├── matchingService.ts    # pgvector similarity query; findMatch(), findChatMatches()
│   │   └── sessionService.ts     # JWT sign/verify, handle generation
│   ├── middleware/
│   │   └── requireSession.ts     # JWT auth middleware for protected routes
│   └── lib/
│       └── prisma.ts             # Prisma client singleton
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                   # Seeds all 13 stories + generates their embeddings
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/echo
JWT_SECRET=your-secret-here
OPENROUTER_API_KEY=your-openrouter-key-here
PORT=3001
```

---

## Client Changes Required

Once the backend is built, the following frontend changes are needed:

1. **`vite.config.ts`** — add proxy: `/api` → `http://localhost:3001`
2. **`client/src/data/stories.ts`** — remove hardcoded `stories` array and all matching
   functions; replace with `fetch('/api/stories')` and `fetch('/api/match')` calls. Keep
   types and `emotionLabels`/`contextLabels` exports.
3. **App mount** — call `POST /api/auth/session` on startup if no JWT in localStorage

---

## Out of Scope (deferred)

- Real-time chat (Socket.IO, ChatSession, Message models)
- Story moderation / soft-delete
- Push or email notifications
