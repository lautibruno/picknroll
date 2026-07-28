import { useState } from 'react'
import type { Carrera } from '../engine/motorCarrera'
import { calcularVeredicto } from '../engine/veredicto'

interface PantallaRetiroProps {
  carrera: Carrera
  nombreCompleto: string
  onNuevaCarrera: () => void
}

function armarTextoCompartir(carrera: Carrera, nombreCompleto: string): string {
  const temporadas = carrera.historial.length
  const picoOvr = Math.max(0, ...carrera.historial.map((h) => h.ovr), carrera.jugador.ovr)
  const veredicto = calcularVeredicto(carrera)
  const lineas = [
    `${nombreCompleto} — PickNRoll`,
    veredicto.titulo,
    `${temporadas} temporadas · pico OVR ${picoOvr}`,
    `🏆 ${carrera.trofeos.anillos} anillos · ⭐ ${carrera.trofeos.allStar} All-Star · 👑 ${carrera.trofeos.mvp} MVP`,
    carrera.fase === 'nba' ? '✅ Llegó a la NBA' : '❌ Nunca pisó la NBA',
  ]
  return lineas.join('\n')
}

export function PantallaRetiro({ carrera, nombreCompleto, onNuevaCarrera }: PantallaRetiroProps) {
  const [copiado, setCopiado] = useState(false)
  const texto = armarTextoCompartir(carrera, nombreCompleto)
  const picoOvr = Math.max(0, ...carrera.historial.map((h) => h.ovr), carrera.jugador.ovr)
  const totalPj = carrera.historial.reduce((acc, h) => acc + h.pj, 0)
  const veredicto = calcularVeredicto(carrera)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl border-2 border-hueso/15 bg-fondo">
      <div className="textura-parquet border-b-2 border-hueso px-6 py-10 text-center">
        <div className="relative">
          <div className="mb-3 font-mono-stats text-[10px] tracking-[0.24em] text-acento">CARRERA TERMINADA</div>
          <div className="animar-settle font-marcador text-6xl leading-none sm:text-7xl">{nombreCompleto.toUpperCase()}</div>
          <div className="mt-2 font-titulo text-sm font-light tracking-[0.2em] text-hueso/60">
            SE RETIRÓ A LOS {carrera.jugador.edad}
          </div>
          <div className="sombra-brutal mx-auto mt-6 inline-block bg-acento px-6 py-3">
            <div className="font-marcador text-3xl leading-none text-fondo sm:text-4xl">{veredicto.titulo}</div>
          </div>
          <div className="mx-auto mt-3 max-w-md font-titulo text-sm font-light text-hueso/70">
            {veredicto.descripcion}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-b-2 border-hueso/15 sm:grid-cols-4">
        <div className="border-r border-hueso/10 px-4 py-6 text-center">
          <div className="font-mono-stats text-[9px] tracking-[0.18em] text-hueso/45">TEMPORADAS</div>
          <div className="font-marcador text-5xl leading-none">{carrera.historial.length}</div>
        </div>
        <div className="border-r border-hueso/10 px-4 py-6 text-center">
          <div className="font-mono-stats text-[9px] tracking-[0.18em] text-hueso/45">PICO OVR</div>
          <div className="font-marcador text-5xl leading-none text-acento">{picoOvr}</div>
        </div>
        <div className="border-r border-hueso/10 px-4 py-6 text-center">
          <div className="font-mono-stats text-[9px] tracking-[0.18em] text-hueso/45">PJ TOTAL</div>
          <div className="font-marcador text-5xl leading-none">{totalPj}</div>
        </div>
        <div className="px-4 py-6 text-center">
          <div className="font-mono-stats text-[9px] tracking-[0.18em] text-hueso/45">LLEGÓ A NBA</div>
          <div className="font-marcador text-5xl leading-none">{carrera.fase === 'nba' ? 'SÍ' : 'NO'}</div>
        </div>
      </div>

      <div className="flex gap-3 border-b-2 border-hueso/15 px-6 py-6">
        {[
          { cantidad: carrera.trofeos.anillos, label: 'ANILLOS' },
          { cantidad: carrera.trofeos.allStar, label: 'ALL-STAR' },
          { cantidad: carrera.trofeos.mvp, label: 'MVP' },
        ].map((t, i) => (
          <div
            key={t.label}
            className="animar-trofeo flex aspect-square w-28 flex-col items-center justify-center gap-1.5 text-center"
            style={{
              animationDelay: `${i * 100}ms`,
              border: t.cantidad > 0 ? '2px solid var(--color-acento)' : '1px dashed rgba(245,241,232,0.22)',
              background: t.cantidad > 0 ? 'var(--color-superficie-alta)' : 'var(--color-fondo)',
            }}
          >
            <div
              className="font-marcador text-4xl leading-none"
              style={{ color: t.cantidad > 0 ? 'var(--color-acento)' : 'rgba(245,241,232,0.25)' }}
            >
              {t.cantidad}
            </div>
            <div
              className="font-mono-stats text-[9px] tracking-[0.12em]"
              style={{ color: t.cantidad > 0 ? 'var(--color-hueso)' : 'rgba(245,241,232,0.35)' }}
            >
              {t.label}
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-6">
        <div className="mb-3 font-mono-stats text-[10px] tracking-[0.2em] text-hueso/45">PARA COMPARTIR</div>
        <pre className="whitespace-pre-line border border-hueso/20 bg-superficie-alta/40 p-4 font-mono-stats text-xs leading-loose text-hueso/85">
          {texto}
        </pre>
        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={copiar}
            className="flex-1 bg-hueso px-4 py-3.5 text-center font-titulo text-sm font-semibold tracking-[0.14em] text-fondo"
          >
            {copiado ? 'COPIADO ✓' : 'COPIAR'}
          </button>
          <button
            type="button"
            onClick={onNuevaCarrera}
            className="sombra-brutal animar-glow-pulse flex-1 bg-acento px-4 py-3.5 text-center font-titulo text-sm font-semibold tracking-[0.14em] text-fondo"
          >
            NUEVA CARRERA
          </button>
        </div>
      </div>
    </div>
  )
}
