import { describe, expect, it } from 'vitest'
import { elegirEquiposOfrecidos, elegirTraspasoOfrecido, type Equipo } from './eventos'

const EQUIPOS: Equipo[] = [
  { id: 'bajo-1', nombre: 'Serie B FC', nivel: 40 },
  { id: 'bajo-2', nombre: 'Segunda FC', nivel: 45 },
  { id: 'medio-1', nombre: 'Medio FC', nivel: 65 },
  { id: 'medio-2', nombre: 'Medio United', nivel: 68 },
  { id: 'alto-1', nombre: 'Barcelona-like', nivel: 88 },
  { id: 'alto-2', nombre: 'Real-like', nivel: 90 },
]

function azarFijo(...valores: number[]): () => number {
  let i = 0
  return () => valores[Math.min(i++, valores.length - 1)]
}

describe('elegirEquiposOfrecidos', () => {
  it('con OVR bajo, nunca ofrece equipos de nivel muy alto (efecto bola de nieve)', () => {
    const ofrecidos = elegirEquiposOfrecidos(EQUIPOS, 42, azarFijo(0, 0.3, 0.6))
    for (const equipo of ofrecidos) {
      expect(equipo.nivel).toBeLessThan(88)
    }
  })

  it('con OVR alto, puede ofrecer los equipos top', () => {
    const ofrecidos = elegirEquiposOfrecidos(EQUIPOS, 89, azarFijo(0, 0.3, 0.6))
    const nivelesOfrecidos = ofrecidos.map((e) => e.nivel)
    // al menos el pool disponible incluye los de nivel alto (no filtrados por debajo del jugador)
    expect(Math.max(...nivelesOfrecidos)).toBeGreaterThanOrEqual(65)
  })

  it('siempre devuelve como máximo 3 opciones', () => {
    const ofrecidos = elegirEquiposOfrecidos(EQUIPOS, 70, azarFijo(0, 0.3, 0.6, 0.9))
    expect(ofrecidos.length).toBeLessThanOrEqual(3)
  })

  it('no repite el mismo equipo dos veces en la misma oferta', () => {
    const ofrecidos = elegirEquiposOfrecidos(EQUIPOS, 70, azarFijo(0, 0, 0, 0))
    const ids = ofrecidos.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('elegirTraspasoOfrecido', () => {
  const clubActual: Equipo = { id: 'medio-1', nombre: 'Medio FC', nivel: 65 }

  it('siempre incluye el club actual como una de las opciones (quedarte)', () => {
    const ofrecidos = elegirTraspasoOfrecido(EQUIPOS, 70, clubActual, azarFijo(0, 0.3))
    expect(ofrecidos.some((e) => e.id === clubActual.id)).toBe(true)
  })

  it('devuelve 3 opciones cuando hay suficientes clubes elegibles', () => {
    const ofrecidos = elegirTraspasoOfrecido(EQUIPOS, 70, clubActual, azarFijo(0, 0.3))
    expect(ofrecidos.length).toBe(3)
  })

  it('las 2 ofertas nuevas nunca son el club actual ni se repiten entre sí', () => {
    const ofrecidos = elegirTraspasoOfrecido(EQUIPOS, 70, clubActual, azarFijo(0, 0.3))
    const ofertas = ofrecidos.filter((e) => e.id !== clubActual.id)
    expect(ofertas.length).toBe(2)
    expect(new Set(ofertas.map((e) => e.id)).size).toBe(2)
  })

  it('el club actual queda siempre al final de la lista', () => {
    const ofrecidos = elegirTraspasoOfrecido(EQUIPOS, 70, clubActual, azarFijo(0, 0.3))
    expect(ofrecidos.at(-1)?.id).toBe(clubActual.id)
  })
})
