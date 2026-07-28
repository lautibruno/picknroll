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
import { calcularEstadisticasTemporada, type EstadisticasTemporada, type Rol } from './estadisticas'
import { evaluarTrofeosTemporada, TROFEOS_INICIALES, type Trofeos } from './trofeos'
import { generarDecisionRiesgo, type DecisionRiesgo } from './decisionesRiesgo'
import {
  OPCIONES_ESPECIALIZACION,
  tocaEventoEspecializacion,
  type OpcionEspecializacion,
  type TipoEspecializacion,
} from './especializacion'
import {
  nivelEquipoCombinado,
  simularTemporadaRegular,
  simularPlayoffs,
  resolverJugadaFinal,
  type ResultadoTemporadaRegular,
} from './playoffs'

export type { Equipo, DificultadCarrera, Trofeos, DecisionRiesgo, TipoEspecializacion }
export type { ResultadoTemporadaRegular } from './playoffs'

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
  | { tipo: 'jugada-final'; rival: string }

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
  rol: Rol
}

// Resumen de cómo le fue al equipo en la temporada regular NBA recién jugada, y en
// playoffs si clasificó — se muestra en PantallaProgreso (pedido del usuario: "que haya
// mensajería de cómo nos fue en cada temporada"). Solo se genera en fase NBA.
export interface ResumenTemporada extends ResultadoTemporadaRegular {
  campeon?: boolean
  eliminado?: { ronda: number; rival: string; marcador: string }
}

// Estado intermedio que se guarda solo mientras hay una jugada final (evento
// 'jugada-final') pendiente de resolver — necesario para poder retomar la simulación de
// playoffs justo donde quedó una vez que el jugador elige la opción.
interface EstadoPlayoffsPendiente {
  nivelEquipo: number
  ronda: number
  rival: string
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
  // Última "competencia por el puesto" resuelta (ver decisionesRiesgo.ts) — se limpia al
  // firmar por un club nuevo (plantel nuevo, terreno neutro otra vez).
  rolForzado: Rol | null
  eventoPendiente: EventoPendiente | null
  historial: EntradaHistorial[]
  trofeos: Trofeos
  ultimoResultadoRiesgo: ResultadoRiesgo | null
  resumenTemporada: ResumenTemporada | null
  estadoPlayoffsPendiente: EstadoPlayoffsPendiente | null
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
    rolForzado: null,
    eventoPendiente: { tipo: 'club-liga-domestica', opciones: elegirEquiposOfrecidos(poolPreNba, ovr, azar) },
    historial: [],
    trofeos: TROFEOS_INICIALES,
    ultimoResultadoRiesgo: null,
    resumenTemporada: null,
    estadoPlayoffsPendiente: null,
    retirado: false,
  }
}

