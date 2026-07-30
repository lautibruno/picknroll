import { useEffect, useRef, useState } from 'react'
import type { Carrera, Equipo, IconoTrofeo } from '../engine/motorCarrera'
import { calcularEstadisticasTemporada } from '../engine/estadisticas'
import { colorPorOvr, esNivelElite } from './colorOvr'
import { calcularValorMercadoEuros, formatoValorMercado } from '../engine/valorMercado'
import { useNumeroAnimado } from './useNumeroAnimado'
import { OPCIONES_JUGADA_FINAL, nombreRonda } from '../engine/playoffs'
import { OPCIONES_CONVOCATORIA } from '../engine/convocatorias'
import { ICONOS_TROFEO, ETIQUETA_TROFEO, IconoLigaLocal } from './iconosTrofeos'

const DURACION_CARTEL_TROFEOS_MS = 2800

// Ritmo entre decisiones (pedido explícito del usuario: "debe haber un poco más de lentitud y
// animación... debe incrementar con animación de subida de números de forma lenta y luego de
// subir, que aparezcan las opciones"). El OVR anima primero y las opciones entran después.
const DEMORA_OPCIONES_MS = 1100

const CLAVE_TROFEO = {
  anillo: 'anillos',
  allstar: 'allStar',
  mvp: 'mvp',
  mundial: 'mundial',
  jjoo: 'jjoo',
  'liga-local': 'ligaLocal',
} as const

// Dashboard único y continuo, densidad estilo copero.com.ar/juegos/simulador-carrera
// (pedido explícito del usuario, con captura de referencia): header compacto de una sola
// franja, historial en filas chicas, sin textos ni espacios de relleno. El panel de la
// decisión pendiente vive siempre abajo — se resuelve y ya se ve la próxima, sin pantalla
// intermedia ni click extra.

interface PantallaCarreraProps {
  carrera: Carrera
  onElegir: (opcionId: string) => void
  onContinuar: () => void
}

const TITULOS_EVENTO: Record<string, string> = {
  'club-liga-domestica': 'CANTERA',
  draft: 'DRAFT NBA',
  trade: 'AGENCIA LIBRE',
}

function abreviarNombre(nombre: string): string {
  const primeraPalabra = nombre.replace(/\(.*\)/, '').trim().split(/\s+/)[0]
  return primeraPalabra.slice(0, 3).toUpperCase()
}

