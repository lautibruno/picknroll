import { describe, expect, it } from 'vitest'
import { generarDecisionConvocatoria, ganoConvocatoria, OPCIONES_CONVOCATORIA } from './convocatorias'

function azarFijo(valor: number): () => number {
  return () => valor
}

describe('generarDecisionConvocatoria', () => {
  it('la escena del Mundial habla del Mundial, no de los Juegos', () => {
    const decision = generarDecisionConvocatoria('mundial', azarFijo(0.1))
    expect(decision.torneo).toBe('mundial')
    expect(`${decision.escenaTitulo} ${decision.escenaDescripcion}`.toLowerCase()).toContain('mundial')
  })

  it('la escena de los JJOO habla de los Juegos', () => {
    const decision = generarDecisionConvocatoria('jjoo', azarFijo(0.1))
    expect(decision.torneo).toBe('jjoo')
    const texto = `${decision.escenaTitulo} ${decision.escenaDescripcion}`.toLowerCase()
    expect(texto.includes('olímpic') || texto.includes('jjoo') || texto.includes('juegos')).toBe(true)
  })

  it('con azar favorable, las dos opciones salen bien', () => {
    const decision = generarDecisionConvocatoria('mundial', azarFijo(0.01))
    expect(decision.resultadoSiEquipo).toBe(true)
    expect(decision.resultadoSiResponsabilidad).toBe(true)
  })

  it('con azar desfavorable, las dos opciones salen mal', () => {
    const decision = generarDecisionConvocatoria('mundial', azarFijo(0.99))
    expect(decision.resultadoSiEquipo).toBe(false)
    expect(decision.resultadoSiResponsabilidad).toBe(false)
  })
})

describe('ganoConvocatoria', () => {
  it('devuelve el resultado ya resuelto de la opción elegida, sin tirar un dado nuevo', () => {
    const decision = {
      torneo: 'mundial' as const,
      escenaTitulo: 't',
      escenaDescripcion: 'd',
      resultadoSiEquipo: true,
      resultadoSiResponsabilidad: false,
    }
    expect(ganoConvocatoria(decision, 'jugar-para-el-equipo')).toBe(true)
    expect(ganoConvocatoria(decision, 'tomar-la-responsabilidad')).toBe(false)
  })

  it('hay exactamente dos opciones y ninguna es infalible', () => {
    expect(OPCIONES_CONVOCATORIA).toHaveLength(2)
    for (const opcion of OPCIONES_CONVOCATORIA) {
      expect(opcion.probabilidadExito).toBeGreaterThan(0)
      expect(opcion.probabilidadExito).toBeLessThan(1)
    }
  })
})
