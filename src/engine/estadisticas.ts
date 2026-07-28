// Estadísticas de temporada derivadas de OVR + rol (titular/rotación/banca según qué tan
// lejos está tu OVR del nivel del club). Fórmulas de balance de juego, no estadística real
// de básquet — pensadas para que se sientan coherentes con el resto del motor (más OVR y
// más minutos = mejores números), no para modelar el deporte con precisión.
import { multiplicadorRebotes, multiplicadorTriples, type TipoEspecializacion } from './especializacion'

export type Rol = 'titular' | 'rotacion' | 'banca'

export interface EstadisticasTemporada {
  pj: number
  minutos: number
  rol: Rol
  ppg: number
  rpg: number
  apg: number
  triples: number // triples anotados por partido — sube/baja según especialización (ver especializacion.ts)
}

const PARTIDOS_POR_TEMPORADA_NBA = 82
const PARTIDOS_POR_TEMPORADA_OTRAS = 34 // liga doméstica / universidad / G-League: valor fijo aproximado, no calendario real

const MINUTOS_POR_ROL: Record<Rol, number> = {
  titular: 32,
  rotacion: 20,
  banca: 10,
}

function rolSegunNivelClub(ovr: number, nivelClub: number | null): Rol {
  if (nivelClub === null) return 'rotacion'
  const diferencia = ovr - nivelClub
  if (diferencia >= 0) return 'titular'
  if (diferencia >= -10) return 'rotacion'
  return 'banca'
}

function redondear1Decimal(valor: number): number {
  return Math.round(valor * 10) / 10
}

export function calcularEstadisticasTemporada(
  ovr: number,
  nivelClub: number | null,
  fase: 'pre-nba' | 'nba',
  especializacion: TipoEspecializacion | null = null,
): EstadisticasTemporada {
  const rol = rolSegunNivelClub(ovr, nivelClub)
  const minutos = MINUTOS_POR_ROL[rol]
  const pj = fase === 'nba' ? PARTIDOS_POR_TEMPORADA_NBA : PARTIDOS_POR_TEMPORADA_OTRAS

  const factorOvr = Math.max(0, ovr - 30) / 70 // normalizado ~0-1 para ovr 30-100
  const escalaMinutos = minutos / MINUTOS_POR_ROL.titular

  return {
    pj,
    minutos,
    rol,
    ppg: redondear1Decimal(factorOvr * 26 * escalaMinutos),
    rpg: redondear1Decimal(factorOvr * 10 * escalaMinutos * multiplicadorRebotes(especializacion)),
    apg: redondear1Decimal(factorOvr * 8 * escalaMinutos),
    triples: redondear1Decimal(factorOvr * 3 * escalaMinutos * multiplicadorTriples(especializacion)),
  }
}
