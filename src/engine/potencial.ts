// Potencial oculto: techo máximo de OVR que un jugador puede alcanzar en su pico.
// Distribución sesgada (no uniforme) — la mayoría de las carreras son mediocres,
// las elite son raras por diseño (ver MVP_SPEC.md §3.1).
export type Azar = () => number // debe devolver un número en [0, 1)

interface TramoPotencial {
  probabilidad: number
  min: number
  max: number
}

const TRAMOS: TramoPotencial[] = [
  { probabilidad: 0.7, min: 60, max: 75 },
  { probabilidad: 0.2, min: 76, max: 85 },
  { probabilidad: 0.08, min: 86, max: 92 },
  { probabilidad: 0.02, min: 93, max: 99 },
]

export function generarPotencial(azar: Azar): number {
  const tirada = azar()
  let acumulado = 0
  for (const tramo of TRAMOS) {
    acumulado += tramo.probabilidad
    if (tirada < acumulado) {
      return tramo.min + Math.floor(azar() * (tramo.max - tramo.min + 1))
    }
  }
  // Redondeo de punto flotante: si tirada cae justo en el borde superior, usar el último tramo.
  const ultimo = TRAMOS[TRAMOS.length - 1]
  return ultimo.min + Math.floor(azar() * (ultimo.max - ultimo.min + 1))
}
