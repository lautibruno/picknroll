import type { ReactElement } from 'react'
import type { IconoTrofeo } from '../engine/motorCarrera'

// Campeón/Mundial/JJOO usan íconos REALES (pedido explícito del usuario: "iconos reales de
// las copas... que me los busques y recuperes, no que los inventes vos") — imágenes oficiales
// de dominio público / CC alojadas en Wikimedia Commons, mismo criterio que ya usa el proyecto
// para escudos reales de clubes vía Wikipedia/ESPN. MVP y All-Star quedan con ícono dibujado
// propio porque no existe en Wikimedia Commons un trofeo/logo libre y estable para ellos (el
// trofeo Michael Jordan y los logos de All-Star Game son artwork comercial protegido que
// cambia cada año, no hay una versión de dominio público reutilizable).
interface IconoProps {
  className?: string
}

const URL_ANILLO = 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Larry_O%27Brien_Championship_Trophy_icon.svg'
const URL_MUNDIAL = 'https://upload.wikimedia.org/wikipedia/commons/0/07/FIBA_Basketball_World_Cup_logo.svg'
// Medalla de oro real (no los aros olímpicos, que son el logo del evento, no el premio en sí
// — pedido explícito del usuario: "si es oro olímpico, medalla olímpica").
const URL_JJOO = 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Gold_medal_olympic.svg'

export function IconoAnillo({ className }: IconoProps) {
  return <img src={URL_ANILLO} alt="Trofeo de campeón" className={`object-contain ${className ?? ''}`} />
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
  return <img src={URL_MUNDIAL} alt="Logo del Mundial FIBA" className={`object-contain ${className ?? ''}`} />
}

export function IconoJjoo({ className }: IconoProps) {
  return <img src={URL_JJOO} alt="Medalla de oro olímpica" className={`object-contain ${className ?? ''}`} />
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

// Descripción para la vitrina de fin de carrera (pedido explícito del usuario: "cuando pasas
// el mouse o lo tocas con el dedo te da la descripción de que es el trofeo").
export const DESCRIPCION_TROFEO: Record<IconoTrofeo, string> = {
  anillo: 'Campeón de la NBA — Trofeo Larry O’Brien, ganado en los playoffs.',
  allstar: 'Convocado al All-Star Game de la NBA por tu nivel esa temporada.',
  mvp: 'Jugador Más Valioso de la temporada regular de la NBA.',
  mundial: 'Convocado a la selección para el Mundial de básquet (FIBA).',
  jjoo: 'Convocado a la selección para los Juegos Olímpicos.',
}
