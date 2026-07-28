import { useState } from 'react'
import type { Carrera, Equipo } from '../engine/motorCarrera'
import { calcularEstadisticasTemporada } from '../engine/estadisticas'
import { colorPorOvr } from './colorOvr'
import { calcularValorMercadoEuros, formatoValorMercado } from '../engine/valorMercado'
import { AnimacionAro } from './AnimacionAro'

interface PantallaEventoProps {
  carrera: Carrera
  onElegir: (opcionId: string) => void
}

const TITULOS_EVENTO: Record<string, { etiqueta: string; titulo: string; bajada: string }> = {
  'club-liga-domestica': {
    etiqueta: 'CANTERA',
    titulo: 'TRES CLUBES TE QUIEREN',
    bajada: 'Las opciones salen de tu nivel actual, no de tu techo.',
  },
  draft: {
    etiqueta: 'DRAFT NBA',
    titulo: 'TRES FRANQUICIAS TE QUIEREN',
    bajada: 'Cruzaste el umbral — llegó tu oportunidad. Las opciones salen de tu nivel actual, no de tu techo.',
  },
  trade: {
    etiqueta: 'AGENCIA LIBRE',
    titulo: 'SE ABRE EL MERCADO',
    bajada: 'Elegí bien: no hay deshacer.',
  },
}

function abreviarNombre(nombre: string): string {
  const primeraPalabra = nombre.replace(/\(.*\)/, '').trim().split(/\s+/)[0]
  return primeraPalabra.slice(0, 3).toUpperCase()
}

function etiquetaRiesgoClub(nivelClub: number, ovr: number): string {
  const diferencia = ovr - nivelClub
  if (diferencia >= 0) return 'BAJO RIESGO · SERÍAS TITULAR'
  if (diferencia >= -10) return 'RIESGO MEDIO · ROTACIÓN'
  return 'ALTO RIESGO · BANCA'
}

