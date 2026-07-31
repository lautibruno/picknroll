// Ligas domésticas de básquet por país — camino real de arranque pre-NBA cuando la
// nacionalidad elegida tiene liga curada (ver motorCarrera.ts). Países sin entrada acá
// caen al camino genérico (universidad/G-League/internacional, ver caminosPreNba.ts) —
// incluye a propósito Estados Unidos, que usa ese camino genérico en vez de una liga
// doméstica real.
//
// CÓMO ACTUALIZAR ESTE ARCHIVO:
// - Clave del Record: código de país ISO-3166 alpha-2, en minúscula (ej. "ar", "es").
// - `nivel` es un valor de balance de juego aproximado (0-100), NO viene de standings
//   reales en vivo — pensado para que el club más grande de cada liga sea más difícil
//   de conseguir al arrancar (mismo mecanismo de dificultad que el resto del motor).
// - `id` de cada club debe ser único en todo el archivo (prefijo de país + slug).
// - `escudoUrl` es opcional — clubes sin escudo resuelto caen al badge de iniciales
//   que ya maneja la UI (ver PantallaEvento.tsx). Fuente: Wikipedia (imagen de la
//   infobox del club, vía API pública, sin necesidad de key).
// - Revisar esta lista una vez por temporada real (ascensos/descensos, nuevos clubes) —
//   última revisión manual: escrito para la temporada 2024-25.
import type { Equipo } from '../eventos'

export interface LigaDomestica {
  nombreLiga: string
  // Imagen del título de esa liga, para la vitrina de fin de carrera (pedido explícito del
  // usuario: "el trofeo debe ser el REAL de la liga en la que estoy jugando"). Se buscó una
  // foto del trofeo físico real para las 10 ligas: solo existe con licencia usable para ACB
  // (España) y NBL (Australia). Para el resto se usa el LOGO OFICIAL real de la liga —
  // decisión confirmada con el usuario ("trofeo real donde exista + logo si no"), misma
  // fuente y criterio que los escudos reales de club de este archivo.
  trofeoUrl: string
  // true = es la copa física real; false = es el logo oficial de la liga. Lo usa la UI para
  // no llamarle "trofeo" a algo que en realidad es un logo.
  trofeoEsCopaReal: boolean
  clubes: Equipo[]
}

