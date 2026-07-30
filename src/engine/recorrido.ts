// Resumen del paso por cada club a lo largo de la carrera — pedido explícito del usuario:
// "al final cuando da el resumen de la carrera debe mostrar todos los equipos por los que
// pasé". Lógica pura sobre el historial (sin React), para poder testearla sola.
import type { EntradaHistorial, IconoTrofeo } from './motorCarrera'

export interface PasoPorClub {
  clubId: string | null
  clubNombre: string
  clubEscudoUrl: string | null
  edadDesde: number
  edadHasta: number
  temporadas: number
  // Todos los títulos ganados mientras estuvo en ese club, en orden.
  trofeos: IconoTrofeo[]
}

// Agrupa temporadas CONSECUTIVAS en el mismo club en un solo paso. Volver años después al
// mismo club cuenta como un paso nuevo (es información real de la carrera, no un duplicado
// que haya que unificar).
export function resumirRecorrido(historial: EntradaHistorial[]): PasoPorClub[] {
  const pasos: PasoPorClub[] = []

  for (const entrada of historial) {
    const ultimo = pasos[pasos.length - 1]
    const mismoClub = ultimo && ultimo.clubId === entrada.clubId

    if (mismoClub) {
      ultimo.edadHasta = entrada.edad
      ultimo.temporadas += 1
      ultimo.trofeos = [...ultimo.trofeos, ...entrada.trofeosGanados]
      continue
    }

    pasos.push({
      clubId: entrada.clubId,
      clubNombre: entrada.clubNombre ?? 'Sin club',
      clubEscudoUrl: entrada.clubEscudoUrl,
      edadDesde: entrada.edad,
      edadHasta: entrada.edad,
      temporadas: 1,
      trofeos: [...entrada.trofeosGanados],
    })
  }

  return pasos
}
