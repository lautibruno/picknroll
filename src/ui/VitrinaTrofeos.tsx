import { useEffect, useRef, useState } from 'react'
import type { Carrera, IconoTrofeo } from '../engine/motorCarrera'
import { ICONOS_TROFEO, ETIQUETA_TROFEO, DESCRIPCION_TROFEO } from './iconosTrofeos'

// Vitrina de fin de carrera — mueble de madera con estantes, vidrio y los trofeos parados
// encima, siguiendo el mockup que pasó el usuario (Claude Design). Diferencia deliberada con
// ese mockup: ahí los trofeos eran formas dibujadas con CSS; acá son las IMÁGENES REALES de
// cada trofeo (pedido explícito: "necesito que los trofeos sean EXACTAMENTE los reales"), ver
// iconosTrofeos.tsx y `trofeoUrl` en datos/ligasPorPais.ts.
//
// Los trofeos se agrupan por tipo (pedido: "si hay muchos trofeos, se agrupan los que son del
// mismo estilo") y tocar/pasar el mouse por un grupo muestra qué es.

const CLAVE_TROFEO: Record<IconoTrofeo, keyof Carrera['trofeos']> = {
  anillo: 'anillos',
  allstar: 'allStar',
  mvp: 'mvp',
  mundial: 'mundial',
  jjoo: 'jjoo',
  'liga-local': 'ligaLocal',
}

const ORDEN: IconoTrofeo[] = ['anillo', 'mvp', 'allstar', 'mundial', 'jjoo', 'liga-local']

// Ancho máximo de cada pieza (coincide con max-w-[76px] del ícono) — se usa como cota superior
// para calcular el solapamiento, así el cálculo nunca subestima el espacio que ocupa una pieza.
const ANCHO_PIEZA = 76
// Cuánto puede llegar a superponerse una pieza sobre la anterior antes de recurrir a achicar
// todo el grupo (fracción del ancho de la pieza).
const SOLAPE_MAXIMO_FRACCION = 0.82
// Piso de escala: por más que haya muchísimas piezas, no se reducen a algo ilegible.
const ESCALA_MINIMA = 0.42

// Se muestran TODAS las piezas ganadas (pedido explícito del usuario: "que agrupes los trofeos
// cuanto más son, más comprimidos, pero que no pasen el límite de la vitrina"). Antes el
// solapamiento era un valor fijo por cantidad, sin medir el ancho real disponible — con muchas
// piezas del mismo tipo el grupo se salía del mueble (bug real reportado con captura). Ahora se
// mide el ancho del contenedor y se resuelve en dos pasos:
//   1. superponer las piezas hasta un máximo (`SOLAPE_MAXIMO_FRACCION`)
//   2. si con esa superposición todavía no entra, escalar el grupo entero hacia abajo
// así SIEMPRE cabe dentro del ancho disponible, sea cual sea la cantidad.
function calcularAjuste(cantidad: number, anchoDisponible: number): { margenIzq: number; escala: number } {
  if (cantidad <= 1 || anchoDisponible <= 0) return { margenIzq: 0, escala: 1 }

  const anchoSinSolapar = ANCHO_PIEZA * cantidad
  if (anchoSinSolapar <= anchoDisponible) {
    // Entra holgado: separadas si son pocas, apenas tocándose si son varias.
    const margen = cantidad <= 2 ? 8 : cantidad === 3 ? 0 : Math.max(-34, -4 * (cantidad - 3))
    return { margenIzq: margen, escala: 1 }
  }

  // No entra sin superponerse: calculamos el solape exacto que hace falta para que quepa.
  const margenNecesario = (anchoDisponible - anchoSinSolapar) / (cantidad - 1)
  const margenMaximo = -ANCHO_PIEZA * SOLAPE_MAXIMO_FRACCION
  const margenAplicado = Math.max(margenMaximo, margenNecesario)

  if (margenNecesario >= margenMaximo) {
    // El solape máximo alcanza para entrar.
    return { margenIzq: margenAplicado, escala: 1 }
  }

  // Ni el solape máximo alcanza (muchísimas piezas): además hay que escalar el grupo entero.
  const anchoConSolapeMaximo = ANCHO_PIEZA + (cantidad - 1) * (ANCHO_PIEZA + margenAplicado)
  const escala = Math.max(ESCALA_MINIMA, anchoDisponible / anchoConSolapeMaximo)
  return { margenIzq: margenAplicado, escala }
}

interface Grupo {
  icono: IconoTrofeo
  cantidad: number
  url?: string
}

interface VitrinaTrofeosProps {
  carrera: Carrera
}

