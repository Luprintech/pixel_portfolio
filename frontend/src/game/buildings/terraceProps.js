// Dibujo de la cubierta de la casa de Lupe: suelo, escalera con su pasamanos, balaustradas, telescopio y sombrilla.
// Todo en píxeles del dibujo de la casa (`homeSprite`), con la luz arriba a la izquierda. Las cifras de sitio salen de
// terrace.js, que también las lee la escena: lo que se ve es lo que se pisa y lo que se toca. Las cifras que también
// necesitan la nieve (terraceWinter.js) y la luz (homeLight.js) se exportan desde aquí.
import { PAL, shade, tint } from '../palette.js'
import { dot, ellipse, line, rect } from '../pixelKit.js'
import { CHAIR, DECK, DECK_WIDEN, STAIRS, TABLE, TELESCOPE } from '../terrace.js'
import { WOOD0, WOOD1, WOOD2, WOOD3 } from './shared.js'

export const BRASS = [shade(PAL.saffron, 0.55), shade(PAL.saffron, 0.78), PAL.saffron, PAL.saffronLight]
const PINK = '#e07a9c'
const CREAM = '#f6f0e0'
const RIM = '#8a3a5c'
// Pintura blanca de la silla: luz, cuerpo y sombra.
const CHAIR_WHITE = ['#ffffff', '#ece6f2', '#b3a8c4']

// Fondo del entarimado: del pie de la balaustrada trasera (`FLOOR_TOP`) al canto delantero. Los muebles apoyan en
// `FLOOR_Y`, contra el fondo, y delante queda el suelo libre por el que se anda (ver `DECK.top` en terrace.js).
export const FLOOR_TOP = 84
export const FLOOR_DEPTH = 30
// Anchura de la escalera, de la barandilla delantera a la trasera: la misma que la hondura de la cubierta, para que el
// pasamanos trasero llegue justo al poste de la esquina trasera y los peldaños se lean como la continuación del entarimado.
export const STAIR_DEPTH = FLOOR_DEPTH
export const FLOOR_Y = TABLE.base
// Altura de los pasamanos sobre el filo de los peldaños, y de la cara superior del pasamanos en la columna `px`.
export const RAIL_H = 11
export const stairRailTop = (px, { x, bottom, run, rise }) => Math.round(bottom - rise - (rise / run) * (px - x - run / 2)) - RAIL_H

// Poste de esquina de la escalera: es el último poste de su pasamanos y el primero de la barandilla delantera, así que
// las dos son una sola estructura.
const NEWEL_X = STAIRS.x + (STAIRS.steps - 1) * STAIRS.run + 1
// Barandilla delantera: la viajera queda detrás. Arranca en el poste de esquina de la escalera, con su barandal a la
// altura donde acaba el pasamanos, y llega hasta el muro de la casa.
export const FRONT_RAIL = { x: NEWEL_X, top: stairRailTop(NEWEL_X + 2, STAIRS) - 2, bottom: 117, right: DECK.right }
const RAIL_POST_GAP = 19

// Postes de la barandilla delantera, repartidos a partes iguales entre el poste de la escalera y uno junto al muro.
export function frontRailPosts({ x, right } = FRONT_RAIL) {
  const last = right - 3
  const count = Math.max(1, Math.round((last - x) / RAIL_POST_GAP))
  return Array.from({ length: count + 1 }, (_, k) => Math.round(x + ((last - x) * k) / count))
}
// Balaustrada trasera: un solo tramo continuo de esquina a esquina del entarimado, entre los dos postes altos. El de la
// izquierda cae en la misma columna que el poste de esquina de la escalera (`NEWEL_X`), así que de frente es una sola pieza
// de madera de arriba abajo; el de la derecha queda pegado al muro de la casa.
export const BACK_RAIL = { from: DECK.left - 4, right: DECK.right }
export const BACK_RAIL_Y = FLOOR_TOP - 11
// Los postes de las esquinas traseras sostienen la guirnalda: suben hasta `top` y llevan un remate de latón. `x` es la
// columna de su borde izquierdo (miden tres píxeles).
export const CORNER_POSTS = { left: BACK_RAIL.from, right: BACK_RAIL.right - 3, top: 42 }
export const PARASOL = { cx: TABLE.x, top: 62, rx: 18, ry: 13 }
// Guirnalda: de un poste de esquina al otro, por encima del telescopio y de la sombrilla, con una caída suave en el centro y
// `bulbs` bombillas a distancias iguales.
export const STRAND = {
  from: { x: CORNER_POSTS.left + 1, y: CORNER_POSTS.top + 4 },
  to: { x: CORNER_POSTS.right + 1, y: CORNER_POSTS.top + 4 },
  sag: 8,
  bulbs: 13,
}

