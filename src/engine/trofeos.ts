// Vitrina de trofeos. All-Star y MVP se resuelven acá (umbral de OVR + algo de azar).
//
// Los que NO salen de acá:
// - Anillos NBA: se ganan jugando los playoffs simulados (ver playoffs.ts, motorCarrera.ts
//   los suma cuando `simularPlayoffs` devuelve 'campeon').
// - Mundial y JJOO: pedido explícito del usuario ("el mundial o los JJOO se ganan con una
//   decisión acertada") — acá solo se calcula SI hay convocatoria disponible ese año
//   (`convocatoriaDisponible`); ganarla o no lo decide el jugador en un evento aparte.
// - Título de liga local: se resuelve en fase pre-nba (ver `probabilidadTituloLocal`).
import type { Azar } from './potencial'

export interface Trofeos {
  anillos: number
  allStar: number
  mvp: number
  mundial: number
  jjoo: number
  ligaLocal: number
}

export const TROFEOS_INICIALES: Trofeos = {
  anillos: 0,
  allStar: 0,
  mvp: 0,
  mundial: 0,
  jjoo: 0,
  ligaLocal: 0,
}

// Qué se ganó ESTA temporada puntual (no el acumulado) — hace falta para el cartel de
// festejo ("apareció un cartel con las copas ganadas") y para marcar el ícono en la fila
// del historial correspondiente, pedido explícito del usuario.
export interface TrofeosGanadosTemporada {
  allStar: boolean
  mvp: boolean
}

export const SIN_TROFEOS_GANADOS: TrofeosGanadosTemporada = { allStar: false, mvp: false }

const UMBRAL_OVR_ALL_STAR = 80
const UMBRAL_OVR_MVP = 90
const PROBABILIDAD_MVP_SI_ELEGIBLE = 0.3

// Mundial de selecciones (FIBA) y JJOO — calendario real: ambos cada 4 años, pero NO
// equidistantes entre sí. El Mundial cae un año antes que los Juegos Olímpicos siguientes
// (ej. Mundial 2019 → JJOO 2020, Mundial 2023 → JJOO 2024), y después hay un hueco de 3
// temporadas sin ninguno de los dos. Se modela con la edad como reloj determinista.
const UMBRAL_OVR_MUNDIAL = 78
const UMBRAL_OVR_JJOO = 82
const CICLO_TORNEOS_TEMPORADAS = 4

export type TorneoSeleccion = 'mundial' | 'jjoo'

// Devuelve a qué torneo de selección te convocan esta temporada (o null). Ser convocado no
// es ganarlo: el trofeo se define después con una decisión del jugador (ver motorCarrera).
export function convocatoriaDisponible(ovr: number, edad: number, fase: 'pre-nba' | 'nba'): TorneoSeleccion | null {
  if (fase !== 'nba') return null
  const posicionEnCiclo = edad % CICLO_TORNEOS_TEMPORADAS
  if (posicionEnCiclo === 0 && ovr >= UMBRAL_OVR_MUNDIAL) return 'mundial'
  if (posicionEnCiclo === 1 && ovr >= UMBRAL_OVR_JJOO) return 'jjoo'
  return null
}

// Título de la liga doméstica (fase pre-nba). Pedido explícito del usuario: "quizás que no
// sea algo TAN común o quizás que sea algo más probable cuando te mantenés en el mismo
// equipo de la liga local por bastante tiempo" — de ahí que la probabilidad arranque baja y
// suba por cada temporada consecutiva en el mismo club, con un techo.
const PROBABILIDAD_BASE_TITULO_LOCAL = 0.06
const BONO_TITULO_LOCAL_POR_TEMPORADA = 0.05
const PROBABILIDAD_MAXIMA_TITULO_LOCAL = 0.4

export function probabilidadTituloLocal(nivelClub: number, ovrJugador: number, temporadasEnClub: number): number {
  // Un club fuerte con un jugador fuerte pelea el título; uno flojo casi nunca.
  const fuerza = (nivelClub + ovrJugador) / 2
  const ajusteFuerza = (fuerza - 50) / 100 // ~-0.1 en clubes flojos, ~+0.15 en los grandes
  const bruto =
    PROBABILIDAD_BASE_TITULO_LOCAL + BONO_TITULO_LOCAL_POR_TEMPORADA * Math.max(0, temporadasEnClub - 1) + ajusteFuerza
  return Math.max(0, Math.min(PROBABILIDAD_MAXIMA_TITULO_LOCAL, bruto))
}

export interface ResultadoTrofeosTemporada {
  trofeos: Trofeos
  ganados: TrofeosGanadosTemporada
}

export function evaluarTrofeosTemporada(
  trofeosPrevios: Trofeos,
  ovr: number,
  fase: 'pre-nba' | 'nba',
  azar: Azar,
): ResultadoTrofeosTemporada {
  if (fase !== 'nba') return { trofeos: trofeosPrevios, ganados: SIN_TROFEOS_GANADOS }

  const ganaAllStar = ovr >= UMBRAL_OVR_ALL_STAR
  const ganaMvp = ovr >= UMBRAL_OVR_MVP && azar() < PROBABILIDAD_MVP_SI_ELEGIBLE

  return {
    trofeos: {
      ...trofeosPrevios,
      allStar: trofeosPrevios.allStar + (ganaAllStar ? 1 : 0),
      mvp: trofeosPrevios.mvp + (ganaMvp ? 1 : 0),
    },
    ganados: { allStar: ganaAllStar, mvp: ganaMvp },
  }
}
