// Vercel serverless function — página de "carrera compartida". No es parte de la SPA: cuando
// WhatsApp (o cualquier crawler de preview de links) pide esta URL, necesita ver los meta
// tags Open Graph ya en el HTML de la respuesta (no ejecuta JS), así que esto se resuelve acá
// en vez de en el cliente. `vercel.json` reescribe /carrera -> /api/carrera.
//
// El resumen de la carrera viaja codificado en el propio query param `d` (ver
// src/engine/compartirCarrera.ts) — no hay backend con base de datos en este proyecto
// (todo vive en localStorage), así que no hay nada que buscar ni persistir acá.
import { decodificarResumen, type ResumenCarrera } from '../src/engine/compartirCarrera'
import { formatoValorMercado } from '../src/engine/valorMercado'

interface MinimalRequest {
  query: Record<string, string | string[] | undefined>
  headers: Record<string, string | string[] | undefined>
}
interface MinimalResponse {
  setHeader(name: string, value: string): void
  status(code: number): MinimalResponse
  send(body: string): void
  redirect(code: number, url: string): void
}

function escaparHtml(texto: string): string {
  return texto
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function primerValor(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v
}

function armarDescripcion(resumen: ResumenCarrera): string {
  const partes = [
    `${resumen.temporadas} temporadas`,
    `pico OVR ${resumen.picoOvr}`,
    `valor máximo ${formatoValorMercado(resumen.valorMaximoEuros)}`,
  ]
  if (resumen.trofeos.anillos > 0) partes.push(`${resumen.trofeos.anillos} anillo${resumen.trofeos.anillos === 1 ? '' : 's'}`)
  return partes.join(' · ')
}

export default async function handler(req: MinimalRequest, res: MinimalResponse) {
  const data = primerValor(req.query.d)
  const resumen = data ? decodificarResumen(data) : null

  if (!resumen) {
    res.redirect(302, '/')
    return
  }

  const host = primerValor(req.headers['x-forwarded-host']) ?? primerValor(req.headers.host) ?? 'picknroll.app'
  const proto = primerValor(req.headers['x-forwarded-proto']) ?? 'https'
  const origen = `${proto}://${host}`

  const titulo = `${resumen.nombre} — ${resumen.veredicto} | PickNRoll`
  const descripcion = armarDescripcion(resumen)
  const urlImagen = `${origen}/api/carrera-imagen?d=${encodeURIComponent(data!)}`
  const urlPagina = `${origen}/carrera?d=${encodeURIComponent(data!)}`

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escaparHtml(titulo)}</title>
<meta name="description" content="${escaparHtml(descripcion)}" />

<meta property="og:type" content="website" />
<meta property="og:title" content="${escaparHtml(titulo)}" />
<meta property="og:description" content="${escaparHtml(descripcion)}" />
<meta property="og:image" content="${urlImagen}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="${urlPagina}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escaparHtml(titulo)}" />
<meta name="twitter:description" content="${escaparHtml(descripcion)}" />
<meta name="twitter:image" content="${urlImagen}" />

<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center; background:#0d0d0d; color:#f5f1e8; font-family:system-ui,sans-serif; padding:24px; box-sizing:border-box; }
  .tarjeta { max-width:480px; width:100%; text-align:center; }
  img { width:100%; height:auto; border:2px solid rgba(245,241,232,0.15); }
  h1 { font-size:1.5rem; margin:20px 0 6px; }
  p { color:rgba(245,241,232,0.6); margin:0 0 24px; }
  a.boton { display:inline-block; background:#ff6b1a; color:#0d0d0d; font-weight:700; text-decoration:none; padding:14px 28px; letter-spacing:0.08em; text-transform:uppercase; font-size:0.85rem; }
</style>
</head>
<body>
  <div class="tarjeta">
    <img src="${urlImagen}" alt="${escaparHtml(titulo)}" width="1200" height="630" />
    <h1>${escaparHtml(resumen.nombre)}</h1>
    <p>${escaparHtml(descripcion)}</p>
    <a class="boton" href="/">Jugar PickNRoll</a>
  </div>
</body>
</html>`

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, immutable')
  res.status(200).send(html)
}
