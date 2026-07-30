import { describe, expect, it } from 'vitest'
import {
  crearCarrera,
  elegirOpcion,
  avanzarSiCorresponde,
  continuarCarrera,
  type Carrera,
  type Equipo,
} from './motorCarrera'
import { UMBRAL_DRAFT_OVR } from './caminosPreNba'
import { OVR_GANADO_AL_COMPETIR, OVR_PERDIDO_AL_FALLAR } from './decisionesRiesgo'

const EQUIPOS_NBA: Equipo[] = [
  { id: 'a', nombre: 'A', nivel: 40 },
  { id: 'b', nombre: 'B', nivel: 45 },
  { id: 'c', nombre: 'C', nivel: 50 },
]

function azarFijo(valor: number): () => number {
  return () => valor
}

// Devuelve `primero` la primera vez que se llama, y `resto` todas las veces después —
// hace falta para aislar la resolución de la jugada final del "encadenado" que sigue
// dentro del mismo elegirOpcion (ver motorCarrera.ts): un azar constante afecta por igual
// la resolución de la jugada final Y la temporada siguiente que arranca al toque.
function azarUnaVezLuego(primero: number, resto: number): () => number {
  let usado = false
  return () => {
    if (usado) return resto
    usado = true
    return primero
  }
}

// Resuelve el evento pendiente tomando siempre la primera opción / jugando seguro en las
// decisiones de riesgo — para avanzar los tests sin importar qué tipo de evento toque.
// elegirOpcion ya encadena directo a la próxima decisión (ver motorCarrera.ts), así que
// una sola llamada acá resuelve Y avanza, no hace falta combinarla con avanzarSiCorresponde.
function resolverPendiente(carrera: Carrera): Carrera {
  // Los títulos frenan la carrera hasta que el jugador los ve (ver `Desenlace`): en los tests
  // se destraban al toque para poder seguir avanzando.
  if (carrera.desenlacePendiente) return continuarCarrera(carrera, azarFijo(0.5), EQUIPOS_NBA)
  if (!carrera.eventoPendiente) return carrera
  if (carrera.eventoPendiente.tipo === 'riesgo') return elegirOpcion(carrera, 'seguro', azarFijo(0.5), EQUIPOS_NBA)
  if (carrera.eventoPendiente.tipo === 'jugada-final') return elegirOpcion(carrera, 'finta', azarFijo(0.01), EQUIPOS_NBA)
  if (carrera.eventoPendiente.tipo === 'convocatoria') {
    return elegirOpcion(carrera, 'jugar-para-el-equipo', azarFijo(0.01), EQUIPOS_NBA)
  }
  return elegirOpcion(carrera, carrera.eventoPendiente.opciones[0].id, azarFijo(0.5), EQUIPOS_NBA)
}

// Destraba todos los desenlaces (títulos) encadenados hasta llegar a una decisión real.
function sinDesenlace(carrera: Carrera, azar: () => number = azarFijo(0.5)): Carrera {
  let actual = carrera
  let vueltas = 0
  while (actual.desenlacePendiente && vueltas < 50) {
    actual = continuarCarrera(actual, azar, EQUIPOS_NBA)
    vueltas++
  }
  return actual
}

function opcionesDe(carrera: Carrera): { id: string }[] {
  const evento = carrera.eventoPendiente!
  if (evento.tipo === 'riesgo' || evento.tipo === 'jugada-final' || evento.tipo === 'convocatoria') {
    throw new Error('este evento no tiene .opciones')
  }
  return evento.opciones
}

// Deja la carrera parada exactamente en el evento de Draft, con un OVR/potencial ya
// preparados para que un solo club top alcance para cruzar el umbral — evita pelear con
// la selección al azar del pool real (ver eventos.ts, elegirSinRepetir), que no importa
// para lo que este archivo quiere probar: el comportamiento del propio motor de estados.
function conEventoDraft(carrera: Carrera, nivelClubTop = 90): Carrera {
  return {
    ...carrera,
    jugador: { ...carrera.jugador, ovr: 50, potencial: Math.max(carrera.jugador.potencial, 95) },
    eventoPendiente: { tipo: 'draft', opciones: [{ id: 'top', nombre: 'Top Club', nivel: nivelClubTop }, ...EQUIPOS_NBA] },
  }
}

