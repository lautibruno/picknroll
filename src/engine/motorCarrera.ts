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
import { FALLBACK_LIGA_POR_PAIS } from './datos/fallbackLigas'
import { EQUIPOS_CAMINO_GENERICO } from './datos/equiposCaminoGenerico'
import { calcularEstadisticasTemporada, type EstadisticasTemporada, type Rol } from './estadisticas'
import {
  evaluarTrofeosTemporada,
  convocatoriaDisponible,
  probabilidadTituloLocal,
  TROFEOS_INICIALES,
  type Trofeos,
  type TrofeosGanadosTemporada,
  type TorneoSeleccion,
} from './trofeos'
import { cambioOvrPorRiesgo, generarDecisionRiesgo, type DecisionRiesgo } from './decisionesRiesgo'
import {
  generarDecisionConvocatoria,
  ganoConvocatoria,
  type DecisionConvocatoria,
} from './convocatorias'
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
  type ResultadoTemporadaRegular,
} from './playoffs'

export type { Equipo, DificultadCarrera, Trofeos, DecisionRiesgo, TipoEspecializacion }
export type { ResultadoTemporadaRegular } from './playoffs'

const EDAD_INICIAL = 19
const EDAD_RETIRO = 40
const OVR_INICIAL_MIN = 40
const OVR_INICIAL_MAX = 50
// Probabilidad bajada (pedido explícito del usuario: "sigue muy lleno de decisiones de
// titular/rotación y otras decisiones") — la mayoría de los turnos ahora son ofertas de
// club simples, la competencia por el puesto es la excepción, no la mitad de las veces.
// Bajadas de nuevo tras el feedback del usuario ("que no sea tan seguido"): ahora hay 10
// decisiones distintas (ver decisionesRiesgo.ts), pero aparecen menos veces.
const PROBABILIDAD_EVENTO_RIESGO_EN_NBA = 0.15
const PROBABILIDAD_EVENTO_RIESGO_PRE_NBA = 0.15

export type ModoCaminoPreNba = 'liga-domestica' | 'universidad'

export type EventoPendiente =
  | { tipo: 'club-liga-domestica' | 'draft' | 'trade'; opciones: Equipo[] }
  | { tipo: 'riesgo'; decision: DecisionRiesgo }
  | { tipo: 'especializacion'; opciones: OpcionEspecializacion[] }
  // resultadoSiFinta/resultadoSiTriple ya están resueltos al generar el evento (ver
  // playoffs.ts) — la UI puede mostrar un revelado en vivo fiel a lo que va a pasar de
  // verdad, sin tirar un dado nuevo cuando el jugador elige.
  | {
      tipo: 'jugada-final'
      rival: string
      escenaTitulo: string
      escenaDescripcion: string
      resultadoSiFinta: boolean
      resultadoSiTriple: boolean
    }
  // Mundial/JJOO — pedido explícito del usuario: "el mundial o los JJOO se ganan con una
  // decisión acertada" (ver convocatorias.ts).
  | { tipo: 'convocatoria'; decision: DecisionConvocatoria }

// Íconos de trofeo/convocatoria a mostrar en el historial (pedido explícito del usuario:
// "figurar como iconos reales de copas pequeñas en la lista de equipos en la temporada
// que se ganó") — ver src/ui/iconosTrofeos.tsx para el dibujo de cada uno.
export type IconoTrofeo = 'anillo' | 'allstar' | 'mvp' | 'mundial' | 'jjoo' | 'liga-local'

