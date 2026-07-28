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

// Resuelve el evento pendiente tomando siempre la primera opción / jugando seguro en las
// decisiones de riesgo — para avanzar los tests sin importar qué tipo de evento toque.
function resolverPendiente(carrera: Carrera): Carrera {
  if (!carrera.eventoPendiente) return carrera
  if (carrera.eventoPendiente.tipo === 'riesgo') return elegirOpcion(carrera, 'seguro', azarFijo(0.5))
  if (carrera.eventoPendiente.tipo === 'jugada-final') return elegirOpcion(carrera, 'finta', azarFijo(0.01))
  return elegirOpcion(carrera, carrera.eventoPendiente.opciones[0].id, azarFijo(0.5))
}

function opcionesDe(carrera: Carrera): { id: string }[] {
  const evento = carrera.eventoPendiente!
  if (evento.tipo === 'riesgo' || evento.tipo === 'jugada-final') throw new Error('este evento no tiene .opciones')
  return evento.opciones
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

  it('elegir un club de liga doméstica lo guarda como clubActual, sigue en fase pre-nba', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'ar', 'C')
    const opcion = opcionesDe(carrera)[0]
    carrera = elegirOpcion(carrera, opcion.id, azarFijo(0.5))
    expect(carrera.clubActual?.id).toBe(opcion.id)
    expect(carrera.fase).toBe('pre-nba')
    expect(carrera.eventoPendiente).toBeNull()
  })

  it('elegir una universidad del camino genérico lo guarda como clubActual', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'C')
    const opcion = opcionesDe(carrera)[0]
    carrera = elegirOpcion(carrera, opcion.id, azarFijo(0.5))
    expect(carrera.clubActual?.id).toBe(opcion.id)
    expect(carrera.fase).toBe('pre-nba')
  })

  it('al cruzar el umbral de draft, genera el evento de Draft con equipos NBA reales', () => {
    let carrera = crearCarrera(azarFijo(0.99), 'us', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5))
    for (let i = 0; i < 10 && carrera.eventoPendiente?.tipo !== 'draft' && !carrera.retirado; i++) {
      carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.99))
      if (carrera.eventoPendiente && carrera.eventoPendiente.tipo !== 'draft') carrera = resolverPendiente(carrera)
    }
    expect(carrera.jugador.ovr).toBeGreaterThanOrEqual(UMBRAL_DRAFT_OVR)
    expect(carrera.eventoPendiente?.tipo).toBe('draft')
  })

  it('elegir equipo en el evento de Draft pasa la carrera a fase nba', () => {
    let carrera = crearCarrera(azarFijo(0.99), 'ar', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5))
    for (let i = 0; i < 10 && carrera.eventoPendiente?.tipo !== 'draft' && !carrera.retirado; i++) {
      carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.99))
      if (carrera.eventoPendiente && carrera.eventoPendiente.tipo !== 'draft') carrera = resolverPendiente(carrera)
    }
    const equipoDrafteado = opcionesDe(carrera)[0]
    carrera = elegirOpcion(carrera, equipoDrafteado.id, azarFijo(0.5))
    expect(carrera.fase).toBe('nba')
    expect(carrera.clubActual?.id).toBe(equipoDrafteado.id)
  })

  it('el Draft incluye la opción de quedarte en tu club/universidad actual (no te obliga a entrar)', () => {
    let carrera = crearCarrera(azarFijo(0.99), 'ar', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5))
    for (let i = 0; i < 10 && carrera.eventoPendiente?.tipo !== 'draft' && !carrera.retirado; i++) {
      carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.99))
      if (carrera.eventoPendiente && carrera.eventoPendiente.tipo !== 'draft') carrera = resolverPendiente(carrera)
    }
    const clubActualAntes = carrera.clubActual
    expect(opcionesDe(carrera).some((o) => o.id === clubActualAntes?.id)).toBe(true)
  })

  it('elegir "quedarte" en el Draft declina — sigue en pre-nba, el Draft vuelve a aparecer después', () => {
    let carrera = crearCarrera(azarFijo(0.99), 'ar', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5))
    for (let i = 0; i < 10 && carrera.eventoPendiente?.tipo !== 'draft' && !carrera.retirado; i++) {
      carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.99))
      if (carrera.eventoPendiente && carrera.eventoPendiente.tipo !== 'draft') carrera = resolverPendiente(carrera)
    }
    const clubActualAntes = carrera.clubActual!
    carrera = elegirOpcion(carrera, clubActualAntes.id, azarFijo(0.5))
    expect(carrera.fase).toBe('pre-nba')
    expect(carrera.clubActual?.id).toBe(clubActualAntes.id)
    // el umbral sigue cruzado, así que el próximo avance vuelve a ofrecer el Draft
    carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.5))
    expect(carrera.eventoPendiente?.tipo).toBe('draft')
  })

  function llegarANba(dificultad: 'intensa' | 'normal' | 'expres' = 'intensa'): Carrera {
    let carrera = crearCarrera(azarFijo(0.99), 'us', 'C', { dificultad })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5))
    for (let i = 0; i < 10 && carrera.eventoPendiente?.tipo !== 'draft' && !carrera.retirado; i++) {
      carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.99))
      if (carrera.eventoPendiente && carrera.eventoPendiente.tipo !== 'draft') carrera = resolverPendiente(carrera)
    }
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5))
    return carrera
  }

  it('una vez en la NBA, con azar alto toca evento de trade (no de riesgo)', () => {
    let carrera = llegarANba()
    carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.9))
    expect(carrera.eventoPendiente?.tipo).toBe('trade')
  })

  it('una vez en la NBA, con azar bajo toca decisión de riesgo (no trade)', () => {
    let carrera = llegarANba()
    carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.1))
    expect(carrera.eventoPendiente?.tipo).toBe('riesgo')
  })

  it('en pre-nba con azar alto toca pase de club/universidad (no riesgo)', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'ar', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5))
    carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.9))
    expect(carrera.eventoPendiente?.tipo).toBe('club-liga-domestica')
  })

  it('en una decisión de riesgo, elegir "seguro" no cambia el OVR', () => {
    let carrera = llegarANba()
    carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.1))
    const ovrPrevio = carrera.jugador.ovr
    carrera = elegirOpcion(carrera, 'seguro', azarFijo(0.5))
    expect(carrera.jugador.ovr).toBe(ovrPrevio)
    expect(carrera.ultimoResultadoRiesgo?.delta).toBe(0)
  })

  it('en una decisión de riesgo, elegir "arriesgar" aplica el delta ya resuelto (positivo o negativo)', () => {
    let carrera = llegarANba()
    carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.1))
    const ovrPrevio = carrera.jugador.ovr
    carrera = elegirOpcion(carrera, 'arriesgar', azarFijo(0.1))
    expect(carrera.ultimoResultadoRiesgo).not.toBeNull()
    expect(carrera.jugador.ovr).not.toBe(ovrPrevio)
    expect(carrera.ultimoResultadoRiesgo!.delta).not.toBe(0)
  })

  it('con dificultad Normal, el evento en NBA tarda 2 temporadas y el historial acumula ambas', () => {
    let carrera = llegarANba('intensa')
    carrera = { ...carrera, intervaloTemporadas: 2 }
    const historialPrevio = carrera.historial.length
    carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.9))
    expect(carrera.historial.length).toBe(historialPrevio + 2)
    expect(carrera.eventoPendiente?.tipo).toBe('trade')
  })

  it('con dificultad Exprés, el Draft igual se dispara apenas se cruza el umbral (no espera el intervalo completo)', () => {
    let carrera = crearCarrera(azarFijo(0.99), 'us', 'C', { dificultad: 'expres' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5))
    carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.99))
    expect(carrera.eventoPendiente?.tipo).toBe('draft')
    expect(carrera.jugador.ovr).toBeGreaterThanOrEqual(UMBRAL_DRAFT_OVR)
  })

  it('se retira automáticamente a los 40 años', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5))
    for (let i = 0; i < 40 && !carrera.retirado; i++) {
      carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.5))
      if (carrera.eventoPendiente) carrera = resolverPendiente(carrera)
    }
    expect(carrera.retirado).toBe(true)
    expect(carrera.jugador.edad).toBeGreaterThanOrEqual(40)
  })

  it('puede retirarse sin haber pisado nunca la NBA si el OVR nunca cruza el umbral', () => {
    let carrera = crearCarrera(azarFijo(0.001), 'us', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5))
    // Arranca ya cerca del retiro (35) y por debajo del umbral — a esa edad la curva
    // solo declina (rango negativo garantizado), así que nunca puede cruzar el umbral.
    carrera = { ...carrera, jugador: { ...carrera.jugador, edad: 35, ovr: 50, potencial: 50 } }
    for (let i = 0; i < 10 && !carrera.retirado; i++) {
      carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0))
      if (carrera.eventoPendiente) carrera = resolverPendiente(carrera)
    }
    expect(carrera.retirado).toBe(true)
    expect(carrera.fase).toBe('pre-nba')
  })

  it('el historial acumula una entrada por temporada jugada (dificultad Intensa)', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5))
    const historialInicial = carrera.historial.length
    carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.5))
    expect(carrera.historial.length).toBe(historialInicial + 1)
  })

  it('con posición de perímetro y azar bajo, en algún momento toca la decisión de especialización', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'PG', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5))
    let toco = false
    for (let i = 0; i < 15 && !carrera.retirado; i++) {
      carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.1))
      if (carrera.eventoPendiente?.tipo === 'especializacion') {
        toco = true
        break
      }
      if (carrera.eventoPendiente) carrera = resolverPendiente(carrera)
    }
    expect(toco).toBe(true)
  })

  it('con posición de pívot (C), nunca toca la decisión de especialización', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5))
    for (let i = 0; i < 15 && !carrera.retirado; i++) {
      carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.1))
      expect(carrera.eventoPendiente?.tipo).not.toBe('especializacion')
      if (carrera.eventoPendiente) carrera = resolverPendiente(carrera)
    }
  })

  it('elegir "triplero" vs "interior" desde el mismo punto de partida cambia los triples y rebotes en direcciones opuestas', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'PG', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5))
    for (let i = 0; i < 15 && carrera.eventoPendiente?.tipo !== 'especializacion' && !carrera.retirado; i++) {
      carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.1))
      if (carrera.eventoPendiente && carrera.eventoPendiente.tipo !== 'especializacion') carrera = resolverPendiente(carrera)
    }
    expect(carrera.eventoPendiente?.tipo).toBe('especializacion')

    const comoTriplero = avanzarSiCorresponde(
      elegirOpcion(carrera, 'triplero', azarFijo(0.5)),
      EQUIPOS_NBA,
      azarFijo(0.9),
    ).historial.at(-1)!

    const comoInterior = avanzarSiCorresponde(
      elegirOpcion(carrera, 'interior', azarFijo(0.5)),
      EQUIPOS_NBA,
      azarFijo(0.9),
    ).historial.at(-1)!

    expect(comoTriplero.triples).toBeGreaterThan(comoInterior.triples)
    expect(comoTriplero.rpg).toBeLessThan(comoInterior.rpg)
  })

  it('en fase NBA, avanzar una temporada deja un resumenTemporada con el récord de la temporada regular', () => {
    let carrera = llegarANba()
    carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.99))
    if (carrera.eventoPendiente?.tipo === 'jugada-final') carrera = resolverPendiente(carrera)
    expect(carrera.resumenTemporada).not.toBeNull()
    expect(carrera.resumenTemporada!.victorias + carrera.resumenTemporada!.derrotas).toBe(82)
  })

  it('en fase pre-nba, no se genera resumenTemporada (los playoffs son solo NBA)', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'ar', 'C', { dificultad: 'intensa' })
    carrera = elegirOpcion(carrera, opcionesDe(carrera)[0].id, azarFijo(0.5))
    carrera = avanzarSiCorresponde(carrera, EQUIPOS_NBA, azarFijo(0.9))
    carrera = resolverPendiente(carrera)
    expect(carrera.resumenTemporada).toBeNull()
  })

  it('elegir "finta" en una jugada final ganada suma un anillo real y marca resumenTemporada.campeon', () => {
    let carrera = llegarANba()
    carrera = {
      ...carrera,
      eventoPendiente: { tipo: 'jugada-final', rival: 'Ironclads' },
      estadoPlayoffsPendiente: { nivelEquipo: 90, ronda: 3, rival: 'Ironclads' },
      resumenTemporada: { victorias: 55, derrotas: 27, clasifico: true },
    }
    const anillosPrevios = carrera.trofeos.anillos
    carrera = elegirOpcion(carrera, 'finta', azarFijo(0.01)) // 0.01 < 0.62 de probabilidad de éxito -> gana
    expect(carrera.trofeos.anillos).toBe(anillosPrevios + 1)
    expect(carrera.resumenTemporada?.campeon).toBe(true)
    expect(carrera.eventoPendiente).toBeNull()
    expect(carrera.estadoPlayoffsPendiente).toBeNull()
  })

  it('elegir "triple" en una jugada final perdida no suma anillo y marca eliminado en esa ronda', () => {
    let carrera = llegarANba()
    carrera = {
      ...carrera,
      eventoPendiente: { tipo: 'jugada-final', rival: 'Ironclads' },
      estadoPlayoffsPendiente: { nivelEquipo: 90, ronda: 3, rival: 'Ironclads' },
      resumenTemporada: { victorias: 55, derrotas: 27, clasifico: true },
    }
    const anillosPrevios = carrera.trofeos.anillos
    carrera = elegirOpcion(carrera, 'triple', azarFijo(0.99)) // 0.99 > 0.45 de probabilidad de éxito -> pierde
    expect(carrera.trofeos.anillos).toBe(anillosPrevios)
    expect(carrera.resumenTemporada?.eliminado?.ronda).toBe(3)
    expect(carrera.resumenTemporada?.eliminado?.rival).toBe('Ironclads')
  })
})
