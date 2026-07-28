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
    <div className="flex shrink-0 flex-wrap items-stretch border-b-2 border-hueso bg-superficie-alta/40">
      <div className="hidden items-center border-r border-hueso/15 px-5 py-3 font-marcador text-2xl sm:flex">
        PICK<span className="text-acento">'</span>N<span className="text-acento">'</span>ROLL
      </div>
      <div className="flex flex-1 flex-wrap">
        <div className="border-r border-hueso/10 px-2.5 py-1.5 sm:px-5 sm:py-2">
          <div className="font-mono-stats text-[7px] tracking-[0.18em] text-hueso/45 sm:text-[9px]">OVR</div>
          <div className="font-marcador text-lg leading-none sm:text-3xl" style={{ color: colorPorOvr(carrera.jugador.ovr) }}>
            {carrera.jugador.ovr}
          </div>
        </div>
        <div className="border-r border-hueso/10 px-2.5 py-1.5 sm:px-5 sm:py-2">
          <div className="font-mono-stats text-[7px] tracking-[0.18em] text-hueso/45 sm:text-[9px]">EDAD</div>
          <div className="font-marcador text-lg leading-none sm:text-3xl">{carrera.jugador.edad}</div>
        </div>
        <div className="border-r border-hueso/10 px-2.5 py-1.5 sm:px-5 sm:py-2">
          <div className="font-mono-stats text-[7px] tracking-[0.18em] text-hueso/45 sm:text-[9px]">FASE</div>
          <div className="font-marcador text-lg leading-none sm:text-3xl">{carrera.fase === 'nba' ? 'NBA' : 'PRE'}</div>
        </div>
        <div className="px-2.5 py-1.5 sm:px-5 sm:py-2">
          <div className="font-mono-stats text-[7px] tracking-[0.18em] text-hueso/45 sm:text-[9px]">VALOR</div>
          <div className="font-marcador text-lg leading-none sm:text-3xl">
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
      <div className="mx-auto flex h-[calc(100dvh-5rem)] max-w-2xl flex-col border-2 border-hueso/15 bg-fondo sm:h-auto">
        <Hud carrera={carrera} />
        <div className="relative shrink-0 border-b-2 border-hueso/15 px-4 py-3 text-center sm:px-6 sm:py-8">
          <span className="mb-1.5 inline-block bg-acento px-2 py-0.5 font-mono-stats text-[8px] font-bold tracking-[0.2em] text-fondo sm:mb-4 sm:px-3 sm:py-1 sm:text-[10px]">
            DECISIÓN DE RIESGO
          </span>
          <div className="font-marcador text-2xl leading-none sm:text-5xl">{decision.titulo.toUpperCase()}</div>
          <div className="mx-auto mt-1.5 hidden max-w-xl font-titulo text-sm font-light leading-relaxed text-hueso/65 sm:mt-3 sm:block">
            {decision.descripcion}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-0.5 bg-hueso/10">
          <button
            type="button"
            onClick={() => onElegir('arriesgar')}
            className="flex flex-col gap-2 border-t-4 border-acento bg-fondo px-3 py-3 text-left hover:bg-superficie sm:gap-4 sm:px-5 sm:py-6"
          >
            <div className="font-titulo text-sm font-semibold uppercase tracking-[0.04em] sm:text-xl">Arriesgar</div>
            <div className="flex gap-1.5 sm:gap-3">
              <div className="flex-1 bg-superficie-alta/50 px-1.5 py-2 text-center sm:px-3 sm:py-3">
                <div className="font-marcador text-base leading-none text-en-vivo sm:text-2xl">
                  +{decision.deltaSiExito}
                </div>
                <div className="mt-1 font-mono-stats text-[9px] tracking-[0.1em] text-hueso/50 sm:text-[10px]">
                  {Math.round(decision.probabilidadExito * 100)}%
                </div>
              </div>
              <div className="flex-1 bg-superficie-alta/50 px-1.5 py-2 text-center sm:px-3 sm:py-3">
                <div className="font-marcador text-base leading-none sm:text-2xl" style={{ color: '#ef4444' }}>
                  {decision.deltaSiFalla}
                </div>
                <div className="mt-1 font-mono-stats text-[9px] tracking-[0.1em] text-hueso/50 sm:text-[10px]">
                  {Math.round((1 - decision.probabilidadExito) * 100)}%
                </div>
              </div>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-hueso/15 pt-2 sm:pt-3">
              <span className="hidden font-mono-stats text-[9px] tracking-[0.1em] text-acento sm:inline">CON PROBABILIDAD VISIBLE</span>
              <span className="ml-auto bg-hueso px-2.5 py-1.5 font-titulo text-[10px] font-semibold tracking-[0.16em] text-fondo sm:px-4 sm:py-2 sm:text-xs">
                ELEGIR
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onElegir('seguro')}
            className="flex flex-col gap-2 border-t-4 border-hueso/30 bg-fondo px-3 py-3 text-left hover:bg-superficie sm:gap-4 sm:px-5 sm:py-6"
          >
            <div className="font-titulo text-sm font-semibold uppercase tracking-[0.04em] text-hueso/80 sm:text-xl">
              Jugar seguro
            </div>
            <div className="flex-1 bg-superficie-alta/50 px-1.5 py-2 text-center sm:px-3 sm:py-3">
              <div className="font-marcador text-base leading-none sm:text-2xl">0 OVR</div>
              <div className="mt-1 font-mono-stats text-[9px] tracking-[0.1em] text-hueso/50 sm:text-[10px]">SIN CAMBIOS</div>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-hueso/15 pt-2 sm:pt-3">
              <span className="hidden font-mono-stats text-[9px] tracking-[0.1em] text-hueso/40 sm:inline">GARANTIZADO</span>
              <span className="ml-auto bg-hueso px-2.5 py-1.5 font-titulo text-[10px] font-semibold tracking-[0.16em] text-fondo sm:px-4 sm:py-2 sm:text-xs">
                ELEGIR
              </span>
            </div>
          </button>
        </div>

        <div className="hidden border-t-2 border-hueso/15 px-6 py-4 font-mono-stats text-[10px] tracking-[0.1em] text-hueso/40 sm:block">
          EL RESULTADO YA ESTÁ DECIDIDO — VOS ELEGÍS SI JUGARLO
        </div>
      </div>
    )
  }

  if (evento.tipo === 'especializacion') {
    return (
      <div className="mx-auto flex h-[calc(100dvh-5rem)] max-w-2xl flex-col border-2 border-hueso/15 bg-fondo sm:h-auto">
        <Hud carrera={carrera} />
        <div className="relative shrink-0 border-b-2 border-hueso/15 px-4 py-3 text-center sm:px-6 sm:py-8">
          <span className="mb-1.5 inline-block bg-acento px-2 py-0.5 font-mono-stats text-[8px] font-bold tracking-[0.2em] text-fondo sm:mb-4 sm:px-3 sm:py-1 sm:text-[10px]">
            MOMENTO DE DEFINIRTE
          </span>
          <div className="font-marcador text-2xl leading-none sm:text-5xl">¿EN QUÉ TE ESPECIALIZÁS?</div>
          <div className="mx-auto mt-1.5 hidden max-w-xl font-titulo text-sm font-light leading-relaxed text-hueso/65 sm:mt-3 sm:block">
            Es una sola vez en tu carrera — define tu estilo de juego de acá en adelante.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-0.5 bg-hueso/10">
          {evento.opciones.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              onClick={() => onElegir(opcion.id)}
              className="flex flex-col gap-2 border-t-4 border-acento bg-fondo px-3 py-3 text-left hover:bg-superficie sm:gap-4 sm:px-5 sm:py-6"
            >
              <div className="font-titulo text-sm font-semibold uppercase tracking-[0.04em] sm:text-xl">{opcion.nombre}</div>
              <div className="hidden font-titulo text-sm font-light leading-relaxed text-hueso/70 sm:block">{opcion.descripcion}</div>
              <div className="mt-auto flex items-center justify-between border-t border-hueso/15 pt-2 sm:pt-3">
                <span className="hidden font-mono-stats text-[9px] tracking-[0.1em] text-acento sm:inline">
                  {opcion.id === 'triplero' ? 'MÁS TRIPLES' : 'MÁS REBOTES'}
                </span>
                <span className="ml-auto bg-hueso px-2.5 py-1.5 font-titulo text-[10px] font-semibold tracking-[0.16em] text-fondo sm:px-4 sm:py-2 sm:text-xs">
                  ELEGIR
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="hidden border-t-2 border-hueso/15 px-6 py-4 font-mono-stats text-[10px] tracking-[0.1em] text-hueso/40 sm:block">
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
    <div className="mx-auto flex h-[calc(100dvh-5rem)] max-w-2xl flex-col border-2 border-hueso/15 bg-fondo sm:h-auto">
      <Hud carrera={carrera} />

      <AnimacionAro disparar={eligiendoId !== null} onTerminada={() => eligiendoId && onElegir(eligiendoId)} />

      <div className="relative shrink-0 border-b-2 border-hueso/15 px-4 py-2.5 text-center sm:px-6 sm:py-8">
        <span className="mb-1.5 inline-block bg-acento px-2.5 py-1 font-mono-stats text-[9px] font-bold tracking-[0.2em] text-fondo sm:mb-4 sm:px-3 sm:text-[10px]">
          {info.etiqueta}
        </span>
        <div className="font-marcador text-2xl leading-none sm:text-5xl">{info.titulo}</div>
        <div className="mx-auto mt-1.5 hidden max-w-xl font-titulo text-xs font-light leading-snug text-hueso/65 sm:mt-3 sm:block sm:text-sm sm:leading-relaxed">
          {info.bajada}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0.5 bg-hueso/10">
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
                  className={`flex flex-col gap-2 border-t-4 bg-fondo px-2 py-2.5 text-left transition-opacity hover:bg-superficie active:scale-[0.98] sm:gap-3 sm:px-5 sm:py-6 sm:active:scale-100 ${
                    esQuedarse ? 'border-hueso/40' : 'border-acento'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-hueso/25 bg-superficie-alta font-titulo text-xs font-semibold sm:order-2 sm:h-11 sm:w-13 sm:text-sm">
                      {opcion.escudoUrl ? (
                        <img src={opcion.escudoUrl} alt="" className="h-11 w-11 object-contain sm:h-9 sm:w-9" />
                      ) : (
                        abreviarNombre(opcion.nombre)
                      )}
                    </div>
                    <div className="line-clamp-2 text-center font-titulo text-xs font-semibold uppercase leading-tight tracking-[0.02em] sm:order-1 sm:text-left sm:text-xl sm:tracking-[0.04em]">
                      {opcion.nombre}
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-baseline justify-between font-mono-stats text-[8px] tracking-[0.1em] text-hueso/45 sm:mb-1.5 sm:text-[9px] sm:tracking-[0.14em]">
                      <span className="hidden sm:inline">NIVEL DE PLANTEL</span>
                      <span className="sm:hidden">NIVEL</span>
                      <span className="font-mono-stats text-[10px] text-hueso sm:text-xs">{opcion.nivel}</span>
                    </div>
                    <div className="h-1.5 bg-superficie sm:h-2">
                      <div className="h-full bg-acento" style={{ width: `${opcion.nivel}%` }} />
                    </div>
                  </div>

                  <div className="flex gap-0.5 bg-hueso/10">
                    <div className="flex-1 bg-superficie-alta/50 px-1.5 py-1.5 text-center sm:px-3 sm:py-2 sm:text-left">
                      <div className="font-mono-stats text-[7px] tracking-[0.1em] text-hueso/45 sm:text-[9px] sm:tracking-[0.14em]">ROL</div>
                      <div className="mt-0.5 truncate font-titulo text-[10px] font-semibold uppercase sm:text-sm">{stats.rol}</div>
                    </div>
                    <div className="flex-1 bg-superficie-alta/50 px-1.5 py-1.5 text-center sm:px-3 sm:py-2 sm:text-left">
                      <div className="font-mono-stats text-[7px] tracking-[0.1em] text-hueso/45 sm:text-[9px] sm:tracking-[0.14em]">MIN/PJ</div>
                      <div className="mt-0.5 font-marcador text-base leading-none sm:text-xl">{stats.minutos}</div>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col gap-1.5 border-t border-hueso/15 pt-2 sm:flex-row sm:items-center sm:justify-between sm:pt-3">
                    <span className={`line-clamp-1 text-center font-mono-stats text-[7px] leading-tight tracking-[0.06em] sm:line-clamp-none sm:text-left sm:text-[9px] sm:tracking-[0.1em] ${esQuedarse ? 'text-hueso/50' : 'text-acento'}`}>
                      {esQuedarse ? 'QUEDARTE ACÁ' : etiquetaRiesgoClub(opcion.nivel, carrera.jugador.ovr)}
                    </span>
                    <span className="w-full bg-hueso px-2 py-2 text-center font-titulo text-[10px] font-semibold tracking-[0.1em] text-fondo sm:w-auto sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.16em]">
                      {activo ? 'FICHANDO…' : 'ELEGIR'}
                    </span>
                  </div>
                </button>
              )
            })}
      </div>

      <div className="border-t-2 border-hueso/15 px-4 py-2 text-center font-mono-stats text-[8px] tracking-[0.08em] text-hueso/40 sm:px-6 sm:py-4 sm:text-left sm:text-[10px] sm:tracking-[0.1em]">
        NO HAY DESHACER · LA ELECCIÓN CIERRA PUERTAS MÁS ADELANTE
      </div>
    </div>
  )
}
