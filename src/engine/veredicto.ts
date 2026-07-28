// Veredicto final de la carrera — el "cierre" que le da sentido a jugar hasta el retiro
// (pedido explícito del usuario: sin esto, la carrera es solo números sueltos sin fin).
// Se calcula sobre el pico de OVR alcanzado y los trofeos, no sobre el OVR final
// (que puede estar en declive) — lo que importa es hasta dónde llegaste, no cómo terminaste.
import type { Carrera } from './motorCarrera'

export interface Veredicto {
  titulo: string
  descripcion: string
}

export function calcularVeredicto(carrera: Carrera): Veredicto {
  const picoOvr = Math.max(carrera.jugador.ovr, ...carrera.historial.map((h) => h.ovr))
  const { anillos, allStar, mvp } = carrera.trofeos

  if (carrera.fase !== 'nba') {
    return {
      titulo: 'NUNCA LLEGÓ A LA NBA',
      descripcion: 'Toda tu carrera transcurrió fuera de la liga más importante del mundo.',
    }
  }

  if (mvp > 0 || picoOvr >= 93) {
    return {
      titulo: 'LEYENDA',
      descripcion: `Pico de OVR ${picoOvr}. Entre los mejores que pisaron una cancha.`,
    }
  }

  if (allStar >= 3 || anillos >= 1 || picoOvr >= 86) {
    return {
      titulo: 'ESTRELLA NBA',
      descripcion: `Pico de OVR ${picoOvr}. Una carrera de las que se recuerdan.`,
    }
  }

  if (allStar >= 1 || picoOvr >= 76) {
    return {
      titulo: 'BUEN TITULAR',
      descripcion: `Pico de OVR ${picoOvr}. Un jugador confiable de verdad.`,
    }
  }

  return {
    titulo: 'JUGADOR DE ROTACIÓN',
    descripcion: `Pico de OVR ${picoOvr}. Llegaste a la NBA — no todos pueden decir lo mismo.`,
  }
}
