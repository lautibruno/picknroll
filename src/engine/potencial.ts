// Potencial oculto: techo máximo de OVR que un jugador puede alcanzar en su pico.
// Distribución sesgada (no uniforme) — la mayoría de las carreras son mediocres,
// las elite son raras por diseño (ver MVP_SPEC.md §3.1).
export type Azar = () => number // debe devolver un número en [0, 1)

interface TramoPotencial {
  probabilidad: number
  min: number
  max: number
}

// Tramos algo más generosos que la primera versión (pedido del usuario: el crecimiento
// se sentía flojo porque el 70% de las carreras arrancaban a 40-50 OVR con techo 60-75 —
// apenas 2-3 temporadas de margen antes de estancarse el resto de la carrera). Elite
// sigue siendo raro por diseño, solo se corrió el piso de cada tramo unos puntos arriba.
const TRAMOS: TramoPotencial[] = [
  { probabilidad: 0.5, min: 62, max: 78 },
  { probabilidad: 0.3, min: 79, max: 87 },
  { probabilidad: 0.13, min: 88, max: 93 },
  { probabilidad: 0.07, min: 94, max: 99 },
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