// Altura del filo de los peldaños: sobre ella están los pies al subir (ver `stairLift`).
export const noseY = (i, { bottom, rise }) => bottom - rise * (i + 1)

// Posición de cada punto de la guirnalda y cuáles llevan bombilla: la columna de la bombilla `k` está a `k / (bulbs + 1)`
// del recorrido, así que el reparto es uniforme y sin bombilla pegada a los postes.
export function strandPoints({ from, to, sag, bulbs } = STRAND) {
  const span = to.x - from.x
  const lit = new Set(Array.from({ length: bulbs }, (_, k) => from.x + Math.round((span * (k + 1)) / (bulbs + 1))))
  const points = []
  for (let px = from.x; px <= to.x; px++) {
    const u = (px - from.x) / span
    points.push({ x: px, y: Math.round(from.y + (to.y - from.y) * u + sag * Math.sin(Math.PI * u)), bulb: lit.has(px) })
  }
  return points
}

// Entarimado: tablas con juntas desfasadas, sombra bajo la balaustrada trasera y el canto delantero.
export function deckFloor(g) {
  const x = DECK.left - 4
  const w = DECK.right - x
  rect(g, x, FLOOR_TOP, w, FLOOR_DEPTH, WOOD2)
  for (let row = 0; row < FLOOR_DEPTH / 3; row++) {
    for (let px = x + 2 + (row % 2) * 3; px < x + w - 1; px += 7) rect(g, px, FLOOR_TOP + 1 + row * 3, 1, 3, WOOD1)
    if (row > 0) rect(g, x, FLOOR_TOP + row * 3, w, 1, WOOD1)
  }
  rect(g, x, FLOOR_TOP, w, 2, WOOD1)
  rect(g, x, FLOOR_TOP + FLOOR_DEPTH, w, 1, WOOD3)
  rect(g, x, FLOOR_TOP + FLOOR_DEPTH + 1, w, 4, WOOD1)
  rect(g, x, FLOOR_TOP + FLOOR_DEPTH + 5, w, 1, WOOD0)
}

// Escalera exterior de madera, vista de perfil con la cámara algo elevada. Se leen tres cosas: la zanca (el costado,
// en madera media, con su tablón inferior en diagonal y el hueco de debajo abierto, sostenido por dos postes), las
// huellas (franjas claras de cuatro píxeles centradas en el filo, con luz en el canto) y la sombra que cada huella
// echa sobre el costado. Los pies de la viajera apoyan en el centro de la huella (`stairLift`).
const STRINGER = 12
export function terraceStairs(g, { x, bottom, steps, run, rise }) {
  const slope = rise / run
  const noseLine = (px) => bottom - rise - slope * (px - x - run / 2)
  const lower = (px) => Math.min(bottom, Math.round(noseLine(px)) + STRINGER)
  const treadTones = [WOOD2, WOOD3, WOOD3, tint(WOOD3, 0.28)]
  for (let i = 0; i < steps; i++) {
    const left = x + i * run
    const top = noseY(i, { bottom, rise })
    // Huella ancha: la tabla del peldaño corre hacia el fondo, `STAIR_DEPTH` píxeles por detrás del filo, con luz en su canto
    // izquierdo y sombra en el derecho. Cada peldaño queda `rise` más arriba que el anterior: el borde trasero sube con ellos.
    // La tabla no pasa de la esquina de la cubierta (`BACK_RAIL.from`): desde ahí el suelo es el entarimado.
    const reach = Math.max(0, Math.min(run, BACK_RAIL.from - left))
    if (reach > 0) {
      rect(g, left, top - STAIR_DEPTH, reach, STAIR_DEPTH - 2, WOOD2)
      for (let seam = top - STAIR_DEPTH + 9; seam < top - 2; seam += 10) rect(g, left + 1, seam, Math.max(0, reach - 2), 1, WOOD1)
      rect(g, left, top - STAIR_DEPTH, 1, STAIR_DEPTH - 2, WOOD3)
      if (reach === run) rect(g, left + run - 1, top - STAIR_DEPTH, 1, STAIR_DEPTH - 2, WOOD1)
    }
    for (let px = left; px < left + run; px++) {
      const end = lower(px)
      rect(g, px, top, 1, end - top, WOOD1)
      rect(g, px, end - 2, 1, 2, WOOD0)
      rect(g, px, top + 2, 1, 2, WOOD0)
      treadTones.forEach((color, row) => rect(g, px, top - 2 + row, 1, 1, color))
    }
    // Canto izquierdo iluminado y derecho en sombra, y la junta del costado bajo cada huella.
    rect(g, left, top - 2, 1, 4, tint(WOOD3, 0.4))
    rect(g, left + run - 1, top - 2, 1, 4, shade(WOOD3, 0.82))
    if (i > 0) rect(g, left, top + 4, 1, Math.max(0, lower(left) - top - 6), WOOD0)
  }
  // Postes que sostienen la escalera por debajo.
  ;[x + 17, x + steps * run - 7].forEach((px) => {
    const top = lower(px + 1)
    rect(g, px, top, 3, bottom - top, WOOD0)
    rect(g, px, top, 1, bottom - top, WOOD2)
    rect(g, px - 1, bottom - 2, 5, 2, WOOD0)
  })
}

