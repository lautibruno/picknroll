import { describe, expect, it } from 'vitest'
import { generarPotencial } from './potencial'

// Azar determinístico: devuelve valores fijos en secuencia, para testear cada tramo.
function azarFijo(...valores: number[]): () => number {
  let i = 0
  return () => valores[Math.min(i++, valores.length - 1)]
}

describe('generarPotencial', () => {
  it('cae en el tramo 60-75 (mayoría) con tirada baja', () => {
    const potencial = generarPotencial(azarFijo(0.1, 0))
    expect(potencial).toBeGreaterThanOrEqual(60)
    expect(potencial).toBeLessThanOrEqual(75)
  })

  it('cae en el tramo 76-85 con tirada en el segundo rango', () => {
    const potencial = generarPotencial(azarFijo(0.75, 0))
    expect(potencial).toBeGreaterThanOrEqual(76)
    expect(potencial).toBeLessThanOrEqual(85)
  })

  it('cae en el tramo 86-92 (all-star) con tirada en el tercer rango', () => {
    const potencial = generarPotencial(azarFijo(0.95, 0))
    expect(potencial).toBeGreaterThanOrEqual(86)
    expect(potencial).toBeLessThanOrEqual(92)
  })

  it('cae en el tramo 93-99 (elite histórico) con tirada muy alta', () => {
    const potencial = generarPotencial(azarFijo(0.99, 0))
    expect(potencial).toBeGreaterThanOrEqual(93)
    expect(potencial).toBeLessThanOrEqual(99)
  })

  it('usa el segundo valor de azar para variar dentro del tramo', () => {
    const bajo = generarPotencial(azarFijo(0.1, 0))
    const alto = generarPotencial(azarFijo(0.1, 0.999))
    expect(alto).toBeGreaterThan(bajo)
  })

  it('sobre muchas corridas, la mayoría cae en el tramo 60-75', () => {
    let contadorMayoria = 0
    const total = 2000
    for (let i = 0; i < total; i++) {
      const potencial = generarPotencial(Math.random)
      if (potencial >= 60 && potencial <= 75) contadorMayoria++
    }
    // ~70% esperado, con margen amplio para no ser flaky
    expect(contadorMayoria / total).toBeGreaterThan(0.6)
    expect(contadorMayoria / total).toBeLessThan(0.8)
  })

  it('nunca devuelve un potencial fuera de rango [60, 99]', () => {
    for (let i = 0; i < 500; i++) {
      const potencial = generarPotencial(Math.random)
      expect(potencial).toBeGreaterThanOrEqual(60)
      expect(potencial).toBeLessThanOrEqual(99)
    }
  })
})
