import { useState } from 'react'
import { crearCarrera, elegirOpcion, avanzarSiCorresponde, type Carrera } from './engine/motorCarrera'
import { EQUIPOS_NBA } from './engine/datos/equiposNba'
import { PantallaSetupWizard } from './ui/PantallaSetupWizard'
import type { DatosSetup } from './ui/tiposSetup'
import { PantallaEvento } from './ui/PantallaEvento'
import { PantallaProgreso } from './ui/PantallaProgreso'
import { PantallaRetiro } from './ui/PantallaRetiro'

type Pantalla = 'setup' | 'evento' | 'progreso' | 'retiro'

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
    setPantalla('evento')
  }

  function elegir(opcionId: string) {
    if (!carrera) return
    setCarrera(elegirOpcion(carrera, opcionId, Math.random))
    setPantalla('progreso')
  }

  function seguirJugando() {
    if (!carrera) return
    const siguiente = avanzarSiCorresponde(carrera, EQUIPOS_NBA, Math.random)
    setCarrera(siguiente)
    if (siguiente.retirado) {
      setPantalla('retiro')
    } else if (siguiente.eventoPendiente) {
      setPantalla('evento')
    }
  }

  function nuevaCarrera() {
    setCarrera(null)
    setPantalla('setup')
  }

  return (
    <main className="min-h-screen bg-fondo px-4 py-10 text-hueso">
      <div className="textura-grano" />
      {pantalla === 'setup' && <PantallaSetupWizard onEmpezar={empezarCarrera} />}
      {pantalla === 'evento' && carrera && <PantallaEvento carrera={carrera} onElegir={elegir} />}
      {pantalla === 'progreso' && carrera && (
        <PantallaProgreso carrera={carrera} onSeguirJugando={seguirJugando} />
      )}
      {pantalla === 'retiro' && carrera && (
        <PantallaRetiro carrera={carrera} nombreCompleto={nombreCompleto} onNuevaCarrera={nuevaCarrera} />
      )}
    </main>
  )
}

export default App