// Pasamanos de la escalera: un poste al pie, otro arriba (el de esquina, que dibuja la barandilla delantera) y dos
// intermedios repartidos a partes iguales; entre ellos, un balaustre fino en los peldaños que quedan sin poste, de modo que
// cada peldaño tiene protección. El pasamanos recto sigue la pendiente y va de un extremo al otro. Se dibuja en la capa
// que va por encima de quien sube (ver `railLayer` en homes.js): la viajera pasa por detrás de él.
const STAIR_POSTS = 3
export const stairRailPosts = ({ x, steps, run } = STAIRS) => {
  const first = x + 1
  const last = x + (steps - 1) * run + 1
  return Array.from({ length: STAIR_POSTS + 1 }, (_, k) => Math.round(first + ((last - first) * k) / STAIR_POSTS))
}

// Maderas de cada pasamanos: el trasero va un tono más oscuro, para que quede al fondo.
const RAIL_WOOD = { front: { post: WOOD1, light: WOOD3, bar: WOOD2, under: WOOD1 }, back: { post: WOOD0, light: WOOD2, bar: WOOD1, under: WOOD0 } }

// `side` es 'front' (el de la barandilla delantera, por encima de quien sube) o 'back' (el de atrás, `STAIR_DEPTH` más arriba:
// sigue la misma pendiente y acaba en el poste de la esquina trasera, que dibuja `backRail`).
export function stairRail(g, { x, bottom, steps, run, rise }, side = 'front') {
  const wood = RAIL_WOOD[side]
  const dy = side === 'back' ? -STAIR_DEPTH : 0
  const railAt = (px) => stairRailTop(px, { x, bottom, run, rise }) + dy
  const baseAt = (px) => noseY(Math.min(steps - 1, Math.floor((px - x) / run)), { bottom, rise }) + dy
  const posts = stairRailPosts({ x, steps, run })
  const start = posts[0]
  const end = posts[posts.length - 1] + 2
  // Balaustres finos: uno por peldaño salvo donde ya hay poste.
  for (let i = 0; i < steps; i++) {
    const px = x + i * run + 2
    if (posts.some((p) => px >= p - 1 && px <= p + 3)) continue
    rect(g, px, railAt(px) + 3, 1, baseAt(px) - railAt(px) - 3, wood.bar)
  }
  // Postes; el de arriba lo pone la barandilla delantera o el poste de esquina trasero.
  posts.slice(0, -1).forEach((px, k) => {
    const top = railAt(px + 1)
    const base = baseAt(px + 1)
    rect(g, px, top, 3, base - top, wood.post)
    rect(g, px, top, 1, base - top, wood.light)
    if (k === 0) rect(g, px - 1, top - 2, 5, 2, wood.light)
  })
  // Pasamanos: una banda de tres píxeles con la cara superior iluminada.
  line(g, start, railAt(start), end, railAt(end), wood.bar, 3)
  line(g, start, railAt(start), end, railAt(end), wood.light, 1)
  line(g, start, railAt(start) + 2, end, railAt(end) + 2, wood.under, 1)
}

