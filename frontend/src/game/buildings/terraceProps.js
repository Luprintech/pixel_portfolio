// Dibujo de la cubierta de la casa de Lupe: suelo, escalera con su pasamanos, balaustradas, telescopio y sombrilla.
// Todo en píxeles del dibujo de la casa (`homeSprite`), con la luz arriba a la izquierda. Las cifras de sitio salen de
// terrace.js, que también las lee la escena: lo que se ve es lo que se pisa y lo que se toca. Las cifras que también
// necesitan la nieve (terraceWinter.js) y la luz (homeLight.js) se exportan desde aquí.
import { PAL, shade, tint } from '../palette.js'
import { dot, ellipse, line, rect } from '../pixelKit.js'
import { DECK, TABLE, TELESCOPE } from '../terrace.js'
import { WOOD0, WOOD1, WOOD2, WOOD3 } from './shared.js'

export const BRASS = [shade(PAL.saffron, 0.55), shade(PAL.saffron, 0.78), PAL.saffron, PAL.saffronLight]
const TUBE = ['#34497a', '#5c7aa8', '#9fb8d8']
const LEG = '#2a2250'
const PINK = '#e07a9c'
const CREAM = '#f6f0e0'
const RIM = '#8a3a5c'

// Fondo del entarimado: del pie de la balaustrada trasera (`FLOOR_TOP`) al canto delantero. Los muebles apoyan en
// `FLOOR_Y`, contra el fondo, y delante queda el suelo libre por el que se anda (ver `DECK.top` en terrace.js).
export const FLOOR_TOP = 84
export const FLOOR_DEPTH = 30
export const FLOOR_Y = TABLE.base
// Barandilla delantera: la viajera queda detrás. Entre la escalera (x < 40) y su primer poste queda libre la entrada.
export const FRONT_RAIL = { x: 52, top: 106, bottom: 119, right: DECK.right + 1 }
const RAIL_POST_GAP = 18

// Postes de la barandilla delantera: uno cada `RAIL_POST_GAP` píxeles y siempre uno en el extremo derecho.
export function frontRailPosts({ x, right } = FRONT_RAIL) {
  const posts = []
  for (let px = x; px < right - 3 - 6; px += RAIL_POST_GAP) posts.push(px)
  posts.push(right - 3)
  return posts
}
// Balaustrada trasera: un poste en la esquina de la escalera y un tramo a la derecha. Entre ambos se deja un hueco
// al cielo, detrás del telescopio, para que su contorno no se mezcle con los balaustres.
export const BACK_RAIL = { post: DECK.left + 4, from: TELESCOPE.x + 14 }
export const BACK_RAIL_Y = FLOOR_TOP - 11
export const PARASOL = { cx: TABLE.x, top: 62, rx: 18, ry: 13 }
// Guirnalda: del mástil de la escalera al alero de la casa, por encima del telescopio y de la sombrilla.
export const STRAND = { from: { x: 38, y: 38 }, to: { x: DECK.right, y: 58 }, sag: 4 }

// Altura del filo de los peldaños: sobre ella están los pies al subir (ver `stairLift`).
export const noseY = (i, { bottom, rise }) => bottom - rise * (i + 1)

// Posición de cada punto de la guirnalda; las bombillas caen cada siete columnas.
export function strandPoints({ from, to, sag } = STRAND) {
  const points = []
  for (let px = from.x; px <= to.x; px++) {
    const u = (px - from.x) / (to.x - from.x)
    points.push({ x: px, y: Math.round(from.y + (to.y - from.y) * u + sag * Math.sin(Math.PI * u)), bulb: (px - from.x) % 7 === 3 })
  }
  return points
}

// Entarimado: tablas con juntas desfasadas, sombra bajo la balaustrada trasera y el canto delantero.
export function deckFloor(g) {
  const x = DECK.left - 4
  const w = DECK.right + 4 - x
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
  stairRail(g, { x, bottom, steps, run, rise })
}

