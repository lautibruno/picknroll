// Resumen de fin de carrera para compartir — pedido explícito del usuario: mensaje más
// profesional + una imagen con los datos más importantes (títulos, escudos reales de los
// clubes, pico de OVR) para adjuntar junto con el link del juego al compartir por WhatsApp.
// Nada de esto viaja codificado en ninguna URL (decisión explícita: "no quiero un link
// gigantesco") — la imagen se genera en el propio cliente (ver ui/generarImagenCompartir.ts)
// y se comparte como archivo adjunto junto con el link normal de la app.
//
// Lógica pura (armar el resumen + el texto), sin React ni canvas, para poder testearla sola.
import type { Carrera } from './motorCarrera'
import type { Trofeos } from './trofeos'
import { calcularVeredicto } from './veredicto'
import { resumirRecorrido } from './recorrido'
import { calcularValorMercadoEuros, formatoValorMercado } from './valorMercado'

export interface ClubResumen {
  nombre: string
  escudoUrl: string | null
}

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
  equipos: ClubResumen[]
}

export function armarResumenCarrera(carrera: Carrera, nombreCompleto: string): ResumenCarrera {
  const picoOvr = Math.max(carrera.jugador.ovr, ...carrera.historial.map((h) => h.ovr))
  // El valor de mercado crece monótono con el OVR (ver valorMercado.ts): el pico de OVR
  // ya determina el pico de valor, sin recalcular temporada por temporada.
  const valorMaximoEuros = calcularValorMercadoEuros(picoOvr)

  // Clubes únicos en orden de primera aparición — si volvió a un club años después, no lo
  // repite (es un resumen de "por dónde pasó", no el recorrido completo con fechas, que ya
  // se muestra aparte en la pantalla de retiro).
  const vistos = new Set<string>()
  const equipos: ClubResumen[] = []
  for (const paso of resumirRecorrido(carrera.historial)) {
    if (vistos.has(paso.clubNombre)) continue
    vistos.add(paso.clubNombre)
    equipos.push({ nombre: paso.clubNombre, escudoUrl: paso.clubEscudoUrl })
  }

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

// Mensaje de texto para compartir junto con la imagen (ver generarImagenCompartir.ts) — el
// link es siempre el de jugar (la home), corto, sin ningún dato codificado.
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
    resumen.equipos.length > 0 ? `📍 Pasó por: ${resumen.equipos.map((e) => e.nombre).join(' → ')}` : null,
    '',
    `Jugá tu propia carrera 👉 ${url}`,
  ].filter((linea): linea is string => linea !== null)

  return lineas.join('\n')
}