// Balaustrada trasera: balaustres, postes con remate (también en cada extremo), barandal y travesaño bajo. Va en
// maderas un tono más oscuras que la delantera, para que quede al fondo.
// Posiciones de los postes de un tramo de balaustrada: uno en cada extremo y, entre ellos, repartidos a partes iguales
// con unos catorce píxeles de separación.
export function railPosts(x, w) {
  const last = x + w - 3
  const count = Math.max(1, Math.round((last - x) / 14))
  return Array.from({ length: count + 1 }, (_, k) => Math.round(x + ((last - x) * k) / count))
}

export function balustrade(g, x, y, w) {
  rect(g, x, y + 11, w, 2, WOOD0)
  for (let bx = x + 3; bx < x + w - 2; bx += 4) rect(g, bx, y + 2, 2, 10, WOOD1)
  railPosts(x, w).forEach((bx) => {
    rect(g, bx, y - 2, 3, 15, WOOD0)
    rect(g, bx, y - 2, 1, 15, WOOD2)
    rect(g, bx - 1, y - 3, 5, 2, WOOD2)
  })
  rect(g, x, y, w, 3, WOOD1)
  rect(g, x, y, w, 1, WOOD2)
}

// Poste alto de una esquina trasera de la cubierta: sostiene la guirnalda, con un remate de latón en lo alto. Nace en el
// entarimado, donde acaba la balaustrada.
function cornerPost(g, x) {
  const { top } = CORNER_POSTS
  const height = BACK_RAIL_Y + 13 - top
  rect(g, x, top, 3, height, WOOD0)
  rect(g, x, top, 1, height, WOOD2)
  rect(g, x - 1, top - 2, 5, 2, WOOD2)
  dot(g, x + 1, top - 3, PAL.saffron)
}

// Balaustrada trasera: el tramo continuo entre las dos esquinas y, encima, los dos postes altos.
export function backRail(g) {
  balustrade(g, BACK_RAIL.from, BACK_RAIL_Y, BACK_RAIL.right - BACK_RAIL.from)
  cornerPost(g, CORNER_POSTS.left)
  cornerPost(g, CORNER_POSTS.right)
}

// Barandilla delantera: va en una capa aparte, por encima de la viajera, que pasa por detrás con las piernas
// medio tapadas. Solo postes, pasamanos y un travesaño bajo: nada de paneles, para que se vea la cubierta a través.
// Arranca en el poste de esquina de la escalera, que sube hasta el pasamanos y baja hasta el canto de la cubierta.
// Se dibuja en las coordenadas del dibujo de la casa; quien la usa traslada el lienzo a su esquina.
export function frontRail(g) {
  const { x, top, bottom, right } = FRONT_RAIL
  const w = right - x
  const posts = frontRailPosts()
  rect(g, x, bottom - 8, w, 2, WOOD1)
  rect(g, x, top + 2, w, 3, WOOD2)
  rect(g, x, top + 2, w, 1, WOOD3)
  posts.forEach((px) => {
    rect(g, px, top + 2, 3, bottom - top - 2, WOOD1)
    rect(g, px, top + 2, 1, bottom - top - 2, WOOD3)
    rect(g, px - 1, top, 5, 2, WOOD3)
  })
}

// Todo lo que va por delante de quien sube o anda por la cubierta: el pasamanos de la escalera y la barandilla delantera.
export function terraceRail(g) {
  stairRail(g, STAIRS)
  frontRail(g)
}

// Rectángulo del dibujo que ocupa `terraceRail`, con dos píxeles de margen para el contorno.
export const RAIL_BOX = (() => {
  const x = STAIRS.x - 2
  const y = FRONT_RAIL.top - 3
  return { x, y, w: FRONT_RAIL.right + 2 - x, h: noseY(0, STAIRS) + 3 - y }
})()

// Celestron AstroMaster 130EQ, el telescopio real de Lupe: tubo azul oscuro metalizado de bordes negros, tendido en diagonal
// con su boca grande y oscura hacia el cielo (a la izquierda), buscador pequeño sobre el tubo, ocular a un lado, montura
// ecuatorial con sus acentos naranjas y el contrapeso colgando de su varilla, y un trípode alto de patas plateadas con la
// bandeja triangular negra. Tiene sombra propia en el suelo y el hueco de la guirnalda a su alrededor para que su contorno
// se lea entero. Va todo a la izquierda del centro del trípode, así que no llega a la silla.
const SILVER = ['#8d90a8', '#c9ccd8', '#eceef6']
const MOUNT = ['#2b2a4a', '#3d3c62', '#5a5886']
// Bandas del tubo, de arriba abajo: borde negro, brillo metálico, azul medio, azul, sombra y borde negro.
// El brillo hace de contorno por arriba: sobre el fondo oscuro de detrás un borde negro no se vería.
const TUBE_BANDS = ['#2d4278', '#8fb0dc', '#5d7fb5', '#41609a', '#2d4278', PAL.ink]
const TUBE_GLINT = '#d4e2f4'
// Cuánto sube el eje del tubo por cada columna hacia la izquierda: la diagonal que lo apunta al cielo.
const TUBE_RISE = 0.36