// Cartel de cierre de un título/torneo (anillo, Mundial/JJOO, liga local) que el jugador ve
// antes de poder seguir. Existe por un bug real reportado: "elegí tirar de 3, salió errado y
// gané el título igual" — el resultado de TU jugada quedaba tapado por lo que pasaba después.
//
// Ojo con el diseño: los desenlaces se ACUMULAN en una cola y NO reemplazan el turno. Segundo
// bug real reportado ("gané 3 títulos seguidos sin jugar, me salieron 3 carteles de campeón"):
// cuando un título cortaba el bloque de temporadas, cada "continuar" arrancaba una temporada
// nueva y un equipo dominante encadenaba campeonatos sin que apareciera ni una decisión. Ahora
// el bloque se juega completo, los títulos que salgan se encolan, y recién después viene la
// próxima decisión — que ya está lista detrás de los carteles.
export interface Desenlace {
  titulo: string
  texto: string
  gano: boolean
  iconos: IconoTrofeo[]
}

export interface EntradaHistorial extends EstadisticasTemporada {
  edad: number
  ovr: number
  clubId: string | null
  clubNombre: string | null
  clubEscudoUrl: string | null
  trofeosGanados: IconoTrofeo[]
}

function iconosDeGanados(ganados: TrofeosGanadosTemporada): IconoTrofeo[] {
  const iconos: IconoTrofeo[] = []
  if (ganados.allStar) iconos.push('allstar')
  if (ganados.mvp) iconos.push('mvp')
  return iconos
}

// Varios títulos se saben DESPUÉS de que la fila de esa temporada ya se empujó al historial
// (el anillo viene de ganar los playoffs; el Mundial/JJOO y la liga local, de resolver una
// decisión en un llamado posterior) — se agregan retroactivamente a la última fila.
function conTrofeoEnUltimaTemporada(historial: EntradaHistorial[], icono: IconoTrofeo): EntradaHistorial[] {
  if (historial.length === 0) return historial
  const copia = [...historial]
  const ultima = copia[copia.length - 1]
  copia[copia.length - 1] = { ...ultima, trofeosGanados: [...ultima.trofeosGanados, icono] }
  return copia
}

export interface ResultadoRiesgo {
  titulo: string
  texto: string
  // null cuando la decisión no toca el rol (las de impacto bajo/alto solo mueven el OVR).
  rol: Rol | null
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
  // Cola de títulos/torneos esperando que el jugador los vea (ver `Desenlace`). No frenan la
  // simulación: la próxima decisión ya viene resuelta detrás. Se vacían con `continuarCarrera`.
  desenlacesPendientes: Desenlace[]
  historial: EntradaHistorial[]
  trofeos: Trofeos
  // Liga doméstica del jugador (según nacionalidad), con la imagen real de su título — solo
  // si arrancó por liga curada, no por el camino genérico (universidad/G-League).
  ligaDomestica: { nombreLiga: string; trofeoUrl: string; trofeoEsCopaReal: boolean } | null
  // Temporadas consecutivas en el club actual — cuanto más te quedás, más chances de salir
  // campeón local (pedido del usuario, ver `probabilidadTituloLocal` en trofeos.ts).
  temporadasEnClubActual: number
  ultimoResultadoRiesgo: ResultadoRiesgo | null
  resumenTemporada: ResumenTemporada | null
  estadoPlayoffsPendiente: EstadoPlayoffsPendiente | null
  // OVR que tenía el jugador cuando se generó la decisión ANTERIOR (no la actual) — el ancla
  // para calcular cuánto cambió el OVR al resolverla. Bug real encontrado jugando: antes se
  // comparaba contra `historial.at(-2)`, que no corresponde a "antes de esta decisión" en
  // absoluto (con dificultad Normal/Exprés un bloque empuja 2-3 filas de historial de
  // golpe, todas con el mismo OVR) — el resultado era un "+N" que nunca se veía reflejado.
  ovrAlIniciarDecision: number
  ultimoCambioOvr: number
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

