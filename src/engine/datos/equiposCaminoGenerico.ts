// Pool de equipos para el camino "vía EEUU" (universidad/G-League/internacional) — usado
// cuando la nacionalidad no tiene liga doméstica curada, o el jugador elige explícitamente
// "vía EEUU" aunque su país sí tenga liga real (ver motorCarrera.ts). Antes esto era solo
// una etiqueta sin equipo real para elegir — bug/carencia real reportada por el usuario,
// corregido: ahora es un evento de club como cualquier otro, con el mismo mecanismo de
// filtro por OVR. Nombres reales de programas universitarios (mismo criterio de riesgo
// asumido ya para las ligas profesionales, ver MVP_SPEC.md §5) + G-League + un par de
// clubes europeos genéricos para la rama "internacional".
import type { Equipo } from '../eventos'

export const EQUIPOS_CAMINO_GENERICO: Equipo[] = [
  { id: 'gen-duke', nombre: 'Duke Blue Devils', nivel: 62 },
  { id: 'gen-kentucky', nombre: 'Kentucky Wildcats', nivel: 60 },
  { id: 'gen-kansas', nombre: 'Kansas Jayhawks', nivel: 58 },
  { id: 'gen-unc', nombre: 'North Carolina Tar Heels', nivel: 56 },
  { id: 'gen-ucla', nombre: 'UCLA Bruins', nivel: 54 },
  { id: 'gen-gonzaga', nombre: 'Gonzaga Bulldogs', nivel: 50 },
  { id: 'gen-gleague', nombre: 'G League Ignite', nivel: 48 },
  { id: 'gen-villanova', nombre: 'Villanova Wildcats', nivel: 46 },
  { id: 'gen-euro-a', nombre: 'ratiopharm Ulm (Alemania)', nivel: 44 },
  { id: 'gen-euro-b', nombre: 'Hapoel Tel Aviv (Israel)', nivel: 42 },
]
