import { describe, expect, it } from 'vitest'
import { crearCarrera, elegirOpcion, type Equipo } from '../src/engine/motorCarrera'
import { armarResumenCarrera, codificarResumen } from '../src/engine/compartirCarrera'
import handler from './carrera'

const EQUIPOS_NBA: Equipo[] = [{ id: 'a', nombre: 'A', nivel: 40 }]

function azarFijo(valor: number): () => number {
  return () => valor
}

function crearResumenCodificado(): string {
  let carrera = crearCarrera(azarFijo(0.1), 'ar', 'C')
  const evento = carrera.eventoPendiente!
  const opcion = evento.tipo === 'club-liga-domestica' ? evento.opciones[0] : null
  carrera = elegirOpcion(carrera, opcion!.id, azarFijo(0.5), EQUIPOS_NBA)
  return codificarResumen(armarResumenCarrera(carrera, 'Fernández'))
}

function mockRes() {
  const res = {
    headers: {} as Record<string, string>,
    statusCode: 0,
    body: '',
    redirectedTo: null as string | null,
    setHeader(name: string, value: string) {
      res.headers[name] = value
    },
    status(code: number) {
      res.statusCode = code
      return res
    },
    send(body: string) {
      res.body = body
    },
    redirect(code: number, url: string) {
      res.statusCode = code
      res.redirectedTo = url
    },
  }
  return res
}

describe('api/carrera', () => {
  it('sin parámetro d, redirige a la home en vez de crashear', async () => {
    const res = mockRes()
    await handler({ query: {}, headers: {} }, res)
    expect(res.statusCode).toBe(302)
    expect(res.redirectedTo).toBe('/')
  })

  it('con dato inválido, redirige a la home', async () => {
    const res = mockRes()
    await handler({ query: { d: 'no-es-json-valido' }, headers: {} }, res)
    expect(res.statusCode).toBe(302)
  })

  it('con un resumen válido, devuelve HTML con los meta tags de Open Graph y la imagen apuntando a api/carrera-imagen', async () => {
    const d = crearResumenCodificado()
    const res = mockRes()
    await handler({ query: { d }, headers: { host: 'picknroll.app' } }, res)

    expect(res.statusCode).toBe(200)
    expect(res.headers['Content-Type']).toContain('text/html')
    expect(res.body).toContain('og:image')
    expect(res.body).toContain('https://picknroll.app/api/carrera-imagen?d=')
    expect(res.body).toContain('Fernández')
  })

  it('escapa el nombre del jugador en el HTML (no permite inyectar markup)', async () => {
    let carrera = crearCarrera(azarFijo(0.1), 'ar', 'C')
    const evento = carrera.eventoPendiente!
    const opcion = evento.tipo === 'club-liga-domestica' ? evento.opciones[0] : null
    carrera = elegirOpcion(carrera, opcion!.id, azarFijo(0.5), EQUIPOS_NBA)
    const d = codificarResumen(armarResumenCarrera(carrera, '<script>alert(1)</script>'))

    const res = mockRes()
    await handler({ query: { d }, headers: {} }, res)
    expect(res.body).not.toContain('<script>alert(1)</script>')
    expect(res.body).toContain('&lt;script&gt;')
  })
})
