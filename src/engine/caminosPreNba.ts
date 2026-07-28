// Umbral de Draft y velocidad de decisiones — ver motorCarrera.ts para el resto de la
// mecánica del camino pre-NBA (el pool real de equipos/universidades vive en
// datos/ligasPorPais.ts y datos/equiposCaminoGenerico.ts).
export const UMBRAL_DRAFT_OVR = 55

// Velocidad de decisiones — mismo concepto y mismos valores reales que Copero
// (verificado jugando copero.com.ar/juegos/simulador-carrera): Intensa = 1 decisión por
// temporada, Normal = cada 2, Exprés = cada 3. Elegido una vez al crear la carrera.
// El Draft, en cambio, se dispara apenas se cruza el umbral, sin esperar al intervalo
// (ver motorCarrera.ts).
export type DificultadCarrera = 'intensa' | 'normal' | 'expres'

export const INTERVALO_TEMPORADAS_POR_DIFICULTAD: Record<DificultadCarrera, number> = {
  intensa: 1,
  normal: 2,
  expres: 3,
}
