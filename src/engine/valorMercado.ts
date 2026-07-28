// Valor de mercado del jugador — pedido del usuario, mismo tipo de dato que muestra
// Copero ("VALOR €11M"). Derivado del OVR con una curva que crece rápido en los tramos
// altos (un jugador de elite vale muchísimo más que uno de nivel medio, no linealmente).
export function calcularValorMercadoEuros(ovr: number): number {
  const base = Math.max(0, ovr - 40)
  return Math.round(base ** 4 * 10)
}

export function formatoValorMercado(valorEuros: number): string {
  if (valorEuros >= 1_000_000) return `€${(valorEuros / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (valorEuros >= 1_000) return `€${Math.round(valorEuros / 1_000)}K`
  return `€${valorEuros}`
}
