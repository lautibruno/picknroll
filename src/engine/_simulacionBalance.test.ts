// Banco de pruebas de BALANCE — no es un test de comportamiento, es una MEDICIÓN. Simula cientos
// de carreras completas y imprime la distribución de veredictos, el pico de OVR
// y cuánto del techo se llega a aprovechar, para tunear con datos en vez de a ojo.
//
// Va con `describe.skip` a propósito: no aporta nada al suite y tarda. Para usarlo, sacar el
// `.skip` y correr:  npx vitest run _simulacionBalance
//
// Sirvió para descubrir que el limitante real de la progresión NO era el crecimiento sino el
// POTENCIAL: se llegaba al 91% del techo, pero el techo promedio (78) quedaba por debajo del
// umbral de "buen titular" (pico 76) para la mitad de las carreras.
import { describe, it } from 'vitest'
import { crearCarrera, elegirOpcion, continuarCarrera } from './motorCarrera'
import { EQUIPOS_NBA } from './datos/equiposNba'
import { calcularVeredicto } from './veredicto'

function azarSemilla(semilla: number): () => number {
  let estado = semilla >>> 0
  return () => {
    estado = (estado * 1664525 + 1013904223) % 4294967296
    return estado / 4294967296
  }
}

type PoliticaClub = 'mejor' | 'azar'
type PoliticaRiesgo = 'arriesgar' | 'seguro' | 'mixto'

function simularCarrera(azar: () => number, club: PoliticaClub, riesgo: PoliticaRiesgo) {
  let carrera = crearCarrera(azar, 'us', 'SG', { dificultad: 'normal' })

  for (let paso = 0; paso < 400 && !carrera.retirado; paso++) {
    if (carrera.desenlacesPendientes.length > 0) {
      carrera = continuarCarrera(carrera)
      continue
    }
    const evento = carrera.eventoPendiente
    if (!evento) break

    if (evento.tipo === 'riesgo') {
      const arriesga = riesgo === 'arriesgar' || (riesgo === 'mixto' && azar() < 0.5)
      carrera = elegirOpcion(carrera, arriesga ? 'arriesgar' : 'seguro', azar, EQUIPOS_NBA)
    } else if (evento.tipo === 'jugada-final') {
      carrera = elegirOpcion(carrera, 'finta', azar, EQUIPOS_NBA)
    } else if (evento.tipo === 'convocatoria') {
      carrera = elegirOpcion(carrera, 'jugar-para-el-equipo', azar, EQUIPOS_NBA)
    } else if (evento.tipo === 'especializacion') {
      carrera = elegirOpcion(carrera, evento.opciones[0].id, azar, EQUIPOS_NBA)
    } else {
      // El jugador ya NO ve el nivel del club: 'azar' es lo más parecido a la experiencia real.
      const opciones = evento.opciones
      const elegida =
        club === 'mejor'
          ? opciones.reduce((a, b) => (b.nivel > a.nivel ? b : a))
          : opciones[Math.floor(azar() * opciones.length)]
      carrera = elegirOpcion(carrera, elegida.id, azar, EQUIPOS_NBA)
    }
  }

  const picoOvr = Math.max(carrera.jugador.ovr, ...carrera.historial.map((h) => h.ovr))
  return {
    veredicto: calcularVeredicto(carrera).titulo,
    picoOvr,
    potencial: carrera.jugador.potencial,
    llegoNba: carrera.fase === 'nba',
    trofeos: carrera.trofeos,
  }
}

const salida: string[] = []

function medir(club: PoliticaClub, riesgo: PoliticaRiesgo, corridas = 600) {
  const veredictos: Record<string, number> = {}
  const picos: number[] = []
  const techos: number[] = []
  let nba = 0
  let anillos = 0
  let allStar = 0

  for (let i = 0; i < corridas; i++) {
    const r = simularCarrera(azarSemilla(1000 + i * 7919), club, riesgo)
    veredictos[r.veredicto] = (veredictos[r.veredicto] ?? 0) + 1
    picos.push(r.picoOvr)
    techos.push(r.potencial)
    if (r.llegoNba) nba++
    anillos += r.trofeos.anillos
    allStar += r.trofeos.allStar
  }

  picos.sort((a, b) => a - b)
  const pct = (n: number) => `${Math.round((n / corridas) * 100)}%`
  const mediana = picos[Math.floor(picos.length / 2)]
  const promedioTecho = Math.round(techos.reduce((a, b) => a + b, 0) / techos.length)

  salida.push('')
  salida.push(`=== club:${club} · riesgo:${riesgo} (${corridas} carreras) ===`)
  salida.push(`  llegó a NBA: ${pct(nba)}`)
  salida.push(`  pico OVR — mín ${picos[0]} · mediana ${mediana} · p90 ${picos[Math.floor(picos.length * 0.9)]} · máx ${picos[picos.length - 1]}`)
  salida.push(`  techo (potencial) promedio: ${promedioTecho}  ->  se aprovecha ${Math.round((mediana / promedioTecho) * 100)}% del techo`)
  salida.push(`  anillos totales: ${anillos} · All-Star totales: ${allStar}`)
  for (const [v, n] of Object.entries(veredictos).sort((a, b) => b[1] - a[1])) {
    salida.push(`  ${pct(n).padStart(4)}  ${v}`)
  }
}

describe.skip('balance', () => {
  it('mide la distribución de carreras', () => {
    medir('azar', 'mixto')
    medir('azar', 'seguro')
    medir('mejor', 'arriesgar')
    console.log(salida.join('\n'))
  })
})