  // Si el país no tiene liga curada, cae a la liga regional/continental más fuerte (pedido
  // explícito del usuario: "en caso de que un país no tenga liga que te mande a la liga más
  // cercana para empezar") — ver fallbackLigas.ts. `us` y países no mapeados (código
  // desconocido, "Otro país") siguen sin liga real: caminoGenérico (universidad/G-League).
  const ligaDomestica =
    LIGAS_POR_PAIS[codigoPaisNacionalidad] ?? LIGAS_POR_PAIS[FALLBACK_LIGA_POR_PAIS[codigoPaisNacionalidad]]
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
    desenlacesPendientes: [],
    historial: [],
    trofeos: TROFEOS_INICIALES,
    ligaDomestica: usaLigaDomestica
      ? {
          nombreLiga: ligaDomestica!.nombreLiga,
          trofeoUrl: ligaDomestica!.trofeoUrl,
          trofeoEsCopaReal: ligaDomestica!.trofeoEsCopaReal,
        }
      : null,
    temporadasEnClubActual: 0,
    ultimoResultadoRiesgo: null,
    resumenTemporada: null,
    estadoPlayoffsPendiente: null,
    ovrAlIniciarDecision: ovr,
    ultimoCambioOvr: 0,
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
  //
  // NO encadena a la próxima temporada: deja un `desenlacePendiente` para que el jugador vea
  // el resultado de SU tiro antes de que el motor siga (ver comentario en `Desenlace` — bug
  // real reportado: errabas el tiro y aparecía el título de la temporada siguiente pegado).
  if (carrera.eventoPendiente.tipo === 'jugada-final') {
    const estado = carrera.estadoPlayoffsPendiente
    if (!estado) return { ...carrera, eventoPendiente: null }
    const gano = opcionId === 'triple' ? carrera.eventoPendiente.resultadoSiTriple : carrera.eventoPendiente.resultadoSiFinta
    const resumenBase = carrera.resumenTemporada ?? { victorias: 0, derrotas: 0, clasifico: true }
    const base = { ...carrera, eventoPendiente: null, estadoPlayoffsPendiente: null }

    const conResultadoDelTiro: Carrera = gano
      ? {
          ...base,
          trofeos: { ...carrera.trofeos, anillos: carrera.trofeos.anillos + 1 },
          historial: conTrofeoEnUltimaTemporada(carrera.historial, 'anillo'),
          resumenTemporada: { ...resumenBase, campeon: true },
          desenlacesPendientes: [
            ...carrera.desenlacesPendientes,
            {
              titulo: '¡Campeones!',
              texto: `La metiste y ganaste la Final contra ${estado.rival}. Sos campeón de la NBA.`,
              gano: true,
              iconos: ['anillo'],
            },
          ],
        }
      : {
          ...base,
          resumenTemporada: {
            ...resumenBase,
            eliminado: { ronda: estado.ronda, rival: estado.rival, marcador: '1-2' },
          },
          desenlacesPendientes: [
            ...carrera.desenlacesPendientes,
            {
              titulo: 'Se escapó',
              texto: `Erraste el tiro decisivo y ${estado.rival} se llevó la Final. Sin anillo esta vez.`,
              gano: false,
              iconos: [],
            },
          ],
        }

    return avanzarSiCorresponde(conResultadoDelTiro, equiposNba, azar)
  }

  // Mundial / JJOO — ganarlo depende de esta decisión (pedido explícito del usuario). Mismo
  // criterio que la jugada final: para acá y deja el desenlace a la vista.
  if (carrera.eventoPendiente.tipo === 'convocatoria') {
    const decision = carrera.eventoPendiente.decision
    const gano = ganoConvocatoria(decision, opcionId)
    const esMundial = decision.torneo === 'mundial'
    const icono: IconoTrofeo = esMundial ? 'mundial' : 'jjoo'
    const nombreTorneo = esMundial ? 'el Mundial' : 'los Juegos Olímpicos'
    const base = { ...carrera, eventoPendiente: null }

    const conResultadoDelTorneo: Carrera = gano
      ? {
          ...base,
          trofeos: esMundial
            ? { ...carrera.trofeos, mundial: carrera.trofeos.mundial + 1 }
            : { ...carrera.trofeos, jjoo: carrera.trofeos.jjoo + 1 },
          historial: conTrofeoEnUltimaTemporada(carrera.historial, icono),
          desenlacesPendientes: [
            ...carrera.desenlacesPendientes,
            {
              titulo: esMundial ? '¡Campeón del mundo!' : '¡Medalla de oro!',
              texto: `Saliste campeón de ${nombreTorneo} con tu selección.`,
              gano: true,
              iconos: [icono],
            },
          ],
        }
      : {
          ...base,
          desenlacesPendientes: [
            ...carrera.desenlacesPendientes,
            {
              titulo: 'Sin título',
              texto: `Se te escapó ${nombreTorneo} con tu selección.`,
              gano: false,
              iconos: [],
            },
          ],
        }

    return avanzarSiCorresponde(conResultadoDelTorneo, equiposNba, azar)
  }

