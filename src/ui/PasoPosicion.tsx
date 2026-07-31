import { useState } from 'react'

const POSICIONES = [
  { id: 'PG', nombre: 'Base', top: '20%', left: '50%' },
  { id: 'SG', nombre: 'Escolta', top: '42%', left: '82%' },
  { id: 'SF', nombre: 'Alero', top: '42%', left: '18%' },
  // El pívot va cerca del aro pero sin taparlo (el aro y la zona restringida se dibujan
  // alrededor de y=90% del alto de la cancha).
  { id: 'PF', nombre: 'Ala-pívot', top: '73%', left: '70%' },
  { id: 'C', nombre: 'Pívot', top: '78%', left: '47%' },
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

        {/* Piso de parquet de maple, brillante (pedido del usuario: "más madera, más estética,
            más brillante y REAL"). Se arma por capas: tono base cálido + variación de tabla a
            tabla + veta fina + juntas entre tablas + brillo especular del barniz. */}
        <div
          className="relative mb-8 aspect-[3/4] w-full overflow-hidden border-2 border-hueso/25"
          style={{
            backgroundImage: [
              // brillo del barniz (reflejo diagonal ancho)
              'linear-gradient(112deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.06) 20%, transparent 38%, transparent 60%, rgba(255,255,255,0.10) 74%, rgba(255,255,255,0.02) 84%, transparent 95%)',
              // veta fina de la madera
              'repeating-linear-gradient(90deg, rgba(88,52,18,0.13) 0 1px, transparent 1px 6px)',
              // juntas entre tablas
              'repeating-linear-gradient(90deg, rgba(58,33,10,0.5) 0 2px, transparent 2px 27px)',
              // variación de tono tabla por tabla (para que no se vea plano/repetido)
              'repeating-linear-gradient(90deg, rgba(255,206,142,0.11) 0 27px, transparent 27px 54px, rgba(124,72,26,0.12) 54px 81px, transparent 81px 108px)',
              // tono base del maple
              'linear-gradient(172deg, #e0a259 0%, #cd8b41 42%, #ab6c2c 100%)',
            ].join(', '),
          }}
        >
          {/* Media cancha en vertical: el aro está ABAJO. La línea de triple ahora rodea ese aro
              — antes estaba dibujada en el extremo opuesto (bug reportado por el usuario). */}
          <svg viewBox="0 0 300 400" className="absolute inset-0 h-full w-full">
            <defs>
              {/* Las líneas están pintadas SOBRE la madera: llevan una sombra mínima para que se
                  apoyen en el piso en vez de flotar. */}
              <filter id="lineaPintada" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1.2" stdDeviation="0.8" floodColor="#3a2109" floodOpacity="0.55" />
              </filter>
            </defs>

            <g
              stroke="rgba(252,250,245,0.92)"
              strokeWidth="2.6"
              fill="none"
              strokeLinecap="round"
              filter="url(#lineaPintada)"
            >
              {/* Perímetro y línea de mitad de cancha (arriba), con su círculo central */}
              <rect x="10" y="10" width="280" height="380" />
              <circle cx="150" cy="10" r="52" />

              {/* Zona pintada, línea y círculo de tiros libres */}
              <rect x="106" y="300" width="88" height="90" />
              <circle cx="150" cy="300" r="44" />

              {/* Línea de triple: dos rectas desde la línea de fondo + arco alrededor del aro */}
              <line x1="30" y1="390" x2="30" y2="330" />
              <line x1="270" y1="390" x2="270" y2="330" />
              <path d="M30,330 A126,126 0 0 1 270,330" />

              {/* Aro, tablero y semicírculo de la zona restringida */}
              <line x1="128" y1="377" x2="172" y2="377" strokeWidth="4.5" />
              <circle cx="150" cy="368" r="7" strokeWidth="2.2" />
              <path d="M128,368 A22,22 0 0 1 172,368" strokeWidth="2" />

              {/* Marcas de posiciones de rebote sobre la zona */}
              <line x1="106" y1="352" x2="98" y2="352" strokeWidth="3" />
              <line x1="194" y1="352" x2="202" y2="352" strokeWidth="3" />
              <line x1="106" y1="332" x2="98" y2="332" strokeWidth="3" />
              <line x1="194" y1="332" x2="202" y2="332" strokeWidth="3" />
            </g>
          </svg>

          {/* Viñeta: oscurece los bordes para dar profundidad y que el brillo del centro resalte */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 42%, transparent 40%, rgba(38,20,6,0.28) 78%, rgba(24,12,3,0.5) 100%)',
            }}
          />

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