describe('motorCarrera', () => {
  it('crea una carrera en fase pre-nba con edad 19 y OVR inicial bajo', () => {
    const carrera = crearCarrera(azarFijo(0.1), 'us', 'C')
    expect(carrera.fase).toBe('pre-nba')
    expect(carrera.jugador.edad).toBe(19)
    expect(carrera.jugador.ovr).toBeGreaterThanOrEqual(40)
    expect(carrera.jugador.ovr).toBeLessThanOrEqual(50)
    expect(carrera.jugador.potencial).toBeGreaterThanOrEqual(60)
    expect(carrera.retirado).toBe(false)
    expect(carrera.clubActual).toBeNull()
  })

  it('con nacionalidad sin liga curada (ej. Estados Unidos), arranca ofreciendo equipos del camino genérico (universidad/G-League/internacional)', () => {
    const carrera = crearCarrera(azarFijo(0.1), 'us', 'C')
    expect(carrera.eventoPendiente?.tipo).toBe('club-liga-domestica')
    expect(opcionesDe(carrera).length).toBeGreaterThan(0)
    for (const opcion of opcionesDe(carrera)) {
      expect(opcion.id.startsWith('gen-')).toBe(true)
    }
  })

  it('con nacionalidad argentina, arranca ofreciendo clubes reales de la Liga Nacional de Básquet', () => {
    const carrera = crearCarrera(azarFijo(0.1), 'ar', 'C')
    expect(carrera.eventoPendiente?.tipo).toBe('club-liga-domestica')
    for (const opcion of opcionesDe(carrera)) {
      expect(opcion.id.startsWith('ar-')).toBe(true)
    }
  })

  it('con nacionalidad española, arranca ofreciendo clubes reales de la Liga ACB', () => {
    const carrera = crearCarrera(azarFijo(0.1), 'es', 'C')
    expect(carrera.eventoPendiente?.tipo).toBe('club-liga-domestica')
    for (const opcion of opcionesDe(carrera)) {
      expect(opcion.id.startsWith('es-')).toBe(true)
    }
  })

  it('con nacionalidad argentina pero eligiendo modo "universidad", ofrece el camino genérico igual', () => {
    const carrera = crearCarrera(azarFijo(0.1), 'ar', 'C', { modoCaminoPreNba: 'universidad' })
    for (const opcion of opcionesDe(carrera)) {
      expect(opcion.id.startsWith('gen-')).toBe(true)
    }
  })

  it('elegir un club de liga doméstica lo guarda como clubActual, sigue en fase pre-nba, y ya deja la próxima decisión lista (sin pantalla intermedia)', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'ar', 'C')
    const opcion = opcionesDe(carrera)[0]
    carrera = elegirOpcion(carrera, opcion.id, azarFijo(0.5), EQUIPOS_NBA)
    expect(carrera.clubActual?.id).toBe(opcion.id)
    expect(carrera.fase).toBe('pre-nba')
    expect(carrera.eventoPendiente).not.toBeNull()
  })

  it('elegir una universidad del camino genérico lo guarda como clubActual', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'C')
    const opcion = opcionesDe(carrera)[0]
    carrera = elegirOpcion(carrera, opcion.id, azarFijo(0.5), EQUIPOS_NBA)
    expect(carrera.clubActual?.id).toBe(opcion.id)
    expect(carrera.fase).toBe('pre-nba')
  })

  it('al cruzar el umbral de draft (fichando un club muy por encima de tu nivel), genera el evento de Draft con equipos NBA reales', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5), EQUIPOS_NBA)
    carrera = {
      ...carrera,
      jugador: { ...carrera.jugador, ovr: 50, potencial: 95 },
      eventoPendiente: { tipo: 'club-liga-domestica', opciones: [{ id: 'top', nombre: 'Top Club', nivel: 95 }] },
    }
    carrera = elegirOpcion(carrera, 'top', azarFijo(0.5), EQUIPOS_NBA)
    expect(carrera.jugador.ovr).toBeGreaterThanOrEqual(UMBRAL_DRAFT_OVR)
    expect(carrera.eventoPendiente?.tipo).toBe('draft')
  })

  it('elegir equipo en el evento de Draft pasa la carrera a fase nba', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'ar', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5), EQUIPOS_NBA)
    carrera = conEventoDraft(carrera)
    const equipoDrafteado = opcionesDe(carrera)[0]
    carrera = elegirOpcion(carrera, equipoDrafteado.id, azarFijo(0.5), EQUIPOS_NBA)
    expect(carrera.fase).toBe('nba')
    expect(carrera.clubActual?.id).toBe(equipoDrafteado.id)
  })

  it('el Draft incluye la opción de quedarte en tu club/universidad actual (no te obliga a entrar)', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'ar', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5), EQUIPOS_NBA)
    const clubActualAntes = carrera.clubActual!
    carrera = {
      ...carrera,
      jugador: { ...carrera.jugador, ovr: 60 },
      eventoPendiente: { tipo: 'draft', opciones: [...EQUIPOS_NBA, clubActualAntes] },
    }
    expect(opcionesDe(carrera).some((o) => o.id === clubActualAntes.id)).toBe(true)
  })

  it('elegir "quedarte" en el Draft declina — sigue en pre-nba, el Draft vuelve a aparecer después', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'ar', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5), EQUIPOS_NBA)
    const clubActualAntes = carrera.clubActual!
    carrera = {
      ...carrera,
      jugador: { ...carrera.jugador, ovr: 60 },
      eventoPendiente: { tipo: 'draft', opciones: [...EQUIPOS_NBA, clubActualAntes] },
    }
    carrera = elegirOpcion(carrera, clubActualAntes.id, azarFijo(0.5), EQUIPOS_NBA)
    expect(carrera.fase).toBe('pre-nba')
    expect(carrera.clubActual?.id).toBe(clubActualAntes.id)
    // el umbral sigue cruzado, así que la próxima decisión encadenada ya vuelve a ser el Draft
    expect(carrera.eventoPendiente?.tipo).toBe('draft')
  })

  // Llega a la NBA directo (bypaseando el pool real pre-NBA, que no es lo que este helper
  // quiere probar) y deja YA lista la primera decisión post-Draft (encadenada).
  // `azarEntrada` controla ese último paso, para poder decidir en el test si toca trade o riesgo.
  function llegarANba(
    dificultad: 'intensa' | 'normal' | 'expres' = 'intensa',
    azarEntrada: () => number = azarFijo(0.5),
  ): Carrera {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'C', { dificultad })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5), EQUIPOS_NBA)
    carrera = conEventoDraft(carrera)
    carrera = elegirOpcion(carrera, 'top', azarEntrada, EQUIPOS_NBA)
    // Con azar bajo la primera temporada NBA puede salir campeona, y un título ahora frena la
    // carrera hasta que el jugador lo vea (ver `Desenlace`) — se destraba para que el test
    // llegue al evento que quiere probar.
    return sinDesenlace(carrera, azarEntrada)
  }

  it('una vez en la NBA, con azar alto toca evento de trade (no de riesgo)', () => {
    const carrera = llegarANba('intensa', azarFijo(0.9))
    expect(carrera.eventoPendiente?.tipo).toBe('trade')
  })

  // `intervaloTemporadas: 0` saltea la simulación de temporadas y deja ver SOLO la elección de
  // rama (riesgo vs trade). Hace falta porque con azar bajo toda temporada NBA sale campeona, y
  // un título ahora frena la carrera antes de llegar a la próxima decisión (ver `Desenlace`).
  it('una vez en la NBA, con azar bajo toca decisión de riesgo (no trade)', () => {
    const base = llegarANba('intensa', azarFijo(0.99))
    const carrera = avanzarSiCorresponde(
      { ...base, intervaloTemporadas: 0, eventoPendiente: null },
      EQUIPOS_NBA,
      azarFijo(0.1),
    )
    expect(carrera.eventoPendiente?.tipo).toBe('riesgo')
  })

  it('en pre-nba con azar alto toca pase de club/universidad (no riesgo)', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'ar', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.9), EQUIPOS_NBA)
    expect(carrera.eventoPendiente?.tipo).toBe('club-liga-domestica')
  })

  it('en una decisión de riesgo, elegir "seguro" (aceptar rotación) fuerza el rol "rotacion", no cambia el OVR directo', () => {
    const base = llegarANba('intensa', azarFijo(0.99))
    const ovrPrevio = base.jugador.ovr
    let carrera: Carrera = {
      ...base,
      eventoPendiente: {
        tipo: 'riesgo',
        decision: { titulo: 'Competencia por el puesto', descripcion: 'test', probabilidadExito: 0.5, exito: true },
      },
    }
    carrera = elegirOpcion(carrera, 'seguro', azarFijo(0.99), EQUIPOS_NBA)
    expect(carrera.ultimoResultadoRiesgo?.rol).toBe('rotacion')
    // jugar seguro no mueve el OVR (solo arriesgar lo hace, ver decisionesRiesgo.ts)
    expect(carrera.jugador.ovr).toBe(ovrPrevio)
  })

  it('en una decisión de riesgo, elegir "arriesgar" (competir) fuerza el rol según el resultado ya resuelto (titular o rotación)', () => {
    const base = llegarANba()
    const decisionBase = {
      titulo: 'Competencia por el puesto',
      descripcion: 'test',
      probabilidadExito: 0.5,
    }
    const conEventoExito = { ...base, eventoPendiente: { tipo: 'riesgo' as const, decision: { ...decisionBase, exito: true } } }
    const conEventoFalla = { ...base, eventoPendiente: { tipo: 'riesgo' as const, decision: { ...decisionBase, exito: false } } }
    const conExito = elegirOpcion(conEventoExito, 'arriesgar', azarFijo(0.5), EQUIPOS_NBA)
    const sinExito = elegirOpcion(conEventoFalla, 'arriesgar', azarFijo(0.5), EQUIPOS_NBA)
    expect(conExito.ultimoResultadoRiesgo?.rol).toBe('titular')
    expect(sinExito.ultimoResultadoRiesgo?.rol).toBe('rotacion')
  })

  it('con dificultad Normal, el evento en NBA tarda 2 temporadas y el historial acumula ambas', () => {
    let carrera = llegarANba('intensa', azarFijo(0.9))
    carrera = { ...carrera, intervaloTemporadas: 2, eventoPendiente: null, ultimoResultadoRiesgo: null }
    const historialPrevio = carrera.historial.length
    carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.9))
    expect(carrera.historial.length).toBe(historialPrevio + 2)
    expect(carrera.eventoPendiente?.tipo).toBe('trade')
  })

  it('con dificultad Exprés, el Draft igual se dispara apenas se cruza el umbral (no espera el intervalo completo)', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'C', { dificultad: 'expres' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5), EQUIPOS_NBA)
    carrera = {
      ...carrera,
      jugador: { ...carrera.jugador, ovr: 50, potencial: 95 },
      eventoPendiente: { tipo: 'club-liga-domestica', opciones: [{ id: 'top', nombre: 'Top Club', nivel: 95 }] },
    }
    carrera = elegirOpcion(carrera, 'top', azarFijo(0.5), EQUIPOS_NBA)
    expect(carrera.eventoPendiente?.tipo).toBe('draft')
    expect(carrera.jugador.ovr).toBeGreaterThanOrEqual(UMBRAL_DRAFT_OVR)
  })

  it('se retira automáticamente a los 40 años', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5), EQUIPOS_NBA)
    for (let i = 0; i < 40 && !carrera.retirado; i++) {
      carrera = resolverPendiente(carrera)
    }
    expect(carrera.retirado).toBe(true)
    expect(carrera.jugador.edad).toBeGreaterThanOrEqual(40)
  })

  it('puede retirarse sin haber pisado nunca la NBA si el OVR nunca cruza el umbral', () => {
    let carrera = crearCarrera(azarFijo(0.001), 'us', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5), EQUIPOS_NBA)
    // Arranca ya cerca del retiro (35) con el potencial oculto igual al OVR actual — el
    // OVR no puede cruzar el umbral porque clampOvr lo tapa en el potencial, sin importar
    // cuánto crecimiento generen las elecciones de club.
    carrera = { ...carrera, jugador: { ...carrera.jugador, edad: 35, ovr: 50, potencial: 50 } }
    for (let i = 0; i < 10 && !carrera.retirado; i++) {
      carrera = resolverPendiente(carrera)
    }
    expect(carrera.retirado).toBe(true)
    expect(carrera.fase).toBe('pre-nba')
  })

  it('el historial acumula una entrada por temporada jugada (dificultad Intensa)', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5), EQUIPOS_NBA)
    carrera = { ...carrera, eventoPendiente: null }
    const historialInicial = carrera.historial.length
    carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.5))
    expect(carrera.historial.length).toBe(historialInicial + 1)
  })

  // La decisión de especialización depende de edad+posición, no de qué club te ofrecen —
  // se para a propósito el jugador ya en la ventana de edad (21-29) y se llama a
  // avanzarSiCorresponde en forma aislada (limpiando el eventoPendiente entre vueltas) para
  // no depender de la selección al azar del pool real de clubes.
  it('con posición de perímetro y azar bajo, en algún momento toca la decisión de especialización', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'PG', { dificultad: 'intensa' })
    carrera = { ...carrera, jugador: { ...carrera.jugador, edad: 21 }, eventoPendiente: null }
    let toco = false
    for (let i = 0; i < 15 && !carrera.retirado; i++) {
      carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.1))
      if (carrera.eventoPendiente?.tipo === 'especializacion') {
        toco = true
        break
      }
      carrera = { ...carrera, eventoPendiente: null }
    }
    expect(toco).toBe(true)
  })

  it('con posición de pívot (C), nunca toca la decisión de especialización', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'C', { dificultad: 'intensa' })
    carrera = { ...carrera, jugador: { ...carrera.jugador, edad: 21 }, eventoPendiente: null }
    for (let i = 0; i < 15 && !carrera.retirado; i++) {
      carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.1))
      expect(carrera.eventoPendiente?.tipo).not.toBe('especializacion')
      carrera = { ...carrera, eventoPendiente: null }
    }
  })

  it('elegir "triplero" vs "interior" desde el mismo punto de partida cambia los triples y rebotes en direcciones opuestas', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'PG', { dificultad: 'intensa' })
    carrera = {
      ...carrera,
      jugador: { ...carrera.jugador, edad: 21 },
      clubActual: { id: 'club-test', nombre: 'Club Test', nivel: 50 },
      eventoPendiente: null,
    }
    for (let i = 0; i < 15 && carrera.eventoPendiente?.tipo !== 'especializacion' && !carrera.retirado; i++) {
      carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.1))
      if (carrera.eventoPendiente?.tipo !== 'especializacion') carrera = { ...carrera, eventoPendiente: null }
    }
    expect(carrera.eventoPendiente?.tipo).toBe('especializacion')

    const comoTriplero = elegirOpcion(carrera, 'triplero', azarFijo(0.9), EQUIPOS_NBA).historial.at(-1)!
    const comoInterior = elegirOpcion(carrera, 'interior', azarFijo(0.9), EQUIPOS_NBA).historial.at(-1)!

    expect(comoTriplero.triples).toBeGreaterThan(comoInterior.triples)
    expect(comoTriplero.rpg).toBeLessThan(comoInterior.rpg)
  })

  it('en fase NBA, entrar a un club ya deja un resumenTemporada con el récord de la temporada regular (encadenado, sin pantalla intermedia)', () => {
    const carrera = llegarANba('intensa', azarFijo(0.99))
    expect(carrera.resumenTemporada).not.toBeNull()
    expect(carrera.resumenTemporada!.victorias + carrera.resumenTemporada!.derrotas).toBe(82)
  })

  it('en fase pre-nba, no se genera resumenTemporada (los playoffs son solo NBA)', () => {
    const carrera = crearCarrera(azarFijo(0.1), 'ar', 'C', { dificultad: 'intensa' })
    const conCarrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.9), EQUIPOS_NBA)
    expect(conCarrera.resumenTemporada).toBeNull()
  })

  it('elegir "finta" en una jugada final ganada suma un anillo real', () => {
    let carrera = llegarANba()
    carrera = {
      ...carrera,
      eventoPendiente: { tipo: 'jugada-final', rival: 'Ironclads', escenaTitulo: 'Últimos segundos', escenaDescripcion: 'Test.', resultadoSiFinta: true, resultadoSiTriple: false },
      estadoPlayoffsPendiente: { nivelEquipo: 90, ronda: 3, rival: 'Ironclads' },
      resumenTemporada: { victorias: 55, derrotas: 27, clasifico: true },
    }
    const anillosPrevios = carrera.trofeos.anillos
    const indiceTemporadaCampeon = carrera.historial.length - 1
    carrera = elegirOpcion(carrera, 'finta', azarUnaVezLuego(0.01, 0.99), EQUIPOS_NBA)
    expect(carrera.trofeos.anillos).toBe(anillosPrevios + 1)
    // el ícono de anillo se marca retroactivamente en la fila de la temporada del título
    // (pedido del usuario: "figurar como iconos... en la temporada que se ganó")
    expect(carrera.historial[indiceTemporadaCampeon].trofeosGanados).toContain('anillo')
    expect(carrera.estadoPlayoffsPendiente).toBeNull()
    // El título FRENA la carrera hasta que el jugador lo ve: no encadena a la temporada
    // siguiente en el mismo llamado (bug reportado por el usuario, ver `Desenlace`).
    expect(carrera.desenlacePendiente?.gano).toBe(true)
    expect(carrera.eventoPendiente).toBeNull()
    // y recién al continuar aparece la próxima decisión
    expect(continuarCarrera(carrera, azarFijo(0.99), EQUIPOS_NBA).eventoPendiente).not.toBeNull()
  })

  it('errar la jugada final NO da el título, y el desenlace lo dice antes de seguir (bug reportado)', () => {
    let carrera = llegarANba()
    carrera = {
      ...carrera,
      // resultadoSiTriple: false -> elegir 'triple' pierde la Final
      eventoPendiente: { tipo: 'jugada-final', rival: 'Ironclads', escenaTitulo: 'Últimos segundos', escenaDescripcion: 'Test.', resultadoSiFinta: true, resultadoSiTriple: false },
      estadoPlayoffsPendiente: { nivelEquipo: 90, ronda: 3, rival: 'Ironclads' },
      resumenTemporada: { victorias: 55, derrotas: 27, clasifico: true },
    }
    const anillosPrevios = carrera.trofeos.anillos
    // azar bajo a propósito: antes, la temporada SIGUIENTE se simulaba en el mismo llamado y
    // podía salir campeona, así que errar el tiro igual mostraba el título.
    carrera = elegirOpcion(carrera, 'triple', azarFijo(0.01), EQUIPOS_NBA)
    expect(carrera.trofeos.anillos).toBe(anillosPrevios)
    expect(carrera.desenlacePendiente?.gano).toBe(false)
    expect(carrera.desenlacePendiente?.iconos).toEqual([])
    expect(carrera.eventoPendiente).toBeNull()
  })

  it('elegir "triple" en una jugada final perdida no suma anillo', () => {
    let carrera = llegarANba()
    carrera = {
      ...carrera,
      eventoPendiente: { tipo: 'jugada-final', rival: 'Ironclads', escenaTitulo: 'Últimos segundos', escenaDescripcion: 'Test.', resultadoSiFinta: true, resultadoSiTriple: false },
      estadoPlayoffsPendiente: { nivelEquipo: 90, ronda: 3, rival: 'Ironclads' },
      resumenTemporada: { victorias: 55, derrotas: 27, clasifico: true },
    }
    const anillosPrevios = carrera.trofeos.anillos
    carrera = elegirOpcion(carrera, 'triple', azarUnaVezLuego(0.5, 0.99), EQUIPOS_NBA)
    expect(carrera.trofeos.anillos).toBe(anillosPrevios)
    expect(carrera.estadoPlayoffsPendiente).toBeNull()
  })

  it('ultimoCambioOvr refleja el crecimiento real de fichar un club top, no un número que después no se cumple', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5), EQUIPOS_NBA)
    carrera = {
      ...carrera,
      jugador: { ...carrera.jugador, ovr: 50, potencial: 95 },
      ovrAlIniciarDecision: 50,
      eventoPendiente: { tipo: 'club-liga-domestica', opciones: [{ id: 'top', nombre: 'Top Club', nivel: 95 }] },
    }
    carrera = elegirOpcion(carrera, 'top', azarFijo(0.5), EQUIPOS_NBA)
    // El OVR mostrado en la próxima decisión debe coincidir EXACTO con lo que dice el
    // cambio — no un número prometido que después "sigue en 50" (bug real reportado).
    expect(carrera.jugador.ovr).toBe(50 + carrera.ultimoCambioOvr)
    expect(carrera.ultimoCambioOvr).toBeGreaterThan(0)
  })

  it('arriesgar y ganar la decisión suma OVR; perderla resta (pedido explícito del usuario)', () => {
    const base = llegarANba('intensa', azarFijo(0.99))
    // potencial bien alto para que el clamp no se coma el aumento, e `intervaloTemporadas: 0`
    // para medir SOLO el efecto de la decisión (sin el crecimiento natural de las temporadas
    // que se simulan después, que también mueve el OVR).
    const preparada: Carrera = {
      ...base,
      jugador: { ...base.jugador, ovr: 70, potencial: 99 },
      ovrAlIniciarDecision: 70,
      intervaloTemporadas: 0,
    }
    const decisionBase = { titulo: 'Competencia por el puesto', descripcion: 'test', probabilidadExito: 0.5 }

    const ganada = elegirOpcion(
      { ...preparada, eventoPendiente: { tipo: 'riesgo', decision: { ...decisionBase, exito: true } } },
      'arriesgar',
      azarFijo(0.99),
      EQUIPOS_NBA,
    )
    const perdida = elegirOpcion(
      { ...preparada, eventoPendiente: { tipo: 'riesgo', decision: { ...decisionBase, exito: false } } },
      'arriesgar',
      azarFijo(0.99),
      EQUIPOS_NBA,
    )

    expect(ganada.ultimoCambioOvr).toBe(OVR_GANADO_AL_COMPETIR)
    expect(perdida.ultimoCambioOvr).toBe(-OVR_PERDIDO_AL_FALLAR)
    expect(ganada.jugador.ovr).toBeGreaterThan(perdida.jugador.ovr)
  })

  it('en pre-nba con liga curada se puede salir campeón local, y frena la carrera para mostrarlo', () => {
    // Argentina tiene liga curada; azar bajo hace que el chequeo de título local pase.
    let carrera = crearCarrera(azarFijo(0.1), 'ar', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.01), EQUIPOS_NBA)
    expect(carrera.trofeos.ligaLocal).toBe(1)
    expect(carrera.desenlacePendiente?.iconos).toEqual(['liga-local'])
    expect(carrera.historial.at(-1)?.trofeosGanados).toContain('liga-local')
    // el nombre de la liga real aparece en el texto del desenlace
    expect(carrera.desenlacePendiente?.texto).toContain('Liga Nacional de Básquet')
  })

  it('sin liga doméstica curada (camino genérico) nunca hay título local', () => {
    // 'us' usa el camino genérico universidad/G-League, no una liga doméstica
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'C', { dificultad: 'intensa' })
    expect(carrera.ligaDomestica).toBeNull()
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.01), EQUIPOS_NBA)
    expect(carrera.trofeos.ligaLocal).toBe(0)
  })

  it('ganar la decisión de convocatoria otorga el Mundial y lo marca en el historial', () => {
    const base = llegarANba('intensa', azarFijo(0.99))
    const carrera = elegirOpcion(
      {
        ...base,
        eventoPendiente: {
          tipo: 'convocatoria',
          decision: {
            torneo: 'mundial',
            escenaTitulo: 'Final del Mundial',
            escenaDescripcion: 'test',
            resultadoSiEquipo: true,
            resultadoSiResponsabilidad: false,
          },
        },
      },
      'jugar-para-el-equipo',
      azarFijo(0.99),
      EQUIPOS_NBA,
    )
    expect(carrera.trofeos.mundial).toBe(base.trofeos.mundial + 1)
    expect(carrera.desenlacePendiente?.gano).toBe(true)
    expect(carrera.historial.at(-1)?.trofeosGanados).toContain('mundial')
  })

  it('perder la decisión de convocatoria no otorga nada', () => {
    const base = llegarANba('intensa', azarFijo(0.99))
    const carrera = elegirOpcion(
      {
        ...base,
        eventoPendiente: {
          tipo: 'convocatoria',
          decision: {
            torneo: 'jjoo',
            escenaTitulo: 'Final olímpica',
            escenaDescripcion: 'test',
            resultadoSiEquipo: true,
            resultadoSiResponsabilidad: false,
          },
        },
      },
      'tomar-la-responsabilidad',
      azarFijo(0.01),
      EQUIPOS_NBA,
    )
    expect(carrera.trofeos.jjoo).toBe(base.trofeos.jjoo)
    expect(carrera.desenlacePendiente?.gano).toBe(false)
  })

  it('una temporada NBA con OVR de nivel All-Star marca el ícono en esa fila del historial', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5), EQUIPOS_NBA)
    carrera = {
      ...carrera,
      fase: 'nba',
      clubActual: { id: 'club-test', nombre: 'Club Test', nivel: 40 },
      jugador: { ...carrera.jugador, ovr: 82, edad: 25, potencial: 95 },
      eventoPendiente: null,
    }
    carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.99))
    expect(carrera.historial.at(-1)?.trofeosGanados).toContain('allstar')
  })
})
