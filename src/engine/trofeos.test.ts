import { describe, expect, it } from 'vitest'
import { evaluarTrofeosTemporada, TROFEOS_INICIALES } from './trofeos'

function azarFijo(valor: number): () => number {
  return () => valor
}

// Edad neutra (no cae en año de Mundial ni de JJOO) para no ensuciar los tests que solo
// quieren probar All-Star/MVP — ver evaluarTrofeosTemporada para el criterio del ciclo.
const EDAD_NEUTRA = 27

describe('evaluarTrofeosTemporada', () => {
  it('fuera de la NBA no otorga ningún trofeo', () => {
    const { trofeos, ganados } = evaluarTrofeosTemporada(TROFEOS_INICIALES, 95, EDAD_NEUTRA, 'pre-nba', azarFijo(0))
    expect(trofeos).toEqual(TROFEOS_INICIALES)
    expect(ganados).toEqual({ allStar: false, mvp: false, mundial: false, jjoo: false })
  })

  it('en la NBA con OVR >= 80, suma All-Star siempre (determinista)', () => {
    const { trofeos, ganados } = evaluarTrofeosTemporada(TROFEOS_INICIALES, 80, EDAD_NEUTRA, 'nba', azarFijo(0.99))
    expect(trofeos.allStar).toBe(1)
    expect(ganados.allStar).toBe(true)
  })

  it('en la NBA con OVR < 80, no suma All-Star', () => {
    const { trofeos } = evaluarTrofeosTemporada(TROFEOS_INICIALES, 79, EDAD_NEUTRA, 'nba', azarFijo(0))
    expect(trofeos.allStar).toBe(0)
  })

  it('MVP requiere OVR >= 90 Y algo de suerte (azar bajo)', () => {
    const conSuerte = evaluarTrofeosTemporada(TROFEOS_INICIALES, 92, EDAD_NEUTRA, 'nba', azarFijo(0))
    const sinSuerte = evaluarTrofeosTemporada(TROFEOS_INICIALES, 92, EDAD_NEUTRA, 'nba', azarFijo(0.99))
    expect(conSuerte.trofeos.mvp).toBe(1)
    expect(conSuerte.ganados.mvp).toBe(true)
    expect(sinSuerte.trofeos.mvp).toBe(0)
  })

  it('MVP no se otorga aunque haya suerte si el OVR no llega a 90', () => {
    const { trofeos } = evaluarTrofeosTemporada(TROFEOS_INICIALES, 85, EDAD_NEUTRA, 'nba', azarFijo(0))
    expect(trofeos.mvp).toBe(0)
  })

  it('Mundial solo puede tocar en un "año de Mundial" (edad múltiplo de 4)', () => {
    const enAnio = evaluarTrofeosTemporada(TROFEOS_INICIALES, 85, 24, 'nba', azarFijo(0))
    const fueraDeAnio = evaluarTrofeosTemporada(TROFEOS_INICIALES, 85, 25, 'nba', azarFijo(0))
    expect(enAnio.ganados.mundial).toBe(true)
    expect(fueraDeAnio.ganados.mundial).toBe(false)
  })

  it('JJOO cae la temporada siguiente al Mundial (calendario real: no equidistante)', () => {
    const enAnio = evaluarTrofeosTemporada(TROFEOS_INICIALES, 85, 25, 'nba', azarFijo(0))
    const fueraDeAnio = evaluarTrofeosTemporada(TROFEOS_INICIALES, 85, 24, 'nba', azarFijo(0))
    expect(enAnio.ganados.jjoo).toBe(true)
    expect(fueraDeAnio.ganados.jjoo).toBe(false)
  })

  it('no toca los anillos — esos se otorgan por fuera, jugando los playoffs (ver playoffs.ts)', () => {
    const previos = { anillos: 2, allStar: 0, mvp: 0, mundial: 0, jjoo: 0 }
    const { trofeos } = evaluarTrofeosTemporada(previos, 95, EDAD_NEUTRA, 'nba', azarFijo(0))
    expect(trofeos.anillos).toBe(2)
  })

  it('acumula sobre los trofeos previos, no los resetea', () => {
    const previos = { anillos: 2, allStar: 3, mvp: 1, mundial: 1, jjoo: 0 }
    const { trofeos } = evaluarTrofeosTemporada(previos, 80, EDAD_NEUTRA, 'nba', azarFijo(0.99))
    expect(trofeos.allStar).toBe(4)
    expect(trofeos.anillos).toBe(2)
    expect(trofeos.mvp).toBe(1)
    expect(trofeos.mundial).toBe(1)
  })
})
