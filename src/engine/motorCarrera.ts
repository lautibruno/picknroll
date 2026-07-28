// Máquina de estados de la carrera: club/universidad inicial -> (posible) Draft -> NBA
// (trades) -> retiro. El Draft no es automático: depende de cruzar UMBRAL_DRAFT_OVR
// mientras estás en tu camino (universidad/G-League/internacional o liga doméstica real)
// — si nunca lo cruzás antes del retiro, la carrera entera transcurre sin pisar la NBA
// (ver MVP_SPEC.md §3). Cada decisión (según la velocidad elegida) alterna entre evento
// de equipo (trade/agencia libre), decisión de riesgo (arriesgar vs. jugar seguro) y,
// una vez en la vida de la carrera si la posición lo amerita, decisión de especialización
// (triplero/interior) — mismo patrón verificado jugando copero.com.ar/juegos/simulador-carrera.
import { generarPotencial, type Azar } from './potencial'
import { avanzarTemporada, clampOvr, type EstadoJugador } from './progresion'
import { elegirEquiposOfrecidos, elegirTraspasoOfrecido, type Equipo } from './eventos'
import { generarCrecimientoPorTraspaso } from './crecimientoPorTraspaso'
import { INTERVALO_TEMPORADAS_POR_DIFICULTAD, UMBRAL_DRAFT_OVR, type DificultadCarrera } from './caminosPreNba'
import { LIGAS_POR_PAIS } from './datos/ligasPorPais'
import { EQUIPOS_CAMINO_GENERICO } from './datos/equiposCaminoGenerico'
import { calcularEstadisticasTemporada, type EstadisticasTemporada } from './estadisticas'
import { evaluarTrofeosTemporada, TROFEOS_INICIALES, type Trofeos } from './trofeos'
import { generarDecisionRiesgo, type DecisionRiesgo } from './decisionesRiesgo'
import {
  OPCIONES_ESPECIALIZACION,
  tocaEventoEspecializacion,
  type OpcionEspecializacion,
  type TipoEspecializacion,
} from './especializacion'

export type { Equipo, DificultadCarrera, Trofeos, DecisionRiesgo, TipoEspecializacion }

const EDAD_INICIAL = 19
const EDAD_RETIRO = 40
const OVR_INICIAL_MIN = 40
const OVR_INICIAL_MAX = 50
const PROBABILIDAD_EVENTO_RIESGO_EN_NBA = 0.5
const PROBABILIDAD_EVENTO_RIESGO_PRE_NBA = 0.5

export type ModoCaminoPreNba = 'liga-domestica' | 'universidad'

export type EventoPendiente =
  | { tipo: 'club-liga-domestica' | 'draft' | 'trade'; opciones: Equipo[] }
  | { tipo: 'riesgo'; decision: DecisionRiesgo }
  | { tipo: 'especializacion'; opciones: OpcionEspecializacion[] }

export interface EntradaHistorial extends EstadisticasTemporada {
  edad: number
  ovr: number
  clubId: string | null
  clubNombre: string | null
  clubEscudoUrl: string | null
}

export interface ResultadoRiesgo {
  titulo: string
  texto: string
  delta: number
}

export interface Carrera {
  jugador: EstadoJugador
  nacionalidad: string
  posicion: string
  intervaloTemporadas: number
  fase: 'pre-nba' | 'nba'
  poolPreNba: Equipo[] // clubes/universidades disponibles antes del Draft — liga doméstica o camino genérico
  clubActual: Equipo | null
  especializacion: TipoEspecializacion | null
  eventoPendiente: EventoPendiente | null
  historial: EntradaHistorial[]
  trofeos: Trofeos
  ultimoResultadoRiesgo: ResultadoRiesgo | null
  retirado: boolean
}

export interface OpcionesCarrera {
  // Solo tiene efecto si la nacionalidad tiene liga doméstica curada (ver ligasPorPais.ts).
  // Sin especificar, usa liga doméstica si existe, o el camino genérico (universidad/
  // G-League/internacional) si no.
  modoCaminoPreNba?: ModoCaminoPreNba
  dificultad?: DificultadCarrera
}

