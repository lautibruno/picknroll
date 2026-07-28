// Vitrina de trofeos — solo se ganan en la NBA (MVP/All-Star/Mundial/JJOO: liga doméstica/
// universidad no otorga convocatorias todavía). Umbrales deterministas para All-Star (mismo
// criterio de "gate por OVR" que el resto del motor); MVP/Mundial/JJOO suman algo de azar
// incluso entre los mejores, para que ni ser elite garantice ganarlos todas las temporadas.
//
// Los anillos NO salen de acá — se ganan de verdad jugando los playoffs simulados (ver
// playoffs.ts, motorCarrera.ts los suma directo cuando `simularPlayoffs` devuelve 'campeon').
import type { Azar } from './potencial'

export interface Trofeos {
  anillos: number
  allStar: number
  mvp: number
  mundial: number
  jjoo: number
}

export const TROFEOS_INICIALES: Trofeos = { anillos: 0, allStar: 0, mvp: 0, mundial: 0, jjoo: 0 }

// Qué se ganó ESTA temporada puntual (no el acumulado) — hace falta para el cartel de
// festejo ("apareció un cartel con las copas ganadas") y para marcar el ícono en la fila
// del historial correspondiente, pedido explícito del usuario.
export interface TrofeosGanadosTemporada {
  allStar: boolean
  mvp: boolean
  mundial: boolean
  jjoo: boolean
}

export const SIN_TROFEOS_GANADOS: TrofeosGanadosTemporada = { allStar: false, mvp: false, mundial: false, jjoo: false }

const UMBRAL_OVR_ALL_STAR = 80
const UMBRAL_OVR_MVP = 90
const PROBABILIDAD_MVP_SI_ELEGIBLE = 0.3

// Mundial de selecciones (FIBA) — cada 4 años en la realidad, acá simplificado a "una de
// cada cuatro temporadas" usando la edad como reloj determinista (no depende de un azar
// extra para decidir SI toca el año, solo si te convocan ESE año).
const UMBRAL_OVR_MUNDIAL = 78
const PROBABILIDAD_MUNDIAL_SI_ELEGIBLE = 0.35
const CICLO_MUNDIAL_TEMPORADAS = 4

// Juegos Olímpicos — mismo ciclo de 4 años, corrido 2 temporadas respecto al Mundial para
// que no coincidan siempre el mismo año (más variedad de carteles a lo largo de la carrera).
const UMBRAL_OVR_JJOO = 82
const PROBABILIDAD_JJOO_SI_ELEGIBLE = 0.25
const CICLO_JJOO_TEMPORADAS = 4
const DESFASE_JJOO_TEMPORADAS = 2

export interface ResultadoTrofeosTemporada {
  trofeos: Trofeos
  ganados: TrofeosGanadosTemporada
}

export function evaluarTrofeosTemporada(
  trofeosPrevios: Trofeos,
  ovr: number,
  edad: number,
  fase: 'pre-nba' | 'nba',
  azar: Azar,
): ResultadoTrofeosTemporada {
  if (fase !== 'nba') return { trofeos: trofeosPrevios, ganados: SIN_TROFEOS_GANADOS }

  const ganaAllStar = ovr >= UMBRAL_OVR_ALL_STAR
  const ganaMvp = ovr >= UMBRAL_OVR_MVP && azar() < PROBABILIDAD_MVP_SI_ELEGIBLE
  const esAnioMundial = edad % CICLO_MUNDIAL_TEMPORADAS === 0
  const ganaMundial = esAnioMundial && ovr >= UMBRAL_OVR_MUNDIAL && azar() < PROBABILIDAD_MUNDIAL_SI_ELEGIBLE
  const esAnioJjoo = (edad + DESFASE_JJOO_TEMPORADAS) % CICLO_JJOO_TEMPORADAS === 0
  const ganaJjoo = esAnioJjoo && ovr >= UMBRAL_OVR_JJOO && azar() < PROBABILIDAD_JJOO_SI_ELEGIBLE

  return {
    trofeos: {
      ...trofeosPrevios,
      allStar: trofeosPrevios.allStar + (ganaAllStar ? 1 : 0),
      mvp: trofeosPrevios.mvp + (ganaMvp ? 1 : 0),
      mundial: trofeosPrevios.mundial + (ganaMundial ? 1 : 0),
      jjoo: trofeosPrevios.jjoo + (ganaJjoo ? 1 : 0),
    },
    ganados: { allStar: ganaAllStar, mvp: ganaMvp, mundial: ganaMundial, jjoo: ganaJjoo },
  }
}
