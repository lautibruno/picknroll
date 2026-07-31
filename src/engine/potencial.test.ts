import { describe, expect, it } from 'vitest'
import { generarPotencial } from './potencial'

// Azar determinístico: devuelve valores fijos en secuencia, para testear cada tramo.
function azarFijo(...valores: number[]): () => number {
  let i = 0
  return () => valores[Math.min(i++, valores.length - 1)]
}

describe('generarPotencial', () => {
  it('cae en el tramo 68-80 (mayoría) con tirada baja', () => {
    const potencial = generarPotencial(azarFijo(0.1, 0))
    expect(potencial).toBeGreaterThanOrEqual(68)
    expect(potencial).toBeLessThanOrEqual(80)
  })

  it('cae en el tramo 81-88 con tirada en el segundo rango', () => {
    const potencial = generarPotencial(azarFijo(0.65, 0))
    expect(potencial).toBeGreaterThanOrEqual(81)
    expect(potencial).toBeLessThanOrEqual(88)
  })

  it('cae en el tramo 89-94 (all-star) con tirada en el tercer rango', () => {
    const potencial = generarPotencial(azarFijo(0.85, 0))
    expect(potencial).toBeGreaterThanOrEqual(89)
    expect(potencial).toBeLessThanOrEqual(94)
  })

  it('cae en el tramo 95-99 (elite histórico) con tirada muy alta', () => {
    const potencial = generarPotencial(azarFijo(0.97, 0))
    expect(potencial).toBeGreaterThanOrEqual(95)
    expect(potencial).toBeLessThanOrEqual(99)
  })

  it('usa el segundo valor de azar para variar dentro del tramo', () => {
    const bajo = generarPotencial(azarFijo(0.1, 0))
    const alto = generarPotencial(azarFijo(0.1, 0.999))
    expect(alto).toBeGreaterThan(bajo)
  })

  it('sobre muchas corridas, la mayoría cae en el tramo más bajo (68-80)', () => {
    let contadorMayoria = 0
    const total = 2000
    for (let i = 0; i < total; i++) {
      const potencial = generarPotencial(Math.random)
      if (potencial >= 68 && potencial <= 80) contadorMayoria++
    }
    // ~42% esperado, con margen amplio para no ser flaky
    expect(contadorMayoria / total).toBeGreaterThan(0.32)
    expect(contadorMayoria / total).toBeLessThan(0.52)
  })

  it('las carreras elite siguen siendo raras (menos del 15% supera 94)', () => {
    let elite = 0
    const total = 2000
    for (let i = 0; i < total; i++) {
      if (generarPotencial(Math.random) > 94) elite++
    }
    expect(elite / total).toBeLessThan(0.15)
  })

  it('nunca devuelve un potencial fuera de rango [68, 99]', () => {
    for (let i = 0; i < 500; i++) {
      const potencial = generarPotencial(Math.random)
      expect(potencial).toBeGreaterThanOrEqual(68)
      expect(potencial).toBeLessThanOrEqual(99)
    }
  })
})
