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

// Curva rebalanceada (pedido del usuario: "el cálculo de OVR anda medio flojo" — con la
// curva anterior la mayoría de las carreras pegaban el techo de potencial en 3-4
// temporadas y después quedaban 15+ años estancadas/declinando sin nada que jugar). Ahora
// el crecimiento se reparte en más temporadas (19-26, en vez de solo 19-23) con un pico
// real 27-29 que todavía puede subir un poco, no una meseta chata — el declive recién
// empieza en serio a los 30, y se acelera de a poco en vez de un salto brusco a los 32.
function rangoPorEdad(edad: number): RangoDelta {
  if (edad <= 22) return { min: 2, max: 5 }
  if (edad <= 26) return { min: 2, max: 6 }
  if (edad <= 29) return { min: 0, max: 3 }
  if (edad <= 33) return { min: -2, max: 1 }
  if (edad <= 36) return { min: -4, max: -1 }
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
