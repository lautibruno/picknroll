import type { Carrera } from '../engine/motorCarrera'
import { useNumeroAnimado } from './useNumeroAnimado'
import { colorPorOvr, esNivelElite } from './colorOvr'
import { calcularValorMercadoEuros, formatoValorMercado } from '../engine/valorMercado'

interface PantallaProgresoProps {
  carrera: Carrera
  onSeguirJugando: () => void
}

export function PantallaProgreso({ carrera, onSeguirJugando }: PantallaProgresoProps) {
  const historialReciente = carrera.historial.slice(-9)
  const ultimaTemporada = carrera.historial.at(-1)
  const anterior = carrera.historial.at(-2)
  const diferenciaOvr = anterior ? carrera.jugador.ovr - anterior.ovr : 0
  const resultadoRiesgo = carrera.ultimoResultadoRiesgo
  const ovrMostrado = useNumeroAnimado(carrera.jugador.ovr, anterior?.ovr ?? carrera.jugador.ovr)
  const colorOvr = colorPorOvr(ovrMostrado)
  const elite = esNivelElite(ovrMostrado)

  return (
    <div className="mx-auto max-w-2xl border-2 border-hueso/15 bg-fondo">
      <div className="grid grid-cols-1 border-b-2 border-hueso sm:grid-cols-2">
        <div className="border-b border-hueso/15 px-6 py-6 sm:border-b-0 sm:border-r-2">
          <div className="flex items-baseline justify-between">
            <div className="font-mono-stats text-[10px] tracking-[0.2em] text-hueso/45">OVR ACTUAL</div>
            <div className="font-mono-stats text-xs tracking-[0.06em] text-hueso/60">
              {formatoValorMercado(calcularValorMercadoEuros(carrera.jugador.ovr))}
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div
              className="font-marcador text-8xl leading-none transition-colors duration-300"
              style={{ color: colorOvr, textShadow: elite ? `0 0 24px ${colorOvr}99` : 'none' }}
            >
              {ovrMostrado}
            </div>
            {anterior && (
              <div key={carrera.historial.length} className="animar-delta pb-2">
                <div className={`font-titulo text-lg font-semibold ${diferenciaOvr >= 0 ? 'text-en-vivo' : 'text-hueso/60'}`}>
                  {diferenciaOvr >= 0 ? '+' : ''}
                  {diferenciaOvr}
                </div>
              </div>
            )}
          </div>
          {resultadoRiesgo && (
            <div
              key={carrera.historial.length}
              className="animar-chip sombra-brutal mt-3 inline-flex items-center gap-2 border-2 border-hueso bg-superficie-alta px-3 py-2"
            >
              {resultadoRiesgo.delta !== 0 && (
                <span
                  className="font-marcador text-xl leading-none"
                  style={{ color: resultadoRiesgo.delta > 0 ? '#4ade80' : '#ef4444' }}
                >
                  {resultadoRiesgo.delta > 0 ? '+' : ''}
                  {resultadoRiesgo.delta}
                </span>
              )}
              <span className="font-mono-stats text-[10px] leading-tight tracking-[0.06em] text-hueso/75">
                {resultadoRiesgo.titulo}
                <br />
                {resultadoRiesgo.texto}
              </span>
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
          <div className="mt-5 border-l-4 border-acento bg-superficie-alta/50 px-4 py-3">
            <div className="mb-1 font-mono-stats text-[9px] tracking-[0.18em] text-acento">SIGUIENTE PASO</div>
            <div className="font-titulo text-sm font-medium leading-snug">
              {carrera.fase === 'pre-nba'
                ? 'Seguís en tu camino — el Draft llega si tu nivel cruza el umbral.'
                : `Próxima decisión en hasta ${carrera.intervaloTemporadas} temporada(s).`}
            </div>
          </div>
          <button
            type="button"
            onClick={onSeguirJugando}
            className="sombra-brutal animar-glow-pulse mt-5 w-full bg-acento px-6 py-4 text-center font-titulo text-base font-semibold tracking-[0.16em] text-fondo"
          >
            SEGUIR JUGANDO
          </button>
        </div>
      </div>

      {ultimaTemporada && (
        <div key={carrera.historial.length} className="animar-chip border-b-2 border-hueso/15 px-6 py-6">
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
          <div
            key={i}
            className="flex items-center border-b border-hueso/10 py-2 font-mono-stats text-xs"
          >
            <div className="w-11 text-hueso/60">{entrada.edad}</div>
            <div className="flex flex-1 items-center gap-2 truncate font-titulo text-sm font-medium uppercase tracking-[0.04em]">
              {entrada.clubEscudoUrl && (
                <img src={entrada.clubEscudoUrl} alt="" className="h-4 w-4 shrink-0 object-contain" />
              )}
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
