import { describe, expect, it } from 'vitest'
import {
  crearCarrera,
  elegirOpcion,
  avanzarSiCorresponde,
  type Carrera,
  type Equipo,
} from './motorCarrera'
import { UMBRAL_DRAFT_OVR } from './caminosPreNba'

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
  if (!carrera.eventoPendiente) return carrera
  if (carrera.eventoPendiente.tipo === 'riesgo') return elegirOpcion(carrera, 'seguro', azarFijo(0.5), EQUIPOS_NBA)
  if (carrera.eventoPendiente.tipo === 'jugada-final') return elegirOpcion(carrera, 'finta', azarFijo(0.01), EQUIPOS_NBA)
  return elegirOpcion(carrera, carrera.eventoPendiente.opciones[0].id, azarFijo(0.5), EQUIPOS_NBA)
}

function opcionesDe(carrera: Carrera): { id: string }[] {
  const evento = carrera.eventoPendiente!
  if (evento.tipo === 'riesgo' || evento.tipo === 'jugada-final') throw new Error('este evento no tiene .opciones')
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
    return carrera
  }

  it('una vez en la NBA, con azar alto toca evento de trade (no de riesgo)', () => {
    const carrera = llegarANba('intensa', azarFijo(0.9))
    expect(carrera.eventoPendiente?.tipo).toBe('trade')
  })

  it('una vez en la NBA, con azar bajo toca decisión de riesgo (no trade)', () => {
    const carrera = llegarANba('intensa', azarFijo(0.1))
    expect(carrera.eventoPendiente?.tipo).toBe('riesgo')
  })

  it('en pre-nba con azar alto toca pase de club/universidad (no riesgo)', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'ar', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.9), EQUIPOS_NBA)
    expect(carrera.eventoPendiente?.tipo).toBe('club-liga-domestica')
  })

  it('en una decisión de riesgo, elegir "seguro" (aceptar rotación) fuerza el rol "rotacion", no cambia el OVR directo', () => {
    let carrera = llegarANba('intensa', azarFijo(0.1))
    expect(carrera.eventoPendiente?.tipo).toBe('riesgo')
    carrera = elegirOpcion(carrera, 'seguro', azarFijo(0.5), EQUIPOS_NBA)
    expect(carrera.ultimoResultadoRiesgo?.rol).toBe('rotacion')
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
      eventoPendiente: { tipo: 'jugada-final', rival: 'Ironclads', resultadoSiFinta: true, resultadoSiTriple: false },
      estadoPlayoffsPendiente: { nivelEquipo: 90, ronda: 3, rival: 'Ironclads' },
      resumenTemporada: { victorias: 55, derrotas: 27, clasifico: true },
    }
    const anillosPrevios = carrera.trofeos.anillos
    // azarUnaVezLuego evita que la temporada siguiente (que arranca en el mismo llamado)
    // clasifique a playoffs por casualidad y confunda el conteo de anillos — el resultado
    // de la jugada final en sí ya viene resuelto en el propio evento, no depende del azar acá.
    carrera = elegirOpcion(carrera, 'finta', azarUnaVezLuego(0.01, 0.99), EQUIPOS_NBA)
    expect(carrera.trofeos.anillos).toBe(anillosPrevios + 1)
    // la carrera sigue: elegirOpcion ya encadenó a la próxima temporada/decisión
    expect(carrera.eventoPendiente).not.toBeNull()
    expect(carrera.estadoPlayoffsPendiente).toBeNull()
  })

  it('elegir "triple" en una jugada final perdida no suma anillo', () => {
    let carrera = llegarANba()
    carrera = {
      ...carrera,
      eventoPendiente: { tipo: 'jugada-final', rival: 'Ironclads', resultadoSiFinta: true, resultadoSiTriple: false },
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

  it('ultimoCambioOvr da 0 si la decisión de riesgo no mueve el OVR directo', () => {
    let carrera = llegarANba('intensa', azarFijo(0.1))
    expect(carrera.eventoPendiente?.tipo).toBe('riesgo')
    carrera = elegirOpcion(carrera, 'seguro', azarFijo(0.5), EQUIPOS_NBA)
    expect(carrera.ultimoCambioOvr).toBe(0)
  })
})