// Resuelve la decisión pendiente y ENCADENA directo a la próxima (jugando copero.com.ar
// en vivo: ahí no hay pantalla intermedia de "seguir jugando" entre decisiones — se
// resuelve y ya te muestra la siguiente). `equiposNba` hace falta acá (no solo en
// avanzarSiCorresponde) porque el encadenado puede terminar generando un trade/draft NBA.
export function elegirOpcion(carrera: Carrera, opcionId: string, azar: Azar, equiposNba: Equipo[]): Carrera {
  if (!carrera.eventoPendiente) return carrera

  if (carrera.eventoPendiente.tipo === 'especializacion') {
    const opcion = OPCIONES_ESPECIALIZACION.find((o) => o.id === opcionId)
    if (!opcion) return carrera
    return avanzarSiCorresponde({ ...carrera, especializacion: opcion.id, eventoPendiente: null }, equiposNba, azar)
  }

  // La jugada final de la Final de playoffs — resuelve el partido decisivo (2-1) y, como
  // es siempre la última ronda, termina ahí mismo la serie: gana = campeón real (anillo),
  // pierde = eliminado en la Final. No hay rondas para retomar después de esto.
  if (carrera.eventoPendiente.tipo === 'jugada-final') {
    const estado = carrera.estadoPlayoffsPendiente
    if (!estado) return { ...carrera, eventoPendiente: null }
    const gano = resolverJugadaFinal(opcionId, azar)
    const resumenBase = carrera.resumenTemporada ?? { victorias: 0, derrotas: 0, clasifico: true }
    if (gano) {
      return avanzarSiCorresponde(
        {
          ...carrera,
          trofeos: { ...carrera.trofeos, anillos: carrera.trofeos.anillos + 1 },
          resumenTemporada: { ...resumenBase, campeon: true },
          eventoPendiente: null,
          estadoPlayoffsPendiente: null,
        },
        equiposNba,
        azar,
      )
    }
    return avanzarSiCorresponde(
      {
        ...carrera,
        resumenTemporada: {
          ...resumenBase,
          eliminado: { ronda: estado.ronda, rival: estado.rival, marcador: '1-2' },
        },
        eventoPendiente: null,
        estadoPlayoffsPendiente: null,
      },
      equiposNba,
      azar,
    )
  }

  // Decisión de riesgo — rehecha jugando Copero: NO mueve el OVR directo, cambia el ROL
  // (titular/rotación), que después modula cuánto crecés en tu próximo fichaje (ver
  // crecimientoPorTraspaso.ts) y tus estadísticas mientras tanto (ver estadisticas.ts).
  if (carrera.eventoPendiente.tipo === 'riesgo') {
    const decision = carrera.eventoPendiente.decision
    if (opcionId === 'seguro') {
      return avanzarSiCorresponde(
        {
          ...carrera,
          rolForzado: 'rotacion',
          eventoPendiente: null,
          ultimoResultadoRiesgo: { titulo: decision.titulo, texto: 'Aceptaste un lugar en rotación.', rol: 'rotacion' },
        },
        equiposNba,
        azar,
      )
    }
    if (opcionId === 'arriesgar') {
      const rol: Rol = decision.exito ? 'titular' : 'rotacion'
      return avanzarSiCorresponde(
        {
          ...carrera,
          rolForzado: rol,
          eventoPendiente: null,
          ultimoResultadoRiesgo: {
            titulo: decision.titulo,
            texto: decision.exito ? 'Ganaste la titularidad.' : 'Perdiste terreno en el equipo.',
            rol,
          },
        },
        equiposNba,
        azar,
      )
    }
    return carrera
  }

  // 'club-liga-domestica', 'draft' o 'trade': todos ofrecen equipos reales. El crecimiento
  // de OVR sale de acá — un club bien por encima de tu nivel actual da un salto grande, uno
  // similar o más chico da un salto chico (ver crecimientoPorTraspaso.ts). El rol forzado
  // se resetea: plantel nuevo, terreno neutro otra vez.
  const equipo = carrera.eventoPendiente.opciones.find((e) => e.id === opcionId)
  if (!equipo) return carrera

  // En el Draft, elegir la opción de "quedarte" (tu club actual) declina por ahora —
  // seguís en pre-nba, el Draft vuelve a aparecer la próxima vez que cruces el umbral.
  const pasaANba = carrera.eventoPendiente.tipo === 'draft' && equipo.id !== carrera.clubActual?.id
  const crecimiento = generarCrecimientoPorTraspaso(
    carrera.jugador.ovr,
    equipo.nivel,
    carrera.intervaloTemporadas,
    carrera.rolForzado,
    azar,
  )
  const jugador = { ...carrera.jugador, ovr: clampOvr(carrera.jugador.ovr + crecimiento, carrera.jugador.potencial) }

  return avanzarSiCorresponde(
    {
      ...carrera,
      jugador,
      clubActual: equipo,
      rolForzado: null,
      fase: pasaANba ? 'nba' : carrera.fase,
      eventoPendiente: null,
    },
    equiposNba,
    azar,
  )
}