export function crearCarrera(
  azar: Azar,
  codigoPaisNacionalidad: string,
  posicion: string,
  opciones: OpcionesCarrera = {},
): Carrera {
  const potencial = generarPotencial(azar)
  const ovr = OVR_INICIAL_MIN + Math.floor(azar() * (OVR_INICIAL_MAX - OVR_INICIAL_MIN + 1))

  const ligaDomestica = LIGAS_POR_PAIS[codigoPaisNacionalidad]
  const usaLigaDomestica = Boolean(ligaDomestica) && opciones.modoCaminoPreNba !== 'universidad'
  const poolPreNba = usaLigaDomestica ? ligaDomestica!.clubes : EQUIPOS_CAMINO_GENERICO

  const dificultad = opciones.dificultad ?? 'normal'

  return {
    jugador: { ovr, edad: EDAD_INICIAL, potencial },
    nacionalidad: codigoPaisNacionalidad,
    posicion,
    intervaloTemporadas: INTERVALO_TEMPORADAS_POR_DIFICULTAD[dificultad],
    fase: 'pre-nba',
    poolPreNba,
    clubActual: null,
    especializacion: null,
    eventoPendiente: { tipo: 'club-liga-domestica', opciones: elegirEquiposOfrecidos(poolPreNba, ovr, azar) },
    historial: [],
    trofeos: TROFEOS_INICIALES,
    ultimoResultadoRiesgo: null,
    retirado: false,
  }
}

export function elegirOpcion(carrera: Carrera, opcionId: string, azar: Azar): Carrera {
  if (!carrera.eventoPendiente) return carrera

  if (carrera.eventoPendiente.tipo === 'especializacion') {
    const opcion = OPCIONES_ESPECIALIZACION.find((o) => o.id === opcionId)
    if (!opcion) return carrera
    return { ...carrera, especializacion: opcion.id, eventoPendiente: null }
  }

  if (carrera.eventoPendiente.tipo === 'riesgo') {
    const decision = carrera.eventoPendiente.decision
    if (opcionId === 'seguro') {
      return {
        ...carrera,
        eventoPendiente: null,
        ultimoResultadoRiesgo: { titulo: decision.titulo, texto: 'Elegiste no arriesgar.', delta: 0 },
      }
    }
    if (opcionId === 'arriesgar') {
      const delta = decision.exito ? decision.deltaSiExito : decision.deltaSiFalla
      const jugador = { ...carrera.jugador, ovr: clampOvr(carrera.jugador.ovr + delta, carrera.jugador.potencial) }
      return {
        ...carrera,
        jugador,
        eventoPendiente: null,
        ultimoResultadoRiesgo: {
          titulo: decision.titulo,
          texto: decision.exito ? 'Salió bien.' : 'Salió mal.',
          delta,
        },
      }
    }
    return carrera
  }

  // 'club-liga-domestica', 'draft' o 'trade': todos ofrecen equipos reales.
  // Elegir equipo (incluso "quedarte") sube el OVR de forma azarosa — verificado
  // jugando Copero: cada selección resuelve la temporada y mueve el nivel del jugador.
  const equipo = carrera.eventoPendiente.opciones.find((e) => e.id === opcionId)
  if (!equipo) return carrera

  // En el Draft, elegir la opción de "quedarte" (tu club actual) declina por ahora —
  // seguís en pre-nba, el Draft vuelve a aparecer la próxima vez que cruces el umbral.
  const pasaANba = carrera.eventoPendiente.tipo === 'draft' && equipo.id !== carrera.clubActual?.id
  const crecimiento = generarCrecimientoPorTraspaso(azar)
  const jugador = { ...carrera.jugador, ovr: clampOvr(carrera.jugador.ovr + crecimiento, carrera.jugador.potencial) }

  return {
    ...carrera,
    jugador,
    clubActual: equipo,
    fase: pasaANba ? 'nba' : carrera.fase,
    eventoPendiente: null,
  }
}

