// Vercel Edge Function — genera la tarjeta/imagen (1200x630, formato estándar de preview de
// link) que WhatsApp muestra al pegar el link de /carrera. Corre en cada request de un
// crawler de preview (no se persiste nada, ver api/carrera.ts), así que tiene que ser rápida:
// @vercel/og (satori + resvg) renderiza HTML/CSS a PNG sin necesitar Node/canvas nativo.
//
// No hay JSX acá a propósito: tsconfig.api.json no tiene "jsx" configurado (el resto de las
// funciones serverless de este proyecto son objetos planos/fetch, sin React), así que el
// árbol que espera ImageResponse se arma a mano con objetos { type, props } — es exactamente
// lo mismo a lo que compila JSX, solo que sin el paso de compilación.
import { ImageResponse } from '@vercel/og'
import { decodificarResumen } from '../src/engine/compartirCarrera'
import { formatoValorMercado } from '../src/engine/valorMercado'

export const config = { runtime: 'edge' }

const FONDO = '#0d0d0d'
const SUPERFICIE = '#1a1512'
const ACENTO = '#ff6b1a'
const HUESO = '#f5f1e8'

type Nodo = any

function el(type: string, props: Record<string, unknown>, ...children: Nodo[]): Nodo {
  return { type, props: { ...props, children: children.length === 1 ? children[0] : children } }
}

// Google Fonts sirve TTF (lo que necesita satori) en vez de WOFF2 si el User-Agent parece un
// navegador viejo/de escritorio sin soporte woff2 — truco documentado por el propio Vercel.
async function cargarFuenteGoogle(familia: string, peso: number): Promise<ArrayBuffer> {
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=${familia}:wght@${peso}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36',
      },
    })
  ).text()
  const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/)
  if (!match) throw new Error(`No se encontró la fuente ${familia} ${peso}`)
  const respuesta = await fetch(match[1])
  return respuesta.arrayBuffer()
}

