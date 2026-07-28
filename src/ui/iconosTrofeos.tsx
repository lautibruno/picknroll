import type { ReactElement } from 'react'
import type { IconoTrofeo } from '../engine/motorCarrera'

// Íconos schematic/monocromáticos (no logos oficiales de ninguna federación real) para
// cada trofeo/convocatoria — pedido explícito del usuario: "iconos reales de las copas",
// interpretado como "que se reconozcan de un vistazo qué representan", no artwork con
// marca registrada (mismo criterio de riesgo ya aceptado en el proyecto para crests reales
// de clubes, pero acá directamente dibujamos formas propias para evitar cualquier duda).
interface IconoProps {
  className?: string
}

export function IconoAnillo({ className }: IconoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M7 3h10l-1.5 6h-7z" />
      <path d="M8.5 9c-3 1-4 3.2-2.2 5.4C7.6 16 9.5 17 12 17s4.4-1 5.7-2.6C19.5 12.2 18.5 10 15.5 9" />
      <path d="M12 17v3" />
      <path d="M8.5 20h7" />
    </svg>
  )
}

export function IconoAllStar({ className }: IconoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" stroke="none">
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.2 1.3-6.6L2.5 9.4l6.6-.8z" />
    </svg>
  )
}

export function IconoMvp({ className }: IconoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 6l4 4 4-6 4 6 4-4-1.5 11h-13z" />
      <path d="M6 20h12" />
    </svg>
  )
}

export function IconoMundial({ className }: IconoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="11" r="7" />
      <path d="M5 11h14M12 4c2 2 3 4.5 3 7s-1 5-3 7c-2-2-3-4.5-3-7s1-5 3-7z" />
      <path d="M9 20h6" />
      <path d="M12 17v3" />
    </svg>
  )
}

export function IconoJjoo({ className }: IconoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="6" cy="15" r="3.2" />
      <circle cx="12" cy="15" r="3.2" />
      <circle cx="18" cy="15" r="3.2" />
      <circle cx="9" cy="9" r="3.2" />
      <circle cx="15" cy="9" r="3.2" />
    </svg>
  )
}

export const ICONOS_TROFEO: Record<IconoTrofeo, (props: IconoProps) => ReactElement> = {
  anillo: IconoAnillo,
  allstar: IconoAllStar,
  mvp: IconoMvp,
  mundial: IconoMundial,
  jjoo: IconoJjoo,
}

export const ETIQUETA_TROFEO: Record<IconoTrofeo, string> = {
  anillo: 'Campeón',
  allstar: 'All-Star',
  mvp: 'MVP',
  mundial: 'Mundial',
  jjoo: 'JJOO',
}
