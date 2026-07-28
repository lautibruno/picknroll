// Vercel serverless function — proxy al scoreboard no-oficial de ESPN.
// Fuente real de "hoy/en vivo/calendario" (ver MVP_SPEC.md §6): sin key, sin cuota,
// sin bloqueo por IP de datacenter (a diferencia de nba.com, que sí bloquea con 403).
// No hace falta ocultar ninguna key acá (ESPN es público) — este proxy existe para
// cachear y evitar que el cliente dependa de CORS pegándole directo.
interface MinimalRequest {
  query: Record<string, string | string[] | undefined>
}
interface MinimalResponse {
  setHeader(name: string, value: string): void
  status(code: number): MinimalResponse
  json(body: unknown): void
}

const ESPN_SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard'

// Días con partido en vivo necesitan refresco más seguido que días sin partidos.
const CACHE_SECONDS_LIVE = 30
const CACHE_SECONDS_SIN_PARTIDOS = 15 * 60

function aFechaEspn(fechaIso: string): string {
  // "2026-04-15" -> "20260415" (formato que espera ESPN)
  return fechaIso.replaceAll('-', '')
}

export default async function handler(req: MinimalRequest, res: MinimalResponse) {
  const fecha = typeof req.query.date === 'string' ? req.query.date : undefined

  const params = new URLSearchParams()
  if (fecha) params.set('dates', aFechaEspn(fecha))

  const upstream = await fetch(`${ESPN_SCOREBOARD_URL}?${params.toString()}`)

  if (!upstream.ok) {
    res.status(upstream.status).json({ error: 'Error consultando el scoreboard de ESPN' })
    return
  }

  const data = (await upstream.json()) as {
    events?: { competitions?: { status?: { type?: { state?: string } } }[] }[]
  }

  const hayPartidoEnVivo = (data.events ?? []).some(
    (evento) => evento.competitions?.[0]?.status?.type?.state === 'in',
  )
  const cacheSegundos = hayPartidoEnVivo ? CACHE_SECONDS_LIVE : CACHE_SECONDS_SIN_PARTIDOS

  res.setHeader(
    'Cache-Control',
    `s-maxage=${cacheSegundos}, stale-while-revalidate=${cacheSegundos * 2}`,
  )
  res.status(200).json(data)
}
