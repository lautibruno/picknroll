import { describe, expect, it } from 'vitest'
import { evaluarTrofeosTemporada, TROFEOS_INICIALES } from './trofeos'

function azarFijo(valor: number): () => number {
  return () => valor
}

describe('evaluarTrofeosTemporada', () => {
  it('fuera de la NBA no otorga ningún trofeo', () => {
    const trofeos = evaluarTrofeosTemporada(TROFEOS_INICIALES, 95, 'pre-nba', azarFijo(0))
    expect(trofeos).toEqual(TROFEOS_INICIALES)
  })

  it('en la NBA con OVR >= 80, suma All-Star siempre (determinista)', () => {
    const trofeos = evaluarTrofeosTemporada(TROFEOS_INICIALES, 80, 'nba', azarFijo(0.99))
    expect(trofeos.allStar).toBe(1)
  })

  it('en la NBA con OVR < 80, no suma All-Star', () => {
    const trofeos = evaluarTrofeosTemporada(TROFEOS_INICIALES, 79, 'nba', azarFijo(0))
    expect(trofeos.allStar).toBe(0)
  })

  it('MVP requiere OVR >= 90 Y algo de suerte (azar bajo)', () => {
    const conSuerte = evaluarTrofeosTemporada(TROFEOS_INICIALES, 92, 'nba', azarFijo(0))
    const sinSuerte = evaluarTrofeosTemporada(TROFEOS_INICIALES, 92, 'nba', azarFijo(0.99))
    expect(conSuerte.mvp).toBe(1)
    expect(sinSuerte.mvp).toBe(0)
  })

  it('MVP no se otorga aunque haya suerte si el OVR no llega a 90', () => {
    const trofeos = evaluarTrofeosTemporada(TROFEOS_INICIALES, 85, 'nba', azarFijo(0))
    expect(trofeos.mvp).toBe(0)
  })

  it('no toca los anillos — esos se otorgan por fuera, jugando los playoffs (ver playoffs.ts)', () => {
    const trofeos = evaluarTrofeosTemporada({ anillos: 2, allStar: 0, mvp: 0 }, 95, 'nba', azarFijo(0))
    expect(trofeos.anillos).toBe(2)
  })

  it('acumula sobre los trofeos previos, no los resetea', () => {
    const previos = { anillos: 2, allStar: 3, mvp: 1 }
    const trofeos = evaluarTrofeosTemporada(previos, 80, 'nba', azarFijo(0.99))
    expect(trofeos.allStar).toBe(4)
    expect(trofeos.anillos).toBe(2)
    expect(trofeos.mvp).toBe(1)
  })
})
