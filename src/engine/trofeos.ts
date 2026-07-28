// Vitrina de trofeos — solo se ganan en la NBA (MVP: liga doméstica/universidad no otorga
// trofeos todavía). Umbrales deterministas para All-Star (mismo criterio de "gate por OVR"
// que el resto del motor); MVP suma algo de azar incluso entre los mejores, para que ni
// ser elite garantice ganarlo todas las temporadas.
//
// Los anillos YA NO salen de acá — antes eran una probabilidad suelta ligada al nivel del
// club, ahora se ganan de verdad jugando los playoffs simulados (ver playoffs.ts,
// motorCarrera.ts los suma directo cuando `simularPlayoffs` devuelve 'campeon').
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

export function evaluarTrofeosTemporada(
  trofeosPrevios: Trofeos,
  ovr: number,
  fase: 'pre-nba' | 'nba',
  azar: Azar,
): Trofeos {
  if (fase !== 'nba') return trofeosPrevios

  const allStar = trofeosPrevios.allStar + (ovr >= UMBRAL_OVR_ALL_STAR ? 1 : 0)
  const mvp =
    trofeosPrevios.mvp + (ovr >= UMBRAL_OVR_MVP && azar() < PROBABILIDAD_MVP_SI_ELEGIBLE ? 1 : 0)

  return { ...trofeosPrevios, allStar, mvp }
}
