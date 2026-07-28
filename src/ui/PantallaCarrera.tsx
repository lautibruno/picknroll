import { useEffect, useState } from 'react'
import type { Carrera, Equipo } from '../engine/motorCarrera'
import { calcularEstadisticasTemporada } from '../engine/estadisticas'
import { colorPorOvr, esNivelElite } from './colorOvr'
import { calcularValorMercadoEuros, formatoValorMercado } from '../engine/valorMercado'
import { useNumeroAnimado } from './useNumeroAnimado'
import { AnimacionAro } from './AnimacionAro'
import { OPCIONES_JUGADA_FINAL, nombreRonda } from '../engine/playoffs'

// Dashboard único y continuo — rehecho jugando copero.com.ar/juegos/simulador-carrera en
// vivo (pedido explícito del usuario, confirmado con preguntas): ahí no hay una pantalla
// "Progreso" separada de la pantalla "Evento" con un botón "Seguir jugando" en el medio.
// Todo vive en una sola pantalla: el header (OVR/edad/valor/vitrina de trofeos/historial)
// siempre visible arriba, y el panel de la decisión pendiente siempre visible abajo — se
// resuelve una decisión y ya se ve la próxima, sin pantalla intermedia ni click extra.

interface PantallaCarreraProps {
  carrera: Carrera
  onElegir: (opcionId: string) => void
}

