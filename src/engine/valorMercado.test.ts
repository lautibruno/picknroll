import { describe, expect, it } from 'vitest'
import { calcularValorMercadoEuros, formatoValorMercado } from './valorMercado'

describe('calcularValorMercadoEuros', () => {
  it('con OVR bajo (<=40), el valor es 0', () => {
    expect(calcularValorMercadoEuros(35)).toBe(0)
    expect(calcularValorMercadoEuros(40)).toBe(0)
  })

  it('a mayor OVR, mayor valor de mercado', () => {
    const bajo = calcularValorMercadoEuros(50)
    const alto = calcularValorMercadoEuros(85)
    expect(alto).toBeGreaterThan(bajo)
  })

  it('nunca es negativo', () => {
    expect(calcularValorMercadoEuros(0)).toBeGreaterThanOrEqual(0)
  })
})

describe('formatoValorMercado', () => {
  it('formatea millones con M', () => {
    expect(formatoValorMercado(11_000_000)).toBe('€11M')
  })

  it('formatea miles con K', () => {
    expect(formatoValorMercado(100_000)).toBe('€100K')
  })

  it('formatea valores chicos sin sufijo', () => {
    expect(formatoValorMercado(0)).toBe('€0')
  })
})
