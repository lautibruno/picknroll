import { useState } from 'react'
import { PasoCaminoDificultad, type DatosPaso1 } from './PasoCaminoDificultad'
import { PasoPais } from './PasoPais'
import { PasoCamiseta, type DatosPaso3 } from './PasoCamiseta'
import { PasoPosicion } from './PasoPosicion'
import type { DatosSetup } from './tiposSetup'

type Paso = 1 | 2 | 3 | 4

interface PantallaSetupWizardProps {
  onEmpezar: (datos: DatosSetup) => void
}

export function PantallaSetupWizard({ onEmpezar }: PantallaSetupWizardProps) {
  const [paso, setPaso] = useState<Paso>(1)
  const [datosPaso1, setDatosPaso1] = useState<DatosPaso1 | null>(null)
  const [codigoPais, setCodigoPais] = useState<string | null>(null)
  const [datosPaso3, setDatosPaso3] = useState<DatosPaso3 | null>(null)

  if (paso === 1) {
    return (
      <PasoCaminoDificultad
        onContinuar={(datos) => {
          setDatosPaso1(datos)
          setPaso(2)
        }}
      />
    )
  }

  if (paso === 2) {
    return (
      <PasoPais
        onContinuar={(codigo) => {
          setCodigoPais(codigo)
          setPaso(3)
        }}
        onVolver={() => setPaso(1)}
      />
    )
  }

  if (paso === 3 && codigoPais) {
    return (
      <PasoCamiseta
        codigoPais={codigoPais}
        onContinuar={(datos) => {
          setDatosPaso3(datos)
          setPaso(4)
        }}
        onVolver={() => setPaso(2)}
      />
    )
  }

  if (paso === 4 && datosPaso1 && codigoPais && datosPaso3) {
    return (
      <PasoPosicion
        onVolver={() => setPaso(3)}
        onContinuar={(posicion) => {
          onEmpezar({
            nombre: '',
            apellido: datosPaso3.apellido,
            dorsal: datosPaso3.dorsal,
            posicion,
            manoHabil: datosPaso3.manoHabil,
            nacionalidad: codigoPais,
            modoCaminoPreNba: datosPaso1.modoCaminoPreNba,
            dificultad: datosPaso1.dificultad,
          })
        }}
      />
    )
  }

  return null
}