function OvrAnimado({ objetivo, inicial }: { objetivo: number; inicial: number }) {
  const mostrado = useNumeroAnimado(objetivo, inicial)
  const color = colorPorOvr(mostrado)
  const elite = esNivelElite(mostrado)
  // Animación distinta si el OVR sube o baja (pedido explícito del usuario), no un pop
  // genérico igual para los dos casos — ver ovr-glow-sube/ovr-glow-baja en index.css.
  const claseDireccion = objetivo > inicial ? 'animar-ovr-sube' : objetivo < inicial ? 'animar-ovr-baja' : ''
  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border-2 border-hueso font-marcador text-xl leading-none sm:h-14 sm:w-14 sm:text-2xl ${claseDireccion}`}
      style={{ color, backgroundColor: `${color}22`, boxShadow: elite ? `0 0 14px ${color}88` : 'none' }}
    >
      {mostrado}
    </div>
  )
}

// Ciclo de revelado tipo "ta-te-ti" para la decisión de riesgo (pedido explícito del
// usuario: "mostrarle al usuario el azar" en vivo) — el resultado YA está resuelto al
// generar el evento (ver decisionesRiesgo.ts), esto solo lo dramatiza: alterna el
// resaltado entre las dos opciones, cada vez más lento, y termina asentándose en la
// respuesta real antes de aplicar la elección.
const SECUENCIA_REVELADO = 7
function useRevelado(onTerminar: () => void) {
  const [destacado, setDestacado] = useState<'a' | 'b' | null>(null)
  const activoRef = useRef(false)

  function iniciar(resultadoFinal: 'a' | 'b') {
    if (activoRef.current) return
    activoRef.current = true
    let paso = 0
    const siguiente = () => {
      paso++
      const esUltimo = paso >= SECUENCIA_REVELADO
      setDestacado(esUltimo ? resultadoFinal : paso % 2 === 0 ? 'a' : 'b')
      if (!esUltimo) {
        setTimeout(siguiente, 110 + paso * 35)
      } else {
        setTimeout(() => {
          activoRef.current = false
          setDestacado(null)
          onTerminar()
        }, 650)
      }
    }
    setDestacado(paso % 2 === 0 ? 'a' : 'b')
    setTimeout(siguiente, 110)
  }

  return { destacado, revelando: destacado !== null, iniciar }
}

export function PantallaCarrera({ carrera, onElegir, onContinuar }: PantallaCarreraProps) {
  const [clubBloqueado, setClubBloqueado] = useState(false)
  const historialReciente = carrera.historial.slice(-8)
  const diferenciaOvr = carrera.ultimoCambioOvr
  const hayCambioPrevio = carrera.historial.length > 0
  const resultadoRiesgo = carrera.ultimoResultadoRiesgo
  const resumen = carrera.resumenTemporada
  const evento = carrera.eventoPendiente
  // Se muestra de a uno: si en el mismo bloque salieron varios títulos, se ven en fila (ver
  // `Desenlace` en motorCarrera.ts).
  const desenlace = carrera.desenlacesPendientes[0] ?? null
  const desenlacesRestantes = carrera.desenlacesPendientes.length - 1

  const revelado = useRevelado(() => {
    if (evento?.tipo === 'riesgo') onElegir('arriesgar')
  })
  const reveladoFinal = useRevelado(() => {
    if (evento?.tipo === 'jugada-final') onElegir(opcionJugadaFinalPendiente.current)
  })
  const reveladoConvocatoria = useRevelado(() => {
    if (evento?.tipo === 'convocatoria') onElegir(opcionConvocatoriaPendiente.current)
  })
  const opcionJugadaFinalPendiente = useRef<string>('finta')
  const opcionConvocatoriaPendiente = useRef<string>('jugar-para-el-equipo')

  // Ritmo (pedido del usuario, punto 6): al resolver una decisión el OVR anima primero y las
  // opciones nuevas recién aparecen después. Se dispara con cada evento nuevo.
  const [opcionesVisibles, setOpcionesVisibles] = useState(true)
  useEffect(() => {
    if (!evento) return
    setOpcionesVisibles(false)
    const t = setTimeout(() => setOpcionesVisibles(true), DEMORA_OPCIONES_MS)
    return () => clearTimeout(t)
  }, [evento])

  // El dashboard ya no se desmonta entre decisiones — sin este reset, el bloqueo de las
  // tarjetas de club quedaba pegado a la decisión anterior (bug real encontrado jugando).
  useEffect(() => {
    setClubBloqueado(false)
  }, [evento])

  // Cartel de festejo breve para los premios INDIVIDUALES (All-Star y MVP), que se otorgan
  // solos al simular la temporada. Los TÍTULOS (anillo, Mundial, JJOO, liga local) ya no
  // pasan por acá: cada uno frena la carrera con su propio desenlace (ver `Desenlace` en
  // motorCarrera.ts), así no aparecen de refilón pegados a otra cosa.
  const previoRef = useRef(carrera.historial.length)
  const [cartelTrofeos, setCartelTrofeos] = useState<IconoTrofeo[] | null>(null)
  useEffect(() => {
    const previo = previoRef.current
    const nuevos: IconoTrofeo[] = []
    if (carrera.historial.length > previo) {
      for (const entrada of carrera.historial.slice(previo)) {
        for (const t of entrada.trofeosGanados) {
          if (t === 'allstar' || t === 'mvp') nuevos.push(t)
        }
      }
    }
    previoRef.current = carrera.historial.length
    if (nuevos.length > 0) setCartelTrofeos(nuevos)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe reaccionar a que cambie
    // la CANTIDAD de temporadas, no cada vez que el array se recrea
  }, [carrera.historial.length])

  // El temporizador que cierra el cartel va en su PROPIO efecto, atado a `cartelTrofeos`.
  // Bug real reportado por el usuario ("me quedo trabado en all star"): antes se armaba dentro
  // del efecto de arriba, cuya dependencia (`historial.length`) puede volver a cambiar antes de
  // que el cartel se cierre — por ejemplo si en la misma temporada ganás All-Star y además un
  // título, y tocás CONTINUAR. Ese cambio disparaba el cleanup (matando el setTimeout) sin
  // armar uno nuevo, así que el cartel quedaba para siempre tapando la pantalla.
  useEffect(() => {
    if (!cartelTrofeos) return
    const t = setTimeout(() => setCartelTrofeos(null), DURACION_CARTEL_TROFEOS_MS)
    return () => clearTimeout(t)
  }, [cartelTrofeos])

  function elegirClub(opcionId: string) {
    if (clubBloqueado) return
    setClubBloqueado(true)
    onElegir(opcionId)
  }

  function competir() {
    if (evento?.tipo !== 'riesgo') return
    revelado.iniciar(evento.decision.exito ? 'a' : 'b')
  }

  function jugarJugadaFinal(opcionId: string) {
    if (evento?.tipo !== 'jugada-final') return
    // El resultado ya está resuelto al generar el evento (ver playoffs.ts) — el revelado
    // en vivo es fiel a lo que en verdad va a pasar, no un dado nuevo e independiente.
    const exito = opcionId === 'triple' ? evento.resultadoSiTriple : evento.resultadoSiFinta
    opcionJugadaFinalPendiente.current = opcionId
    reveladoFinal.iniciar(exito ? 'a' : 'b')
  }

  function jugarConvocatoria(opcionId: string) {
    if (evento?.tipo !== 'convocatoria') return
    const exito =
      opcionId === 'tomar-la-responsabilidad'
        ? evento.decision.resultadoSiResponsabilidad
        : evento.decision.resultadoSiEquipo
    opcionConvocatoriaPendiente.current = opcionId
    reveladoConvocatoria.iniciar(exito ? 'a' : 'b')
  }

  return (
    <div className="mx-auto max-w-2xl border-2 border-hueso/15 bg-fondo">
      {/* `pointer-events-none`: el cartel es puramente decorativo, nunca debe poder atrapar los
          clics del jugador (segunda red de contención del bug "me quedo trabado en all star"). */}
      {cartelTrofeos && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-fondo/80 p-6">
          <div className="animar-trofeo sombra-brutal flex flex-col items-center gap-3 border-2 border-hueso bg-superficie-alta px-8 py-6">
            <div className="flex gap-3">
              {cartelTrofeos.map((t, i) => {
                const Icono = ICONOS_TROFEO[t]
                return <Icono key={i} className="h-11 w-11 text-acento sm:h-14 sm:w-14" />
              })}
            </div>
            <div className="font-titulo text-base font-bold uppercase tracking-wide text-hueso sm:text-lg">
              {cartelTrofeos.map((t) => ETIQUETA_TROFEO[t]).join(' · ')}
            </div>
          </div>
        </div>
      )}

      {/* Desenlace de un título/torneo — la carrera espera acá hasta que el jugador continúa
          (ver `Desenlace` en motorCarrera.ts). Es el fix del bug de "erré el tiro pero salí
          campeón igual": el resultado de TU jugada se ve solo, sin la temporada siguiente
          encimada. */}
      {desenlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-fondo/90 p-6">
          <div className="animar-trofeo sombra-brutal w-full max-w-sm border-2 border-hueso bg-superficie-alta px-6 py-7 text-center">
            {desenlace.iconos.length > 0 && (
              <div className="mb-4 flex justify-center gap-3">
                {desenlace.iconos.map((t, i) =>
                  t === 'liga-local' ? (
                    <IconoLigaLocal key={i} className="h-16 w-16" url={carrera.ligaDomestica?.trofeoUrl} />
                  ) : (
                    (() => {
                      const Icono = ICONOS_TROFEO[t]
                      return <Icono key={i} className="h-16 w-16 text-acento" />
                    })()
                  ),
                )}
              </div>
            )}
            <div
              className="font-marcador text-4xl leading-none sm:text-5xl"
              style={{ color: desenlace.gano ? 'var(--color-acento)' : 'var(--color-hueso)' }}
            >
              {desenlace.titulo.toUpperCase()}
            </div>
            <p className="mx-auto mt-3 max-w-xs font-titulo text-sm font-light leading-relaxed text-hueso/75">
              {desenlace.texto}
            </p>
            <button
              type="button"
              onClick={onContinuar}
              className="mt-6 w-full bg-acento px-4 py-3 font-titulo text-sm font-semibold uppercase tracking-[0.14em] text-fondo"
            >
              Continuar
            </button>
            {desenlacesRestantes > 0 && (
              <div className="mt-2 font-mono-stats text-[9px] tracking-[0.14em] text-hueso/40">
                +{desenlacesRestantes} MÁS
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header compacto de una sola franja — OVR/valor/edad/equipo, sin bloques gigantes. */}
      <div className="flex items-center gap-2 border-b-2 border-hueso px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
        <OvrAnimado key={carrera.historial.length} objetivo={carrera.jugador.ovr} inicial={carrera.jugador.ovr - diferenciaOvr} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-mono-stats text-[8px] tracking-[0.1em] text-hueso/45 sm:text-[9px]">
            <span>#{carrera.jugador.edad}</span>
            <span>·</span>
            <span className="uppercase">{carrera.posicion}</span>
            {hayCambioPrevio && diferenciaOvr !== 0 && (
              <span
                key={`${carrera.historial.length}-delta`}
                className={`ml-auto font-titulo text-xs font-bold sm:text-sm ${
                  diferenciaOvr > 0 ? 'animar-delta text-en-vivo' : 'animar-delta-baja text-baja'
                }`}
              >
                {diferenciaOvr > 0 ? '+' : ''}
                {diferenciaOvr}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 truncate">
            {carrera.clubActual?.escudoUrl && (
              <img src={carrera.clubActual.escudoUrl} alt="" className="h-4 w-4 shrink-0 object-contain" />
            )}
            <span className="truncate font-titulo text-sm font-semibold uppercase leading-tight sm:text-base">
              {carrera.clubActual?.nombre ?? 'Libre'}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {(['anillo', 'mvp', 'allstar', 'mundial', 'jjoo'] as const).some((t) => carrera.trofeos[CLAVE_TROFEO[t]] > 0) && (
            <div className="flex items-center gap-1.5">
              {(['anillo', 'mvp', 'allstar', 'mundial', 'jjoo'] as const).map((t) => {
                const cantidad = carrera.trofeos[CLAVE_TROFEO[t]]
                if (cantidad === 0) return null
                const Icono = ICONOS_TROFEO[t]
                return (
                  <span key={`${t}-${cantidad}`} className="animar-trofeo flex items-center gap-0.5 text-acento">
                    <Icono className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="font-mono-stats text-[9px] sm:text-[10px]">{cantidad}</span>
                  </span>
                )
              })}
            </div>
          )}
          <div className="text-right">
            <div className="font-mono-stats text-[8px] tracking-[0.1em] text-hueso/45 sm:text-[9px]">VALOR</div>
            <div className="font-mono-stats text-[10px] font-semibold text-hueso/80 sm:text-xs">
              {formatoValorMercado(calcularValorMercadoEuros(carrera.jugador.ovr))}
            </div>
          </div>
        </div>
      </div>

      {/* Chips de resultado — solo si hay algo que contar, sin bloque de "vitrina" separado. */}
      {(resultadoRiesgo || resumen || carrera.especializacion) && (
        <div className="flex flex-wrap gap-1.5 border-b border-hueso/10 px-3 py-1.5 sm:px-4">
          {resultadoRiesgo && (
            <span
              key={`${carrera.historial.length}-riesgo`}
              className="animar-chip font-mono-stats text-[9px] tracking-[0.06em] sm:text-[10px]"
              style={{ color: resultadoRiesgo.rol === 'titular' ? '#4ade80' : '#f59e0b' }}
            >
              {resultadoRiesgo.rol === 'titular' ? '● TITULAR' : '● ROTACIÓN'} · {resultadoRiesgo.titulo}
            </span>
          )}
          {resumen && (
            <span key={`${carrera.historial.length}-resumen`} className="animar-chip font-mono-stats text-[9px] tracking-[0.06em] text-hueso/70 sm:text-[10px]">
              {resumen.victorias}-{resumen.derrotas}
              {resumen.campeon && ' · 🏆 CAMPEONES'}
              {resumen.eliminado && ` · Eliminados en ${nombreRonda(resumen.eliminado.ronda)} vs ${resumen.eliminado.rival}`}
              {!resumen.clasifico && ' · afuera de playoffs'}
            </span>
          )}
          {carrera.especializacion && (
            <span className="font-mono-stats text-[9px] tracking-[0.06em] text-acento sm:text-[10px]">
              {carrera.especializacion === 'triplero' ? 'TRIPLERO' : 'INTERIOR'}
            </span>
          )}
        </div>
      )}

      {/* Ritmo: mientras el OVR termina de subir/bajar, en vez de las opciones se ve que la
          temporada se está jugando (pedido del usuario, punto 6). */}
      {evento && !opcionesVisibles && (
        <div className="flex items-center justify-center gap-2 border-b-2 border-hueso/15 px-3 py-8">
          <span className="animar-latido h-2 w-2 bg-acento" />
          <span className="font-mono-stats text-[10px] tracking-[0.18em] text-hueso/50">JUGANDO LA TEMPORADA…</span>
        </div>
      )}

      {/* Panel de decisión pendiente. */}
      {evento && opcionesVisibles && (
        <div className="border-b-2 border-hueso/15">
          {evento.tipo === 'riesgo' &&
            (revelado.revelando ? (
              <div className="grid grid-cols-2 gap-1 p-3 sm:p-4">
                {(['a', 'b'] as const).map((lado) => (
                  <div
                    key={lado}
                    className={`flex items-center justify-center border-2 py-6 font-titulo text-lg font-bold uppercase transition-all sm:py-8 sm:text-xl ${
                      revelado.destacado === lado
                        ? 'scale-105 border-acento bg-acento text-fondo'
                        : 'border-hueso/15 bg-superficie-alta text-hueso/30'
                    }`}
                  >
                    {lado === 'a' ? 'Titular' : 'Rotación'}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="px-3 py-2 sm:px-4 sm:py-3">
                  <div className="font-titulo text-base font-bold uppercase leading-tight sm:text-lg">
                    {evento.decision.titulo}
                  </div>
                  <div className="mt-0.5 font-titulo text-xs font-light text-hueso/60 sm:text-sm">{evento.decision.descripcion}</div>
                </div>
                <div className="grid grid-cols-2 gap-0.5 bg-hueso/10">
                  <button
                    type="button"
                    onClick={competir}
                    className="flex flex-col items-center gap-1 border-t-4 border-acento bg-fondo px-2 py-3 hover:bg-superficie"
                  >
                    <span className="font-titulo text-sm font-semibold uppercase sm:text-base">Competir</span>
                    <span className="font-mono-stats text-[9px] text-hueso/50">ir por la titularidad</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onElegir('seguro')}
                    className="flex flex-col items-center gap-1 border-t-4 border-hueso/30 bg-fondo px-2 py-3 hover:bg-superficie"
                  >
                    <span className="font-titulo text-sm font-semibold uppercase text-hueso/80 sm:text-base">Aceptar rotación</span>
                    <span className="font-mono-stats text-[9px] text-hueso/50">garantizado</span>
                  </button>
                </div>
              </>
            ))}

          {evento.tipo === 'especializacion' && (
            <>
              <div className="px-3 py-2 sm:px-4 sm:py-3">
                <div className="font-titulo text-base font-bold uppercase leading-tight sm:text-lg">¿En qué te especializás?</div>
                <div className="mt-0.5 font-titulo text-xs font-light text-hueso/60 sm:text-sm">Una sola vez en tu carrera.</div>
              </div>
              <div className="grid grid-cols-2 gap-0.5 bg-hueso/10">
                {evento.opciones.map((opcion) => (
                  <button
                    key={opcion.id}
                    type="button"
                    onClick={() => onElegir(opcion.id)}
                    className="flex flex-col items-center gap-1 border-t-4 border-acento bg-fondo px-2 py-3 hover:bg-superficie"
                  >
                    <span className="font-titulo text-sm font-semibold uppercase sm:text-base">{opcion.nombre}</span>
                    <span className="font-mono-stats text-[9px] text-acento">{opcion.id === 'triplero' ? 'MÁS TRIPLES' : 'MÁS REBOTES'}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {evento.tipo === 'jugada-final' &&
            (reveladoFinal.revelando ? (
              <div className="grid grid-cols-2 gap-1 p-3 sm:p-4">
                {(['a', 'b'] as const).map((lado) => (
                  <div
                    key={lado}
                    className={`flex items-center justify-center border-2 py-6 font-titulo text-lg font-bold uppercase transition-all sm:py-8 sm:text-xl ${
                      reveladoFinal.destacado === lado
                        ? 'scale-105 border-acento bg-acento text-fondo'
                        : 'border-hueso/15 bg-superficie-alta text-hueso/30'
                    }`}
                  >
                    {lado === 'a' ? '¡Adentro!' : 'Errada'}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="px-3 py-2 sm:px-4 sm:py-3">
                  <div className="font-mono-stats text-[9px] tracking-[0.1em] text-acento">FINAL vs {evento.rival.toUpperCase()}</div>
                  <div className="font-titulo text-base font-bold uppercase leading-tight sm:text-lg">{evento.escenaTitulo}</div>
                  <div className="mt-0.5 font-titulo text-xs font-light text-hueso/60 sm:text-sm">{evento.escenaDescripcion}</div>
                </div>
                <div className="grid grid-cols-2 gap-0.5 bg-hueso/10">
                  {OPCIONES_JUGADA_FINAL.map((opcion) => (
                    <button
                      key={opcion.id}
                      type="button"
                      onClick={() => jugarJugadaFinal(opcion.id)}
                      className="flex flex-col items-center gap-1 border-t-4 border-acento bg-fondo px-2 py-3 hover:bg-superficie"
                    >
                      <span className="font-titulo text-sm font-semibold uppercase sm:text-base">{opcion.nombre}</span>
                    </button>
                  ))}
                </div>
              </>
            ))}

          {/* Mundial / JJOO — ganarlos depende de esta decisión (pedido del usuario, punto 7). */}
          {evento.tipo === 'convocatoria' &&
            (reveladoConvocatoria.revelando ? (
              <div className="grid grid-cols-2 gap-1 p-3 sm:p-4">
                {(['a', 'b'] as const).map((lado) => (
                  <div
                    key={lado}
                    className={`flex items-center justify-center border-2 py-6 font-titulo text-lg font-bold uppercase transition-all sm:py-8 sm:text-xl ${
                      reveladoConvocatoria.destacado === lado
                        ? 'scale-105 border-acento bg-acento text-fondo'
                        : 'border-hueso/15 bg-superficie-alta text-hueso/30'
                    }`}
                  >
                    {lado === 'a' ? '¡Campeones!' : 'Perdimos'}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="px-3 py-2 sm:px-4 sm:py-3">
                  <div className="font-mono-stats text-[9px] tracking-[0.1em] text-acento">
                    {evento.decision.torneo === 'mundial' ? 'SELECCIÓN · MUNDIAL' : 'SELECCIÓN · JUEGOS OLÍMPICOS'}
                  </div>
                  <div className="font-titulo text-base font-bold uppercase leading-tight sm:text-lg">
                    {evento.decision.escenaTitulo}
                  </div>
                  <div className="mt-0.5 font-titulo text-xs font-light text-hueso/60 sm:text-sm">
                    {evento.decision.escenaDescripcion}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-0.5 bg-hueso/10">
                  {OPCIONES_CONVOCATORIA.map((opcion) => (
                    <button
                      key={opcion.id}
                      type="button"
                      onClick={() => jugarConvocatoria(opcion.id)}
                      className="flex flex-col items-center gap-1 border-t-4 border-acento bg-fondo px-2 py-3 text-center hover:bg-superficie"
                    >
                      <span className="font-titulo text-sm font-semibold uppercase sm:text-base">{opcion.nombre}</span>
                      <span className="font-mono-stats text-[9px] text-hueso/50">{opcion.descripcion}</span>
                    </button>
                  ))}
                </div>
              </>
            ))}

          {(evento.tipo === 'club-liga-domestica' || evento.tipo === 'draft' || evento.tipo === 'trade') && (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 sm:px-4">
                <span className="bg-acento px-1.5 py-0.5 font-mono-stats text-[8px] font-bold tracking-[0.1em] text-fondo">
                  {TITULOS_EVENTO[evento.tipo]}
                </span>
              </div>
              {/* Tarjetas más grandes (pedido del usuario: "se ven muy chico los equipos"), y
                  SIN el nivel del club ni el pronóstico de crecimiento — pedido explícito: "que
                  saques el nivel del equipo... que sea algo más genuino por decisión del que está
                  jugando, que no se guíe por potencial". El motor sigue usando `nivel` por dentro
                  para todo el balance; solo deja de mostrarse. Se conserva el rol (titular/
                  rotación/banca) porque es algo que un jugador sí sabe al firmar. */}
              <div className="grid grid-cols-3 gap-0.5 bg-hueso/10">
                {evento.opciones.map((opcion: Equipo) => {
                  const esQuedarse = opcion.id === carrera.clubActual?.id
                  const stats = calcularEstadisticasTemporada(carrera.jugador.ovr, opcion.nivel, carrera.fase)
                  return (
                    <button
                      key={opcion.id}
                      type="button"
                      onClick={() => elegirClub(opcion.id)}
                      disabled={clubBloqueado}
                      className={`flex flex-col items-center justify-between gap-2 border-t-4 bg-fondo px-2 py-3.5 text-center transition-opacity active:scale-[0.97] disabled:opacity-40 hover:bg-superficie sm:gap-2.5 sm:px-3 sm:py-4 ${
                        esQuedarse ? 'border-hueso/40' : 'border-acento'
                      }`}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-hueso/25 bg-superficie-alta font-titulo text-xs font-semibold sm:h-16 sm:w-16 sm:text-sm">
                        {opcion.escudoUrl ? (
                          <img src={opcion.escudoUrl} alt="" className="h-9 w-9 object-contain sm:h-12 sm:w-12" />
                        ) : (
                          abreviarNombre(opcion.nombre)
                        )}
                      </div>
                      <div className="line-clamp-3 font-titulo text-[11px] font-semibold uppercase leading-tight sm:text-sm">
                        {opcion.nombre}
                      </div>
                      <div className="font-mono-stats text-[8px] uppercase tracking-[0.06em] text-hueso/40 sm:text-[10px]">
                        {esQuedarse ? 'quedarte' : stats.rol}
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Historial — filas compactas, sin subtítulos de relleno. */}
      <div className="px-3 py-2 sm:px-4 sm:py-3">
        <div className="flex border-b border-hueso/15 pb-1 font-mono-stats text-[8px] tracking-[0.06em] text-hueso/40 sm:text-[9px]">
          <div className="w-6">ED</div>
          <div className="flex-1">CLUB</div>
          <div className="w-8 text-right">PJ</div>
          <div className="w-9 text-right">PPG</div>
          <div className="w-9 text-right">3PM</div>
          <div className="w-8 text-right">OVR</div>
        </div>
        {historialReciente.length === 0 && (
          <div className="py-3 text-center font-mono-stats text-[10px] text-hueso/30">Sin temporadas todavía.</div>
        )}
        {historialReciente.map((entrada, i) => (
          <div key={i} className="flex items-center gap-1 border-b border-hueso/5 py-1 font-mono-stats text-[10px] sm:text-xs">
            <div className="w-6 text-hueso/50">{entrada.edad}</div>
            <div className="flex flex-1 items-center gap-1.5 truncate">
              {entrada.clubEscudoUrl && <img src={entrada.clubEscudoUrl} alt="" className="h-3.5 w-3.5 shrink-0 object-contain" />}
              <span className="truncate font-titulo font-medium uppercase tracking-[0.02em]">{entrada.clubNombre ?? '—'}</span>
              {entrada.trofeosGanados.length > 0 && (
                <span className="flex shrink-0 items-center gap-0.5">
                  {entrada.trofeosGanados.map((t, ti) =>
                    // El título local usa la imagen real de la liga del jugador, no un ícono fijo
                    t === 'liga-local' ? (
                      <IconoLigaLocal key={ti} className="h-3 w-3" url={carrera.ligaDomestica?.trofeoUrl} />
                    ) : (
                      (() => {
                        const Icono = ICONOS_TROFEO[t]
                        return <Icono key={ti} className="h-3 w-3 text-acento" />
                      })()
                    ),
                  )}
                </span>
              )}
            </div>
            <div className="w-8 text-right text-hueso/60">{entrada.pj}</div>
            <div className="w-9 text-right text-hueso/80">{entrada.ppg}</div>
            <div className="w-9 text-right text-hueso/60">{entrada.triples}</div>
            <div
              className="w-8 rounded-sm px-1 text-right font-marcador text-xs"
              style={{ color: colorPorOvr(entrada.ovr) }}
            >
              {entrada.ovr}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
