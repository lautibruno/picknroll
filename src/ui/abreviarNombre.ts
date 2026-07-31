// Compartido entre las cards de club (PantallaCarrera) y la imagen para compartir
// (generarImagenCompartir) — mismo criterio de fallback cuando un club no tiene escudo real.
export function abreviarNombre(nombre: string): string {
  const primeraPalabra = nombre.replace(/\(.*\)/, '').trim().split(/\s+/)[0]
  return primeraPalabra.slice(0, 3).toUpperCase()
}
