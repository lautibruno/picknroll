// Playoffs — pedido explícito del usuario: "implementar para jugar playoffs, que haya
// mensajería de cómo nos fue en cada temporada y cuando clasificamos a playoffs que haya
// una simulación de los partidos contra un rival ficticio". Solo aplica en fase NBA (igual
// que el resto de los trofeos, ver trofeos.ts) — la liga doméstica/universidad no tiene
// temporada regular simulada en el MVP.
//
// El "anillo" real ahora sale de ganar las 3 rondas de playoffs simuladas acá, no de una
// probabilidad suelta como antes (ver trofeos.ts) — se gana de verdad, jugando.
import type { Azar } from './potencial'

export interface RivalFicticio {
  nombre: string
  nivel: number
}

// Nombres inventados a propósito (no son franquicias NBA reales) — el rival de playoffs
// es "de relleno", solo para darle marco narrativo a la serie, no un equipo con roster.
const RIVALES_FICTICIOS: RivalFicticio[] = [
  { nombre: 'Metro Sharks', nivel: 76 },
  { nombre: 'Northside Comets', nivel: 79 },
  { nombre: 'Ironclads', nivel: 81 },
  { nombre: 'Red River Wolves', nivel: 74 },
  { nombre: 'Bay City Storm', nivel: 83 },
  { nombre: 'Frontier Kings', nivel: 78 },
  { nombre: 'Union Blaze', nivel: 80 },
  { nombre: 'Coastal Reign', nivel: 84 },
]

const NOMBRES_RONDA = ['Primera ronda', 'Semifinal', 'Final'] as const
export const CANTIDAD_RONDAS_PLAYOFFS = NOMBRES_RONDA.length

export function nombreRonda(ronda: number): string {
  return NOMBRES_RONDA[ronda - 1] ?? `Ronda ${ronda}`
}

const PARTIDOS_TEMPORADA_REGULAR = 82
const UMBRAL_VICTORIAS_PLAYOFFS = 42 // ~.500, aproximado a "entrar en los 8" de cada conferencia

function clampProbabilidad(valor: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, valor))
}

function probabilidadVictoria(nivelPropio: number, nivelRival: number): number {
  return clampProbabilidad(0.5 + (nivelPropio - nivelRival) / 40, 0.2, 0.85)
}

// Combina el nivel del club con el OVR del jugador — un equipo mediocre con una estrella
// real igual puede pelear arriba, y viceversa (mismo criterio narrativo que "cuando
// tenemos buen nivel" del pedido original).
export function nivelEquipoCombinado(nivelClub: number | null, ovrJugador: number): number {
  return (nivelClub ?? 60) * 0.5 + ovrJugador * 0.5
}

export interface ResultadoTemporadaRegular {
  victorias: number
  derrotas: number
  clasifico: boolean
}

export function simularTemporadaRegular(nivelEquipo: number, azar: Azar): ResultadoTemporadaRegular {
  const probVictoria = clampProbabilidad(0.5 + (nivelEquipo - 75) / 150, 0.25, 0.82)
  let victorias = 0
  for (let i = 0; i < PARTIDOS_TEMPORADA_REGULAR; i++) {
    if (azar() < probVictoria) victorias++
  }
  const derrotas = PARTIDOS_TEMPORADA_REGULAR - victorias
  return { victorias, derrotas, clasifico: victorias >= UMBRAL_VICTORIAS_PLAYOFFS }
}

export function elegirRival(ronda: number, azar: Azar): RivalFicticio {
  const base = RIVALES_FICTICIOS[Math.floor(azar() * RIVALES_FICTICIOS.length)]
  return { nombre: base.nombre, nivel: base.nivel + (ronda - 1) * 3 }
}

// Umbral y probabilidad de aparición pensados para que la "jugada final" sea un evento
// realmente aislado (pedido del usuario: "hay muchas decisiones que tomar... debe ser
// más aislado") — solo puede aparecer en la Final (ronda 3), solo si el jugador tiene
// nivel elite, solo si la serie llegó al partido decisivo (1-1), y solo 1 de cada 3 veces
// que se dan esas tres condiciones a la vez. La inmensa mayoría de las finales se
// resuelven solas, sin pedirle nada al jugador.
const UMBRAL_OVR_JUGADA_FINAL = 78
const PROBABILIDAD_APARICION_JUGADA_FINAL = 0.35

