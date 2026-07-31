// Decisiones de riesgo — momentos donde el jugador elige entre arriesgar o ir a lo seguro.
//
// Rehecho tras el feedback del usuario ("la pregunta de competir o adaptarse es muy repetitiva,
// tiene que haber varias preguntas"): antes había 4 temas que siempre ofrecían los mismos dos
// botones. Ahora son 10 situaciones distintas, cada una con sus propias opciones y su propio
// nivel de impacto en el OVR.
//
// Tres niveles de impacto, con la misma relación 2:1 en los tres (ganar paga el doble de lo que
// cuesta perder, así arriesgar sigue siendo atractivo y no un castigo por animarse):
//   bajo  +2 / -1   · las más comunes, rutina y trabajo diario
//   medio +4 / -2   · pelean tu lugar en el equipo (estas además mueven el rol)
//   alto  +8 / -4   · raras, decisiones grandes de carrera
//
// Las cartas ya están sobre la mesa: el resultado se resuelve al GENERAR el evento, no al
// elegir, para que el revelado en vivo de la UI sea fiel a lo que va a pasar de verdad.
import type { Azar } from './potencial'

export type ImpactoRiesgo = 'bajo' | 'medio' | 'alto'

export const CAMBIO_OVR_POR_IMPACTO: Record<ImpactoRiesgo, { exito: number; fallo: number }> = {
  bajo: { exito: 2, fallo: -1 },
  medio: { exito: 4, fallo: -2 },
  alto: { exito: 8, fallo: -4 },
}

// Cuánto más probable es que toque una decisión de cada nivel. Las de impacto alto son
// deliberadamente raras (pedido del usuario: "muy pocas"), pero no tanto como para que una
// carrera entera pase sin ver ninguna.
const PESO_POR_IMPACTO: Record<ImpactoRiesgo, number> = { bajo: 3, medio: 2, alto: 1 }

interface TemaRiesgo {
  titulo: string
  descripcion: string
  probabilidadExito: number
  impacto: ImpactoRiesgo
  // Etiquetas propias de cada decisión — antes eran fijas ("Competir" / "Aceptar rotación").
  opcionArriesgar: string
  opcionSegura: string
  // Qué se lee en el revelado en vivo de la UI cuando sale bien o mal.
  revelarExito: string
  revelarFallo: string
  // Solo las que se pelean el lugar en el equipo mueven titular/rotación. Doblar turno en el
  // gimnasio no debería sacarte del equipo, así que esas solo mueven el OVR.
  afectaRol: boolean
  textoExito: string
  textoFallo: string
}

