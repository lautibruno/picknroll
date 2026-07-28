// Crecimiento al elegir equipo — rehecho jugando copero.com.ar/juegos/simulador-carrera
// en vivo (pedido explícito del usuario, confirmado con preguntas): en el juego real casi
// TODO el crecimiento de nivel sale de este momento (fichar/préstamo), no de una curva de
// edad corriendo sola. Un club bien por encima de tu nivel actual da un salto grande (ej.
// firmar con un club top apenas arrancás), un club similar o más chico da un salto chico o
// nulo — el desafío de subir de categoría es lo que te hace crecer.
import type { Azar } from './potencial'
import type { Rol } from './estadisticas'

// Cuánto más grande la diferencia a favor (club nuevo > tu nivel), más grande el salto —
// pero con un techo (FACTOR_DESAFIO) para que no sea un salto infinito, y un piso (RUIDO)
// para que siempre haya algo de variación entre carreras idénticas.
const FACTOR_DESAFIO = 0.45
const TOPE_DESAFIO_MIN = -6
const TOPE_DESAFIO_MAX = 12
const RUIDO_MIN = -2
const RUIDO_MAX = 2

// El rol forzado por la última "competencia por el puesto" (ver decisionesRiesgo.ts)
// modula el crecimiento del PRÓXIMO fichaje/préstamo — ganaste la titularidad, llegás con
// más rodaje; perdiste terreno, llegás con menos.
const BONUS_POR_ROL: Record<Rol, number> = {
  titular: 2,
  rotacion: -1,
  banca: -3,
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
