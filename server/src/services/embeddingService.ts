const OPENROUTER_EMBEDDINGS_URL = 'https://openrouter.ai/api/v1/embeddings'
const MODEL = 'nvidia/llama-nemotron-embed-vl-1b-v2:free'

interface EmbeddingResponse {
  data: Array<{ embedding: number[] }>
}

export async function embed(text: string): Promise<number[]> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set')

  const res = await fetch(OPENROUTER_EMBEDDINGS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: MODEL, input: text }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`OpenRouter embedding failed (${res.status}): ${body}`)
  }

  const data = (await res.json()) as EmbeddingResponse
  return data.data[0].embedding
}
