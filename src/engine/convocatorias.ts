// Mundial (FIBA) y Juegos Olímpicos — pedido explícito del usuario: "el mundial o los JJOO
// se ganan con una decisión acertada". Ser convocado lo decide el calendario + tu OVR (ver
// `convocatoriaDisponible` en trofeos.ts); GANAR el torneo depende de esta decisión.
//
// Mismo patrón de "cartas sobre la mesa" que decisionesRiesgo.ts y la jugada final de
// playoffs.ts: los dos resultados posibles ya vienen resueltos al generar el evento, así el
// revelado en vivo de la UI es fiel a lo que va a pasar de verdad y no un dado nuevo.
import type { Azar } from './potencial'
import type { TorneoSeleccion } from './trofeos'

export interface OpcionConvocatoria {
  id: 'jugar-para-el-equipo' | 'tomar-la-responsabilidad'
  nombre: string
  descripcion: string
  probabilidadExito: number
}

// Las dos opciones son deliberadamente parejas en valor esperado pero distintas en carácter
// — no hay una "correcta" que convenga siempre (el % no se le muestra al jugador).
export const OPCIONES_CONVOCATORIA: OpcionConvocatoria[] = [
  {
    id: 'jugar-para-el-equipo',
    nombre: 'Jugar para el equipo',
    descripcion: 'Repartís el juego y confiás en el grupo.',
    probabilidadExito: 0.5,
  },
  {
    id: 'tomar-la-responsabilidad',
    nombre: 'Tomar la responsabilidad',
    descripcion: 'Te cargás la selección al hombro.',
    probabilidadExito: 0.45,
  },
]

export interface EscenaConvocatoria {
  titulo: string
  descripcion: string
}

const ESCENAS_MUNDIAL: EscenaConvocatoria[] = [
  { titulo: 'Final del Mundial', descripcion: 'Tu selección llegó a la final. Se define el campeonato del mundo.' },
  { titulo: 'Mundial · último cuarto', descripcion: 'Partido cerrado por el título mundial, quedan cinco minutos.' },
  { titulo: 'Mundial · la final soñada', descripcion: 'Todo el país mirando. Una final para toda la vida.' },
]

const ESCENAS_JJOO: EscenaConvocatoria[] = [
  { titulo: 'Final olímpica', descripcion: 'Jugás la final por la medalla de oro olímpica.' },
  { titulo: 'JJOO · por el oro', descripcion: 'Partido decisivo en los Juegos. El oro se define hoy.' },
  { titulo: 'JJOO · último cuarto', descripcion: 'Final olímpica pareja, se define en los últimos minutos.' },
]

export interface DecisionConvocatoria {
  torneo: TorneoSeleccion
  escenaTitulo: string
  escenaDescripcion: string
  // Un resultado por opción, ya resuelto (ver comentario de arriba).
  resultadoSiEquipo: boolean
  resultadoSiResponsabilidad: boolean
}

export function generarDecisionConvocatoria(torneo: TorneoSeleccion, azar: Azar): DecisionConvocatoria {
  const escenas = torneo === 'mundial' ? ESCENAS_MUNDIAL : ESCENAS_JJOO
  const escena = escenas[Math.floor(azar() * escenas.length)]
  return {
    torneo,
    escenaTitulo: escena.titulo,
    escenaDescripcion: escena.descripcion,
    resultadoSiEquipo: azar() < OPCIONES_CONVOCATORIA[0].probabilidadExito,
    resultadoSiResponsabilidad: azar() < OPCIONES_CONVOCATORIA[1].probabilidadExito,
  }
}

export function ganoConvocatoria(decision: DecisionConvocatoria, opcionId: string): boolean {
  return opcionId === 'tomar-la-responsabilidad' ? decision.resultadoSiResponsabilidad : decision.resultadoSiEquipo
}
