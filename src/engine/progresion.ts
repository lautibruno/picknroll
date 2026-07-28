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

// Rangos ampliados (pedido del usuario: "poco azar, poca probabilidad de crecer" — la
// curva anterior era demasiado plana/predecible). Más swing en ambas direcciones,
// incluida la meseta 28-31, que ahora puede subir o bajar de verdad, no solo estancarse.
function rangoPorEdad(edad: number): RangoDelta {
  if (edad <= 23) return { min: 3, max: 8 }
  if (edad <= 27) return { min: 2, max: 5 }
  if (edad <= 31) return { min: -2, max: 3 }
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
