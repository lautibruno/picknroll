import { describe, expect, it } from 'vitest'
import { crearCarrera, elegirOpcion, type Equipo } from './motorCarrera'
import { armarResumenCarrera, armarTextoCompartir } from './compartirCarrera'

const EQUIPOS_NBA: Equipo[] = [
  { id: 'a', nombre: 'A', nivel: 40 },
  { id: 'b', nombre: 'B', nivel: 45 },
]

function azarFijo(valor: number): () => number {
  return () => valor
}

describe('compartirCarrera', () => {
  it('arma un resumen con los datos clave de la carrera', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'ar', 'C')
    const evento = carrera.eventoPendiente!
    const opcion = evento.tipo === 'club-liga-domestica' ? evento.opciones[0] : null
    carrera = elegirOpcion(carrera, opcion!.id, azarFijo(0.5), EQUIPOS_NBA)

    const resumen = armarResumenCarrera(carrera, 'Fernández')
    expect(resumen.nombre).toBe('Fernández')
    expect(resumen.temporadas).toBe(carrera.historial.length)
    expect(resumen.picoOvr).toBeGreaterThanOrEqual(carrera.jugador.ovr)
    expect(resumen.valorMaximoEuros).toBeGreaterThan(0)
    expect(resumen.trofeos).toEqual(carrera.trofeos)
    expect(resumen.equipos.length).toBeGreaterThan(0)
    expect(resumen.equipos[0].nombre).toBe(carrera.historial[0].clubNombre)
  })

  it('el pico de valor de mercado corresponde al pico de OVR, no al OVR actual', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'C')
    carrera = {
      ...carrera,
      jugador: { ...carrera.jugador, ovr: 60 },
      historial: [
        {
          edad: 25,
          ovr: 95,
          clubId: 'club-test',
          clubNombre: 'Club Test',
          clubEscudoUrl: null,
          trofeosGanados: [],
          pj: 82,
          minutos: 30,
          rol: 'titular',
          ppg: 20,
          rpg: 5,
          apg: 5,
          triples: 2,
        },
      ],
    }
    const resumen = armarResumenCarrera(carrera, 'Test')
    expect(resumen.picoOvr).toBe(95)
  })

  it('la lista de equipos no repite un club al que se volvió años después', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'us', 'C')
    const entradaBase = {
      edad: 25,
      ovr: 70,
      trofeosGanados: [],
      pj: 82,
      minutos: 30,
      rol: 'titular' as const,
      ppg: 15,
      rpg: 5,
      apg: 3,
      triples: 1,
    }
    carrera = {
      ...carrera,
      historial: [
        { ...entradaBase, edad: 25, clubId: 'a', clubNombre: 'Club A', clubEscudoUrl: 'https://ej.com/a.png' },
        { ...entradaBase, edad: 26, clubId: 'b', clubNombre: 'Club B', clubEscudoUrl: null },
        { ...entradaBase, edad: 27, clubId: 'a', clubNombre: 'Club A', clubEscudoUrl: 'https://ej.com/a.png' },
      ],
    }
    const resumen = armarResumenCarrera(carrera, 'Test')
    expect(resumen.equipos).toEqual([
      { nombre: 'Club A', escudoUrl: 'https://ej.com/a.png' },
      { nombre: 'Club B', escudoUrl: null },
    ])
  })

  it('el texto para compartir incluye el link y solo los trofeos realmente ganados', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'ar', 'C')
    const evento = carrera.eventoPendiente!
    const opcion = evento.tipo === 'club-liga-domestica' ? evento.opciones[0] : null
    carrera = elegirOpcion(carrera, opcion!.id, azarFijo(0.5), EQUIPOS_NBA)
    const resumen = armarResumenCarrera(carrera, 'Fernández')

    const texto = armarTextoCompartir(resumen, 'https://picknroll.app')
    expect(texto).toContain('https://picknroll.app')
    expect(texto).not.toContain('?')
    expect(texto).toContain('Fernández')
    if (resumen.trofeos.mvp === 0) expect(texto).not.toContain('MVP')
    if (resumen.trofeos.anillos === 0) expect(texto).not.toContain('anillo')
  })
})
