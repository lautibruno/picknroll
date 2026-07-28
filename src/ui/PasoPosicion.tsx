import { useState } from 'react'

const POSICIONES = [
  { id: 'PG', nombre: 'Base', top: '20%', left: '50%' },
  { id: 'SG', nombre: 'Escolta', top: '42%', left: '82%' },
  { id: 'SF', nombre: 'Alero', top: '42%', left: '18%' },
  { id: 'PF', nombre: 'Ala-pívot', top: '76%', left: '68%' },
  { id: 'C', nombre: 'Pívot', top: '84%', left: '50%' },
] as const

interface PasoPosicionProps {
  onContinuar: (posicion: string) => void
  onVolver: () => void
}

export function PasoPosicion({ onContinuar, onVolver }: PasoPosicionProps) {
  const [seleccionada, setSeleccionada] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-2xl border-2 border-hueso/15 bg-fondo">
      <div className="flex items-stretch justify-between border-b-2 border-hueso">
        <div className="flex items-center px-6 py-4 font-marcador text-3xl">
          PICK<span className="text-acento">'</span>N<span className="text-acento">'</span>ROLL
        </div>
        <div className="flex items-center px-6 font-mono-stats text-[11px] tracking-[0.12em] text-hueso/50">
          PASO 4 / 4 · POSICIÓN
        </div>
      </div>

      <div className="p-8">
        <div className="font-marcador text-5xl leading-none">TU POSICIÓN</div>
        <div className="mb-6 mt-2 font-titulo text-sm font-light tracking-[0.1em] text-hueso/55">
          TOCÁ UN PUNTO DE LA CANCHA
        </div>

        <div
          className="relative mb-8 aspect-[3/4] w-full overflow-hidden border-2 border-hueso/25"
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(245,241,232,0.14), transparent 45%), repeating-linear-gradient(90deg, #4a3620 0 34px, #3f2e18 34px 36px), linear-gradient(160deg, #5a4126, #2a1d10)',
          }}
        >
          <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <g stroke="rgba(245,241,232,0.55)" strokeWidth="2.5" fill="none">
              <rect x="10" y="10" width="280" height="380" />
              <circle cx="150" cy="10" r="55" strokeDasharray="0" />
              <rect x="95" y="290" width="110" height="100" />
              <circle cx="150" cy="290" r="40" />
              <path d="M20,90 A130,130 0 0 0 280,90" />
              <line x1="20" y1="10" x2="20" y2="90" />
              <line x1="280" y1="10" x2="280" y2="90" />
              <circle cx="150" cy="370" r="10" />
              <line x1="130" y1="370" x2="170" y2="370" strokeWidth="4" />
            </g>
          </svg>

          {POSICIONES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSeleccionada(p.id)}
              style={{ top: p.top, left: p.left }}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 outline-none"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 font-marcador text-lg transition-transform ${
                  seleccionada === p.id
                    ? 'scale-110 border-hueso bg-acento text-fondo'
                    : 'border-hueso/60 bg-fondo/70 text-hueso'
                }`}
              >
                {p.id}
              </div>
              <div
                className={`rounded-sm px-1.5 py-0.5 font-mono-stats text-[9px] tracking-[0.08em] ${
                  seleccionada === p.id ? 'bg-acento text-fondo' : 'bg-fondo/70 text-hueso/80'
                }`}
              >
                {p.nombre.toUpperCase()}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onVolver}
            className="border border-hueso/25 px-6 py-4 font-titulo text-sm font-semibold tracking-[0.14em] text-hueso/70"
          >
            ← VOLVER
          </button>
          <button
            type="button"
            disabled={!seleccionada}
            onClick={() => seleccionada && onContinuar(seleccionada)}
            className="sombra-brutal animar-glow-pulse flex-1 bg-acento px-8 py-4 font-titulo text-lg font-semibold tracking-[0.16em] text-fondo disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
          >
            EMPEZAR CARRERA
          </button>
        </div>
      </div>
    </div>
  )
}