// Pasamanos de la escalera: postes verticales sobre cada segundo peldaño, balaustres finos entre ellos y un
// pasamanos recto que sigue la pendiente de los peldaños. Empieza y acaba en un poste con remate; el de arriba
// sigue hasta el mástil de la guirnalda. Entre su final y la barandilla delantera queda libre la entrada.
export const RAIL_H = 15
// Altura de la cara superior del pasamanos en la columna `px`.
export const stairRailTop = (px, { x, bottom, run, rise }) => Math.round(bottom - rise - (rise / run) * (px - x - run / 2)) - RAIL_H

export function stairRail(g, { x, bottom, steps, run, rise }) {
  const railAt = (px) => stairRailTop(px, { x, bottom, run, rise })
  const start = x + run
  const end = x + steps * run - 2
  // Balaustres finos, uno por peldaño.
  for (let i = 1; i < steps; i++) {
    const px = x + i * run + 2
    rect(g, px, railAt(px) + 3, 1, noseY(i, { bottom, rise }) - railAt(px) - 3, WOOD2)
  }
  // Postes cada dos peldaños.
  for (let i = 1; i < steps; i += 2) {
    const px = x + i * run + 1
    const top = railAt(px)
    const base = noseY(i, { bottom, rise })
    rect(g, px, top, 3, base - top, WOOD1)
    rect(g, px, top, 1, base - top, WOOD3)
    if (i === 1 || i === steps - 1) rect(g, px - 1, top - 2, 5, 2, WOOD3)
  }
  // Pasamanos: una banda de tres píxeles con la cara superior iluminada.
  line(g, start, railAt(start), end, railAt(end), WOOD2, 3)
  line(g, start, railAt(start), end, railAt(end), WOOD3, 1)
  line(g, start, railAt(start) + 2, end, railAt(end) + 2, WOOD1, 1)
}

