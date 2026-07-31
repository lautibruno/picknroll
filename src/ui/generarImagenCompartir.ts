// Genera la imagen para compartir (Canvas, 100% en el cliente) — pedido explícito del
// usuario: nada de link con datos codificados, la imagen se adjunta como archivo junto con
// el link normal del juego al compartir (ver PantallaRetiro.tsx, navigator.share con
// `files`). Usa los escudos reales de los clubes (mismas URLs que ya se muestran en el
// juego) y los mismos tokens de diseño que el resto de la app (src/index.css).
import type { ResumenCarrera } from '../engine/compartirCarrera'
import { formatoValorMercado } from '../engine/valorMercado'
import { abreviarNombre } from './abreviarNombre'

const ANCHO = 1200
const ALTO = 630

const FONDO = '#0d0d0d'
const SUPERFICIE = '#1a1512'
const ACENTO = '#ff6b1a'
const HUESO = '#f5f1e8'
const HUESO_TENUE = 'rgba(245,241,232,0.5)'
const HUESO_MUY_TENUE = 'rgba(245,241,232,0.15)'

// Los escudos vienen de dominios variados (Wikimedia, flagcdn, sitios de ligas) — se pide
// con CORS explícito y, si el servidor no lo permite o falla, se descarta esa imagen puntual
// (fallback a la placa con iniciales) en vez de arriesgar "tatuar" el canvas entero y que
// después falle el toBlob() final de TODA la imagen.
async function dibujarImagenSegura(
  ctx: CanvasRenderingContext2D,
  url: string,
  x: number,
  y: number,
  w: number,
  h: number,
): Promise<boolean> {
  let objectUrl: string | null = null
  try {
    const controlador = new AbortController()
    const timeout = setTimeout(() => controlador.abort(), 4000)
    const respuesta = await fetch(url, { mode: 'cors', signal: controlador.signal })
    clearTimeout(timeout)
    if (!respuesta.ok) return false

    const blob = await respuesta.blob()
    objectUrl = URL.createObjectURL(blob)
    const img = new Image()
    img.src = objectUrl
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('no cargó la imagen'))
    })
    ctx.drawImage(img, x, y, w, h)
    return true
  } catch {
    return false
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl)
  }
}

function dibujarPlacaIniciales(ctx: CanvasRenderingContext2D, nombre: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = SUPERFICIE
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = HUESO_MUY_TENUE
  ctx.lineWidth = 1
  ctx.strokeRect(x, y, w, h)
  ctx.fillStyle = HUESO
  ctx.font = `600 ${Math.round(h * 0.34)}px Oswald`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(abreviarNombre(nombre), x + w / 2, y + h / 2 + 1)
}

function urlBandera(codigoPais: string): string {
  return `https://flagcdn.com/48x36/${codigoPais.toLowerCase()}.png`
}

