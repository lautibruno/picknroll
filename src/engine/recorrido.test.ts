import { describe, expect, it } from 'vitest'
import { resumirRecorrido } from './recorrido'
import type { EntradaHistorial } from './motorCarrera'

function fila(edad: number, clubId: string | null, nombre: string, trofeos: EntradaHistorial['trofeosGanados'] = []): EntradaHistorial {
  return {
    edad,
    ovr: 70,
    clubId,
    clubNombre: nombre,
    clubEscudoUrl: null,
    trofeosGanados: trofeos,
    pj: 82,
    minutos: 30,
    rol: 'titular',
    ppg: 10,
    rpg: 4,
    apg: 3,
    triples: 1,
  }
}

describe('resumirRecorrido', () => {
  it('sin historial devuelve un recorrido vacío', () => {
    expect(resumirRecorrido([])).toEqual([])
  })

  it('agrupa temporadas consecutivas en el mismo club en un solo paso', () => {
    const pasos = resumirRecorrido([
      fila(19, 'a', 'Club A'),
      fila(20, 'a', 'Club A'),
      fila(21, 'a', 'Club A'),
    ])
    expect(pasos).toHaveLength(1)
    expect(pasos[0].temporadas).toBe(3)
    expect(pasos[0].edadDesde).toBe(19)
    expect(pasos[0].edadHasta).toBe(21)
  })

  it('separa un paso por cada club distinto, en orden', () => {
    const pasos = resumirRecorrido([
      fila(19, 'a', 'Club A'),
      fila(20, 'b', 'Club B'),
      fila(21, 'b', 'Club B'),
      fila(22, 'c', 'Club C'),
    ])
    expect(pasos.map((p) => p.clubNombre)).toEqual(['Club A', 'Club B', 'Club C'])
    expect(pasos.map((p) => p.temporadas)).toEqual([1, 2, 1])
  })

  it('volver al mismo club años después cuenta como un paso nuevo', () => {
    const pasos = resumirRecorrido([
      fila(19, 'a', 'Club A'),
      fila(20, 'b', 'Club B'),
      fila(21, 'a', 'Club A'),
    ])
    expect(pasos).toHaveLength(3)
    expect(pasos[2].clubNombre).toBe('Club A')
    expect(pasos[2].edadDesde).toBe(21)
  })

  it('junta los títulos ganados en todas las temporadas de ese paso', () => {
    const pasos = resumirRecorrido([
      fila(19, 'a', 'Club A', ['allstar']),
      fila(20, 'a', 'Club A', ['anillo', 'mvp']),
      fila(21, 'b', 'Club B', ['jjoo']),
    ])
    expect(pasos[0].trofeos).toEqual(['allstar', 'anillo', 'mvp'])
    expect(pasos[1].trofeos).toEqual(['jjoo'])
  })

  it('una temporada sin club no rompe: queda como paso con nombre de respaldo', () => {
    const pasos = resumirRecorrido([{ ...fila(19, null, 'x'), clubNombre: null }])
    expect(pasos[0].clubNombre).toBe('Sin club')
  })
})
