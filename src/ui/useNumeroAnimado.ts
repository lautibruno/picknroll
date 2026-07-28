import { useEffect, useRef, useState } from 'react'

const DURACION_MS = 700

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

// Cuenta ascendente/descendente animada — el número "crece" en vivo hacia el valor real
// en vez de saltar de golpe (pedido del usuario). `valorInicial` se pasa explícito desde
// afuera (ej. el OVR de la temporada anterior en el historial) en vez de guardarse en
// estado interno: el componente que llama a este hook se remonta cada vez que cambia la
// pantalla en App.tsx, así que un estado puramente interno pierde la memoria y la
// animación nunca se ve — bug real encontrado jugando.
export function useNumeroAnimado(valorObjetivo: number, valorInicial: number): number {
  const [valorMostrado, setValorMostrado] = useState(valorInicial)
  const yaAnimadoRef = useRef(false)

  useEffect(() => {
    if (yaAnimadoRef.current || valorInicial === valorObjetivo) {
      setValorMostrado(valorObjetivo)
      return
    }
    yaAnimadoRef.current = true

    const inicioTiempo = performance.now()
    let frame: number

    function tick(ahora: number) {
      const progreso = Math.min(1, (ahora - inicioTiempo) / DURACION_MS)
      const valorActual = valorInicial + (valorObjetivo - valorInicial) * easeOutCubic(progreso)
      setValorMostrado(Math.round(valorActual))
      if (progreso < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe animar una vez por montaje, con los valores que tenía al montarse
  }, [])

  return valorMostrado
}
