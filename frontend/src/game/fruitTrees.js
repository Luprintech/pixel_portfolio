// Los frutales del valle: naranjos (homenaje a Córdoba) y manzanos. Cada uno se dibuja en tres estados que siguen las estaciones del valle
// (`valleSky.js`: la base es la primavera de flores, la lluvia lo pasa al otoño y la nevada al invierno): el estado `season` es 0 (primavera),
// 1 (otoño) o 2 (invierno). La escena registra los tres como base, `:autumn` y `:winter` y el cielo los funde con el tiempo (ver `worldAssets.js`),
// así que un árbol cambia a la vez que el suelo y nunca al azar ni al acercarse la viajera. El valle no tiene verano propio.
import { TONE } from './palette.js'
import { dot, makeCanvas, noise, outline, rect } from './pixelKit.js'

const [WOOD0, WOOD1, WOOD2] = TONE.wood
const [STONE0, STONE1, STONE2] = TONE.stone

export const FRUIT_KINDS = ['orangeTree', 'appleTree']
export const isFruitTree = (kind) => FRUIT_KINDS.includes(kind)
// Estados por orden de variante: lo que dibuja cada uno y el `propSprite` que pide `worldAssets.js` para cada capa.
export const FRUIT_STATES = ['spring', 'autumn', 'winter']
export const FRUIT_NAMES = { orangeTree: 'naranjo', appleTree: 'manzano' }

// Estación del valle según el cielo (la misma que mira el cielo para fundir las capas): con la nevada, invierno; con la lluvia, otoño.
export const fruitSeasonOf = (sky) => (sky?.winter >= 0.5 ? 'winter' : sky?.autumn >= 0.5 ? 'autumn' : 'spring')

// Qué conversación abre mirar un frutal (`naranjo` o `manzano`) con el cielo dado: `valle.naranjo.autumn`, por ejemplo.
export const fruitTalkId = (name, sky) => `valle.${name}.${fruitSeasonOf(sky)}`

const SNOW = ['#ffffff', '#eef3f8', '#d4e0ec']

// Bola de hojas con la luz arriba a la izquierda y ruido para romper el borde. `leaf` son cinco tonos, de oscuro a claro; `keep(x, y)` deja
// fuera píxeles (el invierno deja huecos en la copa).
function blob(g, cx, cy, r, leaf, seed, keep = () => true) {
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const dist = Math.hypot(x - cx, y - cy) + (noise(x, y, 2.2, seed) - 0.5) * 2.4
      if (dist > r || !keep(x, y)) continue
      const light = (-(x - cx) * 0.7 - (y - cy) * 0.9) / r + (noise(x, y, 3, seed + 5) - 0.5) * 0.6
      dot(g, x, y, leaf[light < -0.5 ? 0 : light < -0.05 ? 1 : light < 0.4 ? 2 : 3])
    }
  }
}

// Fruta de 3×3 con un brillo arriba a la izquierda y un tono más oscuro abajo a la derecha.
function fruit(g, x, y, [body, shine, shade]) {
  rect(g, x, y, 3, 3, body)
  dot(g, x, y, shine)
  dot(g, x + 2, y + 2, shade)
}

// Capa de nieve sobre lo más alto de una copa: por cada columna, los `depth` primeros píxeles no transparentes.
function snowOnTop(canvas, depth = 2, x0 = 0, x1 = canvas.width) {
  const g = canvas.getContext('2d')
  const { data } = g.getImageData(0, 0, canvas.width, canvas.height)
  for (let x = x0; x < x1; x++) {
    let placed = 0
    for (let y = 0; y < canvas.height && placed < depth; y++) {
      if (data[(y * canvas.width + x) * 4 + 3] < 200) continue
      dot(g, x, y, SNOW[placed === 0 ? 0 : 1])
      placed++
    }
  }
}

const GREEN = TONE.grass
const AUTUMN_LEAVES = ['#7a3e1a', '#a85a1c', '#cc7a24', '#e29c34', '#f0c258']