const TEMAS_RIESGO: TemaRiesgo[] = [
  // ---------- impacto bajo: rutina y trabajo diario ----------
  {
    titulo: 'Doble turno',
    descripcion: 'El preparador físico te ofrece una sesión extra después de cada práctica.',
    probabilidadExito: 0.65,
    impacto: 'bajo',
    opcionArriesgar: 'Doblar turno',
    opcionSegura: 'Cuidar el cuerpo',
    revelarExito: 'Rendiste',
    revelarFallo: 'Te pasó factura',
    afectaRol: false,
    textoExito: 'El doble turno te dejó más entero que nunca.',
    textoFallo: 'Llegaste fundido a los partidos.',
  },
  {
    titulo: '300 tiros por día',
    descripcion: 'Rutina de tiro a las siete de la mañana, todos los días, sin excusas.',
    probabilidadExito: 0.62,
    impacto: 'bajo',
    opcionArriesgar: 'Sumar la rutina',
    opcionSegura: 'Dormir bien',
    revelarExito: 'Entró todo',
    revelarFallo: 'No cuajó',
    afectaRol: false,
    textoExito: 'La muñeca quedó fina de tanto repetir.',
    textoFallo: 'Perdiste descanso y no se notó en la cancha.',
  },
  {
    titulo: 'Liga de verano',
    descripcion: 'Podés jugar la liga de verano en vez de parar en el receso.',
    probabilidadExito: 0.6,
    impacto: 'bajo',
    opcionArriesgar: 'Jugar el verano',
    opcionSegura: 'Descansar',
    revelarExito: 'Buen verano',
    revelarFallo: 'Verano largo',
    afectaRol: false,
    textoExito: 'Llegaste a la pretemporada con ritmo de partido.',
    textoFallo: 'Arrancaste la temporada con las piernas pesadas.',
  },
  {
    titulo: 'Cambio de posición',
    descripcion: 'El entrenador te quiere probar en otro puesto de la cancha.',
    probabilidadExito: 0.55,
    impacto: 'bajo',
    opcionArriesgar: 'Aceptar el cambio',
    opcionSegura: 'Quedarte donde estás',
    revelarExito: 'Te adaptaste',
    revelarFallo: 'No te salió',
    afectaRol: false,
    textoExito: 'Te soltaste en el puesto nuevo y sumaste recursos.',
    textoFallo: 'Nunca te sentiste cómodo y perdiste confianza.',
  },
  {
    titulo: 'Entrenar con el veterano',
    descripcion: 'Un referente del plantel te invita a su pretemporada personal.',
    probabilidadExito: 0.68,
    impacto: 'bajo',
    opcionArriesgar: 'Ir con él',
    opcionSegura: 'Entrenar por tu cuenta',
    revelarExito: 'Aprendiste',
    revelarFallo: 'No enganchaste',
    afectaRol: false,
    textoExito: 'Le robaste oficio a un tipo que ya ganó todo.',
    textoFallo: 'El ritmo te superó y volviste con más dudas.',
  },

  // ---------- impacto medio: tu lugar en el equipo ----------
  {
    titulo: 'Competencia por el puesto',
    descripcion: 'El club incorpora a otro jugador para pelear tu lugar en el equipo.',
    probabilidadExito: 0.5,
    impacto: 'medio',
    opcionArriesgar: 'Pelear la titularidad',
    opcionSegura: 'Aceptar rotación',
    revelarExito: 'Titular',
    revelarFallo: 'Rotación',
    afectaRol: true,
    textoExito: 'Le ganaste el puesto de igual a igual.',
    textoFallo: 'Perdiste terreno en el equipo.',
  },
  {
    titulo: 'Nuevo cuerpo técnico',
    descripcion: 'Cambia el entrenador y hay que ganarse la confianza desde cero.',
    probabilidadExito: 0.48,
    impacto: 'medio',
    opcionArriesgar: 'Competir',
    opcionSegura: 'Aceptar rotación',
    revelarExito: 'Titular',
    revelarFallo: 'Rotación',
    afectaRol: true,
    textoExito: 'El técnico nuevo te puso entre sus intocables.',
    textoFallo: 'No entraste en los planes del nuevo cuerpo técnico.',
  },
  {
    titulo: 'Vuelta de una lesión',
    descripcion: 'Volvés a estar disponible después de una molestia física.',
    probabilidadExito: 0.52,
    impacto: 'medio',
    opcionArriesgar: 'Volver a fondo',
    opcionSegura: 'Volver de a poco',
    revelarExito: 'Titular',
    revelarFallo: 'Rotación',
    afectaRol: true,
    textoExito: 'Volviste enchufado y recuperaste tu lugar.',
    textoFallo: 'La vuelta apurada te dejó a media máquina.',
  },

  // ---------- impacto alto: decisiones grandes de carrera ----------
  {
    titulo: 'Operarte o aguantar',
    descripcion: 'Una molestia crónica: la operación te saca media temporada, pero podés volver mejor.',
    probabilidadExito: 0.42,
    impacto: 'alto',
    opcionArriesgar: 'Operarte ahora',
    opcionSegura: 'Aguantar con infiltraciones',
    revelarExito: 'Salió perfecta',
    revelarFallo: 'Mala recuperación',
    afectaRol: false,
    textoExito: 'La operación salió impecable y volviste como nuevo.',
    textoFallo: 'La recuperación se complicó más de lo previsto.',
  },
  {
    titulo: 'Cambiar de representante',
    descripcion: 'Un agente top promete llevarte a otro nivel, pero podés quedar marcado.',
    probabilidadExito: 0.4,
    impacto: 'alto',
    opcionArriesgar: 'Cambiar de agente',
    opcionSegura: 'Seguir como estás',
    revelarExito: 'Te abrió puertas',
    revelarFallo: 'Quedaste marcado',
    afectaRol: false,
    textoExito: 'El agente nuevo te metió en otra conversación.',
    textoFallo: 'La salida ruidosa te dejó mal parado en el ambiente.',
  },
]

export interface DecisionRiesgo extends TemaRiesgo {
  exito: boolean // ya resuelto al generar el evento — mismo dado, solo se aplica al arriesgar
}

// Elige un tema con peso según el impacto (las de impacto alto salen mucho menos seguido).
function elegirTema(azar: Azar): TemaRiesgo {
  const pesoTotal = TEMAS_RIESGO.reduce((acc, t) => acc + PESO_POR_IMPACTO[t.impacto], 0)
  let restante = azar() * pesoTotal
  for (const tema of TEMAS_RIESGO) {
    restante -= PESO_POR_IMPACTO[tema.impacto]
    if (restante < 0) return tema
  }
  return TEMAS_RIESGO[TEMAS_RIESGO.length - 1]
}

export function generarDecisionRiesgo(azar: Azar): DecisionRiesgo {
  const tema = elegirTema(azar)
  return { ...tema, exito: azar() < tema.probabilidadExito }
}

// Cuánto mueve el OVR arriesgar y que salga bien o mal (pedido explícito del usuario: "cuando
// hay una decisión y la gano debe dar un incremento... y si perdés que reste"). Jugar seguro no
// mueve el OVR: es justamente la opción sin sorpresas.
export function cambioOvrPorRiesgo(decision: Pick<DecisionRiesgo, 'impacto' | 'exito'>): number {
  const cambio = CAMBIO_OVR_POR_IMPACTO[decision.impacto]
  return decision.exito ? cambio.exito : cambio.fallo
}

export const CANTIDAD_DECISIONES = TEMAS_RIESGO.length
export const TEMAS_PARA_TESTS = TEMAS_RIESGO
