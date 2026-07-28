// Decisiones de riesgo — mismo mecanismo que Copero (verificado jugando el simulador real:
// eventos como "Doble turno" y "Plan de alimentación", cada uno con 2 opciones: una
// arriesgada con probabilidad de éxito/fracaso mostrada ANTES de elegir, y otra segura
// sin cambios). Es la pieza que le da tensión real a la carrera — no es azar invisible,
// es una decisión del jugador con las cartas sobre la mesa (ver MVP_SPEC.md §6.1).
import type { Azar } from './potencial'

interface TemaRiesgo {
  titulo: string
  descripcion: string
  probabilidadExito: number
  deltaSiExito: number
  deltaSiFalla: number
}

// Deltas ampliados (pedido del usuario: se sentía poco arriesgado). Cada decisión ahora
// mueve el OVR de verdad, para bien o para mal — sigue siendo la misma "cartas sobre la
// mesa" que Copero, solo con más impacto real por elección.
const TEMAS_RIESGO: TemaRiesgo[] = [
  {
    titulo: 'Doble turno',
    descripcion: 'Dos entrenamientos al día para mejorar tu rendimiento.',
    probabilidadExito: 0.6,
    deltaSiExito: 6,
    deltaSiFalla: -7,
  },
  {
    titulo: 'Plan de alimentación',
    descripcion: 'Un nutricionista propone ajustar tu dieta. Puede mejorar tu rendimiento o salir mal.',
    probabilidadExito: 0.55,
    deltaSiExito: 5,
    deltaSiFalla: -4,
  },
  {
    titulo: 'Nuevo preparador físico',
    descripcion: 'Cambia tu rutina de recuperación entre partidos.',
    probabilidadExito: 0.5,
    deltaSiExito: 7,
    deltaSiFalla: -6,
  },
  {
    titulo: 'Cirugía preventiva',
    descripcion: 'Operarte ahora podría alargar tu carrera, pero te deja parado varios meses.',
    probabilidadExito: 0.45,
    deltaSiExito: 8,
    deltaSiFalla: -8,
  },
]

export interface DecisionRiesgo extends TemaRiesgo {
  exito: boolean // ya resuelto al generar el evento — mismo dado, solo se aplica al elegir "arriesgar"
}

export function generarDecisionRiesgo(azar: Azar): DecisionRiesgo {
  const tema = TEMAS_RIESGO[Math.floor(azar() * TEMAS_RIESGO.length)]
  return { ...tema, exito: azar() < tema.probabilidadExito }
}
