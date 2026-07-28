import { describe, expect, it } from 'vitest'
import { generarDecisionRiesgo } from './decisionesRiesgo'

function azarFijo(...valores: number[]): () => number {
  let i = 0
  return () => valores[Math.min(i++, valores.length - 1)]
}

describe('generarDecisionRiesgo', () => {
  it('con tirada de éxito baja, resuelve éxito', () => {
    const decision = generarDecisionRiesgo(azarFijo(0, 0))
    expect(decision.exito).toBe(true)
  })

  it('con tirada de éxito alta, resuelve fracaso', () => {
    const decision = generarDecisionRiesgo(azarFijo(0, 0.99))
    expect(decision.exito).toBe(false)
  })

  it('siempre trae una probabilidad de éxito entre 0 y 1', () => {
    for (let i = 0; i < 50; i++) {
      const decision = generarDecisionRiesgo(Math.random)
      expect(decision.probabilidadExito).toBeGreaterThan(0)
      expect(decision.probabilidadExito).toBeLessThan(1)
    }
  })

  it('siempre trae título y descripción no vacíos', () => {
    const decision = generarDecisionRiesgo(Math.random)
    expect(decision.titulo.length).toBeGreaterThan(0)
    expect(decision.descripcion.length).toBeGreaterThan(0)
  })
})
