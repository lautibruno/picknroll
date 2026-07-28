// Colores de camiseta por país (primario/secundario), curados a mano para las selecciones
// más comunes — el resto cae a un color neutro del propio sistema de diseño (naranja/hueso),
// no a colores inventados sin criterio. Ampliar esta lista es agregar una entrada más.
export interface ColoresCamiseta {
  primario: string
  secundario: string
}

const COLOR_DEFAULT: ColoresCamiseta = { primario: '#241d17', secundario: '#ff6b1a' }

const COLORES_POR_PAIS: Record<string, ColoresCamiseta> = {
  ar: { primario: '#6cace4', secundario: '#f5f1e8' }, // Argentina
  es: { primario: '#c60b1e', secundario: '#ffc400' }, // España
  it: { primario: '#009246', secundario: '#f5f1e8' }, // Italia
  gr: { primario: '#0d5eaf', secundario: '#f5f1e8' }, // Grecia
  rs: { primario: '#c6363c', secundario: '#f5f1e8' }, // Serbia
  tr: { primario: '#e30a17', secundario: '#f5f1e8' }, // Turquía
  fr: { primario: '#0055a4', secundario: '#ef4135' }, // Francia
  au: { primario: '#00843d', secundario: '#ffcd00' }, // Australia
  lt: { primario: '#fdb913', secundario: '#006a44' }, // Lituania
  br: { primario: '#009c3b', secundario: '#ffdf00' }, // Brasil
  us: { primario: '#3c3b6e', secundario: '#b22234' }, // Estados Unidos
}

export function coloresDePais(codigo: string): ColoresCamiseta {
  return COLORES_POR_PAIS[codigo] ?? COLOR_DEFAULT
}
