// Decisiones de riesgo — rehecho jugando copero.com.ar/juegos/simulador-carrera en vivo
// (pedido explícito del usuario): en el juego real esto NO da un +N/-N de OVR directo,
// cambia tu ROL (titular/rotación), y ese rol es lo que después afecta cuánto jugás y
// cuánto crecés en tu próximo fichaje (ver crecimientoPorTraspaso.ts). Formato: "Competir"
// (arriesgar la titularidad, con probabilidad de éxito visible) vs "Aceptar rotación"
// (opción segura, resigna terreno pero no hay sorpresas).
import type { Azar } from './potencial'

interface TemaRiesgo {
  titulo: string
  descripcion: string
  probabilidadExito: number // probabilidad de ganarte la titularidad si competís
}

const TEMAS_RIESGO: TemaRiesgo[] = [
  {
    titulo: 'Competencia por el puesto',
    descripcion: 'El club incorpora a otro jugador para pelear tu lugar en el equipo.',
    probabilidadExito: 0.5,
  },
  {
    titulo: 'Cambio de esquema táctico',
    descripcion: 'El entrenador prueba un sistema nuevo — puede consolidarte o dejarte afuera.',
    probabilidadExito: 0.55,
  },
  {
    titulo: 'Nuevo cuerpo técnico',
    descripcion: 'Cambia el entrenador y hay que ganarse la confianza desde cero.',
    probabilidadExito: 0.45,
  },
  {
    titulo: 'Vuelta de una lesión',
    descripcion: 'Volvés a estar disponible después de una molestia física — hay que reconquistar el puesto.',
    probabilidadExito: 0.6,
  },
]

export interface DecisionRiesgo extends TemaRiesgo {
  exito: boolean // ya resuelto al generar el evento — mismo dado, solo se aplica al elegir "competir"
}

export function generarDecisionRiesgo(azar: Azar): DecisionRiesgo {
  const tema = TEMAS_RIESGO[Math.floor(azar() * TEMAS_RIESGO.length)]
  return { ...tema, exito: azar() < tema.probabilidadExito }
}
