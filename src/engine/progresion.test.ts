import { describe, expect, it } from 'vitest'
import { avanzarTemporada } from './progresion'

function azarFijo(valor: number): () => number {
  return () => valor
}

describe('avanzarTemporada', () => {
  it('sube OVR en edad joven (19-23) si no llegó al potencial', () => {
    const resultado = avanzarTemporada({ ovr: 50, edad: 20, potencial: 80 }, azarFijo(0.5))
    expect(resultado.ovr).toBeGreaterThan(50)
  })

  it('nunca supera el potencial oculto', () => {
    for (let i = 0; i < 50; i++) {
      const resultado = avanzarTemporada({ ovr: 78, edad: 21, potencial: 80 }, Math.random)
      expect(resultado.ovr).toBeLessThanOrEqual(80)
    }
  })

  it('declina en edad avanzada (32+) aunque no haya llegado al potencial', () => {
    const resultado = avanzarTemporada({ ovr: 70, edad: 33, potencial: 90 }, azarFijo(0.5))
    expect(resultado.ovr).toBeLessThan(70)
  })

  it('no baja de un piso mínimo razonable (no queda en negativo ni ridículo)', () => {
    let jugador = { ovr: 45, edad: 38, potencial: 60 }
    for (let i = 0; i < 10; i++) {
      jugador = avanzarTemporada(jugador, azarFijo(0.99))
    }
    expect(jugador.ovr).toBeGreaterThanOrEqual(30)
  })

  it('la edad avanza en 1 cada llamada', () => {
    const resultado = avanzarTemporada({ ovr: 50, edad: 20, potencial: 80 }, azarFijo(0.5))
    expect(resultado.edad).toBe(21)
  })

  it('en meseta (28-31) el cambio es chico, no un salto grande', () => {
    const resultado = avanzarTemporada({ ovr: 75, edad: 29, potencial: 90 }, azarFijo(0.5))
    expect(Math.abs(resultado.ovr - 75)).toBeLessThanOrEqual(1)
  })
})
