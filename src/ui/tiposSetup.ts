import type { DificultadCarrera, ModoCaminoPreNba } from '../engine/motorCarrera'

export interface DatosSetup {
  nombre: string
  apellido: string
  dorsal: string
  posicion: string
  manoHabil: 'diestra' | 'zurda'
  nacionalidad: string
  modoCaminoPreNba?: ModoCaminoPreNba
  dificultad: DificultadCarrera
}
