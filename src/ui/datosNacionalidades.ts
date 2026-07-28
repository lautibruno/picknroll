// Lista de nacionalidades ofrecidas en el setup. Los códigos que están en LIGAS_POR_PAIS
// arrancan con liga doméstica real; el resto (incluye EEUU a propósito) cae al camino
// genérico universidad/G-League/internacional (ver motorCarrera.ts).
import { LIGAS_POR_PAIS } from '../engine/datos/ligasPorPais'

export interface OpcionNacionalidad {
  codigo: string
  nombre: string
}

const NOMBRES_PAISES_CON_LIGA: Record<string, string> = {
  ar: 'Argentina',
  es: 'España',
  it: 'Italia',
  gr: 'Grecia',
  rs: 'Serbia',
  tr: 'Turquía',
  fr: 'Francia',
  au: 'Australia',
  lt: 'Lituania',
  br: 'Brasil',
}

export const NACIONALIDADES: OpcionNacionalidad[] = [
  ...Object.keys(LIGAS_POR_PAIS).map((codigo) => ({
    codigo,
    nombre: NOMBRES_PAISES_CON_LIGA[codigo] ?? codigo.toUpperCase(),
  })),
  { codigo: 'us', nombre: 'Estados Unidos' },
  { codigo: 'xx', nombre: 'Otro país' },
]

export function ligaDeNacionalidad(codigo: string): string | null {
  return LIGAS_POR_PAIS[codigo]?.nombreLiga ?? null
}
