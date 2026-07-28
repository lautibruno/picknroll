// Vercel serverless function — proxy a API-Sports NBA v2, oculta la key y cachea la respuesta
// para no depender del cupo de 100 req/día por cada visita de usuario (ver MVP_SPEC.md §resultados).
// Tipado mínimo a mano (sin @vercel/node: su árbol de deps trae vulnerabilidades de build tools).
interface MinimalRequest {
  query: Record<string, string | string[] | undefined>
}
interface MinimalResponse {
  setHeader(name: string, value: string): void
  status(code: number): MinimalResponse
  json(body: unknown): void
}

const NBA_API_BASE = 'https://v2.nba.api-sports.io'
const CACHE_SECONDS = 15 * 60 // 15 min: alcanza de sobra para pasados/futuros, casi-live para en vivo

export default async function handler(req: MinimalRequest, res: MinimalResponse) {
  const apiKey = process.env.NBA_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'NBA_API_KEY no configurada' })
    return
  }

  const date = typeof req.query.date === 'string' ? req.query.date : undefined
  const season = typeof req.query.season === 'string' ? req.query.season : undefined

  const params = new URLSearchParams()
  if (date) params.set('date', date)
  if (season) params.set('season', season)

  const upstream = await fetch(`${NBA_API_BASE}/games?${params.toString()}`, {
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': 'v2.nba.api-sports.io',
    },
  })

  if (!upstream.ok) {
    res.status(upstream.status).json({ error: 'Error consultando API-Sports NBA' })
    return
  }

  const data = await upstream.json()
  res.setHeader(
    'Cache-Control',
    `s-maxage=${CACHE_SECONDS}, stale-while-revalidate=${CACHE_SECONDS * 2}`,
  )
  res.status(200).json(data)
}
