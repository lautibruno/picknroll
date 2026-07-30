import { describe, expect, it } from 'vitest'
import {
  evaluarTrofeosTemporada,
  convocatoriaDisponible,
  probabilidadTituloLocal,
  TROFEOS_INICIALES,
} from './trofeos'

function azarFijo(valor: number): () => number {
  return () => valor
}

describe('evaluarTrofeosTemporada', () => {
  it('fuera de la NBA no otorga ningún trofeo', () => {
    const { trofeos, ganados } = evaluarTrofeosTemporada(TROFEOS_INICIALES, 95, 'pre-nba', azarFijo(0))
    expect(trofeos).toEqual(TROFEOS_INICIALES)
    expect(ganados).toEqual({ allStar: false, mvp: false })
  })

  it('en la NBA con OVR >= 80, suma All-Star siempre (determinista)', () => {
    const { trofeos, ganados } = evaluarTrofeosTemporada(TROFEOS_INICIALES, 80, 'nba', azarFijo(0.99))
    expect(trofeos.allStar).toBe(1)
    expect(ganados.allStar).toBe(true)
  })

  it('en la NBA con OVR < 80, no suma All-Star', () => {
    const { trofeos } = evaluarTrofeosTemporada(TROFEOS_INICIALES, 79, 'nba', azarFijo(0))
    expect(trofeos.allStar).toBe(0)
  })

  it('MVP requiere OVR >= 90 Y algo de suerte (azar bajo)', () => {
    const conSuerte = evaluarTrofeosTemporada(TROFEOS_INICIALES, 92, 'nba', azarFijo(0))
    const sinSuerte = evaluarTrofeosTemporada(TROFEOS_INICIALES, 92, 'nba', azarFijo(0.99))
    expect(conSuerte.trofeos.mvp).toBe(1)
    expect(conSuerte.ganados.mvp).toBe(true)
    expect(sinSuerte.trofeos.mvp).toBe(0)
  })

  it('MVP no se otorga aunque haya suerte si el OVR no llega a 90', () => {
    const { trofeos } = evaluarTrofeosTemporada(TROFEOS_INICIALES, 85, 'nba', azarFijo(0))
    expect(trofeos.mvp).toBe(0)
  })

  it('no toca anillos, Mundial, JJOO ni liga local — esos se ganan por fuera', () => {
    const previos = { anillos: 2, allStar: 0, mvp: 0, mundial: 1, jjoo: 1, ligaLocal: 3 }
    const { trofeos } = evaluarTrofeosTemporada(previos, 95, 'nba', azarFijo(0))
    expect(trofeos.anillos).toBe(2)
    expect(trofeos.mundial).toBe(1)
    expect(trofeos.jjoo).toBe(1)
    expect(trofeos.ligaLocal).toBe(3)
  })
})

describe('convocatoriaDisponible', () => {
  it('fuera de la NBA no hay convocatoria', () => {
    expect(convocatoriaDisponible(95, 24, 'pre-nba')).toBeNull()
  })

  it('el Mundial cae en su año del ciclo, con OVR suficiente', () => {
    expect(convocatoriaDisponible(85, 24, 'nba')).toBe('mundial')
  })

  it('los JJOO caen la temporada siguiente al Mundial (calendario real, no equidistante)', () => {
    expect(convocatoriaDisponible(85, 25, 'nba')).toBe('jjoo')
  })

  it('en los años sin torneo no hay convocatoria', () => {
    expect(convocatoriaDisponible(95, 26, 'nba')).toBeNull()
    expect(convocatoriaDisponible(95, 27, 'nba')).toBeNull()
  })

  it('no te convocan si no llegás al umbral de OVR del torneo', () => {
    expect(convocatoriaDisponible(70, 24, 'nba')).toBeNull()
    // 80 alcanza para el Mundial (78) pero no para los JJOO (82)
    expect(convocatoriaDisponible(80, 25, 'nba')).toBeNull()
  })
})

describe('probabilidadTituloLocal', () => {
  it('nunca devuelve una probabilidad fuera de [0, 1]', () => {
    for (const temporadas of [1, 3, 12]) {
      for (const nivel of [30, 60, 95]) {
        const p = probabilidadTituloLocal(nivel, 70, temporadas)
        expect(p).toBeGreaterThanOrEqual(0)
        expect(p).toBeLessThanOrEqual(1)
      }
    }
  })

  it('quedarse más temporadas en el mismo club sube la probabilidad', () => {
    const recien = probabilidadTituloLocal(60, 70, 1)
    const veterano = probabilidadTituloLocal(60, 70, 5)
    expect(veterano).toBeGreaterThan(recien)
  })

  it('un club fuerte da más chances que uno flojo', () => {
    expect(probabilidadTituloLocal(80, 70, 2)).toBeGreaterThan(probabilidadTituloLocal(40, 70, 2))
  })

  it('tiene un techo — nunca es casi seguro, ni quedándose una eternidad', () => {
    expect(probabilidadTituloLocal(99, 99, 40)).toBeLessThanOrEqual(0.4)
  })

  it('arranca siendo poco común (pedido: "que no sea algo TAN común")', () => {
    expect(probabilidadTituloLocal(50, 50, 1)).toBeLessThan(0.15)
  })
})