export function avanzarSiCorresponde(carrera: Carrera, equiposNba: Equipo[], azar: Azar): Carrera {
  if (carrera.retirado || carrera.eventoPendiente) return carrera

  let jugador = carrera.jugador
  let trofeos = carrera.trofeos
  let resumenTemporada = carrera.resumenTemporada
  const historial: EntradaHistorial[] = [...carrera.historial]
  const nivelClub = carrera.clubActual?.nivel ?? null

  for (let i = 0; i < carrera.intervaloTemporadas; i++) {
    const jugadorAnterior = jugador
    jugador = avanzarTemporada(jugador, azar)

    const estadisticas = calcularEstadisticasTemporada(
      jugadorAnterior.ovr,
      nivelClub,
      carrera.fase,
      carrera.especializacion,
      carrera.rolForzado,
    )
    historial.push({
      edad: jugadorAnterior.edad,
      ovr: jugadorAnterior.ovr,
      clubId: carrera.clubActual?.id ?? null,
      clubNombre: carrera.clubActual?.nombre ?? null,
      clubEscudoUrl: carrera.clubActual?.escudoUrl ?? null,
      ...estadisticas,
    })
    trofeos = evaluarTrofeosTemporada(trofeos, jugadorAnterior.ovr, carrera.fase, azar)

    // Temporada regular + playoffs simulados — solo en fase NBA (pedido del usuario:
    // "implementar para jugar playoffs... cuando clasificamos que haya una simulación de
    // los partidos contra un rival ficticio"). Se simula la temporada entera del jugador
    // (jugadorAnterior.ovr, el nivel de arranque de esa temporada, mismo criterio que
    // estadísticas/trofeos) y, si clasifica, la corrida de playoffs — que puede pausarse
    // en la Final pidiendo la jugada final (ver playoffs.ts).
    if (carrera.fase === 'nba') {
      const nivelEquipo = nivelEquipoCombinado(nivelClub, jugadorAnterior.ovr)
      const regular = simularTemporadaRegular(nivelEquipo, azar)
      resumenTemporada = { ...regular }

      if (regular.clasifico) {
        const resultado = simularPlayoffs(nivelEquipo, jugadorAnterior.ovr, azar)
        if (resultado.estado === 'pendiente') {
          return {
            ...carrera,
            jugador,
            historial,
            trofeos,
            resumenTemporada,
            estadoPlayoffsPendiente: { nivelEquipo, ronda: resultado.ronda, rival: resultado.rival },
            eventoPendiente: { tipo: 'jugada-final', rival: resultado.rival },
          }
        }
        if (resultado.estado === 'campeon') {
          trofeos = { ...trofeos, anillos: trofeos.anillos + 1 }
          resumenTemporada = { ...regular, campeon: true }
        } else {
          resumenTemporada = {
            ...regular,
            eliminado: { ronda: resultado.ronda, rival: resultado.rival, marcador: resultado.marcador },
          }
        }
      }
    }

    if (jugador.edad >= EDAD_RETIRO) {
      return { ...carrera, jugador, historial, trofeos, resumenTemporada, retirado: true, eventoPendiente: null }
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
        resumenTemporada,
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
        resumenTemporada,
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

    return { ...carrera, jugador, historial, trofeos, resumenTemporada, eventoPendiente }
  }

  // fase 'nba': alterna entre evento de trade/agencia libre y decisión de riesgo.
  // Siempre 3 opciones: 2 franquicias distintas + quedarte en la actual.
  const eventoPendiente: EventoPendiente =
    azar() < PROBABILIDAD_EVENTO_RIESGO_EN_NBA
      ? { tipo: 'riesgo', decision: generarDecisionRiesgo(azar) }
      : { tipo: 'trade', opciones: elegirTraspasoOfrecido(equiposNba, jugador.ovr, carrera.clubActual!, azar) }

  return { ...carrera, jugador, historial, trofeos, resumenTemporada, eventoPendiente }
}