  // Decisión de riesgo (ver decisionesRiesgo.ts). Arriesgar mueve el OVR según el impacto de la
  // decisión, y SOLO las que se pelean el lugar en el equipo (`afectaRol`) cambian además el rol
  // titular/rotación — doblar turno en el gimnasio no debería sacarte del equipo.
  if (carrera.eventoPendiente.tipo === 'riesgo') {
    const decision = carrera.eventoPendiente.decision

    if (opcionId === 'seguro') {
      return avanzarSiCorresponde(
        {
          ...carrera,
          rolForzado: decision.afectaRol ? 'rotacion' : carrera.rolForzado,
          eventoPendiente: null,
          ultimoResultadoRiesgo: {
            titulo: decision.titulo,
            texto: decision.afectaRol ? 'Aceptaste un lugar en rotación.' : 'Elegiste no arriesgar.',
            // `rol: null` cuando la decisión no era sobre tu lugar en el equipo — si no, el chip
            // de la UI diría "TITULAR" por un rol que venía de antes y no tiene que ver.
            rol: decision.afectaRol ? 'rotacion' : null,
          },
        },
        equiposNba,
        azar,
      )
    }

    if (opcionId === 'arriesgar') {
      const cambio = cambioOvrPorRiesgo(decision)
      const jugador = { ...carrera.jugador, ovr: clampOvr(carrera.jugador.ovr + cambio, carrera.jugador.potencial) }
      const rol: Rol | null = decision.afectaRol ? (decision.exito ? 'titular' : 'rotacion') : carrera.rolForzado
      return avanzarSiCorresponde(
        {
          ...carrera,
          jugador,
          rolForzado: rol,
          eventoPendiente: null,
          ultimoResultadoRiesgo: {
            titulo: decision.titulo,
            texto: `${decision.exito ? decision.textoExito : decision.textoFallo} ${cambio > 0 ? '+' : ''}${cambio} de OVR.`,
            rol: decision.afectaRol ? rol : null,
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

  const sigueEnElMismoClub = equipo.id === carrera.clubActual?.id

  return avanzarSiCorresponde(
    {
      ...carrera,
      jugador,
      clubActual: equipo,
      // Firmar en otro club reinicia el contador de antigüedad (y con él las chances de
      // campeonato local, ver `probabilidadTituloLocal`); quedarse lo conserva.
      temporadasEnClubActual: sigueEnElMismoClub ? carrera.temporadasEnClubActual : 0,
      rolForzado: null,
      fase: pasaANba ? 'nba' : carrera.fase,
      eventoPendiente: null,
    },
    equiposNba,
    azar,
  )
}

// Descarta el cartel de título que el jugador acaba de ver y deja el siguiente de la cola (si
// hay). NO avanza la carrera: la próxima decisión ya venía resuelta detrás de los carteles —
// ver el comentario de `Desenlace` para por qué es así y no al revés.
export function continuarCarrera(carrera: Carrera): Carrera {
  if (carrera.desenlacesPendientes.length === 0) return carrera
  return { ...carrera, desenlacesPendientes: carrera.desenlacesPendientes.slice(1) }
}

export function avanzarSiCorresponde(carrera: Carrera, equiposNba: Equipo[], azar: Azar): Carrera {
  if (carrera.retirado || carrera.eventoPendiente) return carrera

  let jugador = carrera.jugador
  let trofeos = carrera.trofeos
  let resumenTemporada = carrera.resumenTemporada
  let temporadasEnClub = carrera.temporadasEnClubActual
  const historial: EntradaHistorial[] = [...carrera.historial]
  const nivelClub = carrera.clubActual?.nivel ?? null
  // Títulos que salgan durante este bloque de temporadas — se acumulan y se muestran junto con
  // la próxima decisión, sin cortar la simulación (ver `Desenlace`).
  const desenlaces: Desenlace[] = [...carrera.desenlacesPendientes]

  // Cierra el turno: calcula cuánto cambió el OVR desde que se generó la decisión anterior
  // (el ancla guardada en `carrera.ovrAlIniciarDecision`) y deja un ancla nueva para la
  // decisión que se está por mostrar. Se llama en cada punto donde este bloque termina
  // generando una nueva decisión (draft/especialización/riesgo/trade/club/jugada-final).
  function conProximaDecision(eventoPendiente: EventoPendiente, extra: Partial<Carrera> = {}): Carrera {
    return {
      ...carrera,
      jugador,
      historial,
      trofeos,
      resumenTemporada,
      temporadasEnClubActual: temporadasEnClub,
      eventoPendiente,
      desenlacesPendientes: desenlaces,
      ultimoCambioOvr: jugador.ovr - carrera.ovrAlIniciarDecision,
      ovrAlIniciarDecision: jugador.ovr,
      ...extra,
    }
  }

  for (let i = 0; i < carrera.intervaloTemporadas; i++) {
    const jugadorAnterior = jugador
    jugador = avanzarTemporada(jugador, azar)
    temporadasEnClub += 1

    const estadisticas = calcularEstadisticasTemporada(
      jugadorAnterior.ovr,
      nivelClub,
      carrera.fase,
      carrera.especializacion,
      carrera.rolForzado,
    )
    const { trofeos: trofeosActualizados, ganados } = evaluarTrofeosTemporada(
      trofeos,
      jugadorAnterior.ovr,
      carrera.fase,
      azar,
    )
    trofeos = trofeosActualizados
    historial.push({
      edad: jugadorAnterior.edad,
      ovr: jugadorAnterior.ovr,
      clubId: carrera.clubActual?.id ?? null,
      clubNombre: carrera.clubActual?.nombre ?? null,
      clubEscudoUrl: carrera.clubActual?.escudoUrl ?? null,
      trofeosGanados: iconosDeGanados(ganados),
      ...estadisticas,
    })

    // Título de la liga doméstica — solo en fase pre-nba y solo si la nacionalidad tiene liga
    // curada (pedido explícito del usuario: "se debería poder salir campeón de la liga local
    // en la que estás jugando"). Más probable cuanto más tiempo llevás en el mismo club.
    if (
      carrera.fase === 'pre-nba' &&
      carrera.ligaDomestica &&
      carrera.clubActual &&
      azar() < probabilidadTituloLocal(nivelClub ?? 50, jugadorAnterior.ovr, temporadasEnClub)
    ) {
      trofeos = { ...trofeos, ligaLocal: trofeos.ligaLocal + 1 }
      historial[historial.length - 1] = {
        ...historial[historial.length - 1],
        trofeosGanados: [...historial[historial.length - 1].trofeosGanados, 'liga-local'],
      }
      desenlaces.push({
        titulo: '¡Campeón!',
        texto: `Saliste campeón de la ${carrera.ligaDomestica.nombreLiga} con ${carrera.clubActual.nombre}.`,
        gano: true,
        iconos: ['liga-local'],
      })
    }


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
        const resultado = simularPlayoffs(nivelEquipo, jugadorAnterior.ovr, azar, equiposNba, carrera.clubActual?.id ?? null)
        if (resultado.estado === 'pendiente') {
          return conProximaDecision(
            {
              tipo: 'jugada-final',
              rival: resultado.rival,
              escenaTitulo: resultado.escena.titulo,
              escenaDescripcion: resultado.escena.descripcion,
              resultadoSiFinta: resultado.resultadoSiFinta,
              resultadoSiTriple: resultado.resultadoSiTriple,
            },
            { estadoPlayoffsPendiente: { nivelEquipo, ronda: resultado.ronda, rival: resultado.rival } },
          )
        }
        if (resultado.estado === 'campeon') {
          trofeos = { ...trofeos, anillos: trofeos.anillos + 1 }
          resumenTemporada = { ...regular, campeon: true }
          const ultima = historial[historial.length - 1]
          historial[historial.length - 1] = { ...ultima, trofeosGanados: [...ultima.trofeosGanados, 'anillo'] }
          desenlaces.push({
            titulo: '¡Campeones!',
            texto: `Ganaste la Final contra ${resultado.rival}. Sos campeón de la NBA.`,
            gano: true,
            iconos: ['anillo'],
          })
        } else {
          resumenTemporada = {
            ...regular,
            eliminado: { ronda: resultado.ronda, rival: resultado.rival, marcador: resultado.marcador },
          }
        }
      }
    }

    // Convocatoria a la selección (Mundial/JJOO) — ser convocado depende del calendario y de tu
    // OVR; ganarlo, de la decisión que tomes (pedido explícito del usuario). Va DESPUÉS de la
    // temporada y los playoffs, como en la realidad (la selección juega en el receso) — antes
    // estaba antes y en año de Mundial te salteabas los playoffs de esa temporada.
    const torneo: TorneoSeleccion | null = convocatoriaDisponible(
      jugadorAnterior.ovr,
      jugadorAnterior.edad,
      carrera.fase,
    )
    if (torneo) {
      return conProximaDecision({ tipo: 'convocatoria', decision: generarDecisionConvocatoria(torneo, azar) })
    }

    if (jugador.edad >= EDAD_RETIRO) {
      return {
        ...carrera,
        jugador,
        historial,
        trofeos,
        resumenTemporada,
        temporadasEnClubActual: temporadasEnClub,
        retirado: true,
        eventoPendiente: null,
        desenlacesPendientes: desenlaces,
      }
    }

    // El Draft no espera al intervalo de dificultad: se dispara apenas se cruza el
    // umbral, aunque estemos en medio de un bloque "Exprés" de varias temporadas.
    // Incluye la opción de quedarte en tu club/universidad actual — cruzar el umbral
    // te DA la chance de entrar al draft, no te obliga (pedido del usuario).
    if (carrera.fase === 'pre-nba' && jugador.ovr >= UMBRAL_DRAFT_OVR) {
      return conProximaDecision({
        tipo: 'draft',
        opciones: elegirTraspasoOfrecido(equiposNba, jugador.ovr, carrera.clubActual!, azar),
      })
    }

    // Decisión de especialización (triplero/interior) — una sola vez en toda la carrera,
    // solo para posiciones de perímetro, en la ventana de edad "de mitad de carrera".
    if (tocaEventoEspecializacion(carrera.posicion, jugador.edad, carrera.especializacion !== null, azar)) {
      return conProximaDecision({ tipo: 'especializacion', opciones: OPCIONES_ESPECIALIZACION })
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

    return conProximaDecision(eventoPendiente)
  }

  // fase 'nba': alterna entre evento de trade/agencia libre y decisión de riesgo.
  // Siempre 3 opciones: 2 franquicias distintas + quedarte en la actual.
  const eventoPendiente: EventoPendiente =
    azar() < PROBABILIDAD_EVENTO_RIESGO_EN_NBA
      ? { tipo: 'riesgo', decision: generarDecisionRiesgo(azar) }
      : { tipo: 'trade', opciones: elegirTraspasoOfrecido(equiposNba, jugador.ovr, carrera.clubActual!, azar) }

  return conProximaDecision(eventoPendiente)
}
