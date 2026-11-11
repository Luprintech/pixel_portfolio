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
  rose: '#f4b8cc',
  // Amarillo pastel de las respuestas al puntero y del retrato del diálogo (igual que `--accent-hover`).
  butter: '#fbe6a2',
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

// Escalas de tonos, de oscuro a claro, para sombrear con cuatro o cinco pasos
// sin salirse de las familias de la paleta base.
export const TONE = {
  grass: ['#34643a', '#4f7f3f', '#62933f', '#7da844', '#a3c14f'],
  earth: ['#8a6a40', '#b98f5a', '#cba36a', '#dfbf86', '#efd9a8'],
  water: ['#2f7a92', '#3e9bb0', '#5cb5c6', '#8fd3dd', '#d3f0f2'],
  sand: ['#cdb67f', '#e2cf9a'],
  wood: ['#5a3a28', '#7a4f35', '#9a6a45', '#b98458'],
  wall: ['#c9b994', '#e8d3a8', '#f4e8c8'],
  stone: ['#6c6a8c', '#8d8aa8', '#aaa7c4'],
  blossom: ['#c4577f', '#e07a9c', '#f09ab6', '#f8bfd0', '#fde0e8'],
}

// Mezcla un color hexadecimal con blanco para sacar su tono claro.
export function tint(hex, amount = 0.25) {
  const n = parseInt(hex.slice(1), 16)
  const mix = (c) => Math.round(c + (255 - c) * amount)
  const r = mix((n >> 16) & 255)
  const g = mix((n >> 8) & 255)
  const b = mix(n & 255)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
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