// Trípode alto: dos patas exteriores que se abren y una trasera más corta entre ellas, con pies negros y la bandeja de las
// tres. `apexY` es donde se juntan, bajo la montura.
function tripod(g, cx, base, apexY) {
  const metal = (fromX, toX, toY) => {
    line(g, fromX, apexY, toX, toY, SILVER[2], 1)
    line(g, fromX + 1, apexY, toX + 1, toY, SILVER[0], 1)
  }
  // Pata trasera, casi vertical y algo más corta, porque queda más lejos.
  line(g, cx, apexY, cx - 1, base - 3, SILVER[0], 1)
  line(g, cx + 1, apexY, cx, base - 3, SILVER[1], 1)
  rect(g, cx - 2, base - 3, 3, 1, PAL.ink)
  // Bandeja triangular negra con el filo de arriba más claro.
  const trayY = base - 7
  rect(g, cx - 4, trayY, 9, 1, MOUNT[2])
  rect(g, cx - 4, trayY + 1, 9, 1, PAL.ink)
  rect(g, cx - 3, trayY + 2, 7, 1, PAL.ink)
  rect(g, cx - 1, trayY + 3, 3, 1, PAL.ink)
  ;[cx - 8, cx + 7].forEach((toX) => {
    metal(cx, toX, base)
    rect(g, toX - 1, base, 3, 1, PAL.ink)
  })
}

// Cabeza de la montura ecuatorial: placa sobre el trípode, cuello plateado con su círculo naranja, cabeza oscura con perillas
// de latón y la varilla del contrapeso, que baja en diagonal a la izquierda y acaba en la pesa.
function equatorialMount(g, cx, apexY) {
  rect(g, cx - 3, apexY - 2, 7, 2, MOUNT[1])
  rect(g, cx - 3, apexY - 2, 7, 1, MOUNT[2])
  rect(g, cx - 3, apexY, 7, 1, PAL.ink)
  rect(g, cx - 1, apexY - 4, 3, 2, SILVER[1])
  rect(g, cx - 2, apexY - 3, 5, 1, BRASS[2])
  rect(g, cx - 2, apexY - 8, 5, 4, MOUNT[1])
  rect(g, cx - 2, apexY - 8, 5, 1, MOUNT[2])
  rect(g, cx - 2, apexY - 5, 5, 1, MOUNT[0])
  rect(g, cx + 2, apexY - 7, 1, 2, BRASS[2])
  rect(g, cx - 2, apexY - 7, 1, 2, BRASS[3])
  // Contrapeso colgante.
  line(g, cx - 2, apexY - 4, cx - 8, apexY + 5, SILVER[0], 1)
  rect(g, cx - 12, apexY + 5, 5, 4, MOUNT[1])
  rect(g, cx - 12, apexY + 5, 5, 1, MOUNT[2])
  rect(g, cx - 12, apexY + 8, 5, 1, MOUNT[0])
  rect(g, cx - 13, apexY + 6, 1, 2, PAL.ink)
  rect(g, cx - 7, apexY + 6, 1, 2, PAL.ink)
}

