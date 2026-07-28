import { useEffect, useState } from 'react'

// Escena del aro con pelota — animación de Claude Design (ballFlight/netWobble/rimFlash/
// swishPop). Pelota picando en reposo; al elegir una opción, vuela al aro y dispara la
// secuencia completa antes de confirmar la elección (mismo timing que el prototipo:
// ~850ms de vuelo + ~1500ms mostrando el resultado).
const DURACION_VUELO_MS = 850
const DURACION_RESULTADO_MS = 1200

interface AnimacionAroProps {
  disparar: boolean // true mientras está volando/mostrando resultado
  onTerminada: () => void
}

export function AnimacionAro({ disparar, onTerminada }: AnimacionAroProps) {
  const [fase, setFase] = useState<'idle' | 'volando' | 'hecho'>('idle')

  useEffect(() => {
    if (!disparar || fase !== 'idle') return
    setFase('volando')
    const t1 = setTimeout(() => setFase('hecho'), DURACION_VUELO_MS)
    const t2 = setTimeout(() => {
      onTerminada()
      setFase('idle')
    }, DURACION_VUELO_MS + DURACION_RESULTADO_MS)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe reaccionar a "disparar" pasando de false a true
  }, [disparar])

  const animPelota =
    fase === 'volando'
      ? 'ball-flight 0.85s cubic-bezier(.25,.55,.3,1) forwards'
      : fase === 'hecho'
        ? 'none'
        : 'ball-bounce-idle 1.8s ease-in-out infinite'

  return (
    <div className="relative h-16 shrink-0 overflow-hidden border-b-2 border-hueso bg-superficie textura-parquet sm:h-40">
      <div className="absolute inset-0 h-40 origin-top scale-[0.4] sm:scale-100">
      {/* Tablero + aro */}
      <div className="absolute left-1/2 top-3 h-10 w-16 -translate-x-1/2 border-[3px] border-hueso bg-superficie-alta">
        <div className="absolute left-1/2 top-1/2 h-4 w-6 -translate-x-1/2 -translate-y-1/2 border-2 border-hueso" />
      </div>
      <div className="absolute left-1/2 top-12 h-2.5 w-12 -translate-x-1/2 rounded-full border-4 border-acento" />
      {/* Red */}
      <div
        className="absolute left-1/2 top-14 h-7 w-9 -translate-x-1/2"
        style={{
          clipPath: 'polygon(6% 0, 94% 0, 78% 100%, 22% 100%)',
          background:
            'repeating-linear-gradient(115deg, transparent 0 5px, rgba(245,241,232,0.35) 5px 6px), repeating-linear-gradient(65deg, transparent 0 5px, rgba(245,241,232,0.35) 5px 6px)',
          animation: fase === 'hecho' ? 'net-wobble 0.7s ease-out' : 'none',
        }}
      />
      {/* Destello */}
      <div
        className="absolute left-1/2 top-12 h-12 w-12 -translate-x-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,107,26,0.7), transparent 70%)',
          animation: fase === 'hecho' ? 'rim-flash 0.6s ease-out' : 'none',
        }}
      />
      {/* Pelota */}
      <div
        key={fase === 'volando' ? 'volando' : 'quieta'}
        className="absolute bottom-4 left-1/2 h-7 w-7 -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 35% 30%, #ff9450, #ff6b1a 60%, #c9500f 100%), linear-gradient(to right, transparent 47%, rgba(0,0,0,0.45) 47%, rgba(0,0,0,0.45) 53%, transparent 53%), linear-gradient(to bottom, transparent 47%, rgba(0,0,0,0.45) 47%, rgba(0,0,0,0.45) 53%, transparent 53%)',
          animation: animPelota,
        }}
      />
      {/* Texto */}
      {fase === 'hecho' && (
        <div
          className="absolute left-1/2 top-16 -translate-x-1/2 font-marcador text-2xl text-hueso"
          style={{ animation: 'swish-pop 1.4s ease-out forwards' }}
        >
          ¡FICHADO!
        </div>
      )}
      </div>
    </div>
  )
}