// Jardinera de piedra del naranjo, con flores blancas y hojas en el borde.
function planter(g, season) {
  rect(g, 2, 44, 44, 10, STONE1)
  rect(g, 2, 44, 44, 2, STONE2)
  rect(g, 2, 52, 44, 2, STONE0)
  rect(g, 43, 46, 3, 6, STONE0)
  rect(g, 4, 41, 40, 4, GREEN[1])
  for (let x = 5; x < 43; x += 4) {
    dot(g, x, 41, x % 8 === 5 ? '#f6f0e0' : GREEN[3])
    dot(g, x + 1, 42, GREEN[4])
  }
  if (season === 2) rect(g, 4, 40, 40, 2, SNOW[0])
}

const ORANGE_BLOBS = [[24, 16, 11], [14, 21, 8], [34, 21, 8], [24, 25, 8], [18, 12, 6], [31, 11, 6]]
const ORANGE_FRUIT = [[14, 18], [22, 9], [30, 16], [38, 22], [19, 26], [27, 24], [10, 25], [33, 8], [24, 18]]
const ORANGE_BLOSSOM = [[17, 14], [28, 12], [35, 17], [12, 22], [24, 22], [21, 7], [32, 25], [15, 27], [26, 15], [37, 21], [10, 19]]

// Naranjo: primavera con azahar entre las hojas, otoño con los frutos pequeños y verdes que van tomando color, invierno con las naranjas
// maduras y un poco de nieve. Mide 48×54 y apoya en la fila 53.
export function orangeTree(season = 0) {
  const canvas = makeCanvas(48, 54)
  const g = canvas.getContext('2d')
  planter(g, season)
  rect(g, 22, 28, 5, 15, WOOD1)
  rect(g, 22, 28, 2, 15, WOOD2)
  rect(g, 26, 30, 1, 13, WOOD0)
  ORANGE_BLOBS.forEach(([cx, cy, r]) => blob(g, cx, cy, r, GREEN, 3))
  if (season === 0) {
    ORANGE_BLOSSOM.forEach(([x, y]) => {
      dot(g, x, y, '#fffbe8')
      dot(g, x + 1, y, '#fffbe8')
      dot(g, x, y + 1, '#f8d77a')
    })
    // Un par de frutos del año pasado, todavía colgando.
    ;[[14, 18], [30, 16]].forEach(([x, y]) => fruit(g, x, y, ['#f08a24', '#ffc468', '#c4601a']))
  } else if (season === 1) {
    // Frutos en desarrollo: más pequeños y de un verde amarillento que se va calentando.
    ORANGE_FRUIT.forEach(([x, y], i) => {
      const warm = i % 3 === 0 ? ['#d9a428', '#f2d062', '#a8761a'] : ['#a4b838', '#d2dc6a', '#6e8a28']
      rect(g, x, y, 2, 2, warm[0])
      dot(g, x, y, warm[1])
      dot(g, x + 1, y + 1, warm[2])
    })
  } else {
    ORANGE_FRUIT.forEach(([x, y]) => fruit(g, x, y, ['#f08a24', '#ffc468', '#c4601a']))
    snowOnTop(canvas, 2, 6, 42)
  }
  return { canvas: outline(canvas, 0.5), body: [{ l: -20, t: -8, r: 20, b: -1 }] }
}

const APPLE_BLOBS = [[26, 17, 12], [14, 24, 9], [38, 24, 9], [26, 28, 9], [19, 12, 7], [34, 12, 7]]
const APPLE_FRUIT = [[15, 22], [24, 12], [34, 18], [41, 26], [20, 30], [30, 29], [10, 27], [36, 10], [26, 22], [19, 17]]
const APPLE_BLOSSOM = [[16, 18], [28, 12], [36, 17], [12, 26], [26, 24], [22, 8], [33, 27], [18, 30], [40, 22], [30, 17]]

function branch(g, x0, y0, x1, y1, color) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))
  for (let i = 0; i <= steps; i++) dot(g, x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps, color)
}

