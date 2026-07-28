import { describe, expect, it } from 'vitest'
import {
  puedeEspecializarse,
  tocaEventoEspecializacion,
  multiplicadorTriples,
  multiplicadorRebotes,
} from './especializacion'

function azarFijo(valor: number): () => number {
  return () => valor
}

describe('puedeEspecializarse', () => {
  it('un base (PG) en edad media puede especializarse', () => {
    expect(puedeEspecializarse('PG', 24, false)).toBe(true)
  })

  it('un pívot (C) nunca puede especializarse (no es de perímetro)', () => {
    expect(puedeEspecializarse('C', 24, false)).toBe(false)
  })

  it('fuera del rango de edad, no puede especializarse', () => {
    expect(puedeEspecializarse('SG', 19, false)).toBe(false)
    expect(puedeEspecializarse('SG', 35, false)).toBe(false)
  })

  it('si ya está especializado, no puede volver a elegir', () => {
    expect(puedeEspecializarse('SF', 25, true)).toBe(false)
  })
})

describe('tocaEventoEspecializacion', () => {
  it('con azar bajo y condiciones válidas, toca el evento', () => {
    expect(tocaEventoEspecializacion('PG', 24, false, azarFijo(0))).toBe(true)
  })

  it('con azar alto, no toca aunque las condiciones sean válidas', () => {
    expect(tocaEventoEspecializacion('PG', 24, false, azarFijo(0.99))).toBe(false)
  })

  it('nunca toca si la posición no es de perímetro, sin importar el azar', () => {
    expect(tocaEventoEspecializacion('C', 24, false, azarFijo(0))).toBe(false)
  })
})

describe('multiplicadores', () => {
  it('triplero multiplica los triples hacia arriba y los rebotes hacia abajo', () => {
    expect(multiplicadorTriples('triplero')).toBeGreaterThan(1)
    expect(multiplicadorRebotes('triplero')).toBeLessThan(1)
  })

  it('interior multiplica los rebotes hacia arriba y los triples hacia abajo', () => {
    expect(multiplicadorRebotes('interior')).toBeGreaterThan(1)
    expect(multiplicadorTriples('interior')).toBeLessThan(1)
  })

  it('sin especializar, los multiplicadores son neutros (1)', () => {
    expect(multiplicadorTriples(null)).toBe(1)
    expect(multiplicadorRebotes(null)).toBe(1)
  })
})