const TITULOS_EVENTO: Record<string, { etiqueta: string; titulo: string; bajada: string }> = {
  'club-liga-domestica': {
    etiqueta: 'CANTERA',
    titulo: 'TRES CLUBES TE QUIEREN',
    bajada: 'Las opciones salen de tu nivel actual, no de tu techo — un club más grande te hace crecer más.',
  },
  draft: {
    etiqueta: 'DRAFT NBA',
    titulo: 'TRES FRANQUICIAS TE QUIEREN',
    bajada: 'Cruzaste el umbral — llegó tu oportunidad.',
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

function etiquetaDesafioClub(nivelClub: number, ovr: number): string {
  const diferencia = nivelClub - ovr
  if (diferencia >= 10) return 'DESAFÍO GRANDE · CRECÉS MUCHO'
  if (diferencia >= 0) return 'DESAFÍO · CRECÉS BIEN'
  if (diferencia >= -10) return 'CÓMODO · CRECÉS POCO'
  return 'CLUB CHICO · CASI NO CRECÉS'
}

function OvrAnimado({ objetivo, inicial }: { objetivo: number; inicial: number }) {
  const mostrado = useNumeroAnimado(objetivo, inicial)
  const color = colorPorOvr(mostrado)
  const elite = esNivelElite(mostrado)
  return (
    <div
      className="font-marcador text-7xl leading-none transition-colors duration-300 sm:text-8xl"
      style={{ color, textShadow: elite ? `0 0 24px ${color}99` : 'none' }}
    >
      {mostrado}
    </div>
  )
}

export function PantallaCarrera({ carrera, onElegir }: PantallaCarreraProps) {
  const [eligiendoId, setEligiendoId] = useState<string | null>(null)
  const historialReciente = carrera.historial.slice(-9)
  const ultimaTemporada = carrera.historial.at(-1)
  const anterior = carrera.historial.at(-2)
  const diferenciaOvr = anterior ? carrera.jugador.ovr - anterior.ovr : 0
  const resultadoRiesgo = carrera.ultimoResultadoRiesgo
  const resumen = carrera.resumenTemporada
  const evento = carrera.eventoPendiente

  // El dashboard ya no se desmonta entre decisiones (a diferencia de las pantallas
  // separadas de antes) — sin este reset, `eligiendoId` quedaba pegado al club elegido en
  // la decisión anterior y bloqueaba la tarjeta equivocada en la siguiente (bug real
  // encontrado jugando: "FICHANDO…" trabado en el club viejo tras el primer fichaje).
  useEffect(() => {
    setEligiendoId(null)
  }, [evento])

  function elegirConAnimacion(opcionId: string) {
    if (eligiendoId) return
    setEligiendoId(opcionId)
  }

  return (
    <div className="mx-auto max-w-2xl border-2 border-hueso/15 bg-fondo">
      {/* Header persistente — OVR, valor, vitrina de trofeos siempre visible (pedido del
          usuario: "muestra de premios en vivo"), edad/temporadas/equipo. */}
      <div className="grid grid-cols-1 border-b-2 border-hueso sm:grid-cols-2">
        <div className="border-b border-hueso/15 px-6 py-6 sm:border-b-0 sm:border-r-2">
          <div className="flex items-baseline justify-between">
            <div className="font-mono-stats text-[10px] tracking-[0.2em] text-hueso/45">OVR ACTUAL</div>
            <div className="font-mono-stats text-xs tracking-[0.06em] text-hueso/60">
              {formatoValorMercado(calcularValorMercadoEuros(carrera.jugador.ovr))}
            </div>
          </div>
          <div className="flex items-end gap-3">
            <OvrAnimado key={carrera.historial.length} objetivo={carrera.jugador.ovr} inicial={anterior?.ovr ?? carrera.jugador.ovr} />
            {anterior && (
              <div key={`${carrera.historial.length}-delta`} className="animar-delta pb-2">
                <div className={`font-titulo text-lg font-semibold ${diferenciaOvr >= 0 ? 'text-en-vivo' : 'text-hueso/60'}`}>
                  {diferenciaOvr >= 0 ? '+' : ''}
                  {diferenciaOvr}
                </div>
              </div>
            )}
          </div>
          {resultadoRiesgo && (
            <div
              key={`${carrera.historial.length}-riesgo`}
              className="animar-chip sombra-brutal mt-3 inline-flex items-center gap-2 border-2 border-hueso bg-superficie-alta px-3 py-2"
            >
              <span
                className="font-marcador text-base leading-none uppercase"
                style={{ color: resultadoRiesgo.rol === 'titular' ? '#4ade80' : '#f59e0b' }}
              >
                {resultadoRiesgo.rol === 'titular' ? 'TITULAR' : 'ROTACIÓN'}
              </span>
              <span className="font-mono-stats text-[10px] leading-tight tracking-[0.06em] text-hueso/75">
                {resultadoRiesgo.titulo}
                <br />
                {resultadoRiesgo.texto}
              </span>
            </div>
          )}
          {resumen && (
            <div
              key={`${carrera.historial.length}-resumen`}
              className="animar-chip sombra-brutal mt-3 inline-flex flex-col gap-1 border-2 border-hueso bg-superficie-alta px-3 py-2"
            >
              <span className="font-mono-stats text-[10px] leading-tight tracking-[0.06em] text-hueso/75">
                TEMPORADA REGULAR · {resumen.victorias}-{resumen.derrotas}
              </span>
              {resumen.campeon && (
                <span className="font-titulo text-sm font-semibold uppercase text-acento">🏆 Campeones de playoffs</span>
              )}
              {resumen.eliminado && (
                <span className="font-titulo text-sm font-semibold uppercase text-hueso/70">
                  Eliminados en {nombreRonda(resumen.eliminado.ronda)} vs {resumen.eliminado.rival} ({resumen.eliminado.marcador})
                </span>
              )}
              {!resumen.clasifico && (
                <span className="font-titulo text-sm font-semibold uppercase text-hueso/50">No clasificaron a playoffs</span>
              )}
            </div>
          )}
          <div className="linea-jugada my-4" />
          <div className="flex gap-0">
            <div className="flex-1">
              <div className="font-mono-stats text-[9px] tracking-[0.16em] text-hueso/45">EDAD</div>
              <div className="font-marcador text-4xl leading-none">{carrera.jugador.edad}</div>
            </div>
            <div className="flex-1 border-l border-hueso/15 pl-4">
              <div className="font-mono-stats text-[9px] tracking-[0.16em] text-hueso/45">TEMPORADAS</div>
              <div className="font-marcador text-4xl leading-none">{carrera.historial.length}</div>
            </div>
            <div className="flex-1 border-l border-hueso/15 pl-4">
              <div className="font-mono-stats text-[9px] tracking-[0.16em] text-hueso/45">EQUIPO</div>
              <div className="mt-1 flex items-center gap-2">
                {carrera.clubActual?.escudoUrl && (
                  <img src={carrera.clubActual.escudoUrl} alt="" className="h-6 w-6 object-contain" />
                )}
                <div className="font-titulo text-base font-semibold uppercase leading-tight">
                  {carrera.clubActual?.nombre ?? '—'}
                </div>
              </div>
              {carrera.especializacion && (
                <div className="mt-1 font-mono-stats text-[9px] tracking-[0.1em] text-acento">
                  {carrera.especializacion === 'triplero' ? 'ESPECIALIZACIÓN: TRIPLERO' : 'ESPECIALIZACIÓN: INTERIOR'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="mb-3 flex items-baseline justify-between font-mono-stats text-[10px] tracking-[0.16em] text-hueso/45">
            <span>VITRINA</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { cantidad: carrera.trofeos.anillos, label: 'ANILLOS' },
              { cantidad: carrera.trofeos.mvp, label: 'MVP' },
              { cantidad: carrera.trofeos.allStar, label: 'ALL-STAR' },
            ].map((t) => (
              <div
                key={`${t.label}-${t.cantidad}`}
                className={`flex flex-col items-center justify-center gap-1 border border-hueso/20 py-4 text-center ${
                  t.cantidad > 0 ? 'animar-trofeo' : ''
                }`}
              >
                <div className={`font-marcador text-3xl leading-none ${t.cantidad > 0 ? 'text-acento' : ''}`}>
                  {t.cantidad}
                </div>
                <div className="font-mono-stats text-[9px] tracking-[0.1em] text-hueso/45">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {ultimaTemporada && (
        <div key={`${carrera.historial.length}-stats`} className="animar-chip border-b-2 border-hueso/15 px-6 py-6">
          <div className="mb-3 font-mono-stats text-[10px] tracking-[0.2em] text-hueso/45">
            ÚLTIMA TEMPORADA · {ultimaTemporada.clubNombre ?? '—'}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[
              { valor: ultimaTemporada.ppg, label: 'PPG' },
              { valor: ultimaTemporada.rpg, label: 'RPG' },
              { valor: ultimaTemporada.apg, label: 'APG' },
              { valor: ultimaTemporada.triples, label: '3PM' },
              { valor: ultimaTemporada.pj, label: 'PJ' },
            ].map((s) => (
              <div key={s.label} className="border-l-4 border-acento bg-superficie-alta/40 px-3 py-3 text-center">
                <div className="font-marcador text-4xl leading-none text-hueso">{s.valor}</div>
                <div className="mt-1 font-mono-stats text-[9px] tracking-[0.14em] text-acento">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel de decisión pendiente — siempre visible, sin pantalla intermedia. */}
      {evento && (
        <div className="border-b-2 border-hueso/15">
          {evento.tipo === 'riesgo' && (
            <>
              <div className="relative px-6 py-6 text-center">
                <span className="mb-3 inline-block bg-acento px-3 py-1 font-mono-stats text-[10px] font-bold tracking-[0.2em] text-fondo">
                  COMPETENCIA POR EL PUESTO
                </span>
                <div className="font-marcador text-3xl leading-none sm:text-4xl">{evento.decision.titulo.toUpperCase()}</div>
                <div className="mx-auto mt-2 max-w-xl font-titulo text-sm font-light leading-relaxed text-hueso/65">
                  {evento.decision.descripcion}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-0.5 bg-hueso/10">
                <button
                  type="button"
                  onClick={() => onElegir('arriesgar')}
                  className="flex flex-col gap-3 border-t-4 border-acento bg-fondo px-4 py-5 text-left hover:bg-superficie"
                >
                  <div className="font-titulo text-lg font-semibold uppercase tracking-[0.04em]">Competir</div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-superficie-alta/50 px-2 py-2 text-center">
                      <div className="font-marcador text-lg leading-none text-en-vivo">Titular</div>
                      <div className="mt-1 font-mono-stats text-[10px] tracking-[0.1em] text-hueso/50">
                        {Math.round(evento.decision.probabilidadExito * 100)}%
                      </div>
                    </div>
                    <div className="flex-1 bg-superficie-alta/50 px-2 py-2 text-center">
                      <div className="font-marcador text-lg leading-none text-hueso/70">Rotación</div>
                      <div className="mt-1 font-mono-stats text-[10px] tracking-[0.1em] text-hueso/50">
                        {Math.round((1 - evento.decision.probabilidadExito) * 100)}%
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-hueso/15 pt-2">
                    <span className="font-mono-stats text-[9px] tracking-[0.1em] text-acento">CON PROBABILIDAD VISIBLE</span>
                    <span className="bg-hueso px-3 py-1.5 font-titulo text-xs font-semibold tracking-[0.16em] text-fondo">
                      ELEGIR
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => onElegir('seguro')}
                  className="flex flex-col gap-3 border-t-4 border-hueso/30 bg-fondo px-4 py-5 text-left hover:bg-superficie"
                >
                  <div className="font-titulo text-lg font-semibold uppercase tracking-[0.04em] text-hueso/80">
                    Aceptar rotación
                  </div>
                  <div className="bg-superficie-alta/50 px-2 py-2 text-center">
                    <div className="font-marcador text-lg leading-none">Rotación</div>
                    <div className="mt-1 font-mono-stats text-[10px] tracking-[0.1em] text-hueso/50">GARANTIZADO</div>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-hueso/15 pt-2">
                    <span className="font-mono-stats text-[9px] tracking-[0.1em] text-hueso/40">SIN SORPRESAS</span>
                    <span className="bg-hueso px-3 py-1.5 font-titulo text-xs font-semibold tracking-[0.16em] text-fondo">
                      ELEGIR
                    </span>
                  </div>
                </button>
              </div>
            </>
          )}

          {evento.tipo === 'especializacion' && (
            <>
              <div className="relative px-6 py-6 text-center">
                <span className="mb-3 inline-block bg-acento px-3 py-1 font-mono-stats text-[10px] font-bold tracking-[0.2em] text-fondo">
                  MOMENTO DE DEFINIRTE
                </span>
                <div className="font-marcador text-3xl leading-none sm:text-4xl">¿EN QUÉ TE ESPECIALIZÁS?</div>
                <div className="mx-auto mt-2 max-w-xl font-titulo text-sm font-light leading-relaxed text-hueso/65">
                  Es una sola vez en tu carrera — define tu estilo de juego de acá en adelante.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-0.5 bg-hueso/10">
                {evento.opciones.map((opcion) => (
                  <button
                    key={opcion.id}
                    type="button"
                    onClick={() => onElegir(opcion.id)}
                    className="flex flex-col gap-3 border-t-4 border-acento bg-fondo px-4 py-5 text-left hover:bg-superficie"
                  >
                    <div className="font-titulo text-lg font-semibold uppercase tracking-[0.04em]">{opcion.nombre}</div>
                    <div className="font-titulo text-sm font-light leading-relaxed text-hueso/70">{opcion.descripcion}</div>
                    <div className="mt-auto flex items-center justify-between border-t border-hueso/15 pt-2">
                      <span className="font-mono-stats text-[9px] tracking-[0.1em] text-acento">
                        {opcion.id === 'triplero' ? 'MÁS TRIPLES' : 'MÁS REBOTES'}
                      </span>
                      <span className="bg-hueso px-3 py-1.5 font-titulo text-xs font-semibold tracking-[0.16em] text-fondo">
                        ELEGIR
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {evento.tipo === 'jugada-final' && (
            <>
              <div className="relative px-6 py-6 text-center">
                <span className="mb-3 inline-block bg-acento px-3 py-1 font-mono-stats text-[10px] font-bold tracking-[0.2em] text-fondo">
                  FINAL DE PLAYOFFS · vs {evento.rival.toUpperCase()}
                </span>
                <div className="font-marcador text-3xl leading-none sm:text-4xl">JUGADA FINAL</div>
                <div className="mx-auto mt-2 max-w-xl font-titulo text-sm font-light leading-relaxed text-hueso/65">
                  Serie 1-1. Quedás libre de marca para el triple — cómo lo resolvés decide el título.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-0.5 bg-hueso/10">
                {OPCIONES_JUGADA_FINAL.map((opcion) => (
                  <button
                    key={opcion.id}
                    type="button"
                    onClick={() => onElegir(opcion.id)}
                    className="flex flex-col gap-3 border-t-4 border-acento bg-fondo px-4 py-5 text-left hover:bg-superficie"
                  >
                    <div className="font-titulo text-lg font-semibold uppercase tracking-[0.04em]">{opcion.nombre}</div>
                    <div className="font-titulo text-sm font-light leading-relaxed text-hueso/70">{opcion.descripcion}</div>
                    <div className="mt-auto flex items-center justify-between border-t border-hueso/15 pt-2">
                      <span className="font-mono-stats text-[9px] tracking-[0.1em] text-acento">
                        {Math.round(opcion.probabilidadExito * 100)}% DE ÉXITO
                      </span>
                      <span className="bg-hueso px-3 py-1.5 font-titulo text-xs font-semibold tracking-[0.16em] text-fondo">
                        ELEGIR
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          {(evento.tipo === 'club-liga-domestica' || evento.tipo === 'draft' || evento.tipo === 'trade') && (
            <>
              <AnimacionAro disparar={eligiendoId !== null} onTerminada={() => eligiendoId && onElegir(eligiendoId)} />
              <div className="relative px-6 py-6 text-center">
                <span className="mb-3 inline-block bg-acento px-3 py-1 font-mono-stats text-[10px] font-bold tracking-[0.2em] text-fondo">
                  {TITULOS_EVENTO[evento.tipo].etiqueta}
                </span>
                <div className="font-marcador text-3xl leading-none sm:text-4xl">{TITULOS_EVENTO[evento.tipo].titulo}</div>
                <div className="mx-auto mt-2 max-w-xl font-titulo text-sm font-light leading-relaxed text-hueso/65">
                  {TITULOS_EVENTO[evento.tipo].bajada}
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
                      className={`flex flex-col gap-3 border-t-4 bg-fondo px-4 py-5 text-left transition-opacity hover:bg-superficie active:scale-[0.98] ${
                        esQuedarse ? 'border-hueso/40' : 'border-acento'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-titulo text-lg font-semibold uppercase leading-tight tracking-[0.02em]">
                          {opcion.nombre}
                        </div>
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-hueso/25 bg-superficie-alta font-titulo text-sm font-semibold">
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
                          {esQuedarse ? 'QUEDARTE ACÁ' : etiquetaDesafioClub(opcion.nivel, carrera.jugador.ovr)}
                        </span>
                        <span className="bg-hueso px-4 py-2 font-titulo text-xs font-semibold tracking-[0.16em] text-fondo">
                          {activo ? 'FICHANDO…' : 'ELEGIR'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
              <div className="border-t border-hueso/15 px-6 py-4 font-mono-stats text-[10px] tracking-[0.1em] text-hueso/40">
                NO HAY DESHACER · LA ELECCIÓN CIERRA PUERTAS MÁS ADELANTE
              </div>
            </>
          )}
        </div>
      )}

      <div className="px-6 py-6">
        <div className="mb-3 font-mono-stats text-[10px] tracking-[0.2em] text-hueso/45">HISTORIAL DE TEMPORADAS</div>
        <div className="flex border-b-2 border-hueso/20 pb-2 font-mono-stats text-[9px] tracking-[0.12em] text-hueso/45">
          <div className="w-11">EDAD</div>
          <div className="flex-1">EQUIPO</div>
          <div className="w-11 text-right">PJ</div>
          <div className="w-11 text-right">PPG</div>
          <div className="w-11 text-right">RPG</div>
          <div className="w-11 text-right">APG</div>
          <div className="w-11 text-right">3PM</div>
          <div className="w-11 text-right">OVR</div>
        </div>
        {historialReciente.length === 0 && (
          <div className="py-6 text-center font-titulo text-sm text-hueso/40">Todavía no jugaste ninguna temporada.</div>
        )}
        {historialReciente.map((entrada, i) => (
          <div key={i} className="flex items-center border-b border-hueso/10 py-2 font-mono-stats text-xs">
            <div className="w-11 text-hueso/60">{entrada.edad}</div>
            <div className="flex flex-1 items-center gap-2 truncate font-titulo text-sm font-medium uppercase tracking-[0.04em]">
              {entrada.clubEscudoUrl && <img src={entrada.clubEscudoUrl} alt="" className="h-4 w-4 shrink-0 object-contain" />}
              <span className="truncate">{entrada.clubNombre ?? '—'}</span>
            </div>
            <div className="w-11 text-right text-hueso/70">{entrada.pj}</div>
            <div className="w-11 text-right text-hueso">{entrada.ppg}</div>
            <div className="w-11 text-right text-hueso/70">{entrada.rpg}</div>
            <div className="w-11 text-right text-hueso/70">{entrada.apg}</div>
            <div className="w-11 text-right text-hueso/70">{entrada.triples}</div>
            <div className="w-11 text-right font-marcador text-lg" style={{ color: colorPorOvr(entrada.ovr) }}>
              {entrada.ovr}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
