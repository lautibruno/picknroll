import { describe, expect, it } from 'vitest'
import { generarCrecimientoPorTraspaso } from './crecimientoPorTraspaso'

describe('generarCrecimientoPorTraspaso', () => {
  it('siempre devuelve un valor positivo entre 1 y 4', () => {
    for (let i = 0; i < 100; i++) {
      const delta = generarCrecimientoPorTraspaso(Math.random)
      expect(delta).toBeGreaterThanOrEqual(1)
      expect(delta).toBeLessThanOrEqual(4)
    }
  })
})
