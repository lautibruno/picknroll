import { describe, expect, it } from 'vitest'
import { crearCarrera, elegirOpcion, type Equipo } from './motorCarrera'
import { armarResumenCarrera, armarTextoCompartir, codificarResumen, decodificarResumen } from './compartirCarrera'

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

  it('codificar y después decodificar devuelve el mismo resumen (roundtrip)', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'ar', 'C')
    const evento = carrera.eventoPendiente!
    const opcion = evento.tipo === 'club-liga-domestica' ? evento.opciones[0] : null
    carrera = elegirOpcion(carrera, opcion!.id, azarFijo(0.5), EQUIPOS_NBA)
    const resumen = armarResumenCarrera(carrera, 'Ñañez')

    const codificado = codificarResumen(resumen)
    const decodificado = decodificarResumen(codificado)

    expect(decodificado).toEqual(resumen)
  })

  it('decodificar algo inválido devuelve null en vez de tirar', () => {
    expect(decodificarResumen('esto no es json codificado')).toBeNull()
    expect(decodificarResumen(encodeURIComponent(JSON.stringify({ foo: 'bar' })))).toBeNull()
  })

  it('el texto para compartir incluye el link y solo los trofeos realmente ganados', () => {
    let carrera = crearCarrera(azarFijo(0.1), 'ar', 'C')
    const evento = carrera.eventoPendiente!
    const opcion = evento.tipo === 'club-liga-domestica' ? evento.opciones[0] : null
    carrera = elegirOpcion(carrera, opcion!.id, azarFijo(0.5), EQUIPOS_NBA)
    const resumen = armarResumenCarrera(carrera, 'Fernández')

    const texto = armarTextoCompartir(resumen, 'https://picknroll.app/carrera?d=abc')
    expect(texto).toContain('https://picknroll.app/carrera?d=abc')
    expect(texto).toContain('Fernández')
    if (resumen.trofeos.mvp === 0) expect(texto).not.toContain('MVP')
    if (resumen.trofeos.anillos === 0) expect(texto).not.toContain('anillo')
  })
})
