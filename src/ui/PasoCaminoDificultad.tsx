import { useState } from 'react'
import type { DificultadCarrera, ModoCaminoPreNba } from '../engine/motorCarrera'

const DIFICULTADES: { id: DificultadCarrera; nombre: string; detalle: string }[] = [
  { id: 'intensa', nombre: 'INTENSA', detalle: 'Decisión cada temporada' },
  { id: 'normal', nombre: 'NORMAL', detalle: 'Decisión cada 2 temporadas' },
  { id: 'expres', nombre: 'EXPRÉS', detalle: 'Decisión cada 4 temporadas' },
]

export interface DatosPaso1 {
  modoCaminoPreNba: ModoCaminoPreNba
  dificultad: DificultadCarrera
}

interface PasoCaminoDificultadProps {
  onContinuar: (datos: DatosPaso1) => void
}

export function PasoCaminoDificultad({ onContinuar }: PasoCaminoDificultadProps) {
  const [modoCaminoPreNba, setModoCaminoPreNba] = useState<ModoCaminoPreNba>('liga-domestica')
  const [dificultad, setDificultad] = useState<DificultadCarrera>('normal')

  return (
    <div className="mx-auto max-w-2xl border-2 border-hueso/15 bg-fondo">
      <div className="flex items-stretch justify-between border-b-2 border-hueso">
        <div className="flex items-center px-6 py-4 font-marcador text-3xl">
          PICK<span className="text-acento">'</span>N<span className="text-acento">'</span>ROLL
        </div>
        <div className="flex items-center px-6 font-mono-stats text-[11px] tracking-[0.12em] text-hueso/50">
          PASO 1 / 4 · CAMINO
        </div>
      </div>

      <div className="p-8">
        <div className="font-marcador text-5xl leading-none">ELEGÍ TU CAMINO</div>
        <div className="mb-8 mt-2 font-titulo text-sm font-light tracking-[0.1em] text-hueso/55">
          ESTO DEFINE DÓNDE ARRANCA TU HISTORIA
        </div>

        <div className="mb-8">
          <div className="mb-2 font-mono-stats text-[9px] tracking-[0.18em] text-hueso/45">CAMINO PRE-NBA</div>
          <div className="flex flex-col gap-0.5 bg-hueso/10 sm:flex-row">
            <button
              type="button"
              onClick={() => setModoCaminoPreNba('liga-domestica')}
              className={`flex-1 border-l-4 px-4 py-4 text-left ${
                modoCaminoPreNba === 'liga-domestica' ? 'border-l-acento bg-superficie-alta' : 'border-l-transparent bg-fondo'
              }`}
            >
              <div className="font-titulo text-base font-semibold uppercase tracking-[0.08em]">Liga doméstica</div>
              <div className="mt-1 font-mono-stats text-[10px] text-hueso/50">
                CLUBES REALES DE TU PAÍS (SI TIENE LIGA CURADA)
              </div>
            </button>
            <button
              type="button"
              onClick={() => setModoCaminoPreNba('universidad')}
              className={`flex-1 border-l-4 px-4 py-4 text-left ${
                modoCaminoPreNba === 'universidad' ? 'border-l-acento bg-superficie-alta' : 'border-l-transparent bg-fondo'
              }`}
            >
              <div className="font-titulo text-base font-medium uppercase tracking-[0.08em] text-hueso/70">Vía EEUU</div>
              <div className="mt-1 font-mono-stats text-[10px] text-hueso/40">NCAA · G-LEAGUE · EUROPA</div>
            </button>
          </div>
        </div>

        <div className="mb-10">
          <div className="mb-2 font-mono-stats text-[9px] tracking-[0.18em] text-hueso/45">VELOCIDAD DE DECISIONES</div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {DIFICULTADES.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDificultad(d.id)}
                className={`flex-1 border px-3 py-3 text-left ${
                  dificultad === d.id ? 'border-acento bg-superficie-alta' : 'border-hueso/20 bg-fondo'
                }`}
              >
                <div className={`font-titulo text-sm font-semibold tracking-[0.1em] ${dificultad === d.id ? 'text-acento' : 'text-hueso'}`}>
                  {d.nombre}
                </div>
                <div className="mt-0.5 font-mono-stats text-[10px] text-hueso/45">{d.detalle}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onContinuar({ modoCaminoPreNba, dificultad })}
          className="sombra-brutal animar-glow-pulse bg-acento px-8 py-4 font-titulo text-lg font-semibold tracking-[0.16em] text-fondo"
        >
          CONTINUAR
        </button>
      </div>
    </div>
  )
}