export interface ResultadoSerie {
  gano: boolean
  marcador: string
}

export interface SeriePendiente {
  pendiente: true
}

function simularSerieBestOf3(
  nivelEquipo: number,
  nivelRival: number,
  azar: Azar,
  permitirJugadaFinal: boolean,
  ovrJugador: number,
): ResultadoSerie | SeriePendiente {
  const probVictoriaPartido = probabilidadVictoria(nivelEquipo, nivelRival)
  let victoriasEquipo = 0
  let victoriasRival = 0

  for (let partido = 1; partido <= 3; partido++) {
    if (victoriasEquipo === 2 || victoriasRival === 2) break

    const esDecisivo = victoriasEquipo === 1 && victoriasRival === 1
    if (
      permitirJugadaFinal &&
      esDecisivo &&
      ovrJugador >= UMBRAL_OVR_JUGADA_FINAL &&
      azar() < PROBABILIDAD_APARICION_JUGADA_FINAL
    ) {
      return { pendiente: true }
    }

    if (azar() < probVictoriaPartido) victoriasEquipo++
    else victoriasRival++
  }

  return { gano: victoriasEquipo === 2, marcador: `${victoriasEquipo}-${victoriasRival}` }
}

export type ResultadoPlayoffs =
  | { estado: 'campeon' }
  | { estado: 'eliminado'; ronda: number; rival: string; marcador: string }
  // Los dos resultados posibles ya vienen resueltos acá mismo (mismo criterio que
  // decisionesRiesgo.ts: "las cartas ya están sobre la mesa") — así la UI puede mostrar
  // un revelado en vivo fiel a lo que en verdad va a pasar, en vez de tirar un dado nuevo
  // cuando el jugador elige, que podía no coincidir con lo que la animación mostraba.
  | { estado: 'pendiente'; ronda: number; rival: string; resultadoSiFinta: boolean; resultadoSiTriple: boolean }

export function simularPlayoffs(nivelEquipo: number, ovrJugador: number, azar: Azar): ResultadoPlayoffs {
  for (let ronda = 1; ronda <= CANTIDAD_RONDAS_PLAYOFFS; ronda++) {
    const rival = elegirRival(ronda, azar)
    const esFinal = ronda === CANTIDAD_RONDAS_PLAYOFFS
    const resultado = simularSerieBestOf3(nivelEquipo, rival.nivel, azar, esFinal, ovrJugador)

    if ('pendiente' in resultado) {
      return {
        estado: 'pendiente',
        ronda,
        rival: rival.nombre,
        resultadoSiFinta: resolverJugadaFinal('finta', azar),
        resultadoSiTriple: resolverJugadaFinal('triple', azar),
      }
    }
    if (!resultado.gano) {
      return { estado: 'eliminado', ronda, rival: rival.nombre, marcador: resultado.marcador }
    }
  }
  return { estado: 'campeon' }
}

export interface OpcionJugadaFinal {
  id: 'finta' | 'triple'
  nombre: string
  descripcion: string
  probabilidadExito: number
}

export const OPCIONES_JUGADA_FINAL: OpcionJugadaFinal[] = [
  {
    id: 'finta',
    nombre: 'Finta de tiro y penetrar',
    descripcion: 'Jugada más segura: buscás el aro en vez de forzar el triple.',
    probabilidadExito: 0.62,
  },
  {
    id: 'triple',
    nombre: 'Tirar el triple',
    descripcion: 'Todo o nada: si entra, sos el héroe de la Final.',
    probabilidadExito: 0.45,
  },
]

export function resolverJugadaFinal(opcionId: string, azar: Azar): boolean {
  const opcion = OPCIONES_JUGADA_FINAL.find((o) => o.id === opcionId)
  if (!opcion) return false
  return azar() < opcion.probabilidadExito
}
