import { describe, expect, it } from 'vitest'
import { generarCrecimientoPorTraspaso } from './crecimientoPorTraspaso'

function azarFijo(valor: number): () => number {
  return () => valor
}

describe('generarCrecimientoPorTraspaso', () => {
  it('un club muy por encima de tu nivel da un salto grande', () => {
    const crecimiento = generarCrecimientoPorTraspaso(50, 80, 2, null, azarFijo(0.5))
    expect(crecimiento).toBeGreaterThan(8)
  })

  it('un club similar a tu nivel da un salto chico', () => {
    const crecimiento = generarCrecimientoPorTraspaso(65, 66, 2, null, azarFijo(0.5))
    expect(Math.abs(crecimiento)).toBeLessThanOrEqual(3)
  })

  it('un club bastante más chico que tu nivel te estanca, pero nunca te hace retroceder', () => {
    // Pedido explícito del usuario: "crecer es imposible y disminuye muchísimo la OVR" —
    // un club chico como mucho no aporta nada, jamás debería restar por sí solo.
    for (let i = 0; i < 20; i++) {
      const crecimiento = generarCrecimientoPorTraspaso(75, 50, 2, null, () => i / 20)
      expect(crecimiento).toBeGreaterThanOrEqual(0)
    }
  })

  it('más temporadas en el mismo bloque (Exprés) escala el crecimiento hacia arriba', () => {
    const dosTemporadas = generarCrecimientoPorTraspaso(50, 80, 2, null, azarFijo(0.5))
    const cuatroTemporadas = generarCrecimientoPorTraspaso(50, 80, 4, null, azarFijo(0.5))
    expect(cuatroTemporadas).toBeGreaterThan(dosTemporadas)
  })

  it('ganar la titularidad (rol forzado "titular") suma un bonus extra de crecimiento', () => {
    const sinRol = generarCrecimientoPorTraspaso(60, 65, 2, null, azarFijo(0.5))
    const conTitular = generarCrecimientoPorTraspaso(60, 65, 2, 'titular', azarFijo(0.5))
    expect(conTitular).toBeGreaterThan(sinRol)
  })

  it('perder terreno (rol forzado "banca") resta crecimiento respecto a no tener rol forzado', () => {
    const sinRol = generarCrecimientoPorTraspaso(60, 65, 2, null, azarFijo(0.5))
    const conBanca = generarCrecimientoPorTraspaso(60, 65, 2, 'banca', azarFijo(0.5))
    expect(conBanca).toBeLessThan(sinRol)
  })
})
