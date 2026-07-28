import { useMemo, useState } from 'react'
import { PAISES, urlBandera } from './datosPaises'

interface PasoPaisProps {
  onContinuar: (codigoPais: string) => void
  onVolver: () => void
}

export function PasoPais({ onContinuar, onVolver }: PasoPaisProps) {
  const [busqueda, setBusqueda] = useState('')
  const [seleccionado, setSeleccionado] = useState<string | null>(null)

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return PAISES
    return PAISES.filter((p) => p.nombre.toLowerCase().includes(q))
  }, [busqueda])

  return (
    <div className="mx-auto max-w-2xl border-2 border-hueso/15 bg-fondo">
      <div className="flex items-stretch justify-between border-b-2 border-hueso">
        <div className="flex items-center px-6 py-4 font-marcador text-3xl">
          PICK<span className="text-acento">'</span>N<span className="text-acento">'</span>ROLL
        </div>
        <div className="flex items-center px-6 font-mono-stats text-[11px] tracking-[0.12em] text-hueso/50">
          PASO 2 / 4 · NACIONALIDAD
        </div>
      </div>

      <div className="p-8">
        <div className="font-marcador text-5xl leading-none">¿DE DÓNDE SOS?</div>
        <div className="mb-6 mt-2 font-titulo text-sm font-light tracking-[0.1em] text-hueso/55">
          DEFINE LOS COLORES DE TU CAMISETA Y TU PUNTO DE PARTIDA
        </div>

        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar país…"
          className="mb-4 w-full border border-hueso/25 border-b-2 border-b-hueso bg-superficie-alta/40 px-4 py-3 font-titulo text-base outline-none placeholder:text-hueso/35"
        />

        <div className="mb-8 max-h-80 overflow-y-auto border border-hueso/15">
          {filtrados.length === 0 && (
            <div className="p-6 text-center font-titulo text-sm text-hueso/40">Ningún país coincide con la búsqueda.</div>
          )}
          {filtrados.map((pais) => (
            <button
              key={pais.codigo}
              type="button"
              onClick={() => setSeleccionado(pais.codigo)}
              className={`flex w-full items-center gap-3 border-b border-hueso/10 px-4 py-2.5 text-left last:border-b-0 ${
                seleccionado === pais.codigo ? 'bg-superficie-alta' : 'bg-fondo hover:bg-superficie'
              }`}
            >
              <img src={urlBandera(pais.codigo)} alt="" className="h-4 w-6 shrink-0 object-cover" />
              <span className="font-titulo text-sm">{pais.nombre}</span>
              {seleccionado === pais.codigo && <span className="ml-auto font-mono-stats text-xs text-acento">✓</span>}
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
            disabled={!seleccionado}
            onClick={() => seleccionado && onContinuar(seleccionado)}
            className="sombra-brutal animar-glow-pulse flex-1 bg-acento px-8 py-4 font-titulo text-lg font-semibold tracking-[0.16em] text-fondo disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
          >
            CONTINUAR
          </button>
        </div>
      </div>
    </div>
  )
}
