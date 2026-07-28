import { describe, expect, it } from 'vitest'
import { generarPotencial } from './potencial'

// Azar determinístico: devuelve valores fijos en secuencia, para testear cada tramo.
function azarFijo(...valores: number[]): () => number {
  let i = 0
  return () => valores[Math.min(i++, valores.length - 1)]
}

describe('generarPotencial', () => {
  it('cae en el tramo 62-78 (mayoría) con tirada baja', () => {
    const potencial = generarPotencial(azarFijo(0.1, 0))
    expect(potencial).toBeGreaterThanOrEqual(62)
    expect(potencial).toBeLessThanOrEqual(78)
  })

  it('cae en el tramo 79-87 con tirada en el segundo rango', () => {
    const potencial = generarPotencial(azarFijo(0.65, 0))
    expect(potencial).toBeGreaterThanOrEqual(79)
    expect(potencial).toBeLessThanOrEqual(87)
  })

  it('cae en el tramo 88-93 (all-star) con tirada en el tercer rango', () => {
    const potencial = generarPotencial(azarFijo(0.85, 0))
    expect(potencial).toBeGreaterThanOrEqual(88)
    expect(potencial).toBeLessThanOrEqual(93)
  })

  it('cae en el tramo 94-99 (elite histórico) con tirada muy alta', () => {
    const potencial = generarPotencial(azarFijo(0.97, 0))
    expect(potencial).toBeGreaterThanOrEqual(94)
    expect(potencial).toBeLessThanOrEqual(99)
  })

  it('usa el segundo valor de azar para variar dentro del tramo', () => {
    const bajo = generarPotencial(azarFijo(0.1, 0))
    const alto = generarPotencial(azarFijo(0.1, 0.999))
    expect(alto).toBeGreaterThan(bajo)
  })

  it('sobre muchas corridas, la mayoría cae en el tramo 62-78', () => {
    let contadorMayoria = 0
    const total = 2000
    for (let i = 0; i < total; i++) {
      const potencial = generarPotencial(Math.random)
      if (potencial >= 62 && potencial <= 78) contadorMayoria++
    }
    // ~50% esperado, con margen amplio para no ser flaky
    expect(contadorMayoria / total).toBeGreaterThan(0.4)
    expect(contadorMayoria / total).toBeLessThan(0.6)
  })

  it('nunca devuelve un potencial fuera de rango [62, 99]', () => {
    for (let i = 0; i < 500; i++) {
      const potencial = generarPotencial(Math.random)
      expect(potencial).toBeGreaterThanOrEqual(62)
      expect(potencial).toBeLessThanOrEqual(99)
    }
  })
})
