// Decisión de especialización — pedido del usuario: "cuando la posición lo amerita, en
// el medio de la carrera, generar aleatoriamente una decisión de ser triplero u otra
// opción, que repercuta en los puntos de triple". Solo posiciones de perímetro (no tiene
// sentido pedirle a un pívot que se especialice en triples). Es una decisión única por
// carrera — una vez elegida, no vuelve a aparecer.
import type { Azar } from './potencial'

export type TipoEspecializacion = 'triplero' | 'interior'

export interface OpcionEspecializacion {
  id: TipoEspecializacion
  nombre: string
  descripcion: string
}

const POSICIONES_PERIMETRO = ['PG', 'SG', 'SF']
const EDAD_MINIMA = 21
const EDAD_MAXIMA = 29
const PROBABILIDAD_POR_TEMPORADA = 0.18

export const OPCIONES_ESPECIALIZACION: OpcionEspecializacion[] = [
  {
    id: 'triplero',
    nombre: 'Triplero',
    descripcion: 'Entrenás el tiro de larga distancia — más triples, algo menos de rebotes.',
  },
  {
    id: 'interior',
    nombre: 'Anotador interior',
    descripcion: 'Te especializás cerca del aro — más rebotes, casi no tirás de tres.',
  },
]

export function puedeEspecializarse(posicion: string, edad: number, yaEspecializado: boolean): boolean {
  if (yaEspecializado) return false
  if (!POSICIONES_PERIMETRO.includes(posicion)) return false
  return edad >= EDAD_MINIMA && edad <= EDAD_MAXIMA
}

export function tocaEventoEspecializacion(posicion: string, edad: number, yaEspecializado: boolean, azar: Azar): boolean {
  if (!puedeEspecializarse(posicion, edad, yaEspecializado)) return false
  return azar() < PROBABILIDAD_POR_TEMPORADA
}

const MULTIPLICADOR_TRIPLES: Record<TipoEspecializacion | 'ninguna', number> = {
  triplero: 2.2,
  interior: 0.35,
  ninguna: 1,
}

const MULTIPLICADOR_REBOTES: Record<TipoEspecializacion | 'ninguna', number> = {
  triplero: 0.85,
  interior: 1.35,
  ninguna: 1,
}

export function multiplicadorTriples(especializacion: TipoEspecializacion | null): number {
  return MULTIPLICADOR_TRIPLES[especializacion ?? 'ninguna']
}

export function multiplicadorRebotes(especializacion: TipoEspecializacion | null): number {
  return MULTIPLICADOR_REBOTES[especializacion ?? 'ninguna']
}