// Copa desnuda del manzano en invierno: ramas gruesas que salen de la horquilla del tronco en abanico, cada una con dos ramitas, y una
// capa de nieve sobre las puntas. Es determinista (el ruido manda el largo), así que el árbol es siempre el mismo.
function bareCrown(g) {
  const tips = []
  for (let i = 0; i < 7; i++) {
    const angle = (-162 + i * 24) * (Math.PI / 180)
    const len = 19 + noise(i, 1, 2, 4) * 9
    const x1 = 26 + Math.cos(angle) * len
    const y1 = 33 + Math.sin(angle) * len * 1.05
    branch(g, 26, 34, x1, y1, WOOD2)
    branch(g, 25, 34, x1 - 1, y1, WOOD1)
    ;(i % 2 ? [-0.6] : [-0.6, 0.6]).forEach((turn) => {
      const mx = 26 + Math.cos(angle) * len * 0.55
      const my = 33 + Math.sin(angle) * len * 1.05 * 0.55
      const tx = mx + Math.cos(angle + turn) * 8
      const ty = my + Math.sin(angle + turn) * 8
      branch(g, mx, my, tx, ty, WOOD2)
      tips.push([tx, ty])
    })
    tips.push([x1, y1])
  }
  tips.forEach(([x, y]) => {
    dot(g, x, y - 1, SNOW[0])
    dot(g, x + 1, y - 1, SNOW[1])
  })
}

// Manzano plantado en la hierba: primavera con la copa llena de flor blanca y rosa, otoño con manzanas rojas y hojas que amarillean, y
// invierno con las ramas casi desnudas, nieve en ellas y alguna manzana caída al pie. Mide 52×60 y apoya en la fila 59.
export function appleTree(season = 0) {
  const canvas = makeCanvas(52, 60)
  const g = canvas.getContext('2d')
  // Sombra de contacto y raíces.
  rect(g, 14, 56, 24, 3, GREEN[1])
  rect(g, 23, 34, 6, 24, WOOD1)
  rect(g, 23, 34, 2, 24, WOOD2)
  rect(g, 28, 36, 1, 22, WOOD0)
  rect(g, 21, 55, 4, 3, WOOD1)
  rect(g, 27, 55, 4, 3, WOOD1)
  if (season === 0) {
    APPLE_BLOBS.forEach(([cx, cy, r]) => blob(g, cx, cy, r, GREEN, 9))
    APPLE_BLOSSOM.forEach(([x, y], i) => {
      dot(g, x, y, i % 3 ? '#fffafa' : '#f6c6d2')
      dot(g, x + 1, y, i % 2 ? '#fffafa' : '#f2a8bc')
      dot(g, x, y + 1, '#fbe9ee')
    })
  } else if (season === 1) {
    // Copa mezclada: según el ruido, hojas verdes que aún quedan o amarillas y anaranjadas.
    APPLE_BLOBS.forEach(([cx, cy, r], i) => {
      blob(g, cx, cy, r, i % 2 ? GREEN : AUTUMN_LEAVES, 9)
    })
    APPLE_FRUIT.forEach(([x, y]) => fruit(g, x, y, ['#d23a2a', '#f58a70', '#8a1c1c']))
    // Una hoja y una manzana cayendo ya ocupan el suelo: la caída animada la pone `AmbientLife`.
    dot(g, 14, 57, '#cc7a24')
    dot(g, 36, 58, '#e29c34')
  } else {
    bareCrown(g)
    // Pocas hojas secas que se resisten.
    ;[[16, 16], [37, 17], [24, 10], [30, 22]].forEach(([x, y]) => {
      dot(g, x, y, '#8a5a2a')
      dot(g, x + 1, y, '#a8742e')
    })
    // Manzanas caídas al pie, con su nieve, y un manto blanco alrededor de las raíces.
    fruit(g, 14, 56, ['#a8332a', '#cc6a58', '#6a1818'])
    fruit(g, 34, 57, ['#a8332a', '#cc6a58', '#6a1818'])
    rect(g, 10, 57, 30, 2, SNOW[1])
    rect(g, 16, 59, 22, 1, SNOW[2])
  }
  return { canvas: outline(canvas, 0.5), body: [{ l: -6, t: -9, r: 6, b: -1 }] }
}
