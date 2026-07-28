// Color del OVR según nivel — interpolado suavemente entre "paradas" de color, de gris
// apagado (bajo) a dorado brillante (elite). Pedido del usuario: que se note visualmente
// cuando el jugador se vuelve buenísimo, no solo por el número.
interface ParadaColor {
  ovr: number
  rgb: [number, number, number]
}

const PARADAS: ParadaColor[] = [
  { ovr: 30, rgb: [138, 138, 138] }, // gris apagado
  { ovr: 50, rgb: [245, 241, 232] }, // hueso (línea de cancha)
  { ovr: 65, rgb: [255, 107, 26] }, // naranja acento
  { ovr: 82, rgb: [255, 176, 32] }, // naranja-dorado
  { ovr: 93, rgb: [255, 215, 0] }, // dorado brillante (elite)
]

function mezclar(a: [number, number, number], b: [number, number, number], t: number): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

export function colorPorOvr(ovr: number): string {
  if (ovr <= PARADAS[0].ovr) return `rgb(${PARADAS[0].rgb.join(',')})`
  if (ovr >= PARADAS[PARADAS.length - 1].ovr) return `rgb(${PARADAS[PARADAS.length - 1].rgb.join(',')})`

  for (let i = 0; i < PARADAS.length - 1; i++) {
    const actual = PARADAS[i]
    const siguiente = PARADAS[i + 1]
    if (ovr >= actual.ovr && ovr <= siguiente.ovr) {
      const t = (ovr - actual.ovr) / (siguiente.ovr - actual.ovr)
      const [r, g, b] = mezclar(actual.rgb, siguiente.rgb, t)
      return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`
    }
  }
  return `rgb(${PARADAS[PARADAS.length - 1].rgb.join(',')})`
}

export function esNivelElite(ovr: number): boolean {
  return ovr >= 90
}
