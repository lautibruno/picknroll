// Vitrina de trofeos — solo se ganan en la NBA (MVP: liga doméstica/universidad no otorga
// trofeos todavía). Umbrales deterministas para All-Star (mismo criterio de "gate por OVR"
// que el resto del motor); MVP y anillo suman algo de azar incluso entre los mejores,
// para que ni ser elite garantice ganarlos todas las temporadas.
import type { Azar } from './potencial'

export interface Trofeos {
  anillos: number
  allStar: number
  mvp: number
}

export const TROFEOS_INICIALES: Trofeos = { anillos: 0, allStar: 0, mvp: 0 }

const UMBRAL_OVR_ALL_STAR = 80
const UMBRAL_OVR_MVP = 90
const PROBABILIDAD_MVP_SI_ELEGIBLE = 0.3
const UMBRAL_NIVEL_CLUB_CONTENDIENTE = 85
const PROBABILIDAD_ANILLO_SI_CONTENDIENTE = 0.25

export function evaluarTrofeosTemporada(
  trofeosPrevios: Trofeos,
  ovr: number,
  nivelClub: number | null,
  fase: 'pre-nba' | 'nba',
  azar: Azar,
): Trofeos {
  if (fase !== 'nba') return trofeosPrevios

  const allStar = trofeosPrevios.allStar + (ovr >= UMBRAL_OVR_ALL_STAR ? 1 : 0)
  const mvp =
    trofeosPrevios.mvp + (ovr >= UMBRAL_OVR_MVP && azar() < PROBABILIDAD_MVP_SI_ELEGIBLE ? 1 : 0)
  const esContendiente = (nivelClub ?? 0) >= UMBRAL_NIVEL_CLUB_CONTENDIENTE
  const anillos =
    trofeosPrevios.anillos + (esContendiente && azar() < PROBABILIDAD_ANILLO_SI_CONTENDIENTE ? 1 : 0)

  return { anillos, allStar, mvp }
}
