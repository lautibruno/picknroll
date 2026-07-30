import { useState } from 'react'
import { crearCarrera, elegirOpcion, continuarCarrera, type Carrera } from './engine/motorCarrera'
import { EQUIPOS_NBA } from './engine/datos/equiposNba'
import { PantallaSetupWizard } from './ui/PantallaSetupWizard'
import type { DatosSetup } from './ui/tiposSetup'
import { PantallaCarrera } from './ui/PantallaCarrera'
import { PantallaRetiro } from './ui/PantallaRetiro'

type Pantalla = 'setup' | 'carrera' | 'retiro'

function App() {
  const [pantalla, setPantalla] = useState<Pantalla>('setup')
  const [carrera, setCarrera] = useState<Carrera | null>(null)
  const [nombreCompleto, setNombreCompleto] = useState('')

  function empezarCarrera(datos: DatosSetup) {
    const nueva = crearCarrera(Math.random, datos.nacionalidad, datos.posicion, {
      modoCaminoPreNba: datos.modoCaminoPreNba,
      dificultad: datos.dificultad,
    })
    setNombreCompleto(datos.apellido)
    setCarrera(nueva)
    setPantalla('carrera')
  }

  // Resuelve la decisión y encadena directo a la próxima (ver motorCarrera.ts) — no hace
  // falta un paso "seguir jugando" separado, elegirOpcion ya deja la carrera lista con el
  // próximo evento pendiente o retirada.
  // Si se retiró pero quedan carteles de título por ver, no salta al resumen todavía — así no
  // se come el festejo del último título de la carrera.
  function aplicar(siguiente: Carrera) {
    setCarrera(siguiente)
    if (siguiente.retirado && siguiente.desenlacesPendientes.length === 0) setPantalla('retiro')
  }

  function elegir(opcionId: string) {
    if (!carrera) return
    aplicar(elegirOpcion(carrera, opcionId, Math.random, EQUIPOS_NBA))
  }

  // Descarta el cartel de título que el jugador acaba de ver (ver `Desenlace` en
  // motorCarrera.ts). La próxima decisión ya está lista detrás, no hace falta simular nada.
  function continuar() {
    if (!carrera) return
    aplicar(continuarCarrera(carrera))
  }

  function nuevaCarrera() {
    setCarrera(null)
    setPantalla('setup')
  }

  return (
    <main className="min-h-screen bg-fondo px-4 py-10 text-hueso">
      <div className="textura-grano" />
      {pantalla === 'setup' && <PantallaSetupWizard onEmpezar={empezarCarrera} />}
      {pantalla === 'carrera' && carrera && (
        <PantallaCarrera carrera={carrera} onElegir={elegir} onContinuar={continuar} />
      )}
      {pantalla === 'retiro' && carrera && (
        <PantallaRetiro carrera={carrera} nombreCompleto={nombreCompleto} onNuevaCarrera={nuevaCarrera} />
      )}
    </main>
  )
}

export default App
