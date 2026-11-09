// Color de cada letra de la figura. Las matrices no llevan colores: cada letra es un papel (piel,
// pelo, ropa de arriba...) y esta tabla lo resuelve según el aspecto elegido.
//   S/s piel y sombra    B mejilla   m boca   O interior de la boca   K vello facial
//   w/e ojo: blanco y pupila (v/f son la fila baja, que al parpadear queda como pestaña)
//   H/h/d pelo, reflejo y sombra     z pelo rapado
//   D/L/M prenda de arriba, luz y sombra     T ribete
//   N/u/n prenda de abajo, luz y sombra      W blanco hueso (camisa, suela, cordones)
//   R/Q calzado y suela              A/a complemento y su sombra     G gafas   P/Y pétalo y centro
//   Z cejas y párpados (un tono muy oscuro de la piel)   F peca o lunar   C cicatriz   q lágrima
//   r tono claro del calzado (cordones, puños)
//   X contorno (también el que separa el brazo del torso en el perfil)
import { PAL, shade, tint } from '../palette.js'
// Negro azulado del contorno; es el mismo del resto de personajes.
export const OUTLINE = '#14102a'
const EYE_WHITE = '#f6f0e0'

function channels(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function toHex([r, g, b]) {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

// Mezcla dos colores: con `amount` 0 queda el primero y con 1 el segundo.
export function mix(a, b, amount) {
  const ca = channels(a)
  const cb = channels(b)
  return toHex(ca.map((v, i) => Math.round(v * (1 - amount) + cb[i] * amount)))
}

function luminance(hex) {
  const linear = (v) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const [r, g, b] = channels(hex).map(linear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// Un pelo casi negro se fundiría con el contorno. Se levanta el tono base hasta una luminosidad
// mínima, conservando el matiz (el «tinta» queda como un añil), y de ahí salen sus sombras.
const HAIR_MIN_LUMINANCE = 0.07

function toHsl(hex) {
  const [r, g, b] = channels(hex).map((v) => v / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h /= 6
  return [h, s, l]
}

function fromHsl([h, s, l]) {
  const hue = (p, q, t) => {
    const x = (t + 1) % 1
    if (x < 1 / 6) return p + (q - p) * 6 * x
    if (x < 1 / 2) return q
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6
    return p
  }
  if (s === 0) return toHex([l, l, l].map((v) => Math.round(v * 255)))
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return toHex([hue(p, q, h + 1 / 3), hue(p, q, h), hue(p, q, h - 1 / 3)].map((v) => Math.round(v * 255)))
}

export function liftHair(hex) {
  const [h, s, l0] = toHsl(hex)
  let l = l0
  let lifted = hex
  while (luminance(lifted) < HAIR_MIN_LUMINANCE && l < 0.6) {
    l += 0.02
    lifted = fromHsl([h, s, l])
  }
  return lifted
}

// Con `blink` los ojos se cierran: las dos filas altas pasan a piel y la baja queda como pestaña.
export function avatarColors(look, blink = false) {
  const hair = liftHair(look.hair)
  const lash = shade(look.skin, 0.62)
  const pupil = shade(look.eyes, 0.7)
  return {
    X: OUTLINE,
    S: look.skin,
    s: shade(look.skin, 0.84),
    B: mix(look.skin, '#e8607a', 0.4),
    m: shade(mix(look.skin, '#c0405a', 0.65), 0.86),
    O: '#2a1a2e',
    K: shade(look.beardColor, 0.85),
    Z: shade(look.skin, 0.42),
    F: shade(mix(look.skin, '#8a3f2c', 0.4), 0.78),
    C: tint(look.skin, 0.55),
    q: '#7fd0dc',
    w: blink ? look.skin : EYE_WHITE,
    e: blink ? look.skin : pupil,
    v: blink ? lash : EYE_WHITE,
    f: blink ? lash : pupil,
    H: hair,
    h: tint(hair, 0.34),
    d: shade(hair, 0.78),
    z: shade(mix(look.skin, hair, 0.45), 0.95),
    A: look.accessoryColor,
    a: shade(look.accessoryColor, 0.7),
    T: look.trim,
    D: look.topColor,
    L: tint(look.topColor, 0.2),
    M: shade(look.topColor, 0.72),
    N: look.bottomColor,
    u: tint(look.bottomColor, 0.2),
    n: shade(look.bottomColor, 0.72),
    R: look.shoesColor,
    Q: shade(look.shoesColor, 0.6),
    r: tint(look.shoesColor, 0.38),
    W: '#f1e6cf',
    G: '#3a3050',
    P: '#f29bb4',
    Y: PAL.saffron,
  }
}

const SAMPLE_LOOK = {
  skin: '#f0c09a',
  eyes: '#2a1a2e',
  hair: '#8a3f2c',
  beardColor: '#5a3a28',
  accessoryColor: '#f2b134',
  topColor: '#7a3f8f',
  bottomColor: '#3a4a7a',
  shoesColor: '#7a4f35',
  trim: '#f2b134',
}

// Letras que reconoce la paleta: las pruebas rechazan cualquier otra en una matriz.
export const LETTERS = Object.keys(avatarColors(SAMPLE_LOOK))
