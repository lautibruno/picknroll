import { useState } from 'react'
import type { Carrera, IconoTrofeo } from '../engine/motorCarrera'
import { calcularVeredicto } from '../engine/veredicto'
import { ICONOS_TROFEO, ETIQUETA_TROFEO, DESCRIPCION_TROFEO } from './iconosTrofeos'

const CLAVE_TROFEO: Record<IconoTrofeo, keyof Carrera['trofeos']> = {
  anillo: 'anillos',
  allstar: 'allStar',
  mvp: 'mvp',
  mundial: 'mundial',
  jjoo: 'jjoo',
}
const ORDEN_VITRINA: IconoTrofeo[] = ['anillo', 'mvp', 'allstar', 'mundial', 'jjoo']

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
  const [trofeoAbierto, setTrofeoAbierto] = useState<IconoTrofeo | null>(null)
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

      <div className="border-b-2 border-hueso/15 px-6 py-6">
        <div className="mb-3 flex items-baseline justify-between">
          <div className="font-mono-stats text-[10px] tracking-[0.2em] text-hueso/45">VITRINA</div>
          <div className="font-mono-stats text-[10px] tracking-[0.12em] text-hueso/40">
            {ORDEN_VITRINA.reduce((total, t) => total + carrera.trofeos[CLAVE_TROFEO[t]], 0)} TÍTULOS
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {ORDEN_VITRINA.map((t, i) => {
            const cantidad = carrera.trofeos[CLAVE_TROFEO[t]]
            const Icono = ICONOS_TROFEO[t]
            const abierto = trofeoAbierto === t
            return (
              <button
                key={t}
                type="button"
                title={DESCRIPCION_TROFEO[t]}
                onClick={() => setTrofeoAbierto(abierto ? null : t)}
                className="animar-trofeo group flex aspect-square w-28 flex-col items-center justify-center gap-1.5 text-center"
                style={{
                  animationDelay: `${i * 100}ms`,
                  border: cantidad > 0 ? '2px solid var(--color-acento)' : '1px dashed rgba(245,241,232,0.22)',
                  background: cantidad > 0 ? 'var(--color-superficie-alta)' : 'var(--color-fondo)',
                }}
              >
                <Icono className="h-8 w-8" />
                <div
                  className="font-marcador text-2xl leading-none"
                  style={{ color: cantidad > 0 ? 'var(--color-acento)' : 'rgba(245,241,232,0.25)' }}
                >
                  {cantidad}
                </div>
                <div
                  className="font-mono-stats text-[9px] tracking-[0.12em]"
                  style={{ color: cantidad > 0 ? 'var(--color-hueso)' : 'rgba(245,241,232,0.35)' }}
                >
                  {ETIQUETA_TROFEO[t]}
                </div>
              </button>
            )
          })}
        </div>
        {trofeoAbierto && (
          <div className="mt-3 border-l-4 border-acento bg-superficie-alta/60 px-4 py-2.5 font-titulo text-xs text-hueso/80">
            {DESCRIPCION_TROFEO[trofeoAbierto]}
          </div>
        )}
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