function Hud({ carrera }: { carrera: Carrera }) {
  return (
    <div className="flex flex-wrap items-stretch border-b-2 border-hueso bg-superficie-alta/40">
      <div className="flex items-center border-r border-hueso/15 px-5 py-3 font-marcador text-2xl">
        PICK<span className="text-acento">'</span>N<span className="text-acento">'</span>ROLL
      </div>
      <div className="flex flex-1 flex-wrap">
        <div className="border-r border-hueso/10 px-5 py-2">
          <div className="font-mono-stats text-[9px] tracking-[0.18em] text-hueso/45">OVR</div>
          <div className="font-marcador text-3xl leading-none" style={{ color: colorPorOvr(carrera.jugador.ovr) }}>
            {carrera.jugador.ovr}
          </div>
        </div>
        <div className="border-r border-hueso/10 px-5 py-2">
          <div className="font-mono-stats text-[9px] tracking-[0.18em] text-hueso/45">EDAD</div>
          <div className="font-marcador text-3xl leading-none">{carrera.jugador.edad}</div>
        </div>
        <div className="border-r border-hueso/10 px-5 py-2">
          <div className="font-mono-stats text-[9px] tracking-[0.18em] text-hueso/45">FASE</div>
          <div className="font-marcador text-3xl leading-none">{carrera.fase === 'nba' ? 'NBA' : 'PRE'}</div>
        </div>
        <div className="px-5 py-2">
          <div className="font-mono-stats text-[9px] tracking-[0.18em] text-hueso/45">VALOR</div>
          <div className="font-marcador text-3xl leading-none">
            {formatoValorMercado(calcularValorMercadoEuros(carrera.jugador.ovr))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PantallaEvento({ carrera, onElegir }: PantallaEventoProps) {
  const [eligiendoId, setEligiendoId] = useState<string | null>(null)
  const evento = carrera.eventoPendiente
  if (!evento) return null

  if (evento.tipo === 'riesgo') {
    const { decision } = evento
    return (
      <div className="mx-auto max-w-2xl border-2 border-hueso/15 bg-fondo">
        <Hud carrera={carrera} />
        <div className="relative border-b-2 border-hueso/15 px-6 py-8 text-center">
          <span className="mb-4 inline-block bg-acento px-3 py-1 font-mono-stats text-[10px] font-bold tracking-[0.2em] text-fondo">
            DECISIÓN DE RIESGO
          </span>
          <div className="font-marcador text-4xl leading-none sm:text-5xl">{decision.titulo.toUpperCase()}</div>
          <div className="mx-auto mt-3 max-w-xl font-titulo text-sm font-light leading-relaxed text-hueso/65">
            {decision.descripcion}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-0.5 bg-hueso/10 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onElegir('arriesgar')}
            className="flex flex-col gap-4 border-t-4 border-acento bg-fondo px-5 py-6 text-left hover:bg-superficie"
          >
            <div className="font-titulo text-xl font-semibold uppercase tracking-[0.04em]">Arriesgar</div>
            <div className="flex gap-3">
              <div className="flex-1 bg-superficie-alta/50 px-3 py-3 text-center">
                <div className="font-marcador text-2xl leading-none text-en-vivo">
                  +{decision.deltaSiExito} OVR
                </div>
                <div className="mt-1 font-mono-stats text-[10px] tracking-[0.1em] text-hueso/50">
                  {Math.round(decision.probabilidadExito * 100)}%
                </div>
              </div>
              <div className="flex-1 bg-superficie-alta/50 px-3 py-3 text-center">
                <div className="font-marcador text-2xl leading-none" style={{ color: '#ef4444' }}>
                  {decision.deltaSiFalla} OVR
                </div>
                <div className="mt-1 font-mono-stats text-[10px] tracking-[0.1em] text-hueso/50">
                  {Math.round((1 - decision.probabilidadExito) * 100)}%
                </div>
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-hueso/15 pt-3">
              <span className="font-mono-stats text-[9px] tracking-[0.1em] text-acento">CON PROBABILIDAD VISIBLE</span>
              <span className="bg-hueso px-4 py-2 font-titulo text-xs font-semibold tracking-[0.16em] text-fondo">
                ELEGIR
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onElegir('seguro')}
            className="flex flex-col gap-4 border-t-4 border-hueso/30 bg-fondo px-5 py-6 text-left hover:bg-superficie"
          >
            <div className="font-titulo text-xl font-semibold uppercase tracking-[0.04em] text-hueso/80">
              Jugar seguro
            </div>
            <div className="flex-1 bg-superficie-alta/50 px-3 py-3 text-center">
              <div className="font-marcador text-2xl leading-none">0 OVR</div>
              <div className="mt-1 font-mono-stats text-[10px] tracking-[0.1em] text-hueso/50">SIN CAMBIOS</div>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-hueso/15 pt-3">
              <span className="font-mono-stats text-[9px] tracking-[0.1em] text-hueso/40">GARANTIZADO</span>
              <span className="bg-hueso px-4 py-2 font-titulo text-xs font-semibold tracking-[0.16em] text-fondo">
                ELEGIR
              </span>
            </div>
          </button>
        </div>

        <div className="border-t-2 border-hueso/15 px-6 py-4 font-mono-stats text-[10px] tracking-[0.1em] text-hueso/40">
          EL RESULTADO YA ESTÁ DECIDIDO — VOS ELEGÍS SI JUGARLO
        </div>
      </div>
    )
  }

  if (evento.tipo === 'especializacion') {
    return (
      <div className="mx-auto max-w-2xl border-2 border-hueso/15 bg-fondo">
        <Hud carrera={carrera} />
        <div className="relative border-b-2 border-hueso/15 px-6 py-8 text-center">
          <span className="mb-4 inline-block bg-acento px-3 py-1 font-mono-stats text-[10px] font-bold tracking-[0.2em] text-fondo">
            MOMENTO DE DEFINIRTE
          </span>
          <div className="font-marcador text-4xl leading-none sm:text-5xl">¿EN QUÉ TE ESPECIALIZÁS?</div>
          <div className="mx-auto mt-3 max-w-xl font-titulo text-sm font-light leading-relaxed text-hueso/65">
            Es una sola vez en tu carrera — define tu estilo de juego de acá en adelante.
          </div>
        </div>

        <div className="grid grid-cols-1 gap-0.5 bg-hueso/10 sm:grid-cols-2">
          {evento.opciones.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              onClick={() => onElegir(opcion.id)}
              className="flex flex-col gap-4 border-t-4 border-acento bg-fondo px-5 py-6 text-left hover:bg-superficie"
            >
              <div className="font-titulo text-xl font-semibold uppercase tracking-[0.04em]">{opcion.nombre}</div>
              <div className="font-titulo text-sm font-light leading-relaxed text-hueso/70">{opcion.descripcion}</div>
              <div className="mt-auto flex items-center justify-between border-t border-hueso/15 pt-3">
                <span className="font-mono-stats text-[9px] tracking-[0.1em] text-acento">
                  {opcion.id === 'triplero' ? 'MÁS TRIPLES' : 'MÁS REBOTES'}
                </span>
                <span className="bg-hueso px-4 py-2 font-titulo text-xs font-semibold tracking-[0.16em] text-fondo">
                  ELEGIR
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="border-t-2 border-hueso/15 px-6 py-4 font-mono-stats text-[10px] tracking-[0.1em] text-hueso/40">
          NO HAY DESHACER — ESTA ELECCIÓN TE ACOMPAÑA EL RESTO DE LA CARRERA
        </div>
      </div>
    )
  }

  const info = TITULOS_EVENTO[evento.tipo]

  function elegirConAnimacion(opcionId: string) {
    if (eligiendoId) return
    setEligiendoId(opcionId)
  }

  return (
    <div className="mx-auto max-w-2xl border-2 border-hueso/15 bg-fondo">
      <Hud carrera={carrera} />

      <AnimacionAro disparar={eligiendoId !== null} onTerminada={() => eligiendoId && onElegir(eligiendoId)} />

      <div className="relative border-b-2 border-hueso/15 px-6 py-8 text-center">
        <span className="mb-4 inline-block bg-acento px-3 py-1 font-mono-stats text-[10px] font-bold tracking-[0.2em] text-fondo">
          {info.etiqueta}
        </span>
        <div className="font-marcador text-4xl leading-none sm:text-5xl">{info.titulo}</div>
        <div className="mx-auto mt-3 max-w-xl font-titulo text-sm font-light leading-relaxed text-hueso/65">
          {info.bajada}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0.5 bg-hueso/10 sm:grid-cols-3">
        {evento.opciones.map((opcion: Equipo) => {
              const esQuedarse = opcion.id === carrera.clubActual?.id
              const activo = eligiendoId === opcion.id
              const bloqueado = eligiendoId !== null
              const stats = calcularEstadisticasTemporada(carrera.jugador.ovr, opcion.nivel, carrera.fase)
              return (
                <button
                  key={opcion.id}
                  type="button"
                  onClick={() => elegirConAnimacion(opcion.id)}
                  disabled={bloqueado}
                  style={{ opacity: bloqueado && !activo ? 0.4 : 1 }}
                  className={`flex flex-col gap-3 border-t-4 bg-fondo px-5 py-6 text-left transition-opacity hover:bg-superficie ${
                    esQuedarse ? 'border-hueso/40' : 'border-acento'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-titulo text-xl font-semibold uppercase leading-tight tracking-[0.04em]">
                      {opcion.nombre}
                    </div>
                    <div className="flex h-11 w-13 shrink-0 items-center justify-center border-2 border-hueso/25 bg-superficie-alta font-titulo text-sm font-semibold">
                      {opcion.escudoUrl ? (
                        <img src={opcion.escudoUrl} alt="" className="h-9 w-9 object-contain" />
                      ) : (
                        abreviarNombre(opcion.nombre)
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-baseline justify-between font-mono-stats text-[9px] tracking-[0.14em] text-hueso/45">
                      <span>NIVEL DE PLANTEL</span>
                      <span className="font-mono-stats text-xs text-hueso">{opcion.nivel}</span>
                    </div>
                    <div className="h-2 bg-superficie">
                      <div className="h-full bg-acento" style={{ width: `${opcion.nivel}%` }} />
                    </div>
                  </div>

                  <div className="flex gap-0.5 bg-hueso/10">
                    <div className="flex-1 bg-superficie-alta/50 px-3 py-2">
                      <div className="font-mono-stats text-[9px] tracking-[0.14em] text-hueso/45">ROL</div>
                      <div className="mt-0.5 font-titulo text-sm font-semibold uppercase">{stats.rol}</div>
                    </div>
                    <div className="flex-1 bg-superficie-alta/50 px-3 py-2">
                      <div className="font-mono-stats text-[9px] tracking-[0.14em] text-hueso/45">MIN/PJ EST.</div>
                      <div className="mt-0.5 font-marcador text-xl leading-none">{stats.minutos}</div>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-hueso/15 pt-3">
                    <span className={`font-mono-stats text-[9px] tracking-[0.1em] ${esQuedarse ? 'text-hueso/50' : 'text-acento'}`}>
                      {esQuedarse ? 'QUEDARTE ACÁ' : etiquetaRiesgoClub(opcion.nivel, carrera.jugador.ovr)}
                    </span>
                    <span className="bg-hueso px-4 py-2 font-titulo text-xs font-semibold tracking-[0.16em] text-fondo">
                      {activo ? 'FICHANDO…' : 'ELEGIR'}
                    </span>
                  </div>
                </button>
              )
            })}
      </div>

      <div className="border-t-2 border-hueso/15 px-6 py-4 font-mono-stats text-[10px] tracking-[0.1em] text-hueso/40">
        NO HAY DESHACER · LA ELECCIÓN CIERRA PUERTAS MÁS ADELANTE
      </div>
    </div>
  )
}
