// Paleta del Valle del Bucle. Los mismos valores viven como tokens en index.css.
export const PAL = {
  ink: '#1c1b3a',
  ink2: '#2e2d5a',
  dusk: '#3b3572',
  mist: '#7a6ab0',
  moss: '#4f7f3f',
  mossDark: '#3a6a3a',
  meadow: '#a3c14f',
  lagoon: '#3e9bb0',
  lagoonLight: '#7fd0dc',
  saffron: '#f2b134',
  saffronLight: '#f8d77a',
  tile: '#d4503a',
  tileDark: '#b8402c',
  bone: '#f1e6cf',
  wall: '#e8d3a8',
  wallDark: '#c9b994',
  earth: '#b98f5a',
  earthLight: '#d2ad74',
  earthDark: '#9c7547',
  stone: '#5c5a7a',
  stoneLight: '#7a789a',
  plum: '#7a3f8f',
  teal: '#2f8f8b',
}

// Mezcla un color hexadecimal con negro para sombrear sin salirse de la familia.
export function shade(hex, amount = 0.72) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.round(((n >> 16) & 255) * amount)
  const g = Math.round(((n >> 8) & 255) * amount)
  const b = Math.round((n & 255) * amount)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

// Generador pseudoaleatorio con semilla: el mundo se ve igual en cada visita.
export function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
