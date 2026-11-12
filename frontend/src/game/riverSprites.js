// Dibujos del río y sus orillas: el puente romano, el puente de tablones, nenúfares, juncos, el poste de pesca, la caña olvidada y los
// peces. Los puentes, los nenúfares y los juncos son objetos del valle como los demás (`props.js` los registra en `PROP_KINDS`);
// los peces no, porque se mueven (`RiverFish.js`). Todo en píxeles, con la luz arriba a la izquierda y el contorno oscuro de siempre.
// Sin dependencias de Phaser ni de React.
import { PAL, TONE } from './palette.js'
import { dot, ellipse, hash2, makeCanvas, outline, rect } from './pixelKit.js'

const [WOOD0, WOOD1, WOOD2, WOOD3] = TONE.wood
const [, , W2, , W4] = TONE.water
const GRASS = TONE.grass

// Piedra de sillería cálida, como la del puente romano de Córdoba.
const ASHLAR = { dark: '#9c7d52', mid: '#cdb487', light: '#e8d5a8', joint: '#b09468' }

const sprite = (w, h) => {
  const canvas = makeCanvas(w, h)
  return { canvas, g: canvas.getContext('2d') }
}
const done = ({ canvas }, strength = 0.5) => outline(canvas, strength)

// Hiladas de sillares en una banda: líneas horizontales cada 5 px y juntas verticales desfasadas.
function courses(g, x, y, w, h) {
  for (let row = y; row < y + h; row += 5) {
    rect(g, x, row, w, 1, ASHLAR.joint)
    for (let joint = x + ((row - y) / 5 % 2) * 7; joint < x + w; joint += 14) rect(g, joint, row + 1, 1, Math.min(4, y + h - row - 1), ASHLAR.joint)
  }
}

// Puente romano: calzada de losas entre dos pretiles, y por delante el pretil y la cara de piedra con tres arcos de medio punto sobre el
// agua (los de los extremos, sobre tierra, son nichos ciegos). Mide 9×2 teselas de calzada (144×32) más los pretiles y la cara (86 px de alto).
// Es plano: se pisa la calzada y el resto es decorado que no se puede cruzar.
export function romanBridge() {
  const w = 144
  const s = sprite(w, 86)
  const { g } = s
  // Pretil de atrás: coronación clara y cara con hiladas.
  rect(g, 0, 0, w, 10, ASHLAR.mid)
  rect(g, 0, 0, w, 3, ASHLAR.light)
  rect(g, 0, 9, w, 1, ASHLAR.dark)
  courses(g, 0, 3, w, 6)
  // Calzada: tierra apisonada como la de los caminos del valle (el puente es la continuación de la calle), con bordillos de piedra a los
  // lados y unas pocas losas sueltas.
  const earth = TONE.earth
  for (let y = 10; y < 42; y++) {
    for (let x = 0; x < w; x++) {
      const t = hash2(x, y, 5)
      dot(g, x, y, t < 0.45 ? earth[2] : t < 0.8 ? earth[1] : earth[3])
    }
  }
  rect(g, 0, 10, w, 3, ASHLAR.light)
  rect(g, 0, 12, w, 1, ASHLAR.joint)
  rect(g, 0, 39, w, 3, ASHLAR.light)
  rect(g, 0, 41, w, 1, ASHLAR.dark)
  for (let x = 4; x < w; x += 9) rect(g, x, 12, 1, 1, ASHLAR.dark)
  for (let x = 9; x < w; x += 23) rect(g, x, 20 + (x % 4) * 4, 6, 3, ASHLAR.mid)
  // Pretil delantero: remate claro y cara con hiladas, sobre la pared con los arcos.
  rect(g, 0, 42, w, 44, ASHLAR.mid)
  rect(g, 0, 42, w, 3, ASHLAR.light)
  rect(g, 0, 45, w, 1, ASHLAR.dark)
  courses(g, 0, 46, w, 40)
  // Nichos ciegos de los extremos: arcos hundidos en la piedra, sin agua.
  ;[8, 114].forEach((left) => {
    for (let y = 62; y < 82; y++) {
      const dy = y - 70
      const half = dy < 0 ? Math.sqrt(Math.max(0, 81 - dy * dy)) : 9
      rect(g, Math.round(left + 10 - half), y, Math.round(half * 2), 1, ASHLAR.dark)
    }
  })
  // Arcos abiertos sobre el agua: semicírculo de 22 px y paredes rectas hasta el agua, con el interior en sombra y la lámina de agua abajo.
  ;[34, 60, 86].forEach((left) => {
    for (let y = 58; y < 86; y++) {
      const dy = y - 69
      const half = dy < 0 ? Math.sqrt(Math.max(0, 121 - dy * dy)) : 11
      rect(g, Math.round(left + 11 - half), y, Math.round(half * 2), 1, y > 80 ? W2 : y > 77 ? '#2e5a78' : '#34415c')
    }
    // Dovelas del borde del arco, claras y oscuras alternas.
    for (let a = 0; a <= 16; a++) {
      const angle = Math.PI + (a / 16) * Math.PI
      const x = left + 11 + Math.cos(angle) * 12
      const y = 69 + Math.sin(angle) * 12
      rect(g, Math.round(x) - 1, Math.round(y) - 1, 2, 2, a % 2 ? ASHLAR.light : ASHLAR.dark)
    }
  })
  // Espolones de los pilares: una arista clara y otra oscura.
  ;[56, 82, 108].forEach((x) => {
    rect(g, x, 58, 1, 28, ASHLAR.light)
    rect(g, x + 3, 58, 1, 28, ASHLAR.dark)
  })
  // Remates de los extremos: un mojón de piedra en cada esquina del pretil de atrás.
  ;[0, w - 6].forEach((x) => {
    rect(g, x, 0, 6, 10, ASHLAR.light)
    rect(g, x, 8, 6, 2, ASHLAR.dark)
  })
  return { canvas: done(s), body: [{ l: -72, t: -86, r: 72, b: -76 }, { l: -72, t: -44, r: 72, b: -1 }], flat: true }
}

