import { describe, expect, it } from 'vitest'
import {
  generarDecisionRiesgo,
  cambioOvrPorRiesgo,
  CAMBIO_OVR_POR_IMPACTO,
  CANTIDAD_DECISIONES,
  TEMAS_PARA_TESTS,
  type ImpactoRiesgo,
} from './decisionesRiesgo'

function azarFijo(...valores: number[]): () => number {
  let i = 0
  return () => valores[Math.min(i++, valores.length - 1)]
}

// PRNG determinístico, para muestrear la distribución sin depender de Math.random.
function azarSemilla(semilla: number): () => number {
  let estado = semilla
  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296
    return estado / 4294967296
  }
}

describe('catálogo de decisiones', () => {
  it('hay 10 decisiones distintas (pedido del usuario: dejar de repetir siempre la misma)', () => {
    expect(CANTIDAD_DECISIONES).toBe(10)
    expect(new Set(TEMAS_PARA_TESTS.map((t) => t.titulo)).size).toBe(10)
  })

  it('cubre los tres niveles de impacto, con las de impacto alto en minoría', () => {
    const porImpacto = (i: ImpactoRiesgo) => TEMAS_PARA_TESTS.filter((t) => t.impacto === i).length
    expect(porImpacto('bajo')).toBeGreaterThan(0)
    expect(porImpacto('medio')).toBeGreaterThan(0)
    expect(porImpacto('alto')).toBeGreaterThan(0)
    expect(porImpacto('alto')).toBeLessThan(porImpacto('bajo'))
  })

  it('cada decisión trae sus propias etiquetas, sin textos vacíos', () => {
    for (const tema of TEMAS_PARA_TESTS) {
      for (const campo of [
        tema.titulo,
        tema.descripcion,
        tema.opcionArriesgar,
        tema.opcionSegura,
        tema.revelarExito,
        tema.revelarFallo,
        tema.textoExito,
        tema.textoFallo,
      ]) {
        expect(campo.length).toBeGreaterThan(0)
      }
      expect(tema.probabilidadExito).toBeGreaterThan(0)
      expect(tema.probabilidadExito).toBeLessThan(1)
    }
  })

  it('solo las decisiones de impacto medio mueven el rol titular/rotación', () => {
    for (const tema of TEMAS_PARA_TESTS) {
      expect(tema.afectaRol).toBe(tema.impacto === 'medio')
    }
  })
})

describe('cambioOvrPorRiesgo', () => {
  it('respeta los valores acordados con el usuario (+2/-1, +4/-2, +8/-4)', () => {
    expect(CAMBIO_OVR_POR_IMPACTO.bajo).toEqual({ exito: 2, fallo: -1 })
    expect(CAMBIO_OVR_POR_IMPACTO.medio).toEqual({ exito: 4, fallo: -2 })
    expect(CAMBIO_OVR_POR_IMPACTO.alto).toEqual({ exito: 8, fallo: -4 })
  })

  it('ganar siempre suma y perder siempre resta, en todos los niveles', () => {
    for (const impacto of ['bajo', 'medio', 'alto'] as const) {
      expect(cambioOvrPorRiesgo({ impacto, exito: true })).toBeGreaterThan(0)
      expect(cambioOvrPorRiesgo({ impacto, exito: false })).toBeLessThan(0)
    }
  })

  it('ganar paga el doble de lo que cuesta perder (arriesgar tiene que seguir conviniendo)', () => {
    for (const impacto of ['bajo', 'medio', 'alto'] as const) {
      const gana = cambioOvrPorRiesgo({ impacto, exito: true })
      const pierde = Math.abs(cambioOvrPorRiesgo({ impacto, exito: false }))
      expect(gana).toBe(pierde * 2)
    }
  })
})

describe('generarDecisionRiesgo', () => {
  it('devuelve una decisión del catálogo, con el resultado ya resuelto', () => {
    const decision = generarDecisionRiesgo(azarFijo(0.1))
    expect(TEMAS_PARA_TESTS.some((t) => t.titulo === decision.titulo)).toBe(true)
    expect(typeof decision.exito).toBe('boolean')
  })

  it('con tirada de éxito baja, resuelve éxito', () => {
    expect(generarDecisionRiesgo(azarFijo(0, 0)).exito).toBe(true)
  })

  it('con tirada de éxito alta, resuelve fracaso', () => {
    expect(generarDecisionRiesgo(azarFijo(0, 0.99)).exito).toBe(false)
  })

  it('a lo largo de muchas tiradas aparecen varias decisiones distintas (no siempre la misma)', () => {
    const azar = azarSemilla(12345)
    const vistas = new Set<string>()
    for (let i = 0; i < 400; i++) vistas.add(generarDecisionRiesgo(azar).titulo)
    expect(vistas.size).toBeGreaterThanOrEqual(8)
  })

  it('las de impacto alto salen bastante menos seguido que las de impacto bajo', () => {
    const azar = azarSemilla(999)
    const conteo: Record<ImpactoRiesgo, number> = { bajo: 0, medio: 0, alto: 0 }
    for (let i = 0; i < 2000; i++) conteo[generarDecisionRiesgo(azar).impacto] += 1
    expect(conteo.alto).toBeLessThan(conteo.bajo)
    expect(conteo.alto).toBeLessThan(conteo.medio)
    // pero no tan raras como para que una carrera entera pase sin ver ninguna
    expect(conteo.alto).toBeGreaterThan(0)
  })
})
