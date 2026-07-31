// Resumen de fin de carrera para compartir — pedido explícito del usuario: mensaje más
// profesional + una tarjeta/imagen que se vea en el preview del link (WhatsApp), no un
// archivo descargable. Como no hay backend con base de datos (todo vive en localStorage,
// ver CLAUDE.md), el resumen entero viaja codificado en la propia URL — el endpoint que
// genera la imagen (api/carrera-imagen.ts) la reconstruye sin persistir nada.
//
// Lógica pura (armar + codificar/decodificar), sin React, para poder testearla sola y para
// que la puedan importar tanto la UI (src/ui/PantallaRetiro.tsx) como las funciones
// serverless (api/carrera.ts, api/carrera-imagen.ts).
import type { Carrera } from './motorCarrera'
import type { Trofeos } from './trofeos'
import { calcularVeredicto } from './veredicto'
import { resumirRecorrido } from './recorrido'
import { calcularValorMercadoEuros, formatoValorMercado } from './valorMercado'

export interface ResumenCarrera {
  nombre: string
  posicion: string
  nacionalidad: string
  veredicto: string
  edadRetiro: number
  temporadas: number
  picoOvr: number
  valorMaximoEuros: number
  llegoNba: boolean
  trofeos: Trofeos
  nombreLigaLocal: string | null
  equipos: string[]
}

export function armarResumenCarrera(carrera: Carrera, nombreCompleto: string): ResumenCarrera {
  const picoOvr = Math.max(carrera.jugador.ovr, ...carrera.historial.map((h) => h.ovr))
  // El valor de mercado crece monótono con el OVR (ver valorMercado.ts): el pico de OVR
  // ya determina el pico de valor, sin recalcular temporada por temporada.
  const valorMaximoEuros = calcularValorMercadoEuros(picoOvr)

  // Nombres de club únicos en orden de primera aparición — si volvió a un club años
  // después, no lo repite en la lista (es un resumen de "por dónde pasó", no el recorrido
  // completo con fechas, que ya se muestra aparte en la pantalla de retiro).
  const equipos = [...new Set(resumirRecorrido(carrera.historial).map((p) => p.clubNombre))]

  return {
    nombre: nombreCompleto,
    posicion: carrera.posicion,
    nacionalidad: carrera.nacionalidad,
    veredicto: calcularVeredicto(carrera).titulo,
    edadRetiro: carrera.jugador.edad,
    temporadas: carrera.historial.length,
    picoOvr,
    valorMaximoEuros,
    llegoNba: carrera.fase === 'nba',
    trofeos: carrera.trofeos,
    nombreLigaLocal: carrera.ligaDomestica?.nombreLiga ?? null,
    equipos,
  }
}

// Claves cortas a propósito: este objeto viaja entero en la URL, y cuanto más larga la URL
// más chance de que algún cliente (o el propio WhatsApp) la trunque.
interface ResumenCodificado {
  n: string
  p: string
  na: string
  v: string
  e: number
  t: number
  o: number
  vm: number
  nba: 0 | 1
  // [anillos, allStar, mvp, mundial, jjoo, ligaLocal]
  tr: [number, number, number, number, number, number]
  ll: string | null
  eq: string[]
}

function aCodificado(r: ResumenCarrera): ResumenCodificado {
  return {
    n: r.nombre,
    p: r.posicion,
    na: r.nacionalidad,
    v: r.veredicto,
    e: r.edadRetiro,
    t: r.temporadas,
    o: r.picoOvr,
    vm: r.valorMaximoEuros,
    nba: r.llegoNba ? 1 : 0,
    tr: [r.trofeos.anillos, r.trofeos.allStar, r.trofeos.mvp, r.trofeos.mundial, r.trofeos.jjoo, r.trofeos.ligaLocal],
    ll: r.nombreLigaLocal,
    eq: r.equipos,
  }
}

function deCodificado(c: ResumenCodificado): ResumenCarrera {
  const [anillos, allStar, mvp, mundial, jjoo, ligaLocal] = c.tr
  return {
    nombre: c.n,
    posicion: c.p,
    nacionalidad: c.na,
    veredicto: c.v,
    edadRetiro: c.e,
    temporadas: c.t,
    picoOvr: c.o,
    valorMaximoEuros: c.vm,
    llegoNba: c.nba === 1,
    trofeos: { anillos, allStar, mvp, mundial, jjoo, ligaLocal },
    nombreLigaLocal: c.ll,
    equipos: c.eq,
  }
}

export function codificarResumen(resumen: ResumenCarrera): string {
  return encodeURIComponent(JSON.stringify(aCodificado(resumen)))
}

export function decodificarResumen(data: string): ResumenCarrera | null {
  try {
    const parseado = JSON.parse(decodeURIComponent(data)) as Partial<ResumenCodificado>
    if (
      typeof parseado.n !== 'string' ||
      typeof parseado.o !== 'number' ||
      !Array.isArray(parseado.tr) ||
      parseado.tr.length !== 6
    ) {
      return null
    }
    return deCodificado(parseado as ResumenCodificado)
  } catch {
    return null
  }
}

// Mensaje de texto para copiar/compartir por fuera del link (algunos clientes no arman
// preview de imagen, o el usuario prefiere mandar el texto directo) — mismo contenido que
// la tarjeta, en formato prolijo. `url` es el link con el resumen codificado: WhatsApp arma
// el preview de la imagen a partir de ese link si aparece en el texto del mensaje.
export function armarTextoCompartir(resumen: ResumenCarrera, url: string): string {
  const { trofeos } = resumen
  const lineasTrofeos = [
    trofeos.anillos > 0 && `🏆 ${trofeos.anillos} anillo${trofeos.anillos === 1 ? '' : 's'} NBA`,
    trofeos.mvp > 0 && `👑 ${trofeos.mvp} MVP`,
    trofeos.allStar > 0 && `⭐ ${trofeos.allStar} All-Star`,
    trofeos.mundial > 0 && `🌍 ${trofeos.mundial} Mundial${trofeos.mundial === 1 ? '' : 'es'}`,
    trofeos.jjoo > 0 && `🥇 ${trofeos.jjoo} medalla${trofeos.jjoo === 1 ? '' : 's'} olímpica${trofeos.jjoo === 1 ? '' : 's'}`,
    trofeos.ligaLocal > 0 && resumen.nombreLigaLocal && `🏅 ${trofeos.ligaLocal}x campeón de ${resumen.nombreLigaLocal}`,
  ].filter((linea): linea is string => Boolean(linea))

  const lineas = [
    `🏀 ${resumen.nombre} — PICK'N'ROLL`,
    resumen.veredicto,
    '',
    `📅 ${resumen.temporadas} temporadas · se retiró a los ${resumen.edadRetiro}`,
    `📈 Pico de OVR ${resumen.picoOvr} · 💰 Valor máximo ${formatoValorMercado(resumen.valorMaximoEuros)}`,
    resumen.llegoNba ? '✅ Llegó a la NBA' : '❌ Nunca llegó a la NBA',
    ...lineasTrofeos,
    '',
    resumen.equipos.length > 0 ? `📍 Pasó por: ${resumen.equipos.join(' → ')}` : null,
    '',
    `Jugá tu propia carrera 👉 ${url}`,
  ].filter((linea): linea is string => linea !== null)

  return lineas.join('\n')
}
