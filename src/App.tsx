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
  function elegir(opcionId: string) {
    if (!carrera) return
    const siguiente = elegirOpcion(carrera, opcionId, Math.random, EQUIPOS_NBA)
    setCarrera(siguiente)
    if (siguiente.retirado) setPantalla('retiro')
  }

  // Los títulos/torneos frenan la carrera hasta que el jugador los ve (ver `Desenlace` en
  // motorCarrera.ts) — este es el paso que la retoma.
  function continuar() {
    if (!carrera) return
    const siguiente = continuarCarrera(carrera, Math.random, EQUIPOS_NBA)
    setCarrera(siguiente)
    if (siguiente.retirado) setPantalla('retiro')
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
