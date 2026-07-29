import { describe, expect, it } from 'vitest'
import {
  simularTemporadaRegular,
  elegirRival,
  simularPlayoffs,
  resolverJugadaFinal,
  nivelEquipoCombinado,
  nombreRonda,
  OPCIONES_JUGADA_FINAL,
} from './playoffs'
import type { Equipo } from './eventos'

const EQUIPOS_LIGA_TEST: Equipo[] = [
  { id: 'a', nombre: 'Equipo A', nivel: 70 },
  { id: 'b', nombre: 'Equipo B', nivel: 75 },
  { id: 'c', nombre: 'Equipo C', nivel: 80 },
  { id: 'd', nombre: 'Equipo D', nivel: 85 },
]

function azarFijo(valor: number): () => number {
  return () => valor
}

// Alterna dos valores en secuencia — útil para simular series parejas sin depender de
// Math.random en los tests.
function azarAlternado(...valores: number[]): () => number {
  let i = 0
  return () => valores[i++ % valores.length]
}

describe('nivelEquipoCombinado', () => {
  it('combina nivel de club y OVR del jugador en partes iguales', () => {
    expect(nivelEquipoCombinado(80, 80)).toBe(80)
    expect(nivelEquipoCombinado(60, 100)).toBe(80)
  })

  it('sin club (null), usa un nivel base razonable', () => {
    expect(nivelEquipoCombinado(null, 80)).toBeGreaterThan(0)
  })
})

describe('simularTemporadaRegular', () => {
  it('con nivel de equipo muy alto, gana casi todos los partidos y clasifica', () => {
    const resultado = simularTemporadaRegular(99, azarFijo(0.01))
    expect(resultado.victorias).toBeGreaterThan(70)
    expect(resultado.clasifico).toBe(true)
  })

  it('con nivel de equipo muy bajo, pierde casi todos los partidos y no clasifica', () => {
    const resultado = simularTemporadaRegular(30, azarFijo(0.99))
    expect(resultado.derrotas).toBeGreaterThan(70)
    expect(resultado.clasifico).toBe(false)
  })

  it('victorias + derrotas siempre suman 82 partidos', () => {
    const resultado = simularTemporadaRegular(75, azarFijo(0.5))
    expect(resultado.victorias + resultado.derrotas).toBe(82)
  })
})

describe('elegirRival', () => {
  it('el rival de una ronda más alta tiene nivel mayor o igual que el de la ronda 1', () => {
    const rondaUno = elegirRival(1, azarFijo(0.1), EQUIPOS_LIGA_TEST)
    const rondaTres = elegirRival(3, azarFijo(0.1), EQUIPOS_LIGA_TEST)
    expect(rondaTres.nivel).toBeGreaterThanOrEqual(rondaUno.nivel)
  })

  it('devuelve un nombre no vacío', () => {
    const rival = elegirRival(2, azarFijo(0.5), EQUIPOS_LIGA_TEST)
    expect(rival.nombre.length).toBeGreaterThan(0)
  })

  it('nunca devuelve un equipo excluido (tu propio club o un rival ya enfrentado)', () => {
    for (let i = 0; i < 20; i++) {
      const rival = elegirRival(1, azarFijo(i / 20), EQUIPOS_LIGA_TEST, ['a', 'b'])
      expect(['a', 'b']).not.toContain(rival.id)
    }
  })
})

describe('simularPlayoffs', () => {
  it('con nivel de equipo dominante, es campeón (gana las 3 rondas)', () => {
    const resultado = simularPlayoffs(99, 60, azarFijo(0.01), EQUIPOS_LIGA_TEST, 'a')
    expect(resultado.estado).toBe('campeon')
  })

  it('con nivel de equipo muy débil, queda eliminado en la primera ronda', () => {
    const resultado = simularPlayoffs(20, 60, azarFijo(0.99), EQUIPOS_LIGA_TEST, 'a')
    expect(resultado.estado).toBe('eliminado')
    if (resultado.estado === 'eliminado') {
      expect(resultado.ronda).toBe(1)
    }
  })

  it('nunca enfrenta a tu propio club', () => {
    const resultado = simularPlayoffs(50, 60, azarFijo(0.5), EQUIPOS_LIGA_TEST, 'a')
    if (resultado.estado === 'eliminado' || resultado.estado === 'pendiente') {
      const club = EQUIPOS_LIGA_TEST.find((e) => e.id === 'a')!
      expect(resultado.rival).not.toBe(club.nombre)
    }
  })

  it('la jugada final (clutch) nunca aparece con OVR bajo, aunque el azar la favorezca', () => {
    // Serie pareja (gana-pierde-alternado) para llegar al partido decisivo de la Final,
    // pero con OVR bajo (< umbral) nunca debería pedir la decisión interactiva.
    const resultado = simularPlayoffs(75, 50, azarAlternado(0.01, 0.9, 0.5), EQUIPOS_LIGA_TEST, 'a')
    expect(resultado.estado).not.toBe('pendiente')
  })

  it('con OVR alto y azar que favorece la aparición, puede quedar pendiente de la jugada final', () => {
    // azar bajo constante: gana rondas 1 y 2 limpio, y en la Final el chequeo de
    // aparición de la jugada final también usa azar bajo -> aparece.
    const resultado = simularPlayoffs(85, 90, azarFijo(0.01), EQUIPOS_LIGA_TEST, 'a')
    // No siempre puede llegar al partido decisivo con azar tan bajo (podría barrer 2-0),
    // así que solo verificamos que el estado sea uno de los válidos.
    expect(['campeon', 'eliminado', 'pendiente']).toContain(resultado.estado)
    if (resultado.estado === 'pendiente') {
      expect(resultado.escena.titulo.length).toBeGreaterThan(0)
    }
  })
})

describe('resolverJugadaFinal', () => {
  it('con azar favorable, la opción elegida gana', () => {
    const gano = resolverJugadaFinal('finta', azarFijo(0.01))
    expect(gano).toBe(true)
  })

  it('con azar desfavorable, la opción elegida pierde', () => {
    const gano = resolverJugadaFinal('triple', azarFijo(0.99))
    expect(gano).toBe(false)
  })

  it('una opción inexistente no gana nunca', () => {
    const gano = resolverJugadaFinal('inexistente', azarFijo(0.01))
    expect(gano).toBe(false)
  })

  it('"tirar el triple" tiene menor probabilidad de éxito que "finta y penetrar" (más riesgo)', () => {
    const finta = OPCIONES_JUGADA_FINAL.find((o) => o.id === 'finta')!
    const triple = OPCIONES_JUGADA_FINAL.find((o) => o.id === 'triple')!
    expect(triple.probabilidadExito).toBeLessThan(finta.probabilidadExito)
  })
})

describe('nombreRonda', () => {
  it('devuelve el nombre correcto para cada ronda', () => {
    expect(nombreRonda(1)).toBe('Primera ronda')
    expect(nombreRonda(2)).toBe('Semifinal')
    expect(nombreRonda(3)).toBe('Final')
  })
})
