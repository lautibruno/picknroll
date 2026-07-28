# PickNRoll — MVP Spec

Simulador de carrera de básquet por decisiones (estilo Copero, pero NBA). Creás jugador, tomás decisiones cada N temporadas (draft → equipo → contratos/trades), motor simula progresión oculta, objetivo: llegar a una GRAN carrera (poco probable a propósito).

## 1. Stack

Mismo que PixGeo (decisión ya tomada, no reabrir sin motivo concreto):
React + Vite + TS + Tailwind + Zustand + Vitest. Sin backend en el MVP (progreso en `localStorage`). Supabase se evalúa recién si hace falta ranking/multiplayer más adelante.

## 2. Arquitectura de carpetas

- `src/engine/` — lógica pura del juego, sin React. Tests con Vitest ANTES de tocar la UI.
- `src/ui/` — capa de presentación (componentes, pantallas). No conoce reglas del motor, solo las consume.
- `src/data/` — datasets estáticos (nombres de equipos ficticios o reales con licencia libre a definir, curva de atributos, tablas de eventos).

El motor no sabe nada de React ni de estética — la estética se define aparte con Claude Design y se integra después (mismo patrón que el rediseño ámbar de PixGeo: archivos que se pisan/mergean, no se rediseña a mano).

## 3. Mecánica central (definida en sesión de diseño)

### 3.1 Setup de personaje
- Nombre, apellido, número, mano hábil (diestra/zurda), posición (PG/SG/SF/PF/C), nacionalidad (opcional, saborizante).
- **Potencial oculto** (no visible al jugador): techo máximo de OVR que puede alcanzar en su pico. Distribución sesgada, NO uniforme:
  - 70% → techo 60-75 (carrera mediocre/rol jugador)
  - 20% → techo 76-85 (buen titular)
  - 8% → techo 86-92 (all-star)
  - 2% → techo 93+ (elite histórico)
- Edad inicial: 19 (draft NBA típico). OVR inicial bajo (40-50), lejos del potencial — hay que desarrollarlo.

### 3.2 Curva de progresión por edad (aplica sobre el camino hacia el potencial, no lo excede)
- 19-23: crecimiento rápido (+2 a +5 OVR/temporada), sujeto a rol/minutos.
- 24-27: maduración (+1 a +3).
- 28-31: meseta (-1 a +1).
- 32+: declive (-2 a -5/temporada).

### 3.3 Camino previo a la NBA (decisión del usuario — no todos arrancan en la NBA)
La carrera NO arranca directo en la NBA, y **arranca distinto según la nacionalidad elegida en el setup** (decisión del usuario — la nacionalidad deja de ser solo saborizante):

- **Nacionalidad con liga doméstica curada** (Argentina, España, Italia, Grecia, Serbia, Turquía, Francia, Australia, Lituania, Brasil — ver `src/engine/datos/ligasPorPais.ts`): el primer evento ofrece 3 clubes REALES de esa liga (Boca/San Lorenzo/Regatas para Argentina, Real Madrid/Barcelona/Baskonia para España, etc.), filtrados por tu OVR inicial como cualquier otro evento.
- **Nacionalidad sin liga curada** (incluye EEUU a propósito — su camino real es universidad/G-League, no un club doméstico): cae al camino genérico ya construido — universidad top (NCAA), G-League Ignite, o liga internacional (Europa).

El dataset de ligas está pensado para revisarse/actualizarse periódicamente (ver comentario "CÓMO ACTUALIZAR" al inicio de `ligasPorPais.ts`) — cobertura actual: 10 países con liga real curada, el resto cae al fallback genérico sin romper nada.

**Elección explícita de camino (decisión del usuario)**: aunque tu nacionalidad tenga liga doméstica curada, podés elegir igual el camino universidad/G-League/internacional (`crearCarrera(azar, nacionalidad, { modoCaminoPreNba: 'universidad' })`) — pensado para el jugador que quiere "intentar la vía EEUU" sin importar de dónde es. Sin especificar, usa la liga doméstica si existe.

