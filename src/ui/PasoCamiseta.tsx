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

// Geometría de la musculosa, en un solo lugar para que el contorno y los ribetes coincidan.
// Hombros angostos, sisas profundas y curvas, escote redondo y un leve vuelo en el ruedo.
const ESCOTE = 'M144,28 Q120,58 96,28'
const SISA_IZQ = 'M74,26 C62,54 52,84 48,116'
const SISA_DER = 'M192,116 C188,84 178,54 166,26'
const RUEDO = 'M46,262 Q120,278 194,262'
const CONTORNO_MUSCULOSA =
  'M74,26 C62,54 52,84 48,116 L46,262 Q120,278 194,262 L192,116 C188,84 178,54 166,26 L144,28 Q120,58 96,28 Z'

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
          {/* Musculosa de básquet realista (pedido explícito del usuario) — sin mangas, sisas
              profundas, escote redondo, ribetes en el color secundario, tela de malla y sombreado
              de pliegues. `SISA_*` y `ESCOTE` se reusan para el contorno y para los ribetes, así
              el borde y la costura siempre coinciden. */}
          <svg viewBox="0 0 240 300" className="w-full max-w-[220px]">
            <defs>
              <clipPath id="recorteMusculosa">
                <path d={CONTORNO_MUSCULOSA} />
              </clipPath>
              {/* Luz desde arriba-izquierda y caída de sombra hacia abajo-derecha */}
              <linearGradient id="sombraTela" x1="0" y1="0" x2="0.85" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.26" />
                <stop offset="42%" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.34" />
              </linearGradient>
              {/* Malla deportiva: agujeritos regulares, apenas visibles */}
              <pattern id="mallaTela" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="1.15" fill="#000000" opacity="0.13" />
              </pattern>
              <filter id="sombraMusculosa" x="-25%" y="-15%" width="150%" height="140%">
                <feDropShadow dx="3" dy="8" stdDeviation="7" floodColor="#000000" floodOpacity="0.55" />
              </filter>
            </defs>

            <g filter="url(#sombraMusculosa)">
              <path d={CONTORNO_MUSCULOSA} fill={primario} />

              <g clipPath="url(#recorteMusculosa)">
                <rect width="240" height="300" fill="url(#mallaTela)" />
                {/* Paneles laterales, como las musculosas de verdad */}
                <path d="M46,120 L64,118 L62,266 L46,258 Z" fill={secundario} opacity="0.85" />
                <path d="M194,120 L176,118 L178,266 L194,258 Z" fill={secundario} opacity="0.85" />
                {/* Pliegues de la tela */}
                <path d="M98,64 Q108,170 100,266" stroke="#ffffff" strokeOpacity="0.09" strokeWidth="11" fill="none" />
                <path d="M150,70 Q142,175 152,266" stroke="#000000" strokeOpacity="0.09" strokeWidth="9" fill="none" />
                <rect width="240" height="300" fill="url(#sombraTela)" />
              </g>

              {/* Ribetes: escote y sisas. Van por encima del recorte para que se lean como costura */}
              <path d={ESCOTE} fill="none" stroke={secundario} strokeWidth="8" strokeLinecap="round" />
              <path d={SISA_IZQ} fill="none" stroke={secundario} strokeWidth="6.5" strokeLinecap="round" />
              <path d={SISA_DER} fill="none" stroke={secundario} strokeWidth="6.5" strokeLinecap="round" />
              <path d={RUEDO} fill="none" stroke={secundario} strokeWidth="5" strokeLinecap="round" />
            </g>

            <text
              x="120"
              y="120"
              textAnchor="middle"
              fontFamily="Oswald, sans-serif"
              fontWeight={600}
              fontSize="17"
              letterSpacing="1.6"
              fill={colorNumero}
            >
              {apellido || 'APELLIDO'}
            </text>
            {/* Número con contorno, como los dorsales reales */}
            <text
              x="120"
              y="225"
              textAnchor="middle"
              fontFamily="'Bebas Neue', sans-serif"
              fontSize="104"
              fill={colorNumero}
              stroke={secundario}
              strokeWidth="2.6"
              paintOrder="stroke"
            >
              {dorsal || '0'}
            </text>
          </svg>
        </div>
      </div>
    </div>
  )
}
