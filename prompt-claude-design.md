# Prompt para Claude Design — PickNRoll

Necesito el sistema de diseño completo para **PickNRoll**, un sitio de básquet con dos partes que comparten la misma identidad visual:

1. **Sección "Resultados"**: partidos NBA en vivo, pasados y futuros (estilo Promiedos/ESPN scoreboard) — calendario, marcador, estado del partido, tabla de posiciones.
2. **El juego**: un simulador de carrera de básquet por decisiones (creás un jugador, elegís equipo/universidad, tomás decisiones cada cierta cantidad de temporadas, ves tu progreso: OVR, estadísticas, trofeos, hasta el retiro).

Quiero UN solo lenguaje visual para las dos partes, no dos diseños distintos pegados.

## Estilo

**Dirección: pizarra táctica de entrenador + estética de cancha real** — no un dashboard SaaS genérico. Pensá en la pizarra blanca de un vestuario NBA (líneas de jugadas, marcador táctil), combinado con la textura de una cancha de madera (parquet) y el naranja/negro de una pelota real. Nada de "app corporativa".

## Prohibido explícitamente (rechazá cualquier propuesta que tenga esto)

- Gradientes violeta/púrpura o celeste-a-rosa (el cliché #1 de diseño generado por IA)
- Glassmorphism / blur de fondo tipo iOS
- Sombras difusas con blur grande — si hay sombra, que sea sólida/offset, sin blur
- Tipografía `Inter`, `system-ui`, o cualquier sans genérica sin personalidad como protagonista
- Iconos de librería genérica (Material Icons, Feather) sin adaptar
- Bordes redondeados exagerados tipo "burbuja" en todo (algún redondeo puntual está bien, no como regla general)
- Cualquier cosa que se sienta "plantilla de landing page de SaaS 2024"

## Paleta (cerrada, no inventar otros colores base)

- Fondo: negro/carbón muy oscuro, casi negro (tipo `#0d0d0d` – `#141414`)
- Superficie: un gris cálido oscuro apenas por encima del fondo
- Acento primario: **naranja cancha real** (tipo `#ff6b1a` – `#f4741b`, el naranja de una pelota de básquet real, no un naranja pastel)
- Acento secundario: blanco hueso puro para líneas/texto de alto contraste (como las líneas de una cancha)
- Un solo color de estado para "en vivo" (verde o rojo saturado, uno solo, usado con moderación — no un semáforo de 5 colores)

## Tipografía

- Una fuente condensada/deportiva con carácter para títulos y números grandes (marcador, OVR, edad) — pensar en algo tipo `Oswald`, `Bebas Neue`, o similar (números de dorsal, carteles de estadio)
- Una monoespaciada para datos tabulares (tabla de posiciones, historial de temporadas) — sensación de planilla de estadísticas, no de código
- Nada de fuente sans genérica como protagonista

## Referencias reales (mood, no copiar literal)

- Pizarra táctica / vestuario NBA
- Texturas de parquet/cancha de madera
- Carteles vintage de la NBA de los 90 (tipografía condensada, números gigantes)
- Scoreboard físico de estadio (dígitos grandes, alto contraste)
- Nada de estética "2K videogame menu" genérica ni neón gamer

## Detalle/textura específica que quiero ver

- Líneas de cancha como elemento gráfico recurrente (separadores, bordes de sección)
- Números de estadística (OVR, edad, puntaje) tratados como elemento tipográfico grande y protagonista, no metidos en una tarjetita chica
- Alguna textura sutil de grano/ruido en fondos oscuros (no plano perfecto)

## Qué necesito que me entregues

1. Tokens de diseño (colores, tipografía, espaciado) reutilizables entre las dos secciones
2. Pantalla de "Resultados" (lista de partidos del día + detalle de un partido)
3. Pantallas del juego: setup de jugador, evento de decisión (3 opciones tipo card), pantalla de progreso/historial, pantalla de resultado final
4. Que ambas se sientan como el mismo producto, no dos apps distintas

Iterá conmigo mostrándome avances — voy a darte feedback puntual sobre elementos específicos, no "no me gusta" en general.