### 3.5 Velocidad de decisiones (Intensa / Normal / Exprés — mismo concepto que Copero)
Elegida una vez al crear la carrera (`opciones.dificultad`), determina cada cuántas temporadas se genera un evento de trade/agencia libre una vez en la NBA: Intensa = cada temporada, Normal = cada 2 (default), Exprés = cada 4 (`src/engine/caminosPreNba.ts` → `INTERVALO_TEMPORADAS_POR_DIFICULTAD`). El historial sigue acumulando una entrada por cada temporada individual dentro del bloque, aunque no haya evento hasta el final. **El Draft es la excepción**: se dispara apenas se cruza `UMBRAL_DRAFT_OVR`, sin esperar a que termine el bloque de temporadas de la dificultad elegida — no tendría sentido que el draft "se demore" por elegir Exprés.

**El Draft NBA no es automático**: mientras estás en tu camino pre-NBA, el motor chequea cada temporada si tu OVR cruzó `UMBRAL_DRAFT_OVR` (55). Si no lo cruzaste, no pasa nada ese año — seguís en tu camino. Si lo cruzás, se dispara el evento de Draft (pool de franquicias NBA reales filtrado por tu OVR, mismo mecanismo que cualquier evento). **Consecuencia real de diseño, confirmada explícitamente por el usuario**: si tu OVR nunca cruza el umbral antes del retiro a los 40, tu carrera entera transcurre sin pisar la NBA — universidad/G-League/exterior para siempre. Es dificultad real, no cosmética (verificado con test: `motorCarrera.test.ts` → "puede retirarse sin haber pisado nunca la NBA").

### 3.4 Loop de eventos una vez en la NBA (cada N temporadas, según dificultad elegida — Intensa/Normal/Exprés como Copero)
Eventos con opciones tipo card, **el pool de opciones se filtra por el OVR actual, no por el potencial oculto** — esta es la pieza clave de dificultad: un mal arranque cierra puertas a equipos/roles mejores más adelante, efecto bola de nieve.

Tipos de evento:
1. **Draft** (ver §3.3 — condicional, no garantizado).
2. **Trade / agencia libre** (una vez en NBA): franquicias reales ofrecidas según nivel actual.
3. **Renovación de contrato** (pendiente de implementar): quedarte, pedir trade, aceptar rol reducido.
4. **Evento negativo** (pendiente de implementar, probabilidad no despreciable en cada tick, compuesta a lo largo de la carrera): lesión, pérdida de rol, waivers — asegura que carreras "perfectas" sean raras por definición estadística, no por un único gate.

### 3.4 Stats derivadas
PJ, PPG, RPG, APG derivados de "minutos" (variable oculta, depende de rol/equipo/rendimiento), no random directo — el random define el rango de minutos según si sos titular/rotación/banca.

### 3.5 Trofeos
Anillos/MVP/All-Star requieren alinear OVR alto + buen equipo + buena racha de eventos — gate compuesto, no solo stat individual. Vitrina vacía al inicio (igual que Copero).

## 4. Roadmap por fases

- **Fase 0 — Setup**: scaffold Vite+TS+Tailwind+Vitest+Zustand, deploy (Vercel, a definir).
- **Fase 1 — Motor de progresión**: `engine/potencial.ts` (generación sesgada), `engine/progresion.ts` (curva por edad + rol), `engine/eventos.ts` (tipos de evento + filtro por OVR), `engine/motorCarrera.ts` (máquina de estados: crear jugador → avanzar temporadas → evento → resolver decisión → fin de carrera). Tests Vitest ANTES de UI.
- **Fase 2 — UI de decisiones**: pantallas de setup, evento (3 cards), progreso (tabla histórica por temporada como Copero), vitrina de trofeos. Estética placeholder (Tailwind default) — se reemplaza en Fase 2.5.
- **Fase 2.5 — Integración de estética Claude Design**: el usuario diseña por fuera con Claude Design, se importan los archivos generados (mismo patrón que PixGeo: pisar/mergear componentes, cuidando no romper wiring de `App.tsx`/props existentes).
- **Fase 3 — Resultado + compartir**: texto tipo Wordle con resumen de carrera (años, equipos, trofeos, pico de OVR) — a confirmar si texto o imagen (default: texto, mismo criterio que PixGeo).
- **Fase 4+ (a evaluar)**: persistencia server-side / rankings si se prioriza, PWA si se pide, dataset de equipos (ficticios vs. reales con nombres alterados por tema de licencia — a decidir).

## 5. Decisiones tomadas

