// Crecimiento aleatorio al elegir equipo — verificado jugando Copero: cada selección de
// club (no solo los eventos de riesgo) sube el OVR de forma azarosa, incluso al quedarte
// en tu club actual (sigue siendo una "temporada resuelta"). Rango chico a propósito: la
// curva de edad y las decisiones de riesgo ya aportan la mayor parte del movimiento.
import type { Azar } from './potencial'

const CRECIMIENTO_MIN = 1
const CRECIMIENTO_MAX = 4

export function generarCrecimientoPorTraspaso(azar: Azar): number {
  return CRECIMIENTO_MIN + Math.floor(azar() * (CRECIMIENTO_MAX - CRECIMIENTO_MIN + 1))
}