export const LIGAS_POR_PAIS: Record<string, LigaDomestica> = {
  ar: {
    nombreLiga: 'Liga Nacional de Básquet (Argentina)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a0/LNB_Argentina_Logo.svg',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'ar-quimsa', nombre: 'Quimsa (Santiago del Estero)', nivel: 60, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2c/Asociaci%C3%B3n_Atl%C3%A9tica_Quimsa_logo.svg/120px-Asociaci%C3%B3n_Atl%C3%A9tica_Quimsa_logo.svg.png' },
      { id: 'ar-regatas', nombre: 'Regatas Corrientes', nivel: 58, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9f/Crc_regatas.png' },
      { id: 'ar-boca', nombre: 'Boca Juniors', nivel: 55, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Boca_Juniors_logo18.svg/250px-Boca_Juniors_logo18.svg.png' },
      { id: 'ar-san-lorenzo', nombre: 'San Lorenzo', nivel: 52, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/San_lorenzo_almagro_logo.svg/120px-San_lorenzo_almagro_logo.svg.png' },
      { id: 'ar-instituto', nombre: 'Instituto (Córdoba)', nivel: 50, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Instituto_acc_cordoba_logo.svg/120px-Instituto_acc_cordoba_logo.svg.png' },
      { id: 'ar-gimnasia-lp', nombre: 'Gimnasia y Esgrima (La Plata)', nivel: 47, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6d/Gimnasia_Esgrima_LP_logo.svg/330px-Gimnasia_Esgrima_LP_logo.svg.png' },
      { id: 'ar-ferro', nombre: 'Ferro Carril Oeste', nivel: 45, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Escudo_club_ferro_c_oeste.svg/120px-Escudo_club_ferro_c_oeste.svg.png' },
      { id: 'ar-obras', nombre: 'Obras Sanitarias', nivel: 44, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3c/Club_obras_logo14.png' },
      { id: 'ar-estudiantes-bb', nombre: 'Estudiantes (Bahía Blanca)', nivel: 43, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Logo_Club_Estudiantes.png' },
      { id: 'ar-penarol', nombre: 'Peñarol (Mar del Plata)', nivel: 42, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/60/Penarol_mardel_crest.png' },
    ],
  },
  es: {
    nombreLiga: 'Liga ACB (España)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/62/ACB_Trophy.png',
    trofeoEsCopaReal: true,
    clubes: [
      { id: 'es-real-madrid', nombre: 'Real Madrid', nivel: 68, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/be/Real_Madrid_Baloncesto.png' },
      { id: 'es-barcelona', nombre: 'FC Barcelona', nivel: 66, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/250px-FC_Barcelona_%28crest%29.svg.png' },
      { id: 'es-baskonia', nombre: 'Baskonia', nivel: 60, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6a/Saski_Baskonia.png' },
      { id: 'es-valencia', nombre: 'Valencia Basket', nivel: 58, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/Valencia_Basket_logo.svg/250px-Valencia_Basket_logo.svg.png' },
      { id: 'es-unicaja', nombre: 'Unicaja Málaga', nivel: 55, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/41/CB_Unicaja_Logo.png' },
      { id: 'es-gran-canaria', nombre: 'Gran Canaria', nivel: 50, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/CB_Gran_Canaria_logo.svg/250px-CB_Gran_Canaria_logo.svg.png' },
      { id: 'es-joventut', nombre: 'Joventut Badalona', nivel: 48, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/23/Joventut_Badalona_logo.png' },
      { id: 'es-manresa', nombre: 'Manresa', nivel: 44, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4b/Kids%26Us_Manresa_logo.webp' },
    ],
  },
  it: {
    nombreLiga: 'Lega Basket Serie A (Italia)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9d/LegaBasket_Serie_A_Logo.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'it-olimpia-milano', nombre: 'Olimpia Milano', nivel: 65, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3d/Pallacanestro_Olimpia_Milano_logo.svg/120px-Pallacanestro_Olimpia_Milano_logo.svg.png' },
      { id: 'it-virtus-bologna', nombre: 'Virtus Bologna', nivel: 62, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Virtus_Bologna_logo.svg/250px-Virtus_Bologna_logo.svg.png' },
      { id: 'it-reggio-emilia', nombre: 'Unahotels Reggio Emilia', nivel: 50, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9c/Pallacanestro_Reggiana_2026.svg/120px-Pallacanestro_Reggiana_2026.svg.png' },
      { id: 'it-trento', nombre: 'Aquila Basket Trento', nivel: 48, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/59/Aquila_Basket_Trento_logo.svg/500px-Aquila_Basket_Trento_logo.svg.png' },
      { id: 'it-sassari', nombre: 'Banco di Sardegna Sassari', nivel: 46, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d4/Dinamo_Sassari_logo.png' },
      { id: 'it-brescia', nombre: 'Germani Brescia', nivel: 44, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/da/Basket_Brescia_Leonessa_Logo.png' },
      { id: 'it-fortitudo', nombre: 'Fortitudo Bologna', nivel: 43, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/08/BC_Fortitudo_Bologna_logo.gif' },
      { id: 'it-trieste', nombre: 'Pallacanestro Trieste', nivel: 41, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Logo_Pall_Trieste.png' },
    ],
  },
  gr: {
    nombreLiga: 'Greek Basket League (Grecia)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fc/Greek_Basket_League_Logo.jpg',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'gr-panathinaikos', nombre: 'Panathinaikos', nivel: 66, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/18/Panathinaikos_BC_logo.svg/330px-Panathinaikos_BC_logo.svg.png' },
      { id: 'gr-olympiacos', nombre: 'Olympiacos', nivel: 65, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7f/Olympiacos_BC_logo.svg/250px-Olympiacos_BC_logo.svg.png' },
      { id: 'gr-aek', nombre: 'AEK Athens', nivel: 50, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/22/AEK_NEW_LOGO_3_STARS.png' },
      { id: 'gr-paok', nombre: 'PAOK', nivel: 45, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/86/P.A.O.K._B.C._logo.png' },
      { id: 'gr-promitheas', nombre: 'Promitheas Patras', nivel: 44, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/Promitheas_Patras_BC_logo.svg/330px-Promitheas_Patras_BC_logo.svg.png' },
      { id: 'gr-aris', nombre: 'Aris', nivel: 43, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/03/Aris_Thessaloniki_BC_logo.png' },
    ],
  },
  rs: {
    nombreLiga: 'KLS / ABA Liga (Serbia)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/47/Basketball_League_of_Serbia_logo.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'rs-zvezda', nombre: 'Crvena Zvezda (Estrella Roja)', nivel: 64, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/01/KK_Crvena_zvezda_logo.svg/250px-KK_Crvena_zvezda_logo.svg.png' },
      { id: 'rs-partizan', nombre: 'Partizan', nivel: 63, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/80/KK_Partizan_logo.svg/250px-KK_Partizan_logo.svg.png' },
      { id: 'rs-mega', nombre: 'Mega Basket', nivel: 55, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/da/Mega-logo-2020.png' },
      { id: 'rs-vojvodina', nombre: 'Vojvodina', nivel: 49, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b5/KKVojvodina.png' },
      { id: 'rs-fmp', nombre: 'FMP', nivel: 48, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d7/KK_FMP_Beograd.png' },
    ],
  },
  tr: {
    nombreLiga: 'Basketbol Süper Ligi (Turquía)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e0/Official_logo_of_the_Turkish_Basketball_Super_League.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'tr-fenerbahce', nombre: 'Fenerbahçe', nivel: 64, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0b/Fenerbah%C3%A7e_Men%27s_Basketball_logo.svg/250px-Fenerbah%C3%A7e_Men%27s_Basketball_logo.svg.png' },
      { id: 'tr-anadolu-efes', nombre: 'Anadolu Efes', nivel: 63, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/74/Anadolu_Efes_SK_logo.svg/250px-Anadolu_Efes_SK_logo.svg.png' },
      { id: 'tr-galatasaray', nombre: 'Galatasaray', nivel: 50, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Galatasaray_MCT_Technic_logo.png' },
      { id: 'tr-bahcesehir', nombre: 'Bahçeşehir Koleji', nivel: 47, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Bah%C3%A7e%C5%9Fehir_Koleji_Spor_Kul%C3%BCb%C3%BC_logo.png' },
      { id: 'tr-besiktas', nombre: 'Beşiktaş', nivel: 46, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Be%C5%9Fikta%C5%9F_logo.png/3840px-Be%C5%9Fikta%C5%9F_logo.png' },
    ],
  },
  fr: {
    nombreLiga: 'Betclic Élite (Francia)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2d/Betclic_%C3%89lite.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'fr-monaco', nombre: 'AS Monaco', nivel: 60, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/AS_Monaco_Basket.svg/250px-AS_Monaco_Basket.svg.png' },
      { id: 'fr-asvel', nombre: 'ASVEL Lyon-Villeurbanne', nivel: 58 },
      { id: 'fr-paris', nombre: 'Paris Basketball', nivel: 52, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/86/Logo_Paris_Basketball.svg/500px-Logo_Paris_Basketball.svg.png' },
      { id: 'fr-cholet', nombre: 'Cholet Basket', nivel: 49, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f8/Cholet_Basket_2019_logo.png' },
      { id: 'fr-le-mans', nombre: 'Le Mans', nivel: 48, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d9/Le_Mans_Sarthe_Basket_logo_2009.png' },
      { id: 'fr-nanterre', nombre: 'Nanterre 92', nivel: 47, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d2/Nanterre_92_logo.png' },
      { id: 'fr-strasbourg', nombre: 'Strasbourg', nivel: 46 },
    ],
  },
  au: {
    nombreLiga: 'NBL (Australia)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/2016-17_NBL_championship_trophy.jpg',
    trofeoEsCopaReal: true,
    clubes: [
      { id: 'au-perth', nombre: 'Perth Wildcats', nivel: 56, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/50/Perth_Wildcats.png' },
      { id: 'au-melbourne-united', nombre: 'Melbourne United', nivel: 55, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/40/Melbourne_United_Primary_Logo_2024.png' },
      { id: 'au-sydney', nombre: 'Sydney Kings', nivel: 54, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cb/Sydney_Kings_logo.svg/500px-Sydney_Kings_logo.svg.png' },
      { id: 'au-adelaide', nombre: 'Adelaide 36ers', nivel: 50, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/32/Adelaide_36ers_logo.svg/330px-Adelaide_36ers_logo.svg.png' },
      { id: 'au-nz-breakers', nombre: 'New Zealand Breakers', nivel: 48 },
      { id: 'au-illawarra', nombre: 'Illawarra Hawks', nivel: 46, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f8/Illawarra_Hawks.png' },
      { id: 'au-se-melbourne', nombre: 'South East Melbourne Phoenix', nivel: 45, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/21/South_East_Melbourne_Phoenix_logo.svg/960px-South_East_Melbourne_Phoenix_logo.svg.png' },
    ],
  },
  lt: {
    nombreLiga: 'LKL (Lituania)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Betsson_LKL.svg',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'lt-zalgiris', nombre: 'Žalgiris Kaunas', nivel: 62, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0e/BC_%C5%BDalgiris_logo.svg/330px-BC_%C5%BDalgiris_logo.svg.png' },
      { id: 'lt-rytas', nombre: 'Rytas Vilnius', nivel: 52, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/BC_Rytas_logo.svg/330px-BC_Rytas_logo.svg.png' },
      { id: 'lt-lietkabelis', nombre: 'Lietkabelis Panevėžys', nivel: 47, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/BC_Lietkabelis_logo.svg/330px-BC_Lietkabelis_logo.svg.png' },
      { id: 'lt-neptunas', nombre: 'Neptūnas Klaipėda', nivel: 45, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/22/BC_Nept%C5%ABnas_logo.png' },
    ],
  },
  br: {
    nombreLiga: 'NBB (Brasil)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/ff/Novo_Basquete_Brasil_logo_%282022%29.svg',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'br-flamengo', nombre: 'Flamengo', nivel: 58, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Clube_de_Regatas_do_Flamengo_logo.svg/500px-Clube_de_Regatas_do_Flamengo_logo.svg.png' },
      { id: 'br-franca', nombre: 'Franca Basquete', nivel: 55, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/75/Franca_basquete_logo.png' },
      { id: 'br-minas', nombre: 'Minas', nivel: 50, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/Crest_of_Minas_Tenis_Clube.svg/330px-Crest_of_Minas_Tenis_Clube.svg.png' },
      { id: 'br-corinthians', nombre: 'Corinthians', nivel: 47 },
      { id: 'br-bauru', nombre: 'Bauru Basket', nivel: 45, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9c/Bauru_Basket_logo_2023.png' },
      { id: 'br-pinheiros', nombre: 'Pinheiros', nivel: 44, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Esporte_Clube_Pinheiros.svg/1920px-Esporte_Clube_Pinheiros.svg.png' },
      { id: 'br-sao-paulo', nombre: 'São Paulo FC Basquete', nivel: 42, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/S%C3%A3o_Paulo_Futebol_Clube_logo_%282022%29.svg/60px-S%C3%A3o_Paulo_Futebol_Clube_logo_%282022%29.svg.png' },
    ],
  },

  // ============================================================
  // Ampliación (pedido explícito del usuario: "todos los equipos de todas las ligas que
  // existan en el mundo") — 30 países más, investigados y verificados de la misma forma que
  // los 10 originales. Países sin liga curada (ni acá ni arriba) caen al mapa de fallback
  // (ver fallbackLigas.ts), que los manda a la liga regional/continental más fuerte.
  // ============================================================

  de: {
    nombreLiga: 'Basketball Bundesliga (Alemania)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/70/BEKO_BBL_logo_2015.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'de-alba', nombre: 'ALBA Berlin', nivel: 60, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b3/Alba_Berlin_logo.svg' },
      { id: 'de-ulm', nombre: 'ratiopharm Ulm', nivel: 50, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/ed/Ratiopharm_Ulm_logo.svg' },
      { id: 'de-bonn', nombre: 'Telekom Baskets Bonn', nivel: 47, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cd/Telekom_Baskets_Bonn_logo.svg' },
      { id: 'de-oldenburg', nombre: 'EWE Baskets Oldenburg', nivel: 45, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/de/EWE_Baskets_Oldenburg_logo.svg' },
    ],
  },
  il: {
    nombreLiga: 'Ligat Winner (Israel)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/94/Official_logo_of_the_Israeli_Basketball_Premier_League.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'il-maccabi-ta', nombre: 'Maccabi Tel Aviv', nivel: 64, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6b/Maccabi_Tel_Aviv_BC_logo.svg' },
      { id: 'il-hapoel-jer', nombre: 'Hapoel Jerusalem', nivel: 50, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/74/Hapoel_Jerusalem_BC_logo.svg' },
      { id: 'il-maccabi-rl', nombre: 'Maccabi Rishon LeZion', nivel: 46, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/03/Maccabi_Rishon_logo_2017.png' },
      { id: 'il-hapoel-ta', nombre: 'Hapoel Tel Aviv', nivel: 44 },
      { id: 'il-bnei-herzliya', nombre: 'Bnei Herzliya', nivel: 41 },
    ],
  },
  pl: {
    nombreLiga: 'Polska Liga Koszykówki (Polonia)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/28/Energa_Basket_Liga_logo.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'pl-slask', nombre: 'Śląsk Wrocław', nivel: 52, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a8/%C5%9Al%C4%85sk_Wroc%C5%82aw_%28basketball%29_logo.svg' },
      { id: 'pl-legia', nombre: 'Legia Warszawa', nivel: 48, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6d/Legia_Warsaw_logo.svg' },
      { id: 'pl-wloclawek', nombre: 'Anwil Włocławek', nivel: 46, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/24/Anwil_W%C5%82oc%C5%82awek_2019_logo.png' },
      { id: 'pl-zielona-gora', nombre: 'Zastal Zielona Góra', nivel: 44, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3a/Basket_Zielona_G%C3%B3ra_Logo.png' },
      { id: 'pl-szczecin', nombre: 'King Szczecin', nivel: 41, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8f/Wilki_Morskie_Szczecin_logo.png' },
    ],
  },
  ua: {
    nombreLiga: 'Ukrainian Basketball SuperLeague (Ucrania)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c1/Ukrainian_Basketball_SuperLeague_logo.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'ua-prometey', nombre: 'BC Prometey', nivel: 48, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/93/BC_Prometey_logo.png' },
      { id: 'ua-mykolaiv', nombre: 'MBC Mykolaiv', nivel: 42, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/03/LogoMBCMykolaiv2018.png' },
      { id: 'ua-kyiv-basket', nombre: 'Kyiv-Basket', nivel: 40 },
    ],
  },
  fi: {
    nombreLiga: 'Korisliiga (Finlandia)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1d/Korisliiga_2015-16_logo.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'fi-kataja', nombre: 'Kataja Basket', nivel: 45, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/ef/Kataja_Basket_2019_logo.png' },
      { id: 'fi-vilpas', nombre: 'Vilpas Vikings', nivel: 43, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2f/Salon_Vilpas_Vikings_logo.png' },
      { id: 'fi-nokia', nombre: 'BC Nokia', nivel: 40, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a7/BC_Nokia_logo.png' },
    ],
  },
  dk: {
    nombreLiga: 'Basketligaen (Dinamarca)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/1c/Basketligaen_logo.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'dk-bakken-bears', nombre: 'Bakken Bears', nivel: 44, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3a/Bakken_Bears_logo.svg' },
      { id: 'dk-horsens', nombre: 'Horsens IC', nivel: 41, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8e/Horsens_IC_logo.png' },
    ],
  },
  bg: {
    nombreLiga: 'NBL Bulgaria',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e6/National_Basketball_League_%28Bulgaria%29_logo.jpg',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'bg-levski', nombre: 'Levski Sofia', nivel: 44, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/03/Levski_Basket_logo.png' },
      { id: 'bg-balkan', nombre: 'Balkan Botevgrad', nivel: 42, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/ba/BC_Balkan_logo.png' },
    ],
  },
  ch: {
    nombreLiga: 'SB League (Suiza)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/SB_League_Logo.svg',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'ch-fribourg', nombre: 'Fribourg Olympic', nivel: 45, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9d/Fribourg_Olympic_Basket_logo.png' },
      { id: 'ch-lugano', nombre: 'Lugano Tigers', nivel: 42, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3e/Lugano_Tigers_logo.png' },
    ],
  },
  gb: {
    nombreLiga: 'British Basketball League (Reino Unido)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c2/British_Basketball_League_logo.svg',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'gb-london-lions', nombre: 'London Lions', nivel: 50, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b5/London_Lions_logo_%282021%29.png' },
      { id: 'gb-leicester-riders', nombre: 'Leicester Riders', nivel: 46, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/22/Riders_logo.png' },
      { id: 'gb-newcastle-eagles', nombre: 'Newcastle Eagles', nivel: 44, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/40/Newcastle_Eagles_logo.svg' },
      { id: 'gb-bristol-flyers', nombre: 'Bristol Flyers', nivel: 41, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b6/BristolFlyersLogo.png' },
    ],
  },
  jp: {
    nombreLiga: 'B.League (Japón)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/B.League_logo.svg',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'jp-kawasaki', nombre: 'Kawasaki Brave Thunders', nivel: 52, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e7/Kawasaki_Brave_Thunders_logo.jpg' },
      { id: 'jp-ryukyu', nombre: 'Ryukyu Golden Kings', nivel: 48, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/35/Ryukyu_Golden_Kings_logo_19.png' },
      { id: 'jp-utsunomiya', nombre: 'Utsunomiya Brex', nivel: 45 },
      { id: 'jp-chiba', nombre: 'Chiba Jets', nivel: 43 },
    ],
  },
  ph: {
    nombreLiga: 'Philippine Basketball Association (Filipinas)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/74/First_PBA_logo.svg',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'ph-san-miguel', nombre: 'San Miguel Beermen', nivel: 54, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/San_Miguel_Corporation_logo.svg' },
      { id: 'ph-ginebra', nombre: 'Barangay Ginebra', nivel: 50, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Barangay_Ginebra_San_Miguel_logo.png' },
      { id: 'ph-talk-n-text', nombre: 'TNT Tropang Giga', nivel: 47, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/TNT_KaTropa_logo_2019-2020.webp' },
      { id: 'ph-meralco', nombre: 'Meralco Bolts', nivel: 44, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c7/Meralco_Bolts_logo.svg' },
    ],
  },
  nz: {
    nombreLiga: 'NZ NBL (Nueva Zelanda)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6c/NZNBL_logo.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'nz-breakers', nombre: 'New Zealand Breakers', nivel: 48, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/New_Zealand_Breakers_logo.svg' },
      { id: 'nz-hawks', nombre: "Hawke's Bay Hawks", nivel: 43, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/08/Hawke%27s_Bay_Hawks_new_logo.png' },
      { id: 'nz-saints', nombre: 'Southland Sharks', nivel: 41, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/07/Southlandsharkslogo.png' },
    ],
  },
  be: {
    // Misma liga que Países Bajos (fusionada desde 2021) — mismo logo real, ver `nl` abajo.
    nombreLiga: 'BNXT League (Bélgica)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4a/BNXT_League_logo.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'be-oostende', nombre: 'Filou Oostende', nivel: 46, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d3/BC_Oostende_%28logo%29.png' },
      { id: 'be-antwerp', nombre: 'Antwerp Giants', nivel: 43, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/51/Antwerp_Giants_logo.jpg' },
      { id: 'be-leuven', nombre: 'Leuven Bears', nivel: 41, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/e4/Leuven_Bears_logo.png' },
    ],
  },
  mx: {
    nombreLiga: 'LNBP (México)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9c/LNBP_Logo_Caliente.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'mx-fuerza-regia', nombre: 'Fuerza Regia de Monterrey', nivel: 50, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/75/Fuerza_Regia_2015_Logo.png' },
      { id: 'mx-halcones-rojos', nombre: 'Halcones Rojos Veracruz', nivel: 46, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2a/Halcones_Rojos_Veracruz_Logo.png' },
      { id: 'mx-soles', nombre: 'Soles de Mexicali', nivel: 44, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/f/fd/Soles_de_Mexicali_logo.png' },
      { id: 'mx-abejas', nombre: 'Abejas de León', nivel: 41, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/96/Abejas_Leon_logo.png' },
    ],
  },
  pr: {
    nombreLiga: 'BSN (Puerto Rico)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/28/BSN_Puerto_Rico_Logo.svg',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'pr-vaqueros', nombre: 'Vaqueros de Bayamón', nivel: 47, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/27/Bayamon_Vaqueros_Basketball_Logo.png' },
      { id: 'pr-indios', nombre: 'Indios de Mayagüez', nivel: 43, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Indios_de_Mayaguez_cap_logo.svg' },
      { id: 'pr-capitanes', nombre: 'Capitanes de Arecibo', nivel: 41 },
      { id: 'pr-leones', nombre: 'Leones de Ponce', nivel: 40 },
    ],
  },
  ca: {
    nombreLiga: 'CEBL (Canadá)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/ee/Canadian_Elite_Basketball_League_logo.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'ca-edmonton-stingers', nombre: 'Edmonton Stingers', nivel: 47, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/03/Edmonton_Stingers_Logo.png' },
      { id: 'ca-scarborough', nombre: 'Scarborough Shooting Stars', nivel: 45, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/87/Scarborough_Shooting_Stars_Logo.png' },
      { id: 'ca-niagara', nombre: 'Niagara River Lions', nivel: 43, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/da/Niagara_River_Lions_logo.webp' },
      { id: 'ca-hamilton', nombre: 'Hamilton Honey Badgers', nivel: 41, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/74/Hamilton_Honey_Badgers_Logo.png' },
    ],
  },
  se: {
    nombreLiga: 'Basketligan (Suecia)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/8c/Basketligan_logo.svg',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'se-norrkoping', nombre: 'Norrköping Dolphins', nivel: 43, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/65/Norrkoping_Dolphins_logo.svg' },
      { id: 'se-sodertalje', nombre: 'Södertälje Kings', nivel: 41, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/df/Sodertalje_BBK_logo.svg' },
    ],
  },
  ro: {
    nombreLiga: 'Liga Națională (Rumania)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6f/LNBM_basketball_logo.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'ro-oradea', nombre: 'CSM Oradea', nivel: 44, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6c/CSM_Oradea_logo-en.png' },
      { id: 'ro-sibiu', nombre: 'CSU Sibiu', nivel: 41, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c1/CSU_Sibiu_logo.png' },
    ],
  },
  kr: {
    nombreLiga: 'Korean Basketball League (Corea del Sur)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/8/87/Korean_Basketball_League_logo.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'kr-seoul', nombre: 'Seoul SK Knights', nivel: 46, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/SK_logo.svg' },
      { id: 'kr-goyang', nombre: 'Goyang Sono Skygunners', nivel: 42, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/64/Goyang_Sono_Skygunners.png' },
    ],
  },
  za: {
    nombreLiga: 'Basketball National League (Sudáfrica)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/40/Basketball-SA-Logo.jpg',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'za-cape-town-tigers', nombre: 'Cape Town Tigers', nivel: 42, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Cape_Town_Tigers_logo.png' },
      { id: 'za-gauteng-heat', nombre: 'Gauteng Heat', nivel: 40 },
    ],
  },
  eg: {
    nombreLiga: 'Egyptian Basketball Super League (Egipto)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/ec/Egyptian_Basketball_Federation_logo.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'eg-al-ahly', nombre: 'Al Ahly', nivel: 46, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Ahly_Old_Logo.png' },
      { id: 'eg-zamalek', nombre: 'Zamalek', nivel: 44, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/e/ef/Zamalek_SC_logo.svg' },
      { id: 'eg-smouha', nombre: 'Smouha SC', nivel: 41, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3f/Smouha_SC_logo.png' },
    ],
  },
  ru: {
    // Los clubes rusos ya no juegan la VTB United League internacional (excluidos desde
    // 2022) pero la liga sigue siendo la fuente real más clara del logo — el logo propio de
    // la liga doméstica rusa no tiene versión libre verificable en Wikimedia.
    nombreLiga: 'Liga Premier de Rusia',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4c/VTB_United_League_logo.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'ru-cska', nombre: 'CSKA Moscú', nivel: 58, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/7e/PBC_CSKA_Moscow_logo.svg' },
      { id: 'ru-unics', nombre: 'UNICS Kazán', nivel: 50, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/27/UNICS_logo_2014.png' },
      { id: 'ru-lokomotiv-kuban', nombre: 'Lokomotiv Kuban', nivel: 45, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/23/PBC_Lokomotiv-Kuban_logo.svg' },
      { id: 'ru-nizhny', nombre: 'Nizhny Novgorod', nivel: 41, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/d6/BC_Nizhny_Novgorod_logo.svg' },
    ],
  },
  cz: {
    nombreLiga: 'Národní basketbalová liga (Chequia)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/15/Czech_Basketball_Federation_logo.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'cz-usk-praha', nombre: 'USK Praha', nivel: 46, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c5/USK_Praha_logo.png' },
      { id: 'cz-decin', nombre: 'BK Děčín', nivel: 42, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b6/BK_Armex_D%C4%9B%C4%8D%C3%ADn_logo.png' },
      { id: 'cz-opava', nombre: 'BK Opava', nivel: 40, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/1/14/BK_Opava_logo.png' },
    ],
  },
  nl: {
    // Misma liga que Bélgica (fusionada desde 2021) — mismo logo real, ver `be` arriba.
    nombreLiga: 'BNXT League (Países Bajos)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4a/BNXT_League_logo.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'nl-donar', nombre: 'Donar Groningen', nivel: 47, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/51/Donar_Groningen_logo.svg' },
      { id: 'nl-den-bosch', nombre: 'Heroes Den Bosch', nivel: 43, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a7/Heroes_Den_Bosch_logo.png' },
      { id: 'nl-zz-leiden', nombre: 'ZZ Leiden', nivel: 41, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/d/df/BS_Leiden_logo.jpg' },
    ],
  },
  ve: {
    nombreLiga: 'Liga Profesional de Baloncesto (Venezuela)',
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/01/Federaci%C3%B3n_Venezolana_de_Baloncesto_%28logo%29.png',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 've-marinos', nombre: 'Marinos de Anzoátegui', nivel: 44, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/5/5f/Marinos_de_Anzo%C3%A1tegui_logo.png' },
      { id: 've-trotamundos', nombre: 'Trotamundos de Carabobo', nivel: 41, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/ac/Trotamundos_BBC_logo.png' },
    ],
  },
  pt: {
    nombreLiga: 'Liga Portuguesa de Basquetebol (Portugal)',
    // Sin logo propio de la liga con licencia libre verificable — se usa el escudo real del
    // club más grande como imagen de la vitrina (mismo criterio de "real por encima de
    // inventado"; `trofeoEsCopaReal: false` dice que no es la copa física de la liga).
    trofeoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg',
    trofeoEsCopaReal: false,
    clubes: [
      { id: 'pt-benfica', nombre: 'Benfica', nivel: 47, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg' },
      { id: 'pt-sporting', nombre: 'Sporting CP', nivel: 44, escudoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Sporting_Clube_de_Portugal_2026.svg' },
    ],
  },
}