export function VitrinaTrofeos({ carrera }: VitrinaTrofeosProps) {
  const [abierto, setAbierto] = useState<IconoTrofeo | null>(null)

  const grupos: Grupo[] = ORDEN.filter((icono) => carrera.trofeos[CLAVE_TROFEO[icono]] > 0).map((icono) => ({
    icono,
    cantidad: carrera.trofeos[CLAVE_TROFEO[icono]],
    url: icono === 'liga-local' ? carrera.ligaDomestica?.trofeoUrl : undefined,
  }))

  const total = grupos.reduce((acc, g) => acc + g.cantidad, 0)
  // Dos estantes, como el mueble del mockup. Con pocos grupos, todo va arriba y el de abajo
  // queda vacío (se sigue viendo el mueble completo, que es parte del gag visual).
  const corte = Math.ceil(grupos.length / 2)
  const estantes = [grupos.slice(0, corte), grupos.slice(corte)]

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <div className="font-mono-stats text-[10px] tracking-[0.2em] text-hueso/45">VITRINA</div>
        <div className="font-mono-stats text-[10px] tracking-[0.12em] text-hueso/40">
          {total} {total === 1 ? 'TÍTULO' : 'TÍTULOS'}
        </div>
      </div>

      {total === 0 ? (
        <div className="border border-dashed border-hueso/20 px-4 py-10 text-center font-titulo text-sm font-light text-hueso/45">
          Te retiraste sin títulos. La vitrina quedó vacía.
        </div>
      ) : (
        <>
          <div style={{ perspective: '1400px' }}>
            <div
              className="relative"
              style={{
                transform: 'rotateX(2.5deg)',
                transformStyle: 'preserve-3d',
                background: 'linear-gradient(155deg,#4a3220,#2e1e12 55%,#1d130b)',
                padding: '14px',
                boxShadow: '12px 12px 0 rgba(0,0,0,0.55)',
                borderTop: '3px solid #6b4726',
                borderLeft: '2px solid #5b3c1f',
                borderRight: '2px solid #24170d',
                borderBottom: '3px solid #150e07',
              }}
            >
              <div
                className="relative"
                style={{
                  background: 'linear-gradient(175deg,#120c07,#1c130c 60%,#0f0a06)',
                  border: '2px solid #0c0805',
                  boxShadow: 'inset 0 0 0 1px rgba(245,241,232,0.06), inset 0 26px 46px rgba(0,0,0,0.75)',
                }}
              >
                {estantes.map((grupsEstante, indiceEstante) => (
                  <div key={indiceEstante} className="relative">
                    {/* Cada grupo mide en flex-1/min-w-0: así se reparte el ancho real del
                        estante entre todos los grupos que lo comparten, en vez de dejar que
                        cada uno crezca a su ancho natural (eso era lo que permitía que un
                        grupo con muchas piezas se saliera del mueble). */}
                    <div className="relative flex h-[120px] items-end gap-2 px-4 pb-0.5 sm:h-[132px] sm:px-6">
                      {grupsEstante.map((grupo, indiceGrupo) => (
                        <GrupoDeTrofeos
                          key={grupo.icono}
                          grupo={grupo}
                          retraso={indiceEstante * 240 + indiceGrupo * 110}
                          activo={abierto === grupo.icono}
                          onTocar={() => setAbierto(abierto === grupo.icono ? null : grupo.icono)}
                        />
                      ))}
                    </div>

                    {/* Tabla del estante */}
                    <div
                      style={{
                        height: '7px',
                        background: 'linear-gradient(180deg,#7d5730,#5a3c1f 45%,#33210f)',
                        boxShadow: '0 3px 7px rgba(0,0,0,0.65)',
                      }}
                    />
                    <div style={{ height: '4px', background: 'linear-gradient(180deg,#1a110a,#0d0906)' }} />
                  </div>
                ))}

                {/* Reflejo del vidrio, divisor central y marco interno */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(104deg,transparent 8%,rgba(245,241,232,0.05) 13%,rgba(245,241,232,0.11) 16%,transparent 21%,transparent 52%,rgba(245,241,232,0.04) 57%,rgba(245,241,232,0.08) 60%,transparent 65%)',
                  }}
                />
                <div
                  className="pointer-events-none absolute bottom-0 top-0 left-1/2 w-[5px] -translate-x-1/2"
                  style={{ background: 'linear-gradient(90deg,#160f09,#4a3220 45%,#160f09)' }}
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ boxShadow: 'inset 0 0 0 1px rgba(245,241,232,0.09)' }}
                />
              </div>
            </div>
          </div>

          {/* Descripción del trofeo tocado (en desktop además está el tooltip nativo al hover) */}
          <div className="mt-3 min-h-[2.5rem]">
            {abierto ? (
              <div className="border-l-4 border-acento bg-superficie-alta/60 px-4 py-2.5">
                <div className="font-titulo text-sm font-semibold uppercase tracking-wide text-hueso">
                  {ETIQUETA_TROFEO[abierto]}
                  {carrera.trofeos[CLAVE_TROFEO[abierto]] > 1 && ` ×${carrera.trofeos[CLAVE_TROFEO[abierto]]}`}
                </div>
                <div className="font-titulo text-xs font-light text-hueso/75">
                  {abierto === 'liga-local' && carrera.ligaDomestica
                    ? `Campeón de la ${carrera.ligaDomestica.nombreLiga}.`
                    : DESCRIPCION_TROFEO[abierto]}
                </div>
              </div>
            ) : (
              <div className="px-1 font-mono-stats text-[9px] tracking-[0.14em] text-hueso/35">
                TOCÁ UN TROFEO PARA VER QUÉ ES
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function GrupoDeTrofeos({
  grupo,
  retraso,
  activo,
  onTocar,
}: {
  grupo: Grupo
  retraso: number
  activo: boolean
  onTocar: () => void
}) {
  const Icono = ICONOS_TROFEO[grupo.icono]
  const etiqueta = ETIQUETA_TROFEO[grupo.icono]

  // Mide el ancho real de su propio slot (ya repartido por flex-1 entre los grupos del mismo
  // estante) para calcular cuánto tienen que superponerse/achicarse las piezas y que NUNCA se
  // salgan del mueble, sea cual sea la cantidad.
  const contenedorRef = useRef<HTMLButtonElement>(null)
  const [anchoDisponible, setAnchoDisponible] = useState(0)
  useEffect(() => {
    const el = contenedorRef.current
    if (!el) return
    const observer = new ResizeObserver((entradas) => {
      const ancho = entradas[0]?.contentRect.width
      if (ancho) setAnchoDisponible(ancho)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { margenIzq, escala } = calcularAjuste(grupo.cantidad, anchoDisponible)

  return (
    <button
      ref={contenedorRef}
      type="button"
      onClick={onTocar}
      title={etiqueta}
      aria-label={`${etiqueta}: ${grupo.cantidad}`}
      // `items-end` + sin nada debajo de las piezas: así quedan APOYADAS en la tabla del
      // estante en vez de flotando (el contador va como badge absoluto, no en el flujo).
      // `flex-1 min-w-0` reparte el ancho del estante entre todos los grupos que lo comparten.
      // El `overflow-hidden` va en el contenedor de las PIEZAS, no en el botón entero, para no
      // recortar el badge "×N" (que sí necesita poder asomar un poco por arriba/afuera).
      className="group relative flex min-w-0 flex-1 cursor-pointer items-end justify-center bg-transparent pb-0"
    >
      <div className="flex w-full items-end justify-center overflow-hidden">
        <div
          className="flex items-end"
          style={{ transform: escala < 1 ? `scale(${escala})` : undefined, transformOrigin: 'bottom center' }}
        >
        {Array.from({ length: grupo.cantidad }, (_, i) => (
          <span
            key={i}
            className="animar-trofeo relative block shrink-0"
            style={{
              animationDelay: `${retraso + i * 70}ms`,
              transformOrigin: 'bottom center',
              marginLeft: i === 0 ? 0 : `${margenIzq}px`,
              // Las de adelante tapan a las de atrás, como trofeos apoyados en fila
              zIndex: i,
            }}
          >
          {/* Foco de luz del estante — sin esto, un trofeo/logo oscuro desaparece contra el
              fondo negro del mueble (pasó de verdad con el logo de la LNB al verificar). */}
          <span
            className="pointer-events-none absolute inset-0 -m-2"
            style={{
              background: 'radial-gradient(ellipse at 50% 65%, rgba(245,241,232,0.16), transparent 70%)',
            }}
          />
          {/* Alto fijo y ancho libre: cada trofeo real tiene su propia proporción (la copa
              O'Brien es alta y angosta, el logo del All-Star es ancho y bajo). Forzarlos a un
              cuadrado dejaba a los anchos diminutos. */}
          {grupo.url ? (
            <img
              src={grupo.url}
              alt={etiqueta}
              className={`relative h-14 w-auto max-w-[76px] object-contain object-bottom transition-transform sm:h-16 sm:max-w-[86px] ${
                activo ? 'scale-110' : 'group-hover:scale-105'
              }`}
            />
          ) : (
            <Icono
              className={`relative h-14 w-auto max-w-[76px] text-acento transition-transform sm:h-16 sm:max-w-[86px] ${
                activo ? 'scale-110' : 'group-hover:scale-105'
              }`}
            />
          )}
          {/* Sombra de la pieza apoyada en el estante */}
          <span className="absolute bottom-0 left-1/2 h-[4px] w-7 -translate-x-1/2 rounded-[50%] bg-black/70" />
          </span>
          ))}
        </div>
      </div>
      {grupo.cantidad > 1 && (
        <span
          className={`absolute -top-1 right-0 px-1 font-mono-stats text-[9px] leading-none transition-colors ${
            activo ? 'text-acento' : 'text-hueso/50'
          }`}
        >
          ×{grupo.cantidad}
        </span>
      )}
    </button>
  )
}
