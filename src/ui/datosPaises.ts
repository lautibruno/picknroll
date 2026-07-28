// Lista completa de países (nombre en español + código ISO alpha-2) para el selector de
// nacionalidad estilo Copero (bandera + nombre + buscador). Mismo paquete que ya funcionó
// bien en el proyecto hermano PixGeo (`i18n-iso-countries`).
import countries from 'i18n-iso-countries'
import es from 'i18n-iso-countries/langs/es.json'

countries.registerLocale(es)

export interface OpcionPais {
  codigo: string // alpha-2 en minúscula, ej. "ar"
  nombre: string
}

const nombresPorCodigo = countries.getNames('es', { select: 'official' })

export const PAISES: OpcionPais[] = Object.entries(nombresPorCodigo)
  .map(([alpha2, nombre]) => ({ codigo: alpha2.toLowerCase(), nombre }))
  .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

export function urlBandera(codigo: string, ancho: 40 | 80 | 160 = 40): string {
  return `https://flagcdn.com/w${ancho}/${codigo}.png`
}
