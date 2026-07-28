import { describe, expect, it } from 'vitest'
import { calcularVeredicto } from './veredicto'
import type { Carrera } from './motorCarrera'

function carreraBase(overrides: Partial<Carrera>): Carrera {
  return {
    jugador: { ovr: 50, edad: 40, potencial: 80 },
    nacionalidad: 'ar',
    posicion: 'C',
    intervaloTemporadas: 1,
    fase: 'nba',
    poolPreNba: [],
    clubActual: null,
    especializacion: null,
    rolForzado: null,
    eventoPendiente: null,
    historial: [],
    trofeos: { anillos: 0, allStar: 0, mvp: 0, mundial: 0, jjoo: 0 },
    ultimoResultadoRiesgo: null,
    resumenTemporada: null,
    estadoPlayoffsPendiente: null,
    ovrAlIniciarDecision: 50,
    ultimoCambioOvr: 0,
    retirado: true,
    ...overrides,
  }
}

describe('calcularVeredicto', () => {
  it('si nunca llegó a la NBA, el veredicto lo dice sin importar el OVR', () => {
    const veredicto = calcularVeredicto(carreraBase({ fase: 'pre-nba', jugador: { ovr: 95, edad: 40, potencial: 99 } }))
    expect(veredicto.titulo).toBe('NUNCA LLEGÓ A LA NBA')
  })

  it('con MVP, es Leyenda sin importar otra cosa', () => {
    const veredicto = calcularVeredicto(carreraBase({ trofeos: { anillos: 0, allStar: 0, mvp: 1, mundial: 0, jjoo: 0 } }))
    expect(veredicto.titulo).toBe('LEYENDA')
  })

  it('con pico de OVR 93+, es Leyenda aunque no tenga trofeos', () => {
    const veredicto = calcularVeredicto(
      carreraBase({ jugador: { ovr: 60, edad: 40, potencial: 99 }, historial: [{ edad: 30, ovr: 94, clubId: null, clubNombre: null, clubEscudoUrl: null, trofeosGanados: [], pj: 82, minutos: 32, rol: 'titular', ppg: 20, rpg: 5, apg: 5, triples: 1 }] }),
    )
    expect(veredicto.titulo).toBe('LEYENDA')
  })

  it('con 3+ All-Star, es Estrella NBA', () => {
    const veredicto = calcularVeredicto(carreraBase({ trofeos: { anillos: 0, allStar: 3, mvp: 0, mundial: 0, jjoo: 0 } }))
    expect(veredicto.titulo).toBe('ESTRELLA NBA')
  })

  it('con al menos un All-Star, es Buen Titular', () => {
    const veredicto = calcularVeredicto(carreraBase({ trofeos: { anillos: 0, allStar: 1, mvp: 0, mundial: 0, jjoo: 0 } }))
    expect(veredicto.titulo).toBe('BUEN TITULAR')
  })

  it('sin trofeos ni pico alto, es Jugador de Rotación', () => {
    const veredicto = calcularVeredicto(carreraBase({ jugador: { ovr: 50, edad: 40, potencial: 70 } }))
    expect(veredicto.titulo).toBe('JUGADOR DE ROTACIÓN')
  })

  it('usa el pico histórico de OVR, no el final (que puede estar en declive)', () => {
    const veredicto = calcularVeredicto(
      carreraBase({
        jugador: { ovr: 55, edad: 40, potencial: 99 },
        historial: [{ edad: 29, ovr: 90, clubId: null, clubNombre: null, clubEscudoUrl: null, trofeosGanados: [], pj: 82, minutos: 32, rol: 'titular', ppg: 25, rpg: 6, apg: 5, triples: 1 }],
      }),
    )
    expect(veredicto.titulo).toBe('ESTRELLA NBA')
  })
})