export function avanzarSiCorresponde(carrera: Carrera, equiposNba: Equipo[], azar: Azar): Carrera {
  if (carrera.retirado || carrera.eventoPendiente) return carrera

  let jugador = carrera.jugador
  let trofeos = carrera.trofeos
  const historial: EntradaHistorial[] = [...carrera.historial]
  const nivelClub = carrera.clubActual?.nivel ?? null

  for (let i = 0; i < carrera.intervaloTemporadas; i++) {
    const jugadorAnterior = jugador
    jugador = avanzarTemporada(jugador, azar)

    const estadisticas = calcularEstadisticasTemporada(jugadorAnterior.ovr, nivelClub, carrera.fase, carrera.especializacion)
    historial.push({
      edad: jugadorAnterior.edad,
      ovr: jugadorAnterior.ovr,
      clubId: carrera.clubActual?.id ?? null,
      clubNombre: carrera.clubActual?.nombre ?? null,
      clubEscudoUrl: carrera.clubActual?.escudoUrl ?? null,
      ...estadisticas,
    })
    trofeos = evaluarTrofeosTemporada(trofeos, jugadorAnterior.ovr, nivelClub, carrera.fase, azar)

    if (jugador.edad >= EDAD_RETIRO) {
      return { ...carrera, jugador, historial, trofeos, retirado: true, eventoPendiente: null }
    }

    // El Draft no espera al intervalo de dificultad: se dispara apenas se cruza el
    // umbral, aunque estemos en medio de un bloque "Exprés" de varias temporadas.
    // Incluye la opción de quedarte en tu club/universidad actual — cruzar el umbral
    // te DA la chance de entrar al draft, no te obliga (pedido del usuario).
    if (carrera.fase === 'pre-nba' && jugador.ovr >= UMBRAL_DRAFT_OVR) {
      return {
        ...carrera,
        jugador,
        historial,
        trofeos,
        eventoPendiente: {
          tipo: 'draft',
          opciones: elegirTraspasoOfrecido(equiposNba, jugador.ovr, carrera.clubActual!, azar),
        },
      }
    }

    // Decisión de especialización (triplero/interior) — una sola vez en toda la carrera,
    // solo para posiciones de perímetro, en la ventana de edad "de mitad de carrera".
    if (tocaEventoEspecializacion(carrera.posicion, jugador.edad, carrera.especializacion !== null, azar)) {
      return {
        ...carrera,
        jugador,
        historial,
        trofeos,
        eventoPendiente: { tipo: 'especializacion', opciones: OPCIONES_ESPECIALIZACION },
      }
    }
  }

  if (carrera.fase === 'pre-nba') {
    // Alterna entre pase de club/universidad y decisión de riesgo, igual que en la NBA
    // — tanto liga doméstica curada como camino genérico tienen un pool real de equipos.
    // Siempre 3 opciones: 2 clubes distintos + quedarte en el actual (ver eventos.ts).
    const tocaRiesgo = azar() < PROBABILIDAD_EVENTO_RIESGO_PRE_NBA
    const eventoPendiente: EventoPendiente = tocaRiesgo
      ? { tipo: 'riesgo', decision: generarDecisionRiesgo(azar) }
      : {
          tipo: 'club-liga-domestica',
          opciones: elegirTraspasoOfrecido(carrera.poolPreNba, jugador.ovr, carrera.clubActual!, azar),
        }

    return { ...carrera, jugador, historial, trofeos, eventoPendiente }
  }

  // fase 'nba': alterna entre evento de trade/agencia libre y decisión de riesgo.
  // Siempre 3 opciones: 2 franquicias distintas + quedarte en la actual.
  const eventoPendiente: EventoPendiente =
    azar() < PROBABILIDAD_EVENTO_RIESGO_EN_NBA
      ? { tipo: 'riesgo', decision: generarDecisionRiesgo(azar) }
      : { tipo: 'trade', opciones: elegirTraspasoOfrecido(equiposNba, jugador.ovr, carrera.clubActual!, azar) }

  return { ...carrera, jugador, historial, trofeos, eventoPendiente }
}
