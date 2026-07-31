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
// Logo real del All-Star Game: la estrella con el logoman (pedido explícito del usuario, que
// pasó la imagen). Este es el ÚNICO trofeo que se sirve desde `public/` en vez de Wikimedia —
// se buscó ahí y solo existen los logos por año/ciudad (2018, 2019, 2022, 2023, 2025...), no la
// marca permanente. El archivo lo aportó el usuario: public/trofeos/all-star.png
const URL_ALL_STAR = '/trofeos/all-star.png'
// Medalla de oro real (no los aros olímpicos, que son el logo del evento, no el premio en sí
// — pedido explícito del usuario: "si es oro olímpico, medalla olímpica").
const URL_JJOO = 'https://upload.wikimedia.org/wikipedia/commons/4/4f/Gold_medal_olympic.svg'

export function IconoAnillo({ className }: IconoProps) {
  return <img src={URL_ANILLO} alt="Trofeo de campeón" className={`object-contain ${className ?? ''}`} />
}

export function IconoAllStar({ className }: IconoProps) {
  return <img src={URL_ALL_STAR} alt="Logo del All-Star Game" className={`object-contain ${className ?? ''}`} />
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

// El título de liga local no tiene un ícono fijo: usa la imagen REAL de la liga que estás
// jugando (ver `ligaDomestica` en motorCarrera.ts y `trofeoUrl` en datos/ligasPorPais.ts),
// así que la UI le pasa la URL en vez de dibujar un ícono propio.
export function IconoLigaLocal({ className, url }: IconoProps & { url?: string }) {
  if (!url) return <span className={className} />
  return <img src={url} alt="Título de liga local" className={`object-contain ${className ?? ''}`} />
}

export const ICONOS_TROFEO: Record<IconoTrofeo, (props: IconoProps) => ReactElement> = {
  anillo: IconoAnillo,
  allstar: IconoAllStar,
  mvp: IconoMvp,
  mundial: IconoMundial,
  jjoo: IconoJjoo,
  'liga-local': IconoLigaLocal,
}

export const ETIQUETA_TROFEO: Record<IconoTrofeo, string> = {
  anillo: 'Campeón',
  allstar: 'All-Star',
  mvp: 'MVP',
  mundial: 'Mundial',
  jjoo: 'JJOO',
  'liga-local': 'Liga local',
}

// Descripción para la vitrina de fin de carrera (pedido explícito del usuario: "cuando pasas
// el mouse o lo tocas con el dedo te da la descripción de que es el trofeo").
export const DESCRIPCION_TROFEO: Record<IconoTrofeo, string> = {
  anillo: 'Campeón de la NBA — Trofeo Larry O’Brien, ganado en los playoffs.',
  allstar: 'Convocado al All-Star Game de la NBA por tu nivel esa temporada.',
  mvp: 'Jugador Más Valioso de la temporada regular de la NBA.',
  mundial: 'Campeón del Mundial de básquet (FIBA) con tu selección.',
  jjoo: 'Medalla de oro olímpica con tu selección.',
  'liga-local': 'Campeón de la liga de tu país, antes de llegar a la NBA.',
}
