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
  clubes: Equipo[]
}

export const LIGAS_POR_PAIS: Record<string, LigaDomestica> = {
  ar: {
    nombreLiga: 'Liga Nacional de Básquet (Argentina)',
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
    clubes: [
      { id: 'lt-zalgiris', nombre: 'Žalgiris Kaunas', nivel: 62, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0e/BC_%C5%BDalgiris_logo.svg/330px-BC_%C5%BDalgiris_logo.svg.png' },
      { id: 'lt-rytas', nombre: 'Rytas Vilnius', nivel: 52, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/BC_Rytas_logo.svg/330px-BC_Rytas_logo.svg.png' },
      { id: 'lt-lietkabelis', nombre: 'Lietkabelis Panevėžys', nivel: 47, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/BC_Lietkabelis_logo.svg/330px-BC_Lietkabelis_logo.svg.png' },
      { id: 'lt-neptunas', nombre: 'Neptūnas Klaipėda', nivel: 45, escudoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/22/BC_Nept%C5%ABnas_logo.png' },
    ],
  },
  br: {
    nombreLiga: 'NBB (Brasil)',
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
}