// Tubo óptico: cilindro de seis filas que sube hacia la izquierda, con su boca ovalada, el focalizador con el ocular y el
// buscador paralelo encima, sujeto con dos soportes. `pivotY` es la fila del eje justo sobre la montura.
function opticalTube(g, cx, pivotY) {
  const from = cx - 11
  const to = cx + 9
  const axis = (px) => Math.round(pivotY - TUBE_RISE * (cx - px))
  for (let px = from; px <= to; px++) {
    const top = axis(px) - 3
    TUBE_BANDS.forEach((color, i) => rect(g, px, top + i, 1, 1, color))
  }
  ;[cx - 8, cx - 7, cx - 6, cx + 3, cx + 4].forEach((px) => dot(g, px, axis(px) - 2, TUBE_GLINT))
  // Culata trasera, más oscura y con tapa.
  rect(g, to - 1, axis(to - 1) - 2, 2, 4, TUBE_BANDS[4])
  rect(g, to + 1, axis(to) - 2, 1, 4, PAL.ink)
  // Boca grande y oscura, con el aro claro del borde y el espejo al fondo.
  const mouthY = axis(from) + 0.5
  ellipse(g, from - 1, mouthY, 2.8, 3.8, '#6f8dbd')
  ellipse(g, from - 1, mouthY, 2, 3, PAL.ink)
  dot(g, from - 1, mouthY + 1, '#4a4680')
  dot(g, from - 2, mouthY - 1, '#2a2456')
  // Focalizador y ocular: perpendiculares al tubo, hacia arriba.
  const eyeX = cx - 5
  rect(g, eyeX, axis(eyeX) - 5, 3, 2, PAL.ink)
  rect(g, eyeX, axis(eyeX) - 9, 2, 4, SILVER[1])
  rect(g, eyeX, axis(eyeX) - 9, 1, 4, SILVER[2])
  rect(g, eyeX, axis(eyeX) - 10, 2, 1, PAL.ink)
  // Buscador: tubito oscuro paralelo al principal, con su lente y dos soportes plateados.
  const finderY = axis(cx - 10) - 8
  rect(g, cx - 12, finderY, 5, 2, MOUNT[1])
  rect(g, cx - 12, finderY, 5, 1, SILVER[0])
  dot(g, cx - 13, finderY, '#bfe4f0')
  rect(g, cx - 11, finderY + 2, 1, 3, SILVER[0])
  rect(g, cx - 9, finderY + 2, 1, 3, SILVER[0])
}

export function telescope(g) {
  const { x: cx, base } = TELESCOPE
  const apexY = base - 12
  ellipse(g, cx + 1, base + 1, 11, 1.8, 'rgba(40,24,50,0.32)')
  tripod(g, cx, base, apexY)
  equatorialMount(g, cx, apexY)
  opticalTube(g, cx, apexY - 11)
}

// Cubierta de la sombrilla: cada gajo es un cilindro con luz en su borde izquierdo y sombra en el derecho, y el
// conjunto se oscurece hacia la derecha y hacia el borde. Con dos tonos de más por gajo y un borde oscuro definido,
// se lee como volumen y no como un dibujo plano. Sin varillas dibujadas: las separa la propia luz.
function canopy(g) {
  const { cx, top, rx, ry } = PARASOL
  const centerY = top + ry
  const tones = (base) => [shade(base, 0.62), shade(base, 0.8), base, tint(base, 0.22), tint(base, 0.4)]
  for (let y = top; y < centerY; y++) {
    for (let x = cx - rx; x < cx + rx; x++) {
      const u = (x + 0.5 - cx) / rx
      const v = (y + 0.5 - centerY) / ry
      if (u * u + v * v > 1) continue
      const scaled = (u + 1) * 3
      const panel = Math.floor(scaled)
      const local = scaled - panel
      let level = 2
      level += local < 0.24 ? 1 : local > 0.76 ? -1 : 0
      level += u > 0.55 ? -1 : 0
      level += u < -0.2 && y < top + 5 ? 1 : 0
      level += y >= centerY - 2 ? -1 : 0
      dot(g, x, y, tones(panel % 2 === 0 ? PINK : CREAM)[Math.max(0, Math.min(4, level))])
    }
  }
  // Borde definido: una línea oscura continua y, debajo, un festón por gajo con su propio filo.
  rect(g, cx - rx, centerY, rx * 2, 1, RIM)
  const edge = (k) => cx + Math.round((rx * (k - 3)) / 3)
  for (let k = 0; k < 6; k++) {
    const mid = (edge(k) + edge(k + 1)) / 2
    const base = k % 2 === 0 ? PINK : CREAM
    const half = (edge(k + 1) - edge(k)) / 2
    for (let y = 1; y <= 3; y++) {
      const span = Math.sqrt(Math.max(0, 1 - ((y - 0.5) / 3.2) ** 2)) * half
      const color = y === 3 ? RIM : y === 2 ? shade(base, 0.72) : tones(base)[2]
      rect(g, Math.round(mid - span), centerY + y, Math.max(1, Math.round(span * 2)), 1, color)
    }
  }
}