// Genera el PNG en memoria. Devuelve `null` si el navegador no puede exportarlo (canvas
// "tatuado" por alguna imagen cross-origin sin CORS que igual haya quedado dibujada, muy
// raro dado el chequeo de arriba, pero el llamador tiene que poder caer al share solo-texto).
export async function generarImagenCompartir(resumen: ResumenCarrera): Promise<Blob | null> {
  const canvas = document.createElement('canvas')
  canvas.width = ANCHO
  canvas.height = ALTO
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  await document.fonts.ready

  // Fondo + franja de acento superior, mismo lenguaje visual que el resto del juego.
  ctx.fillStyle = FONDO
  ctx.fillRect(0, 0, ANCHO, ALTO)
  ctx.fillStyle = ACENTO
  ctx.fillRect(0, 0, ANCHO, 10)

  const margenX = 64
  let y = 56

  // Wordmark.
  ctx.fillStyle = ACENTO
  ctx.beginPath()
  ctx.arc(margenX + 5, y, 5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = HUESO_TENUE
  ctx.font = '22px Oswald'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText("P I C K ' N ' R O L L", margenX + 22, y + 8)

  // Nombre + bandera.
  y += 74
  const huboBandera = await dibujarImagenSegura(ctx, urlBandera(resumen.nacionalidad), margenX, y - 30, 48, 36)
  const xNombre = margenX + (huboBandera ? 64 : 0)
  ctx.fillStyle = HUESO
  ctx.font = '96px "Bebas Neue"'
  ctx.fillText(resumen.nombre.toUpperCase(), xNombre, y + 8)

  // Badge de veredicto, estilo "sombra-brutal" (offset sólido sin blur).
  y += 40
  ctx.font = '30px "Bebas Neue"'
  const anchoBadge = ctx.measureText(resumen.veredicto).width + 44
  ctx.fillStyle = HUESO
  ctx.fillRect(margenX + 6, y + 6, anchoBadge, 52)
  ctx.fillStyle = ACENTO
  ctx.fillRect(margenX, y, anchoBadge, 52)
  ctx.fillStyle = FONDO
  ctx.textBaseline = 'middle'
  ctx.fillText(resumen.veredicto, margenX + 22, y + 28)
  ctx.textBaseline = 'alphabetic'

  // Fila de stats: pico OVR, valor máximo, temporadas.
  y += 130
  const stats: [string, string, string][] = [
    ['PICO OVR', String(resumen.picoOvr), ACENTO],
    ['VALOR MÁXIMO', formatoValorMercado(resumen.valorMaximoEuros), HUESO],
    ['TEMPORADAS', String(resumen.temporadas), HUESO],
  ]
  const anchoColumna = 190
  stats.forEach(([etiqueta, valor, color], i) => {
    const x = margenX + i * anchoColumna
    ctx.fillStyle = HUESO_TENUE
    ctx.font = '18px Oswald'
    ctx.fillText(etiqueta, x, y)
    ctx.fillStyle = color
    ctx.font = '72px "Bebas Neue"'
    ctx.fillText(valor, x, y + 68)
  })

  // Trofeos realmente ganados (mismo criterio que el texto para compartir).
  y += 118
  const filasTrofeos: [string, string][] = []
  if (resumen.trofeos.anillos > 0) filasTrofeos.push(['🏆', `${resumen.trofeos.anillos} anillo${resumen.trofeos.anillos === 1 ? '' : 's'}`])
  if (resumen.trofeos.mvp > 0) filasTrofeos.push(['👑', `${resumen.trofeos.mvp} MVP`])
  if (resumen.trofeos.allStar > 0) filasTrofeos.push(['⭐', `${resumen.trofeos.allStar} All-Star`])
  if (resumen.trofeos.mundial > 0) filasTrofeos.push(['🌍', `${resumen.trofeos.mundial} Mundial`])
  if (resumen.trofeos.jjoo > 0) filasTrofeos.push(['🥇', `${resumen.trofeos.jjoo} Olímpico`])
  if (resumen.trofeos.ligaLocal > 0 && resumen.nombreLigaLocal) {
    filasTrofeos.push(['🏅', `${resumen.trofeos.ligaLocal}x ${resumen.nombreLigaLocal}`])
  }

  if (filasTrofeos.length > 0) {
    let x = margenX
    ctx.font = '24px Oswald'
    for (const [icono, texto] of filasTrofeos) {
      const anchoChip = ctx.measureText(`${icono} ${texto}`).width + 36
      ctx.fillStyle = SUPERFICIE
      ctx.fillRect(x, y - 34, anchoChip, 48)
      ctx.strokeStyle = HUESO_MUY_TENUE
      ctx.strokeRect(x, y - 34, anchoChip, 48)
      ctx.fillStyle = HUESO
      ctx.textBaseline = 'middle'
      ctx.fillText(`${icono} ${texto}`, x + 18, y - 10)
      ctx.textBaseline = 'alphabetic'
      x += anchoChip + 16
      if (x > ANCHO - margenX - 150) break
    }
    y += 66
  }

  // Escudos de los clubes por donde pasó.
  if (resumen.equipos.length > 0) {
    y = ALTO - 110
    ctx.fillStyle = HUESO_TENUE
    ctx.font = '18px Oswald'
    ctx.fillText('PASÓ POR', margenX, y)

    const tamañoEscudo = 60
    const espacio = 16
    const maxEscudos = Math.min(resumen.equipos.length, 8)
    const dibujos: Promise<void>[] = []
    for (let i = 0; i < maxEscudos; i++) {
      const club = resumen.equipos[i]
      const x = margenX + i * (tamañoEscudo + espacio)
      const yEscudo = y + 18
      dibujos.push(
        (async () => {
          const ok = club.escudoUrl && (await dibujarImagenSegura(ctx, club.escudoUrl, x, yEscudo, tamañoEscudo, tamañoEscudo))
          if (!ok) dibujarPlacaIniciales(ctx, club.nombre, x, yEscudo, tamañoEscudo, tamañoEscudo)
        })(),
      )
    }
    await Promise.all(dibujos)
  }

  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob), 'image/png')
    } catch {
      resolve(null)
    }
  })
}