// Puente de tablones: `tiles`×2 teselas de cubierta (12 por defecto) con barandilla a ambos lados y postes. Más sencillo y más bajo
// que el romano.
function plankSpan(tiles) {
  const w = tiles * 16
  const h = 44
  const s = sprite(w, h)
  const { g } = s
  rect(g, 0, 10, w, h - 20, WOOD2)
  for (let x = 0; x < w; x += 6) {
    rect(g, x, 10, 1, h - 20, WOOD0)
    rect(g, x + 1, 10, 4, h - 20, (x / 6) % 2 ? WOOD2 : WOOD3)
  }
  ;[2, h - 10].forEach((y) => {
    rect(g, 0, y, w, 3, WOOD1)
    rect(g, 0, y, w, 1, WOOD3)
    for (let x = 4; x < w; x += 18) {
      rect(g, x, y - 5, 3, 10, WOOD0)
      rect(g, x, y - 5, 1, 10, WOOD2)
    }
  })
  return { canvas: done(s), body: [{ l: -w / 2, t: -44, r: w / 2, b: -36 }, { l: -w / 2, t: -12, r: w / 2, b: -1 }], flat: true }
}

// Los objetos se dibujan con `(variante)`: cada puente fija su largo aquí. El puentecillo del afluente mide seis teselas.
export const plankBridge = () => plankSpan(12)
export const footBridge = () => plankSpan(6)

// Nenúfar: hoja redonda con su muesca y, en dos variantes, una flor blanca o rosa. Flota, así que no tiene cuerpo.
export function lily(variant = 0) {
  const s = sprite(18, 10)
  const { g } = s
  ellipse(g, 9, 6, 7, 3.4, GRASS[1])
  ellipse(g, 8, 5.4, 6, 2.6, GRASS[2])
  rect(g, 9, 6, 8, 1, W2)
  dot(g, 7, 4, GRASS[4])
  dot(g, 4, 5, GRASS[3])
  if (variant > 0) {
    const petal = variant === 1 ? '#f6f0e0' : '#f29bb4'
    ;[[-2, 0], [2, 0], [0, -2], [-1, -1], [1, -1]].forEach(([dx, dy]) => dot(g, 6 + dx, 3 + dy, petal))
    dot(g, 6, 3, PAL.saffron)
  }
  return { canvas: done(s, 0.35), body: [] }
}

