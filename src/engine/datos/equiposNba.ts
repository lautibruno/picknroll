// Las 30 franquicias reales de la NBA (nombres/escudos reales — decisión explícita
// del usuario, ver MVP_SPEC.md §5). El campo `nivel` es un valor de balance de juego
// aproximado (no viene de stats en vivo todavía) — candidato futuro: alimentarlo con
// la posición real en la tabla desde la sección de Resultados (api/nba/scoreboard.ts).
// `escudoUrl`: CDN pública de ESPN (misma fuente que ya usamos para resultados en vivo),
// sin API key, verificado con las 30 URLs reales (`site.api.espn.com/.../nba/teams`).
import type { Equipo } from '../eventos'

function escudoEspn(slug: string): string {
  return `https://a.espncdn.com/i/teamlogos/nba/500/${slug}.png`
}

export const EQUIPOS_NBA: Equipo[] = [
  { id: 'bos', nombre: 'Boston Celtics', nivel: 90, escudoUrl: escudoEspn('bos') },
  { id: 'den', nombre: 'Denver Nuggets', nivel: 88, escudoUrl: escudoEspn('den') },
  { id: 'okc', nombre: 'Oklahoma City Thunder', nivel: 87, escudoUrl: escudoEspn('okc') },
  { id: 'mil', nombre: 'Milwaukee Bucks', nivel: 83, escudoUrl: escudoEspn('mil') },
  { id: 'min', nombre: 'Minnesota Timberwolves', nivel: 82, escudoUrl: escudoEspn('min') },
  { id: 'nyk', nombre: 'New York Knicks', nivel: 80, escudoUrl: escudoEspn('ny') },
  { id: 'lal', nombre: 'Los Angeles Lakers', nivel: 79, escudoUrl: escudoEspn('lal') },
  { id: 'cle', nombre: 'Cleveland Cavaliers', nivel: 79, escudoUrl: escudoEspn('cle') },
  { id: 'dal', nombre: 'Dallas Mavericks', nivel: 78, escudoUrl: escudoEspn('dal') },
  { id: 'phi', nombre: 'Philadelphia 76ers', nivel: 77, escudoUrl: escudoEspn('phi') },
  { id: 'lac', nombre: 'LA Clippers', nivel: 76, escudoUrl: escudoEspn('lac') },
  { id: 'phx', nombre: 'Phoenix Suns', nivel: 75, escudoUrl: escudoEspn('phx') },
  { id: 'mia', nombre: 'Miami Heat', nivel: 74, escudoUrl: escudoEspn('mia') },
  { id: 'gsw', nombre: 'Golden State Warriors', nivel: 73, escudoUrl: escudoEspn('gs') },
  { id: 'ind', nombre: 'Indiana Pacers', nivel: 72, escudoUrl: escudoEspn('ind') },
  { id: 'orl', nombre: 'Orlando Magic', nivel: 71, escudoUrl: escudoEspn('orl') },
  { id: 'hou', nombre: 'Houston Rockets', nivel: 70, escudoUrl: escudoEspn('hou') },
  { id: 'sac', nombre: 'Sacramento Kings', nivel: 68, escudoUrl: escudoEspn('sac') },
  { id: 'chi', nombre: 'Chicago Bulls', nivel: 65, escudoUrl: escudoEspn('chi') },
  { id: 'atl', nombre: 'Atlanta Hawks', nivel: 64, escudoUrl: escudoEspn('atl') },
  { id: 'mem', nombre: 'Memphis Grizzlies', nivel: 62, escudoUrl: escudoEspn('mem') },
  { id: 'nop', nombre: 'New Orleans Pelicans', nivel: 61, escudoUrl: escudoEspn('no') },
  { id: 'bkn', nombre: 'Brooklyn Nets', nivel: 60, escudoUrl: escudoEspn('bkn') },
  { id: 'sas', nombre: 'San Antonio Spurs', nivel: 58, escudoUrl: escudoEspn('sa') },
  { id: 'uta', nombre: 'Utah Jazz', nivel: 55, escudoUrl: escudoEspn('utah') },
  { id: 'tor', nombre: 'Toronto Raptors', nivel: 54, escudoUrl: escudoEspn('tor') },
  { id: 'por', nombre: 'Portland Trail Blazers', nivel: 52, escudoUrl: escudoEspn('por') },
  { id: 'cha', nombre: 'Charlotte Hornets', nivel: 50, escudoUrl: escudoEspn('cha') },
  { id: 'det', nombre: 'Detroit Pistons', nivel: 48, escudoUrl: escudoEspn('det') },
  { id: 'was', nombre: 'Washington Wizards', nivel: 45, escudoUrl: escudoEspn('wsh') },
]
