// Crecimiento al elegir equipo — rehecho jugando copero.com.ar/juegos/simulador-carrera
// en vivo (pedido explícito del usuario, confirmado con preguntas): en el juego real casi
// TODO el crecimiento de nivel sale de este momento (fichar/préstamo), no de una curva de
// edad corriendo sola. Un club bien por encima de tu nivel actual da un salto grande (ej.
// firmar con un club top apenas arrancás), un club similar o más chico da un salto chico o
// nulo — el desafío de subir de categoría es lo que te hace crecer.
import type { Azar } from './potencial'
import type { Rol } from './estadisticas'

// Cuánto más grande la diferencia a favor (club nuevo > tu nivel), más grande el salto —
// pero con un techo (FACTOR_DESAFIO) para que no sea un salto infinito. El piso del
// desafío es 0 a propósito (pedido del usuario: "crecer es imposible y disminuye
// muchísimo la OVR" — antes un club cómodo directamente te hacía retroceder, lo que hacía
// sentir la progresión imposible en cuanto agotabas los clubes top del pool). Ahora fichar
// un club chico como mucho te estanca (crecimiento ~0), nunca te resta por sí solo — el
// único lugar donde de verdad se pierde nivel es el declive de veterano (progresion.ts).
const FACTOR_DESAFIO = 0.6
const TOPE_DESAFIO_MIN = 0
const TOPE_DESAFIO_MAX = 16
const RUIDO_MIN = 0
const RUIDO_MAX = 4

// El rol forzado por la última "competencia por el puesto" (ver decisionesRiesgo.ts)
// modula el crecimiento del PRÓXIMO fichaje/préstamo — ganaste la titularidad, llegás con
// más rodaje; perdiste terreno, llegás con menos (pero sigue sin ser un castigo severo).
const BONUS_POR_ROL: Record<Rol, number> = {
  titular: 2,
  rotacion: 0,
  banca: -2,
}

function clampNumero(valor: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, valor))
}

export function generarCrecimientoPorTraspaso(
  ovrActual: number,
  nivelDestino: number,
  temporadas: number,
  rolForzado: Rol | null,
  azar: Azar,
): number {
  const diferencia = nivelDestino - ovrActual
  const factorDesafio = clampNumero(diferencia * FACTOR_DESAFIO, TOPE_DESAFIO_MIN, TOPE_DESAFIO_MAX)
  const ruido = RUIDO_MIN + Math.floor(azar() * (RUIDO_MAX - RUIDO_MIN + 1))
  const bonusRol = rolForzado ? BONUS_POR_ROL[rolForzado] : 0
  const porTemporada = factorDesafio + ruido + bonusRol

  return Math.round((porTemporada * temporadas) / 2)
}
