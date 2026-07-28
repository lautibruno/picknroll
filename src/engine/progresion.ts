// Curva de progresión de OVR por edad (ver MVP_SPEC.md §3.2).
// El potencial oculto actúa como techo: nunca se supera, aunque la curva "quisiera" subir más.
import type { Azar } from './potencial'

export interface EstadoJugador {
  ovr: number
  edad: number
  potencial: number
}

export const OVR_MINIMO = 30

export function clampOvr(ovr: number, potencial: number): number {
  return Math.max(OVR_MINIMO, Math.min(potencial, ovr))
}

interface RangoDelta {
  min: number
  max: number
}

// Curva rehecha jugando copero.com.ar/juegos/simulador-carrera en vivo (pedido explícito
// del usuario, confirmado con preguntas): en el juego real el crecimiento sale casi
// entero de fichar/préstamo (ver crecimientoPorTraspaso.ts), no de una curva de edad
// corriendo temporada a temporada por su cuenta. Acá solo queda el DECLIVE pasivo de
// veterano — pasa igual aunque no cambies de club — porque un jugador de 35 años
// declina exista o no una decisión ese año; el crecimiento en edad joven/pico es 0 a
// propósito, así el único lugar donde de verdad subís de nivel es eligiendo bien tu club.
function rangoPorEdad(edad: number): RangoDelta {
  if (edad <= 31) return { min: 0, max: 0 }
  if (edad <= 34) return { min: -2, max: 0 }
  if (edad <= 37) return { min: -4, max: -1 }
  return { min: -7, max: -3 }
}

function enteroEnRango(azar: Azar, rango: RangoDelta): number {
  const cantidad = rango.max - rango.min + 1
  return rango.min + Math.floor(azar() * cantidad)
}

export function avanzarTemporada(jugador: EstadoJugador, azar: Azar): EstadoJugador {
  const delta = enteroEnRango(azar, rangoPorEdad(jugador.edad))
  const ovr = clampOvr(jugador.ovr + delta, jugador.potencial)

  return {
    ovr,
    edad: jugador.edad + 1,
    potencial: jugador.potencial,
  }
}
