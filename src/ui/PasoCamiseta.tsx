import { useState } from 'react'
import { coloresDePais } from './datosColoresPais'

export interface DatosPaso3 {
  apellido: string
  dorsal: string
  manoHabil: 'diestra' | 'zurda'
}

interface PasoCamisetaProps {
  codigoPais: string
  onContinuar: (datos: DatosPaso3) => void
  onVolver: () => void
}

function colorTexto(hexFondo: string): string {
  // contraste simple: fondo claro -> texto oscuro, fondo oscuro -> texto hueso
  const r = parseInt(hexFondo.slice(1, 3), 16)
  const g = parseInt(hexFondo.slice(3, 5), 16)
  const b = parseInt(hexFondo.slice(5, 7), 16)
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminancia > 0.6 ? '#0d0d0d' : '#f5f1e8'
}

export function PasoCamiseta({ codigoPais, onContinuar, onVolver }: PasoCamisetaProps) {
  const [apellido, setApellido] = useState('')
  const [dorsal, setDorsal] = useState('')
  const [manoHabil, setManoHabil] = useState<'diestra' | 'zurda'>('diestra')

  const { primario, secundario } = coloresDePais(codigoPais)
  const colorNumero = colorTexto(primario)

  return (
    <div className="mx-auto max-w-2xl border-2 border-hueso/15 bg-fondo">
      <div className="flex items-stretch justify-between border-b-2 border-hueso">
        <div className="flex items-center px-6 py-4 font-marcador text-3xl">
          PICK<span className="text-acento">'</span>N<span className="text-acento">'</span>ROLL
        </div>
        <div className="flex items-center px-6 font-mono-stats text-[11px] tracking-[0.12em] text-hueso/50">
          PASO 3 / 4 · CAMISETA
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_260px]">
        <div className="p-8">
          <div className="font-marcador text-5xl leading-none">TU CAMISETA</div>
          <div className="mb-8 mt-2 font-titulo text-sm font-light tracking-[0.1em] text-hueso/55">
            APELLIDO Y DORSAL SE ACTUALIZAN EN VIVO
          </div>

          <div className="mb-6 grid grid-cols-[1fr_100px] gap-4">
            <div>
              <div className="mb-2 font-mono-stats text-[9px] tracking-[0.18em] text-hueso/45">APELLIDO</div>
              <input
                value={apellido}
                onChange={(e) => setApellido(e.target.value.toUpperCase().slice(0, 14))}
                className="w-full border border-hueso/25 border-b-2 border-b-hueso bg-superficie-alta/40 px-3 py-2.5 font-titulo text-lg uppercase outline-none"
              />
            </div>
            <div>
              <div className="mb-2 font-mono-stats text-[9px] tracking-[0.18em] text-hueso/45">DORSAL</div>
              <input
                value={dorsal}
                onChange={(e) => setDorsal(e.target.value.replace(/\D/g, '').slice(0, 2))}
                className="w-full border border-hueso/25 border-b-2 border-b-acento bg-superficie-alta/40 px-3 py-1.5 font-marcador text-2xl text-acento outline-none"
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-2 font-mono-stats text-[9px] tracking-[0.18em] text-hueso/45">MANO HÁBIL</div>
            <div className="flex gap-2">
              {(['diestra', 'zurda'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setManoHabil(m)}
                  className={`flex-1 border py-2.5 font-titulo text-xs font-semibold tracking-[0.12em] uppercase ${
                    manoHabil === m ? 'border-hueso bg-hueso text-fondo' : 'border-hueso/25 bg-superficie-alta/40 text-hueso/60'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
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
              onClick={() => onContinuar({ apellido: apellido || 'JUGADOR', dorsal: dorsal || '0', manoHabil })}
              className="sombra-brutal animar-glow-pulse flex-1 bg-acento px-8 py-4 font-titulo text-lg font-semibold tracking-[0.16em] text-fondo"
            >
              CONTINUAR
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center border-t-2 border-hueso/15 bg-superficie-alta/30 p-6 sm:border-l-2 sm:border-t-0">
          <svg viewBox="0 0 240 280" className="w-full max-w-[220px] drop-shadow-lg">
            <path
              d="M60,10 L100,10 Q120,26 140,10 L180,10 L215,58 L182,80 L182,270 L58,270 L58,80 L25,58 Z"
              fill={primario}
              stroke={secundario}
              strokeWidth="6"
            />
            <path
              d="M100,10 Q120,26 140,10"
              fill="none"
              stroke={secundario}
              strokeWidth="8"
              strokeLinecap="round"
            />
            <rect x="58" y="80" width="10" height="190" fill={secundario} />
            <rect x="172" y="80" width="10" height="190" fill={secundario} />
            <text
              x="120"
              y="115"
              textAnchor="middle"
              fontFamily="Oswald, sans-serif"
              fontWeight={600}
              fontSize="16"
              letterSpacing="1"
              fill={colorNumero}
            >
              {apellido || 'APELLIDO'}
            </text>
            <text
              x="120"
              y="210"
              textAnchor="middle"
              fontFamily="'Bebas Neue', sans-serif"
              fontSize="90"
              fill={colorNumero}
            >
              {dorsal || '0'}
            </text>
          </svg>
        </div>
      </div>
    </div>
  )
}