- **Nombres y escudos de equipos: reales (30 franquicias NBA)** — decisión explícita del usuario, asumiendo el riesgo de marca/copyright ya señalado (cease & desist / DMCA es el escenario más probable si el proyecto gana visibilidad o va a tienda; escudo real es más grave que nombre real, no hay "transformación" que lo cubra). Precedente citado por el usuario: Copero usa clubes reales de fútbol sin problema conocido. Revisar esta decisión si el proyecto escala (monetización, publicación en Play/App Store).
- **Retiro forzado: 40 años.**

## 6. Sección "Resultados" (nueva, decisión del usuario — sitio con pestaña de juego + resultados NBA)

Idea: el sitio no es solo PickNRoll (el juego) — tiene una sección de resultados NBA (live/pasados/futuros, estilo Promiedos) + la pestaña del juego. Decisiones cerradas:

- **Fuente principal — hoy/en vivo/calendario completo (pasado y futuro): API no-oficial de ESPN** (`site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=YYYYMMDD`). Sin API key, sin cuenta, sin límite de cuota conocido, sin bloqueo por IP de datacenter (verificado con curl real desde este entorno — a diferencia de nba.com). Devuelve calendario completo de la temporada, estado del partido (`STATUS_FINAL`/en vivo/programado vía `competitions[0].status`), marcador real por equipo (`competitors[].score`). Cubre TODO lo que se necesita para la sección de resultados (hoy, pasados, futuros) — no oficial/no documentada formalmente, así que puede cambiar sin aviso (riesgo aceptado, sin alternativa gratis mejor encontrada).
- **Fuente secundaria (en evaluación, no bloqueante) — historial de stats/temporadas completas más ricas: API-Sports NBA v2** (`v2.nba.api-sports.io`), plan free (100 req/día, sin tarjeta, cuenta ya creada por el usuario). **Limitación real encontrada probando en vivo**: el free tier da acceso completo a temporadas pasadas cerradas (2022-23, 2023-24, 2024-25 confirmado con 1387 partidos reales) pero **bloquea 100% la temporada en curso** (2025-26) — mensaje de error de fechas es engañoso/genérico, en la práctica no hay ninguna ventana de "hoy" accesible gratis. Como ESPN ya cubre hoy/en vivo/calendario, API-Sports queda como fuente opcional futura solo si se quiere data más rica de temporadas cerradas (stats avanzadas, no solo resultado).
- **Descartado**: `nba.com` directo (CDN `cdn.nba.com`/`stats.nba.com`) — bloquea con 403 (Akamai) IPs de datacenter/cloud, inviable para hosting en producción (Vercel/AWS/etc. corren en esas IPs). Confirmado con test real (curl + browser), no solo teoría.
- **Descartado**: BALLDONTLIE — free real es solo 48hs de prueba, pide tarjeta después.
- **Descartado**: Big Balls Sports Data — sin rastro de reputación real (sin reviews, bloqueó fetch, copy sospechoso tipo landing genérica), no confiable sin más verificación.
- **Arquitectura**: `api/nba/scoreboard.ts` (proxy a ESPN, fuente real de hoy/en vivo/calendario) — cache adaptativo: 30s si hay algún partido en vivo ese día (`competitions[0].status.type.state === 'in'`), 15min si no hay partidos (para no pegarle de más en días sin actividad). `api/nba/games.ts` queda apuntando a API-Sports (temporadas cerradas, opcional/no bloqueante, ver arriba). tsc/lint limpios en ambos; no verificable en el preview de Vite (necesita `vercel dev`, no configurado todavía) — la lógica de ESPN ya se probó manualmente por curl con datos reales (76ers 109 - Magic 97).
- **API key de API-Sports**: vive en `.env.local` (var `NBA_API_KEY`), nunca en el código. Nota de seguridad: la key circuló en texto plano en el chat durante el setup — se le recomendó al usuario resetearla (mismo criterio que el incidente de Supabase en PixGeo), pero decidió explícitamente no resetearla y usar esa key igual, asumiendo el riesgo (queda registrado como decisión suya, no omisión).
- Tipado de funciones serverless a mano sin `@vercel/node` (ese paquete trae árbol de dependencias con vulnerabilidades de build tools — `npm audit` quedó en 0 al sacarlo).

## 6.1 Decisiones de riesgo estilo Copero (implementado — verificado jugando el original real)

A pedido del usuario (reportó la carrera como "0 divertido, sin ningún fin", y después pidió específicamente calcar el mecanismo de Copero), se jugó `copero.com.ar/juegos/simulador-carrera` a fondo para copiar el patrón real en vez de inventar uno propio. Hallazgos concretos verificados jugando:

