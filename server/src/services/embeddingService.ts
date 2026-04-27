const TEI_URL = (process.env.TEI_URL ?? 'http://embed:80').replace(/\/+$/, '')

export async function embed(text: string): Promise<number[]> {
  const res = await fetch(`${TEI_URL}/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: text }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`TEI embedding failed (${res.status}): ${body}`)
  }

  const data = (await res.json()) as number[][]
  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    throw new Error('TEI returned unexpected payload shape')
  }

  return data[0]
}
