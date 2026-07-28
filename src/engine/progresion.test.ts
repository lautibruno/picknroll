import { describe, expect, it } from 'vitest'
import { avanzarTemporada } from './progresion'

function azarFijo(valor: number): () => number {
  return () => valor
}

describe('avanzarTemporada', () => {
  it('en edad joven/pico (hasta 31) no hay crecimiento pasivo — eso sale de fichar/prestamos', () => {
    const resultado = avanzarTemporada({ ovr: 50, edad: 20, potencial: 80 }, azarFijo(0.5))
    expect(resultado.ovr).toBe(50)
  })

  it('nunca supera el potencial oculto', () => {
    for (let i = 0; i < 50; i++) {
      const resultado = avanzarTemporada({ ovr: 78, edad: 21, potencial: 80 }, Math.random)
      expect(resultado.ovr).toBeLessThanOrEqual(80)
    }
  })

  it('declina en edad avanzada (35+) aunque no haya llegado al potencial', () => {
    const resultado = avanzarTemporada({ ovr: 70, edad: 35, potencial: 90 }, azarFijo(0.5))
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

  it('en el pico (27-29) tampoco hay crecimiento pasivo — sigue sin cambios', () => {
    const resultado = avanzarTemporada({ ovr: 75, edad: 29, potencial: 90 }, azarFijo(0.99))
    expect(resultado.ovr).toBe(75)
  })

  it('el declive recién empieza en serio a los 32, no antes', () => {
    const sinDeclive = avanzarTemporada({ ovr: 75, edad: 31, potencial: 90 }, azarFijo(0.99))
    expect(sinDeclive.ovr).toBe(75)
  })
})
