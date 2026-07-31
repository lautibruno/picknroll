import { useState } from 'react'
import type { Carrera } from '../engine/motorCarrera'
import { calcularVeredicto } from '../engine/veredicto'
import { resumirRecorrido } from '../engine/recorrido'
import { armarResumenCarrera, armarTextoCompartir } from '../engine/compartirCarrera'
import { generarImagenCompartir } from './generarImagenCompartir'
import { ICONOS_TROFEO, IconoLigaLocal } from './iconosTrofeos'
import { VitrinaTrofeos } from './VitrinaTrofeos'

interface PantallaRetiroProps {
  carrera: Carrera
  nombreCompleto: string
  onNuevaCarrera: () => void
}

function descargarImagen(blob: Blob) {
  const url = URL.createObjectURL(blob)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = 'picknroll-carrera.png'
  enlace.click()
  URL.revokeObjectURL(url)
}

export function PantallaRetiro({ carrera, nombreCompleto, onNuevaCarrera }: PantallaRetiroProps) {
  const [estado, setEstado] = useState<'listo' | 'generando' | 'copiado'>('listo')
  const resumen = armarResumenCarrera(carrera, nombreCompleto)
  // Link limpio, sin ningún dato codificado (pedido explícito del usuario: "no quiero un
  // link gigantesco") — la imagen con los datos de la carrera viaja como archivo adjunto al
  // compartir, no en la URL. Ver generarImagenCompartir.ts.
  const url = window.location.origin
  const texto = armarTextoCompartir(resumen, url)
  const picoOvr = resumen.picoOvr
  const totalPj = carrera.historial.reduce((acc, h) => acc + h.pj, 0)
  const veredicto = calcularVeredicto(carrera)
  const recorrido = resumirRecorrido(carrera.historial)

  async function compartir() {
    setEstado('generando')
    const blob = await generarImagenCompartir(resumen)
    const archivo = blob ? new File([blob], 'picknroll-carrera.png', { type: 'image/png' }) : null

    // Compartir la imagen como archivo adjunto (junto con el texto, que ya lleva el link) es
    // lo que hace que se vea como una tarjeta real en WhatsApp — no un link pelado.
    if (archivo && navigator.canShare?.({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo], text: texto })
        setEstado('listo')
        return
      } catch {
        // el usuario canceló el share nativo — no hace falta caer a nada más
        setEstado('listo')
        return
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: `${nombreCompleto} — PickNRoll`, text: texto })
        setEstado('listo')
        return
      } catch {
        // cae al copiado/descarga de abajo
      }
    }

    // Sin Web Share API (típicamente desktop): descarga la imagen y copia el texto, para que
    // el usuario los pegue juntos a mano donde quiera compartirlos.
    if (blob) descargarImagen(blob)
    try {
      await navigator.clipboard.writeText(texto)
      setEstado('copiado')
      setTimeout(() => setEstado('listo'), 2000)
    } catch {
      setEstado('listo')
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
        <VitrinaTrofeos carrera={carrera} />
      </div>

      {/* Recorrido: todos los equipos por los que pasó (pedido explícito del usuario). */}
      <div className="border-b-2 border-hueso/15 px-6 py-6">
        <div className="mb-3 flex items-baseline justify-between">
          <div className="font-mono-stats text-[10px] tracking-[0.2em] text-hueso/45">RECORRIDO</div>
          <div className="font-mono-stats text-[10px] tracking-[0.12em] text-hueso/40">
            {recorrido.length} {recorrido.length === 1 ? 'EQUIPO' : 'EQUIPOS'}
          </div>
        </div>
        <div className="flex flex-col">
          {recorrido.map((paso, i) => (
            <div key={`${paso.clubId ?? 'sin'}-${paso.edadDesde}-${i}`} className="flex items-stretch gap-3">
              <div className="w-16 shrink-0 pt-3 font-mono-stats text-[10px] text-hueso/50">
                {paso.edadDesde === paso.edadHasta ? paso.edadDesde : `${paso.edadDesde}–${paso.edadHasta}`}
              </div>
              {/* Línea de tiempo punteada */}
              <div className="flex w-3 shrink-0 flex-col items-center">
                <div className={`mt-3.5 h-2.5 w-2.5 shrink-0 ${paso.trofeos.length > 0 ? 'bg-acento' : 'bg-hueso/40'}`} />
                {i < recorrido.length - 1 && (
                  <div
                    className="w-0.5 flex-1"
                    style={{
                      background:
                        'repeating-linear-gradient(180deg,rgba(245,241,232,0.3) 0 5px,transparent 5px 10px)',
                    }}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1 pb-4 pt-2.5">
                <div className="flex items-center gap-1.5">
                  {paso.clubEscudoUrl && (
                    <img src={paso.clubEscudoUrl} alt="" className="h-4 w-4 shrink-0 object-contain" />
                  )}
                  <span className="truncate font-titulo text-sm font-semibold uppercase tracking-[0.03em]">
                    {paso.clubNombre}
                  </span>
                  {paso.trofeos.length > 0 && (
                    <span className="flex shrink-0 items-center gap-0.5">
                      {paso.trofeos.map((t, ti) =>
                        t === 'liga-local' ? (
                          <IconoLigaLocal key={ti} className="h-4 w-auto max-w-7" url={carrera.ligaDomestica?.trofeoUrl} />
                        ) : (
                          (() => {
                            const Icono = ICONOS_TROFEO[t]
                            return <Icono key={ti} className="h-4 w-auto max-w-7 text-acento" />
                          })()
                        ),
                      )}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 font-mono-stats text-[10px] text-hueso/45">
                  {paso.temporadas} {paso.temporadas === 1 ? 'temporada' : 'temporadas'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="mb-3 font-mono-stats text-[10px] tracking-[0.2em] text-hueso/45">PARA COMPARTIR</div>
        <pre className="whitespace-pre-line border border-hueso/20 bg-superficie-alta/40 p-4 font-mono-stats text-xs leading-loose text-hueso/85">
          {texto}
        </pre>
        <div className="mt-4 flex gap-2.5">
          <button
            type="button"
            onClick={compartir}
            disabled={estado === 'generando'}
            className="flex-1 bg-hueso px-4 py-3.5 text-center font-titulo text-sm font-semibold tracking-[0.14em] text-fondo disabled:opacity-60"
          >
            {estado === 'generando' ? 'GENERANDO…' : estado === 'copiado' ? 'COPIADO ✓' : 'COMPARTIR'}
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