export default async function handler(req: Request) {
  const url = new URL(req.url)
  const data = url.searchParams.get('d')
  const resumen = data ? decodificarResumen(data) : null

  if (!resumen) {
    return new Response('Falta o es inválido el parámetro d', { status: 400 })
  }

  const [bebasNeue, oswald, oswaldSemibold] = await Promise.all([
    cargarFuenteGoogle('Bebas+Neue', 400),
    cargarFuenteGoogle('Oswald', 400),
    cargarFuenteGoogle('Oswald', 600),
  ])

  const filasTrofeos: { icono: string; texto: string }[] = []
  if (resumen.trofeos.anillos > 0) filasTrofeos.push({ icono: '🏆', texto: `${resumen.trofeos.anillos} anillo${resumen.trofeos.anillos === 1 ? '' : 's'}` })
  if (resumen.trofeos.mvp > 0) filasTrofeos.push({ icono: '👑', texto: `${resumen.trofeos.mvp} MVP` })
  if (resumen.trofeos.allStar > 0) filasTrofeos.push({ icono: '⭐', texto: `${resumen.trofeos.allStar} All-Star` })
  if (resumen.trofeos.mundial > 0) filasTrofeos.push({ icono: '🌍', texto: `${resumen.trofeos.mundial} Mundial` })
  if (resumen.trofeos.jjoo > 0) filasTrofeos.push({ icono: '🥇', texto: `${resumen.trofeos.jjoo} Olímpico` })
  if (resumen.trofeos.ligaLocal > 0 && resumen.nombreLigaLocal) {
    filasTrofeos.push({ icono: '🏅', texto: `${resumen.trofeos.ligaLocal}x ${resumen.nombreLigaLocal}` })
  }

  const bannerFlagUrl = `https://flagcdn.com/48x36/${resumen.nacionalidad.toLowerCase()}.png`

  const arbol = el(
    'div',
    {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: FONDO,
        color: HUESO,
        fontFamily: 'Oswald',
        padding: '56px 64px',
        position: 'relative',
      },
    },
    // Franja de acento superior, mismo lenguaje visual que el resto del juego (sombra sólida).
    el('div', { style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '10px', backgroundColor: ACENTO, display: 'flex' } }),

    el(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '14px' } },
      el('div', {
        style: {
          width: '10px',
          height: '10px',
          backgroundColor: ACENTO,
          borderRadius: '999px',
          display: 'flex',
        },
      }),
      el('div', { style: { fontSize: '22px', letterSpacing: '6px', color: 'rgba(245,241,232,0.55)', display: 'flex' } }, "PICK'N'ROLL"),
    ),

    el(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '18px', marginTop: '20px' } },
      el('img', { src: bannerFlagUrl, width: 48, height: 36, style: { display: 'flex', border: '1px solid rgba(245,241,232,0.25)' } }),
      el(
        'div',
        { style: { fontSize: '96px', fontFamily: 'Bebas Neue', lineHeight: 1, display: 'flex' } },
        resumen.nombre.toUpperCase(),
      ),
    ),

    el(
      'div',
      {
        style: {
          display: 'flex',
          marginTop: '14px',
          backgroundColor: ACENTO,
          color: FONDO,
          padding: '10px 22px',
          fontSize: '30px',
          fontFamily: 'Bebas Neue',
          letterSpacing: '2px',
          alignSelf: 'flex-start',
        },
      },
      resumen.veredicto,
    ),

    el(
      'div',
      { style: { display: 'flex', gap: '56px', marginTop: '46px' } },
      el(
        'div',
        { style: { display: 'flex', flexDirection: 'column' } },
        el('div', { style: { fontSize: '18px', letterSpacing: '3px', color: 'rgba(245,241,232,0.45)', display: 'flex' } }, 'PICO OVR'),
        el('div', { style: { fontSize: '72px', fontFamily: 'Bebas Neue', color: ACENTO, display: 'flex' } }, String(resumen.picoOvr)),
      ),
      el(
        'div',
        { style: { display: 'flex', flexDirection: 'column' } },
        el('div', { style: { fontSize: '18px', letterSpacing: '3px', color: 'rgba(245,241,232,0.45)', display: 'flex' } }, 'VALOR MÁXIMO'),
        el('div', { style: { fontSize: '72px', fontFamily: 'Bebas Neue', display: 'flex' } }, formatoValorMercado(resumen.valorMaximoEuros)),
      ),
      el(
        'div',
        { style: { display: 'flex', flexDirection: 'column' } },
        el('div', { style: { fontSize: '18px', letterSpacing: '3px', color: 'rgba(245,241,232,0.45)', display: 'flex' } }, 'TEMPORADAS'),
        el('div', { style: { fontSize: '72px', fontFamily: 'Bebas Neue', display: 'flex' } }, String(resumen.temporadas)),
      ),
    ),

    filasTrofeos.length > 0 &&
      el(
        'div',
        { style: { display: 'flex', gap: '28px', marginTop: '38px', flexWrap: 'wrap' } },
        ...filasTrofeos.map((f) =>
          el(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: SUPERFICIE,
                border: '1px solid rgba(245,241,232,0.15)',
                padding: '10px 18px',
                fontSize: '24px',
              },
            },
            el('div', { style: { display: 'flex', fontSize: '28px' } }, f.icono),
            el('div', { style: { display: 'flex' } }, f.texto),
          ),
        ),
      ),

    resumen.equipos.length > 0 &&
      el(
        'div',
        {
          style: {
            display: 'flex',
            marginTop: 'auto',
            fontSize: '22px',
            color: 'rgba(245,241,232,0.55)',
          },
        },
        `📍 ${resumen.equipos.slice(0, 6).join(' · ')}${resumen.equipos.length > 6 ? '…' : ''}`,
      ),
  )

  return new ImageResponse(arbol, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Bebas Neue', data: bebasNeue, weight: 400, style: 'normal' },
      { name: 'Oswald', data: oswald, weight: 400, style: 'normal' },
      { name: 'Oswald', data: oswaldSemibold, weight: 600, style: 'normal' },
    ],
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
