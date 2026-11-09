// Bioma de invierno de la portada. Con la nevada el valle se funde con una tercera versión de sí mismo:
// la hierba y las copas se cubren de nieve, las cumbres y los tejados llevan su capa blanca y en el
// prado salen montones de nieve, charcos helados y un muñeco. Se construye una sola vez a partir del
// paisaje de primavera (sin sus flores) y los tres biomas se funden por transparencia.
import { seeded } from './palette.js'
import { dot, ellipse, hash2, makeCanvas, rect } from './pixelKit.js'
import { isBlossom, isGreen, repaintSteps } from './titleRecolor.js'
import { drain } from './sliced.js'

const MEADOW_TOP = 124
export const SNOW = '#f6faff'
export const SNOW_SHADE = '#c9d8ee'
const SNOW_DEEP = '#9fb4d6'

// Capa de nieve sobre un sprite: en cada columna, desde su primer píxel opaco hacia abajo, dos o tres
// filas de blanco con el borde festoneado. Sirve igual para tejados, copas y la herrería.
export function snowCap(sprite) {
  const { width, height } = sprite
  const capped = makeCanvas(width, height)
  const g = capped.getContext('2d')
  g.drawImage(sprite, 0, 0)
  const { data } = g.getImageData(0, 0, width, height)
  const opaque = (x, y) => data[(y * width + x) * 4 + 3] > 0
  for (let x = 0; x < width; x++) {
    let top = 0
    while (top < height && !opaque(x, top)) top++
    if (top === height) continue
    const depth = 2 + (hash2(x, 3, 17) > 0.55 ? 1 : 0)
    for (let i = 0; i < depth && top + i < height; i++) {
      if (opaque(x, top + i)) dot(g, x, top + i, i === depth - 1 && depth === 3 ? SNOW_SHADE : SNOW)
    }
  }
  return capped
}

// Cumbres nevadas: la franja alta de cada montaña se pone blanca con un borde irregular.
export function paintSnowyPeaks(g, tops, width) {
  for (let x = 0; x < width; x++) {
    tops.forEach(({ top, depth }) => {
      const base = top(x)
      const reach = depth + Math.round(hash2(x, 9, 5) * 2)
      for (let i = 0; i < reach; i++) dot(g, x, base + i, i === reach - 1 ? SNOW_SHADE : SNOW)
    })
  }
}

// La hierba y las copas pasan a nieve conservando sus luces y sombras (las más oscuras quedan azuladas,
// para que se siga leyendo la forma de cada árbol); los rosas del cerezo, a flor con escarcha.
export function* recolorWinterSteps(g, width, height) {
  yield* repaintSteps(g, width, height, (h, s, l) => {
    if (isGreen(h, s)) return [212, 0.4, Math.min(0.97, 0.38 + l * 1.05)]
    if (isBlossom(h, s)) return [335, 0.45, Math.min(0.95, 0.74 + l * 0.2)]
    return null
  })
}

export const recolorWinter = (g, width, height) => drain(recolorWinterSteps(g, width, height))

// Montón de nieve: cuerpo blanco con la base en sombra y un brillo arriba.
function drift(g, x, y, rx) {
  ellipse(g, x, y + 1, rx, 2.4, SNOW_SHADE)
  ellipse(g, x, y, rx, 2.2, SNOW)
  dot(g, x - Math.floor(rx / 3), y - 1, '#ffffff')
}

// Charco helado: hielo claro con un reflejo y el borde más oscuro.
function icePatch(g, x, y, rx) {
  ellipse(g, x, y, rx, 2, '#8fb3d4')
  ellipse(g, x, y - 0.4, rx - 1, 1.2, '#cfe8f4')
  dot(g, x - Math.floor(rx / 2), y - 1, '#ffffff')
  dot(g, x + 1, y, '#a9d0e6')
}

// Muñeco de nieve: tres bolas, ojos de carbón, nariz de zanahoria, bufanda y gorro.
export function snowman(g, x, y) {
  ellipse(g, x, y - 3, 6, 4.5, SNOW_DEEP)
  ellipse(g, x, y - 4, 6, 4.5, SNOW)
  ellipse(g, x, y - 11, 4.5, 4, SNOW_DEEP)
  ellipse(g, x, y - 12, 4.5, 4, SNOW)
  ellipse(g, x, y - 19, 3.5, 3.4, SNOW_DEEP)
  ellipse(g, x, y - 20, 3.5, 3.4, SNOW)
  rect(g, x - 3, y - 15, 7, 2, '#d6384f')
  rect(g, x + 2, y - 14, 2, 4, '#d6384f')
  dot(g, x - 1, y - 21, '#14102a')
  dot(g, x + 1, y - 21, '#14102a')
  rect(g, x, y - 19, 3, 1, '#e8872a')
  ;[-8, -6, -3].forEach((dy) => dot(g, x, y + dy - 4, '#14102a'))
  rect(g, x - 3, y - 25, 7, 2, '#2e2d5a')
  rect(g, x - 2, y - 28, 5, 3, '#2e2d5a')
  rect(g, x - 3, y - 25, 7, 1, '#d6384f')
}

// Construye el lienzo de invierno: `land` es el paisaje (ya con montañas y tejados nevados), que se
// repinta en blanco, y encima se reparten los detalles de la estación solo sobre hierba.
export function buildWinterLand(land) {
  const { width, height } = land
  const g = land.getContext('2d')
  const original = g.getImageData(0, 0, width, height).data
  const onGrass = (x, y) => {
    const i = (y * width + x) * 4
    return original[i + 1] > original[i] && original[i + 3] > 0
  }
  const rand = seeded(47)
  const spot = () => {
    for (let tries = 0; tries < 40; tries++) {
      const x = 6 + Math.floor(rand() * (width - 12))
      const y = MEADOW_TOP + 8 + Math.floor(rand() * (height - MEADOW_TOP - 16))
      if (onGrass(x, y)) return { x, y }
    }
    return { x: 60, y: 168 }
  }
  const drifts = Array.from({ length: 16 }, (_, i) => ({ ...spot(), rx: 4 + (i % 4) * 2 }))
  const ice = Array.from({ length: 3 }, (_, i) => ({ ...spot(), rx: 6 + (i % 2) * 2 }))
  const twinkles = Array.from({ length: 60 }, spot)

  recolorWinter(g, width, height)

  ice.forEach(({ x, y, rx }) => icePatch(g, x, y, rx))
  drifts.sort((a, b) => a.y - b.y).forEach(({ x, y, rx }) => drift(g, x, y, rx))
  twinkles.forEach(({ x, y }, i) => dot(g, x, y, i % 3 === 0 ? '#ffffff' : SNOW_SHADE))
  snowman(g, 150, 164)
  return land
}
