console.log("PUBG Mortar Calculator — created by wertikk");

// ============================================================
// PUBG Mortar Calculator — app.js
// ============================================================

// ------ MAP CONFIG ------------------------------------------
// mapSizeM: real in-game map side length in metres
// gridM:    grid line interval (metres) drawn on canvas
// gridLabel: how to label major grid squares
// -------------------------------------------------------
const MAPS = {
  taego: {
    name: 'Taego',
    info: 'Taego — 8×8 km',
    image: 'maps/taego.png',
    mapSizeM: 8000,
    gridM: 1000,
    gridAlpha: 0.30,
  },
  rondo: {
    name: 'Rondo',
    info: 'Rondo — 8×8 km',
    image: 'maps/rondo.png',
    mapSizeM: 8000,
    gridM: 1000,
    gridAlpha: 0.30,
  },
  sanhok: {
    name: 'Sanhok',
    info: 'Sanhok — 4×4 km',
    image: 'maps/sanhok.png',
    mapSizeM: 4000,
    gridM: 500,
    gridAlpha: 0.28,
  },
  erangel: {
    name: 'Erangel',
    info: 'Erangel — 8×8 km',
    image: 'maps/erangel.png',
    mapSizeM: 8000,
    gridM: 1000,
    gridAlpha: 0.30,
  },
  miramar: {
    name: 'Miramar',
    info: 'Miramar — 8×8 km',
    image: 'maps/miramar.png',
    mapSizeM: 8000,
    gridM: 1000,
    gridAlpha: 0.30,
  },
  vikendi: {
    name: 'Vikendi',
    info: 'Vikendi — 6×6 km',
    image: 'maps/vikendi.png',
    mapSizeM: 6000,
    gridM: 1000,
    gridAlpha: 0.30,
  },
  karakin: {
    name: 'Karakin',
    info: 'Karakin — 2×2 km',
    image: 'maps/karakin.png',
    mapSizeM: 2000,
    gridM: 250,
    gridAlpha: 0.28,
  },
  deston: {
    name: 'Deston',
    info: 'Deston — 8×8 km',
    image: 'maps/deston.png',
    mapSizeM: 8000,
    gridM: 1000,
    gridAlpha: 0.30,
  },
  paramo: {
    name: 'Paramo',
    info: 'Paramo — 3×3 km',
    image: 'maps/paramo.png',
    mapSizeM: 3000,
    gridM: 500,
    gridAlpha: 0.28,
  },
};
