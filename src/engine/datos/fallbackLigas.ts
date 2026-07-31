// Mapa de fallback: país SIN liga curada en `ligasPorPais.ts` -> código de país cuya liga usar
// en su lugar. Pedido explícito del usuario: "en caso de que un país no tenga liga que te mande
// a la liga más cercana para empezar" — decisión confirmada: "la más cercana" = la liga
// regional/continental más fuerte, no necesariamente el vecino más próximo en el mapa.
//
// Es deliberadamente aproximado — el criterio es geográfico/cultural razonable (no un tratado de
// geopolítica), pensado para que ningún país quede sin punto de partida real. `es-mx`, `xx`
// ("Otro país") y `us` NO tienen entrada acá a propósito: Estados Unidos ya usa el camino
// genérico por diseño (ver motorCarrera.ts), y "Otro país" no es un país real.
//
// CÓMO ACTUALIZAR: agregar el código ISO-3166 alpha-2 en minúscula como clave, apuntando a
// alguna clave de `LIGAS_POR_PAIS`. Si se cura una liga nueva, revisar si algún país de acá
// debería apuntar a esa en vez de a su fallback actual.
export const FALLBACK_LIGA_POR_PAIS: Record<string, string> = {
  // --- Europa occidental/central sin liga propia curada -> vecino con liga curada ---
  ad: 'es', // Andorra -> España
  mc: 'fr', // Mónaco -> Francia
  lu: 'be', // Luxemburgo -> Bélgica (BNXT)
  li: 'ch', // Liechtenstein -> Suiza
  at: 'de', // Austria -> Alemania
  sk: 'cz', // Eslovaquia -> Chequia
  sm: 'it', // San Marino -> Italia
  va: 'it', // Ciudad del Vaticano -> Italia
  mt: 'it', // Malta -> Italia
  cy: 'gr', // Chipre -> Grecia
  ie: 'gb', // Irlanda -> Reino Unido
  is: 'dk', // Islandia -> Dinamarca
  fo: 'dk', // Islas Feroe -> Dinamarca
  gl: 'dk', // Groenlandia -> Dinamarca
  no: 'se', // Noruega -> Suecia

  // --- Balcanes / Europa del Este sin liga propia -> la más fuerte de la región (Serbia) ---
  al: 'rs', // Albania
  mk: 'rs', // Macedonia del Norte
  me: 'rs', // Montenegro
  ba: 'rs', // Bosnia y Herzegovina
  xk: 'rs', // Kosovo
  hu: 'rs', // Hungría -> Serbia: no se encontró un logo real y verificable de la liga
            // húngara pese a varios intentos, aunque sí hay clubes reales (ver ligasPorPais.ts
            // si se quiere revisar en el futuro con más tiempo de investigación).
  by: 'ua', // Bielorrusia -> Ucrania (más cercana con liga curada)
  md: 'ua', // Moldavia -> Ucrania
  ee: 'lt', // Estonia -> Lituania (báltica)
  lv: 'lt', // Letonia -> Lituania

  // --- Cáucaso / Asia Central -> Rusia (liga regional más fuerte) ---
  ge: 'ru', // Georgia
  am: 'ru', // Armenia
  az: 'ru', // Azerbaiyán
  kz: 'ru', // Kazajistán
  uz: 'ru', // Uzbekistán
  tm: 'ru', // Turkmenistán
  tj: 'ru', // Tayikistán
  kg: 'ru', // Kirguistán
  mn: 'jp', // Mongolia -> Japón (China ya no está curada, ver nota abajo)

  // --- Medio Oriente / Golfo -> Turquía (potencia regional del básquet) ---
  sa: 'tr',
  ae: 'tr',
  qa: 'tr',
  kw: 'tr',
  bh: 'tr',
  om: 'tr',
  jo: 'tr',
  lb: 'tr',
  sy: 'tr',
  iq: 'tr',
  ye: 'tr',
  ps: 'tr', // Palestina
  ir: 'tr', // Irán

  // --- Sur y centro de Asia -> Japón (China no tiene liga curada, ver nota abajo) ---
  in: 'jp', // India
  pk: 'jp', // Pakistán
  bd: 'jp', // Bangladés
  lk: 'jp', // Sri Lanka
  np: 'jp', // Nepal
  bt: 'jp', // Bután
  mv: 'jp', // Maldivas
  af: 'jp', // Afganistán

  // --- Sudeste asiático -> Filipinas (la cultura de básquet más fuerte de la región) ---
  id: 'ph', // Indonesia
  my: 'ph', // Malasia
  th: 'ph', // Tailandia
  vn: 'ph', // Vietnam
  kh: 'ph', // Camboya
  la: 'ph', // Laos
  mm: 'ph', // Myanmar
  sg: 'ph', // Singapur
  bn: 'ph', // Brunéi
  tl: 'ph', // Timor Oriental

  // --- Este de Asia sin liga propia curada ---
  tw: 'jp', // Taiwán -> Japón
  hk: 'jp', // Hong Kong -> Japón
  mo: 'jp', // Macao -> Japón
  cn: 'jp', // China -> Japón: se investigó a fondo (liga + 4 clubes, 3 rondas) y ninguna
            // imagen real con licencia libre resultó verificable, así que China cae al
            // fallback en vez de tener una entrada propia con datos dudosos.
  kp: 'kr', // Corea del Norte -> Corea del Sur

  // --- Oceanía (islas del Pacífico) -> Australia ---
  fj: 'au',
  pg: 'au',
  sb: 'au',
  vu: 'au',
  ws: 'au',
  to: 'au',
  ki: 'au',
  fm: 'au',
  mh: 'au',
  pw: 'au',
  nr: 'au',
  tv: 'au',
  nc: 'au', // Nueva Caledonia
  pf: 'au', // Polinesia Francesa

  // --- Centroamérica -> México ---
  gt: 'mx',
  hn: 'mx',
  sv: 'mx',
  ni: 'mx',
  cr: 'mx',
  pa: 'mx',
  bz: 'mx',

  // --- Caribe -> Puerto Rico (el básquet más fuerte y popular de la región) ---
  cu: 'pr',
  do: 'pr', // República Dominicana
  ht: 'pr',
  jm: 'pr',
  tt: 'pr',
  bs: 'pr',
  bb: 'pr',
  gd: 'pr',
  lc: 'pr',
  vc: 'pr',
  dm: 'pr',
  ag: 'pr',
  kn: 'pr',

  // --- Sudamérica sin liga propia curada ---
  py: 'ar', // Paraguay -> Argentina
  bo: 'ar', // Bolivia -> Argentina
  pe: 'ar', // Perú -> Argentina (Chile no tiene liga curada, ver nota abajo)
  ec: 'ar', // Ecuador -> Argentina
  gy: 'br', // Guyana -> Brasil
  sr: 'br', // Surinam -> Brasil
  gf: 'br', // Guayana Francesa -> Brasil
  cl: 'ar', // Chile -> Argentina: mismo caso que China, no se encontró un logo de liga
            // real y verificable pese a varios intentos (liga + varios clubes).
  co: 've', // Colombia -> Venezuela: misma razón (liga + 2 clubes sin imagen real verificable).
  uy: 'ar', // Uruguay -> Argentina: misma razón (solo 1 de 3 clubes tuvo escudo verificable).

  // --- África: Magreb + vecinos del Nilo -> Egipto ---
  ma: 'eg', // Marruecos
  dz: 'eg', // Argelia
  tn: 'eg', // Túnez
  ly: 'eg', // Libia
  sd: 'eg', // Sudán
  ss: 'eg', // Sudán del Sur

  // --- Resto de África subsahariana -> Sudáfrica (la liga más fuerte del continente) ---
  ng: 'za', // Nigeria
  gh: 'za', // Ghana
  sn: 'za', // Senegal
  ci: 'za', // Costa de Marfil
  ml: 'za', // Malí
  bf: 'za', // Burkina Faso
  ne: 'za', // Níger
  tg: 'za', // Togo
  bj: 'za', // Benín
  gn: 'za', // Guinea
  sl: 'za', // Sierra Leona
  lr: 'za', // Liberia
  gm: 'za', // Gambia
  gw: 'za', // Guinea-Bisáu
  cv: 'za', // Cabo Verde
  mr: 'za', // Mauritania
  cm: 'za', // Camerún
  cd: 'za', // Rep. Dem. del Congo
  cg: 'za', // Congo
  ga: 'za', // Gabón
  gq: 'za', // Guinea Ecuatorial
  cf: 'za', // República Centroafricana
  td: 'za', // Chad
  ao: 'za', // Angola
  ke: 'za', // Kenia
  tz: 'za', // Tanzania
  ug: 'za', // Uganda
  rw: 'za', // Ruanda
  bi: 'za', // Burundi
  et: 'za', // Etiopía
  er: 'za', // Eritrea
  dj: 'za', // Yibuti
  so: 'za', // Somalia
  na: 'za', // Namibia
  bw: 'za', // Botsuana
  zw: 'za', // Zimbabue
  zm: 'za', // Zambia
  mz: 'za', // Mozambique
  mw: 'za', // Malaui
  ls: 'za', // Lesoto
  sz: 'za', // Esuatini
  mg: 'za', // Madagascar
  mu: 'za', // Mauricio
  sc: 'za', // Seychelles
  km: 'za', // Comoras
}