- **Velocidad de decisiones real**: Intensa = 1 decisión/temporada, Normal = cada 2, **Exprés = cada 3** (no 4 como se había supuesto antes — corregido en `INTERVALO_TEMPORADAS_POR_DIFICULTAD`).
- **Copero tiene DOS familias de evento**, no solo "elegir club": eventos de club (cantera/mercado de pases, ya teníamos esto) y **eventos de decisión de riesgo** — ej. "Doble turno" ("Entrenar a fondo" → 65% Titular / 35% Lesión, vs "Bajar la carga" → seguro) y "Plan de alimentación" ("Seguir el plan" → 60% +3 OVR / 40% -2 OVR, vs "Mantener tu dieta" → sin cambios). La probabilidad se muestra ANTES de elegir — es agencia real del jugador, no azar invisible.

Se reemplazó el sistema anterior (sucesos.ts, automático e invisible) por este patrón real:

- `src/engine/decisionesRiesgo.ts` (`generarDecisionRiesgo`): 3 temáticas con sabor de básquet ("Doble turno", "Plan de alimentación", "Nuevo preparador físico"), cada una con 2 opciones — **arriesgar** (probabilidad de éxito visible, delta positivo si sale bien / negativo si sale mal, ya resuelto en el momento de generar el evento) y **jugar seguro** (0, garantizado).
- `motorCarrera.ts`: nuevo tipo de evento `riesgo`. En fase pre-nba, cada decisión (mientras no se cruza el umbral del Draft) es SIEMPRE una decisión de riesgo (no hay mercado de pases antes de la NBA). En fase NBA, alterna 50/50 entre evento de trade y decisión de riesgo. `Carrera.ultimoResultadoRiesgo` guarda el resultado de la última decisión de riesgo tomada, para mostrarlo en la UI.
- `PantallaEvento.tsx`: layout dedicado para el tipo `riesgo` — dos cards ("Arriesgar" con los dos desenlaces posibles y su %, "Jugar seguro" con 0 garantizado). `PantallaProgreso.tsx`: banner (verde/rojo) con el resultado de la última decisión de riesgo tomada.
- Verificado jugando en el navegador: apareció "Doble turno" con 65%/35% reales, se eligió "Arriesgar", salió mal (-4 OVR, mostrado correctamente en el banner "DOBLE TURNO -4 Salió mal.").

## 6.2 Veredicto final (implementado)

También a pedido del usuario (falta de "fin"/cierre a la carrera), se agregó `src/engine/veredicto.ts` (`calcularVeredicto`): título + descripción final basados en el **pico histórico de OVR** (no el final, que puede estar en declive) y los trofeos acumulados — "NUNCA LLEGÓ A LA NBA" (si `fase !== 'nba'`), "LEYENDA" (MVP o pico≥93), "ESTRELLA NBA" (3+ All-Star, anillo, o pico≥86), "BUEN TITULAR" (algún All-Star o pico≥76), "JUGADOR DE ROTACIÓN" (resto). Se muestra en `PantallaRetiro.tsx` como cartel destacado junto al nombre, y se suma al texto para compartir.

## 7. Pendiente de decidir con el usuario

- **Dataset de 30 franquicias reales**: ya armado en `src/engine/datos/equiposNba.ts` (nombres reales, campo `nivel` de balance de juego aproximado — no viene de stats en vivo, candidato futuro: alimentarlo con posición real en tabla desde `api/nba/scoreboard.ts`, la sección de Resultados). Falta: escudos reales (assets gráficos, de dónde sacarlos).
- Si habrá "modo repetir con misma semilla" (desafío diario) tipo PixGeo, o solo carrera libre.
- Diseño visual: el usuario va a usar **Claude Design** (herramienta externa) para la estética de todo el sitio (juego + sección de resultados) — mismo patrón que PixGeo (se integra después importando/mergeando archivos generados).
- Falta decidir: estructura final de la sección "Resultados" (¿pantalla separada, ruta `/resultados`, o todo en una sola pantalla con pestañas?), y si el cron de refresh corre como Vercel Cron Job o se dispara on-demand cuando expira el cache.
- Falta que el usuario complete `.env.local` con la `NBA_API_KEY` (después de resetearla) para poder probar el proxy end-to-end.
