import { describe, expect, it } from 'vitest'
import { calcularEstadisticasTemporada } from './estadisticas'

describe('calcularEstadisticasTemporada', () => {
  it('con OVR >= nivel del club, el rol es titular con más minutos', () => {
    const stats = calcularEstadisticasTemporada(70, 60, 'nba')
    expect(stats.rol).toBe('titular')
    expect(stats.minutos).toBe(32)
  })

  it('con OVR muy por debajo del nivel del club, el rol es banca con pocos minutos', () => {
    const stats = calcularEstadisticasTemporada(50, 70, 'nba')
    expect(stats.rol).toBe('banca')
    expect(stats.minutos).toBe(10)
  })

  it('sin club (camino genérico sin equipo concreto), el rol por defecto es rotación', () => {
    const stats = calcularEstadisticasTemporada(50, null, 'pre-nba')
    expect(stats.rol).toBe('rotacion')
  })

  it('en fase NBA juega 82 partidos, fuera de la NBA menos', () => {
    const statsNba = calcularEstadisticasTemporada(70, 60, 'nba')
    const statsOtras = calcularEstadisticasTemporada(70, 60, 'pre-nba')
    expect(statsNba.pj).toBe(82)
    expect(statsOtras.pj).toBeLessThan(statsNba.pj)
  })

  it('a mayor OVR, mayor PPG (con el mismo rol/minutos)', () => {
    const bajo = calcularEstadisticasTemporada(50, 50, 'nba')
    const alto = calcularEstadisticasTemporada(90, 50, 'nba')
    expect(alto.ppg).toBeGreaterThan(bajo.ppg)
  })

  it('nunca devuelve estadísticas negativas', () => {
    const stats = calcularEstadisticasTemporada(30, 90, 'nba')
    expect(stats.ppg).toBeGreaterThanOrEqual(0)
    expect(stats.rpg).toBeGreaterThanOrEqual(0)
    expect(stats.apg).toBeGreaterThanOrEqual(0)
  })
})
