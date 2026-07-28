// Pool de equipos ofrecidos en cada evento, filtrado por el OVR ACTUAL del jugador
// (no por su potencial oculto) — esta es la pieza central de dificultad del diseño:
// un mal arranque cierra puertas a equipos de nivel alto más adelante, efecto bola de nieve
// intencional (ver MVP_SPEC.md §3.3 y CLAUDE.md).
import type { Azar } from './potencial'

export interface Equipo {
  id: string
  nombre: string
  nivel: number // 0-100, comparable directo contra el OVR del jugador
  escudoUrl?: string // opcional — sin esto, la UI cae al badge de iniciales (ver ligas domésticas, pendiente)
}

const MARGEN_NIVEL_SOBRE_OVR = 10
const CANTIDAD_OPCIONES = 3

function elegirSinRepetir<T>(items: T[], cantidad: number, azar: Azar): T[] {
  const restantes = [...items]
  const elegidos: T[] = []
  while (restantes.length > 0 && elegidos.length < cantidad) {
    const indice = Math.floor(azar() * restantes.length)
    elegidos.push(restantes[indice])
    restantes.splice(indice, 1)
  }
  return elegidos
}

export function elegirEquiposOfrecidos(equipos: Equipo[], ovrActual: number, azar: Azar): Equipo[] {
  const elegibles = equipos.filter((equipo) => equipo.nivel <= ovrActual + MARGEN_NIVEL_SOBRE_OVR)
  return elegirSinRepetir(elegibles, CANTIDAD_OPCIONES, azar)
}

// Traspaso con club actual: siempre 3 opciones — 2 clubes distintos + quedarte en el
// tuyo (mismo patrón real de Copero, "Mercado de pases"/"Quedarte en X"). La opción de
// quedarte va siempre al final para que la UI sea predecible.
export function elegirTraspasoOfrecido(equipos: Equipo[], ovrActual: number, clubActual: Equipo, azar: Azar): Equipo[] {
  const elegibles = equipos.filter(
    (equipo) => equipo.nivel <= ovrActual + MARGEN_NIVEL_SOBRE_OVR && equipo.id !== clubActual.id,
  )
  const ofertas = elegirSinRepetir(elegibles, CANTIDAD_OPCIONES - 1, azar)
  return [...ofertas, clubActual]
}