// Sombrilla de mesa: mástil visible de la base al remate, cubierta con volumen y festones, y su sombra sobre el suelo.
export function parasol(g) {
  const { cx, top } = PARASOL
  // Sombra sobre el entarimado: plana y de borde duro, como el resto.
  ellipse(g, cx + 3, FLOOR_Y + 2, 17, 2.2, 'rgba(40,24,50,0.3)')
  // Mástil: pasa por el centro de la mesa y apoya en un pie.
  rect(g, cx - 1, top + 2, 2, FLOOR_Y - top - 1, WOOD1)
  rect(g, cx - 1, top + 2, 1, FLOOR_Y - top - 1, WOOD3)
  rect(g, cx - 4, FLOOR_Y - 1, 8, 2, WOOD0)
  rect(g, cx - 4, FLOOR_Y - 1, 8, 1, WOOD2)
  // Mesa redonda con mantel claro, para que se lea sobre la madera, y una taza.
  const tableTop = FLOOR_Y - 10
  rect(g, cx - 8, tableTop + 4, 2, 6, WOOD0)
  rect(g, cx + 6, tableTop + 4, 2, 6, WOOD0)
  rect(g, cx - 9, tableTop, 18, 3, CREAM)
  rect(g, cx - 9, tableTop, 18, 1, '#ffffff')
  rect(g, cx - 9, tableTop + 3, 18, 1, PINK)
  for (let px = cx - 9; px < cx + 9; px += 3) dot(g, px + 1, tableTop + 4, PINK)
  rect(g, cx + 3, tableTop - 3, 3, 3, '#9fd6e0')
  dot(g, cx + 6, tableTop - 2, '#9fd6e0')
  dot(g, cx + 4, tableTop - 3, '#f6f0e0')
  canopy(g)
  ellipse(g, cx, top - 1, 1.6, 1.6, BRASS[3])
  rect(g, cx, top + 1, 1, 2, BRASS[1])
}

// Silla de madera pintada de blanco, para que destaque sobre el entarimado, de frente y con cojín rosa como la sombrilla. Apoya contra el fondo, junto al telescopio.
// Quien se sienta (ver `seatOnDeck` en ValleScene.js) se dibuja por delante: el respaldo queda detrás y las patas delanteras
// asoman bajo sus piernas.
export function deckChair(g) {
  const { x: cx, base } = CHAIR
  const left = cx - 9
  ellipse(g, cx + 2, base + 1, 11, 1.6, 'rgba(40,24,50,0.3)')
  // Patas traseras, que suben hasta el respaldo, y listones.
  ;[left, cx + 7].forEach((px) => {
    rect(g, px, base - 20, 2, 16, CHAIR_WHITE[2])
    rect(g, px, base - 20, 1, 16, CHAIR_WHITE[1])
  })
  rect(g, left, base - 20, 18, 3, CHAIR_WHITE[1])
  rect(g, left, base - 20, 18, 1, CHAIR_WHITE[0])
  ;[base - 14, base - 11].forEach((y) => rect(g, left + 2, y, 14, 2, CHAIR_WHITE[1]))
  // Asiento con su cojín y la cara delantera del bastidor.
  rect(g, left - 1, base - 7, 20, 3, CHAIR_WHITE[1])
  rect(g, left - 1, base - 7, 20, 1, CHAIR_WHITE[0])
  rect(g, left, base - 8, 18, 2, PINK)
  rect(g, left, base - 8, 18, 1, tint(PINK, 0.35))
  rect(g, left - 1, base - 4, 20, 1, CHAIR_WHITE[2])
  // Patas delanteras.
  ;[left, cx + 7].forEach((px) => {
    rect(g, px, base - 3, 2, 3, CHAIR_WHITE[2])
    rect(g, px, base - 3, 1, 3, CHAIR_WHITE[1])
  })
}

// Ventanas de la sala baja, bajo la cubierta: repartidas con el mismo margen a los lados y entre ellas sobre el muro visible
// (de `LOWER_WALL.x` al comienzo de la casa de dos plantas).
export const LOWER_WALL = { x: 38, right: 106 + DECK_WIDEN }
export const LOWER_WINDOW = { w: 32, h: 20, y: 128 }
export const lowerWindowXs = ({ x, right } = LOWER_WALL, { w } = LOWER_WINDOW) => {
  const gap = Math.round((right - x - 2 * w) / 3)
  return [x + gap, x + 2 * gap + w]
}