// Balaustrada trasera: balaustres, postes con remate (también en cada extremo), barandal y travesaño bajo. Va en
// maderas un tono más oscuras que la delantera, para que quede al fondo.
// Posiciones de los postes de un tramo de balaustrada: cada catorce píxeles y uno en el extremo.
export function railPosts(x, w) {
  const posts = []
  for (let bx = x; bx <= x + w - 3; bx += 14) posts.push(bx)
  if (posts[posts.length - 1] < x + w - 7) posts.push(x + w - 3)
  return posts
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

// Los dos tramos de la balaustrada trasera: el poste de la esquina de la escalera y el de la derecha, con el hueco
// del telescopio en medio.
export function backRail(g) {
  balustrade(g, BACK_RAIL.post, BACK_RAIL_Y, 3)
  balustrade(g, BACK_RAIL.from, BACK_RAIL_Y, DECK.right + 1 - BACK_RAIL.from)
}

// Barandilla delantera: va en una capa aparte, por encima de la viajera, que pasa por detrás con las piernas
// medio tapadas. Solo postes, pasamanos y un travesaño bajo: nada de paneles, para que se vea la cubierta a través.
// Se dibuja en las coordenadas del dibujo de la casa; quien la usa traslada el lienzo a su esquina.
export function frontRail(g) {
  const { x, top, bottom, right } = FRONT_RAIL
  const w = right - x
  const posts = frontRailPosts()
  rect(g, x, top + 9, w, 2, WOOD1)
  rect(g, x, top + 2, w, 3, WOOD2)
  rect(g, x, top + 2, w, 1, WOOD3)
  posts.forEach((px) => {
    rect(g, px, top + 2, 3, bottom - top - 2, WOOD1)
    rect(g, px, top + 2, 1, bottom - top - 2, WOOD3)
    rect(g, px - 1, top, 5, 2, WOOD3)
  })
}

// Telescopio de latón sobre un trípode: patas abiertas de metal oscuro, cabeza giratoria, tubo azul inclinado con
// anillos, ocular a la izquierda, campana y lente a la derecha y un buscador paralelo encima. Tiene sombra propia en
// el suelo y el hueco de la balaustrada y de la guirnalda a su alrededor para que su contorno se lea entero.
export function telescope(g) {
  const { x: cx, base } = TELESCOPE
  const apexY = base - 14
  ellipse(g, cx + 1, base + 1, 11, 1.8, 'rgba(40,24,50,0.32)')
  // Trípode: patas de dos píxeles con un filo claro a la izquierda.
  const leg = (toX) => {
    line(g, cx, apexY, toX, base, LEG, 1)
    line(g, cx + 1, apexY, toX + 1, base, LEG, 1)
    dot(g, toX - 1, base, '#6a5aa0')
    rect(g, toX, base, 3, 1, PAL.ink)
  }
  leg(cx - 8)
  leg(cx + 7)
  rect(g, cx - 1, apexY, 3, base + 2 - apexY, '#3b3572')
  rect(g, cx - 1, apexY, 1, base + 2 - apexY, '#6a5aa0')
  line(g, cx - 5, base - 5, cx + 5, base - 5, LEG, 1)
  // Cabeza giratoria.
  rect(g, cx - 3, apexY - 2, 7, 3, BRASS[1])
  rect(g, cx - 3, apexY - 2, 7, 1, BRASS[3])
  rect(g, cx - 1, apexY - 4, 3, 2, BRASS[2])
  // Tubo: de (cx-1, apexY-3) hacia arriba a la derecha. `axis` da la altura del eje a una columna.
  const axis = (px) => apexY - 4 - 0.6 * (px - (cx - 1))
  const from = cx - 1
  const to = cx + 14
  line(g, from, axis(from) - 1, to, axis(to) - 1, TUBE[1], 4)
  line(g, from, axis(from) - 1, to, axis(to) - 1, TUBE[2], 1)
  line(g, from, axis(from) + 2, to, axis(to) + 2, TUBE[0], 1)
  // Anillos de latón.
  ;[from + 3, from + 10].forEach((px) => {
    rect(g, px, Math.round(axis(px)) - 2, 2, 6, BRASS[2])
    rect(g, px, Math.round(axis(px)) - 2, 2, 1, BRASS[3])
  })
  // Campana del objetivo con su lente.
  const bellX = to + 1
  line(g, to, axis(to) - 2, bellX + 3, axis(bellX + 3) - 2, BRASS[1], 6)
  line(g, to, axis(to) - 2, bellX + 3, axis(bellX + 3) - 2, BRASS[3], 1)
  ellipse(g, bellX + 4, axis(bellX + 4) + 1, 1.6, 3.2, BRASS[0])
  ellipse(g, bellX + 4, axis(bellX + 4) + 1, 1, 2.4, '#bfe4f0')
  dot(g, bellX + 4, axis(bellX + 4), '#ffffff')
  // Ocular: tubito de latón más largo y claro, con su tapa oscura, bien separado de todo lo demás.
  line(g, from - 5, axis(from - 5) + 1, from, axis(from) + 1, BRASS[2], 2)
  line(g, from - 5, axis(from - 5) + 1, from, axis(from) + 1, BRASS[3], 1)
  rect(g, from - 7, Math.round(axis(from - 5)), 2, 4, PAL.ink)
  dot(g, from - 7, Math.round(axis(from - 5)), '#6a5aa0')
  // Buscador encima del tubo, sujeto con dos soportes.
  const finderFrom = from + 3
  const finderTo = from + 11
  line(g, finderFrom, axis(finderFrom) - 5, finderTo, axis(finderTo) - 5, '#b8b4d0', 1)
  ;[finderFrom + 1, finderTo - 1].forEach((px) => rect(g, px, Math.round(axis(px)) - 5, 1, 4, BRASS[1]))
  dot(g, finderTo + 1, axis(finderTo + 1) - 5, '#bfe4f0')
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