// Juncos y espadañas de la orilla: un manojo de tallos con dos espigas oscuras. Dos variantes de altura.
export function reeds(variant = 0) {
  const s = sprite(22, 30)
  const { g } = s
  const stems = variant === 0 ? [[4, 20], [8, 26], [12, 22], [16, 17], [19, 23]] : [[3, 24], [7, 18], [11, 27], [15, 21], [18, 25]]
  stems.forEach(([x, top]) => {
    rect(g, x, top, 1, 29 - top, GRASS[2])
    rect(g, x + 1, top + 4, 1, 25 - top, GRASS[1])
  })
  ;[stems[1], stems[3]].forEach(([x, top]) => {
    rect(g, x - 1, top - 5, 3, 6, WOOD1)
    rect(g, x, top - 6, 1, 1, WOOD0)
    rect(g, x - 1, top - 5, 1, 5, WOOD3)
  })
  stems.forEach(([x]) => dot(g, x, 29, GRASS[0]))
  return { canvas: done(s, 0.4), body: [] }
}

// Poste de pesca: un poste con un pez de madera clavado y una cuerda. Marca los sitios donde se puede echar la caña.
export function fishPost() {
  const s = sprite(16, 28)
  const { g } = s
  rect(g, 7, 8, 3, 20, WOOD1)
  rect(g, 7, 8, 1, 20, WOOD3)
  rect(g, 2, 2, 12, 8, WOOD2)
  rect(g, 2, 2, 12, 1, WOOD3)
  rect(g, 2, 9, 12, 1, WOOD0)
  ellipse(g, 7, 6, 4, 2, '#8fd3dd')
  rect(g, 11, 4, 3, 4, '#8fd3dd')
  dot(g, 5, 5, WOOD0)
  rect(g, 10, 12, 1, 6, '#f6f0e0')
  return { canvas: done(s), body: [{ l: -2, t: -5, r: 3, b: -1 }] }
}

// Caña de pescar apoyada en una piedra, con un destello. Es lo que se esconde en el valle (ver `world.js`, `ROD_SPOT`).
export function rod() {
  const s = sprite(26, 34)
  const { g } = s
  ellipse(g, 17, 28, 6, 4, TONE.stone[0])
  ellipse(g, 16, 27, 5, 3, TONE.stone[1])
  ellipse(g, 15, 26, 3, 2, TONE.stone[2])
  for (let i = 0; i < 28; i++) {
    const x = 20 - Math.round(i * 0.6)
    const y = 30 - i
    rect(g, x, y, 1, 1, i < 10 ? WOOD1 : i < 20 ? WOOD2 : WOOD3)
  }
  rect(g, 3, 2, 1, 7, '#f6f0e0')
  rect(g, 2, 8, 3, 2, '#d4503a')
  rect(g, 5, 28, 6, 2, '#c8402e')
  ;[[22, 6], [24, 8], [21, 9]].forEach(([x, y]) => dot(g, x, y, PAL.saffronLight))
  rect(g, 23, 5, 1, 3, PAL.saffronLight)
  rect(g, 22, 6, 3, 1, PAL.saffronLight)
  return { canvas: done(s), body: [] }
}

// Pez visto desde arriba, con dos fotogramas de la cola. `tone` es 0 (anaranjado), 1 (plateado) o 2 (verdoso). Lo anima `RiverFish.js`.
const FISH_TONES = [['#d98b4a', '#f2b26a'], ['#8fa6b8', '#cbd9e3'], ['#6f9a6a', '#a8c98f']]
export function fish(tone = 0, frame = 0) {
  const s = sprite(11, 5)
  const { g } = s
  const [body, belly] = FISH_TONES[tone % FISH_TONES.length]
  ellipse(g, 5, 2.5, 4, 2, body)
  rect(g, 3, 3, 4, 1, belly)
  rect(g, 8, frame ? 1 : 2, 2, 1, body)
  rect(g, 9, frame ? 3 : 2, 2, 1, body)
  dot(g, 2, 2, '#1c1b3a')
  return s.canvas
}

// Estela del pez al saltar: un anillo de salpicadura en tres tamaños.
export function splash(step = 0) {
  const r = 3 + step * 3
  const s = sprite(r * 2 + 3, r + 3)
  const { g } = s
  g.fillStyle = W4
  for (let a = 0; a < 20; a++) {
    const angle = (a / 20) * Math.PI * 2
    g.fillRect(Math.round(r + 1 + Math.cos(angle) * r), Math.round((r + 3) / 2 + Math.sin(angle) * (r / 2)), 1, 1)
  }
  return s.canvas
}

