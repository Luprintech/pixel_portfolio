// Bar Mihrab dibujado en píxeles. Copia la composición de la ilustración que hizo la usuaria (cornisa, rótulo oscuro entre
// dos faroles, toldo crema, escaparate a la izquierda con taburetes, puerta abierta a la derecha, cuadro y expositor de
// carta a la izquierda y panel de azulejos a la derecha) con la paleta del valle y la luz arriba a la izquierda. Conserva
// las medidas del PNG (64×60, apoyado abajo en un lienzo de cuatro teselas) y la columna de la puerta, porque la terraza
// de delante (`terraceCafe.js`) y la tesela de entrada están colocadas contra ellas.
import { PAL, TONE, shade, tint } from '../palette.js'
import { dot, rect } from '../pixelKit.js'
import { drawText, textWidth } from '../pixelFont.js'
import { litPane } from './litPane.js'
import { STONE0, STONE1, STONE2, WOOD0, WOOD1, WOOD2, WOOD3, finish, newSprite } from './shared.js'

export const BAR_FACADE = { w: 64, h: 60 }
const BAR_CANVAS_H = 64
// Fila del lienzo donde empieza la fachada: el dibujo se apoya abajo y deja libre la franja de arriba.
const TOP = BAR_CANVAS_H - BAR_FACADE.h

const [PLASTER_DARK, PLASTER, PLASTER_LIGHT] = [TONE.earth[2], TONE.earth[3], TONE.earth[4]]
const AWNING = [shade(PAL.bone, 0.78), shade(PAL.bone, 0.9), PAL.bone, tint(PAL.bone, 0.5)]
// Interior en penumbra que se ve por el escaparate y la puerta abierta: madera oscura, no el azul de la noche.
const DARK = shade(WOOD0, 0.55)
const DIM = shade(WOOD0, 0.78)

// Hueco del escaparate y de la puerta, en píxeles de la fachada.
const SHOP = { x: 12, y: 27, w: 25, h: 29 }
const DOOR = { x: 39, y: 27, w: 11, h: 29 }
// Centro de la puerta abierta; ValleScene alinea con él la tesela de entrada.
export const BAR_DOOR_COL = 44

// Cornisa: hilada de ladrillo visto con su vierteaguas, que remata la fachada.
function cornice(g, y) {
  const [d0, d1, d2, d3] = [WOOD1, TONE.earth[0], TONE.earth[1], TONE.earth[2]]
  rect(g, 1, y, 62, 4, d2)
  rect(g, 1, y, 62, 1, d1)
  rect(g, 0, y + 1, 64, 2, d3)
  for (let x = 2; x < 62; x += 5) rect(g, x, y + 1, 2, 1, TONE.earth[3])
  for (let x = 4; x < 62; x += 5) rect(g, x, y + 3, 1, 1, d1)
  rect(g, 1, y + 4, 62, 1, d0)
}

// Pared enlucida con un zócalo de piedra rosada a la derecha, donde no llega el expositor.
function plaster(g, y, h) {
  rect(g, 1, y, 62, h, PLASTER)
  rect(g, 1, y, 62, 2, PLASTER_DARK)
  rect(g, 1, y, 2, h, PLASTER_LIGHT)
  rect(g, 61, y, 2, h, PLASTER_DARK)
  const plinth = 47
  rect(g, 54, plinth, 8, 57 - plinth, tint(PAL.earthDark, 0.35))
  rect(g, 54, plinth, 8, 1, tint(PAL.earthDark, 0.55))
  rect(g, 54, plinth + 5, 8, 1, PAL.earthDark)
}

// Rótulo de madera oscura con el nombre en letra de 3×5, sombra de una fila y un listón ámbar debajo.
function signBoard(g, y) {
  const x = 8
  const w = 48
  rect(g, x, y, w, 11, WOOD1)
  rect(g, x, y, w, 1, WOOD2)
  rect(g, x + 1, y + 1, w - 2, 8, WOOD0)
  rect(g, x + 1, y + 1, w - 2, 1, shade(WOOD0, 0.8))
  const label = 'BAR MIHRAB'
  const tx = x + Math.floor((w - textWidth(label)) / 2)
  drawText(g, tx, y + 4, label, shade(WOOD0, 0.6))
  drawText(g, tx, y + 3, label, PAL.bone)
  rect(g, x + 1, y + 9, w - 2, 1, shade(PAL.saffron, 0.78))
  rect(g, x, y + 10, w, 1, shade(WOOD0, 0.7))
  dot(g, x + 1, y + 1, WOOD2)
  dot(g, x + w - 2, y + 1, WOOD2)
}

// Farol de pared: brazo de hierro, sombrerete y cristal crema.
function lantern(g, x, y, flip) {
  const iron = shade(PAL.stone, 0.6)
  rect(g, x, y, 5, 1, iron)
  rect(g, x + 1, y + 1, 3, 6, PAL.bone)
  rect(g, x + 1, y + 1, 1, 6, tint(PAL.bone, 0.6))
  rect(g, x + 3, y + 1, 1, 6, AWNING[1])
  rect(g, x, y + 7, 5, 1, iron)
  rect(g, x + 2, y + 8, 1, 2, iron)
  // El brazo sale de la pared hacia el lado contrario al rótulo.
  rect(g, flip ? x + 5 : x - 1, y + 3, 1, 1, iron)
}

// Toldo recogido de lona crema: pliegues verticales suaves y un faldón ondulado con sus remaches.
function awning(g, y) {
  const x = 7
  const w = 51
  rect(g, x, y, w, 7, AWNING[2])
  rect(g, x, y, w, 1, AWNING[0])
  rect(g, x, y + 1, w, 1, AWNING[3])
  for (let fx = x + 6; fx < x + w - 2; fx += 8) rect(g, fx, y + 2, 1, 4, AWNING[1])
  rect(g, x, y + 6, w, 1, AWNING[1])
  for (let fx = x + 1; fx < x + w; fx += 4) {
    rect(g, fx, y + 7, 3, 1, AWNING[2])
    dot(g, fx + 1, y + 7, AWNING[0])
  }
  rect(g, x + w - 2, y + 1, 2, 6, AWNING[1])
}

// Soporte de hierro forjado bajo el farol derecho: aguanta el toldo y deja ver una voluta.
function ironBracket(g, x, y) {
  const iron = shade(PAL.stone, 0.6)
  rect(g, x, y, 1, 6, iron)
  rect(g, x, y, 4, 1, iron)
  dot(g, x + 4, y + 1, iron)
  dot(g, x + 3, y + 2, iron)
  dot(g, x + 1, y + 3, iron)
}

// Marco de madera del escaparate y la puerta, con el montante gris que los separa.
function shopFrame(g) {
  const x = SHOP.x - 2
  const y = SHOP.y - 3
  const w = DOOR.x + DOOR.w + 2 - x
  const h = SHOP.y + SHOP.h - y
  rect(g, x, y, w, h, WOOD0)
  rect(g, x, y, w, 1, WOOD1)
  rect(g, x, y, 1, h, WOOD1)
  rect(g, x + 1, y + 1, w - 2, 1, shade(WOOD0, 0.8))
  rect(g, SHOP.x + SHOP.w, SHOP.y, 2, SHOP.h, tint(PAL.stone, 0.3))
  rect(g, SHOP.x + SHOP.w, SHOP.y, 1, SHOP.h, tint(PAL.stone, 0.55))
}

// Taburete alto de madera visto de frente: asiento, dos patas y el travesaño.
function stool(g, x, y) {
  rect(g, x, y, 7, 2, WOOD3)
  rect(g, x, y + 1, 7, 1, WOOD2)
  rect(g, x + 1, y + 2, 1, 8, WOOD2)
  rect(g, x + 5, y + 2, 1, 8, WOOD1)
  rect(g, x + 1, y + 6, 5, 1, WOOD2)
}

// Interior del escaparate: dos baldas vacías en la penumbra, la barra y dos taburetes delante, todo bajo el cristal.
// Devuelve los huecos (los taburetes) que quedan en silueta cuando el cristal se enciende de noche.
function shopWindow(g) {
  const { x, y, w, h } = SHOP
  rect(g, x, y, w, h, DARK)
  rect(g, x, y, w, 2, shade(DARK, 0.7))
  ;[y + 5, y + 11].forEach((shelfY) => {
    rect(g, x + 2, shelfY, w - 4, 1, WOOD0)
    rect(g, x + 2, shelfY + 1, w - 4, 1, shade(DARK, 0.75))
  })
  rect(g, x, y + 16, w, 2, WOOD1)
  rect(g, x, y + 16, w, 1, WOOD2)
  rect(g, x, y + 18, w, h - 18, DIM)
  stool(g, x + 4, y + 17)
  stool(g, x + 14, y + 17)
  rect(g, x, y + h - 2, w, 2, shade(WOOD1, 0.8))
  glassSheen(g, SHOP)
  return [
    { x: 4, y: 17, w: 7, h: 10 },
    { x: 14, y: 17, w: 7, h: 10 },
  ]
}

// Bandas de reflejo en diagonal ('/'): `offset` es la columna donde cada banda corta la fila de abajo del cristal.
const SHEEN_BANDS = [
  { offset: -6, width: 4, alpha: 0.2 },
  { offset: 0, width: 1, alpha: 0.16 },
  { offset: 13, width: 2, alpha: 0.12 },
]

// Cristal sobre el interior: un velo azulado muy leve, el canto de arriba y el de la izquierda más claros y bandas de
// reflejo en diagonal que cruzan el hueco entero (también por encima de los taburetes), como en la ilustración.
function glassSheen(g, { x, y, w, h }) {
  rect(g, x, y, w, h, 'rgba(159,214,224,0.05)')
  rect(g, x, y, w, 1, 'rgba(255,255,255,0.28)')
  rect(g, x, y + 1, 1, h - 1, 'rgba(255,255,255,0.18)')
  for (let row = 0; row < h; row++) {
    const rise = h - 1 - row
    SHEEN_BANDS.forEach(({ offset, width, alpha }) => {
      const from = Math.max(x, x + offset + rise - width)
      const to = Math.min(x + w, x + offset + rise)
      if (to > from) rect(g, from, y + row, to - from, 1, `rgba(255,255,255,${alpha})`)
    })
  }
  dot(g, x + 1, y + 1, 'rgba(255,255,255,0.6)')
}

// Puerta abierta: el pasillo en penumbra con el umbral de madera.
function openDoor(g) {
  const { x, y, w, h } = DOOR
  rect(g, x, y, w, h, DARK)
  rect(g, x, y, 2, h, shade(DARK, 0.7))
  rect(g, x + 2, y + h - 6, w - 2, 4, DIM)
  rect(g, x, y + h - 2, w, 2, WOOD1)
  rect(g, x, y + h - 2, w, 1, WOOD2)
}

// Cuadro colgado: marco de madera y una lámina ámbar.
function poster(g, x, y) {
  rect(g, x, y, 6, 9, WOOD1)
  rect(g, x, y, 6, 1, WOOD2)
  rect(g, x + 1, y + 1, 4, 7, PAL.saffron)
  rect(g, x + 1, y + 1, 4, 2, PAL.saffronLight)
  rect(g, x + 2, y + 4, 2, 2, PAL.tile)
  rect(g, x + 1, y + 7, 4, 1, shade(PAL.saffron, 0.8))
}

// Expositor de la carta: tejadillo azul, marco rojo y las fotos de los platos.
function menuStand(g, x, y) {
  rect(g, x - 1, y, 8, 2, PAL.lagoon)
  rect(g, x - 1, y, 8, 1, PAL.lagoonLight)
  rect(g, x, y + 2, 6, 13, PAL.tile)
  rect(g, x, y + 2, 1, 13, tint(PAL.tile, 0.3))
  rect(g, x + 5, y + 2, 1, 13, PAL.tileDark)
  const dishes = [[PAL.lagoon, PAL.saffron], [PAL.saffronLight, PAL.tile], [PAL.earth, PAL.bone]]
  dishes.forEach(([back, food], i) => {
    rect(g, x + 1, y + 3 + i * 4, 4, 3, back)
    dot(g, x + 2, y + 4 + i * 4, food)
    dot(g, x + 3, y + 4 + i * 4, food)
  })
}

// Panel de azulejos: seis piezas en dos columnas con un motivo central, enmarcadas en madera.
function tilePanel(g, x, y) {
  rect(g, x, y, 7, 16, WOOD1)
  rect(g, x, y, 7, 1, WOOD2)
  const motifs = [PAL.lagoon, PAL.saffron, PAL.tile, PAL.lagoon, PAL.saffron, PAL.tile]
  motifs.forEach((motif, i) => {
    const tx = x + 1 + (i % 2) * 3
    const ty = y + 1 + Math.floor(i / 2) * 5
    rect(g, tx, ty, 2, 4, PAL.bone)
    rect(g, tx, ty + 1, 2, 2, motif)
  })
}

// Escalón de piedra a lo largo de toda la fachada.
function step(g, y) {
  rect(g, 1, y, 62, 3, STONE1)
  rect(g, 1, y, 62, 1, STONE2)
  rect(g, 1, y + 2, 62, 1, STONE0)
  for (let x = 9; x < 62; x += 11) rect(g, x, y + 1, 1, 1, STONE0)
}

export function barSprite() {
  const s = newSprite(BAR_FACADE.w, BAR_CANVAS_H)
  const { g } = s
  // Las piezas trabajan en píxeles de la fachada; el lienzo es más alto y la fachada se apoya abajo.
  g.translate(0, TOP)
  cornice(g, 0)
  plaster(g, 5, 52)
  signBoard(g, 5)
  lantern(g, 2, 6, false)
  lantern(g, 57, 6, true)
  awning(g, 16)
  ironBracket(g, 57, 16)
  shopFrame(g)
  const holes = shopWindow(g)
  openDoor(g)
  poster(g, 3, 31)
  menuStand(g, 3, 42)
  tilePanel(g, 55, 27)
  step(g, 57)
  g.setTransform(1, 0, 0, 1, 0, 0)
  s.doorCol = BAR_DOOR_COL
  // De noche se encienden el escaparate (con los taburetes en silueta) y el fondo de la puerta abierta.
  s.windows.push(...litPane(SHOP.x, TOP + SHOP.y, SHOP.w, SHOP.h, holes))
  s.windows.push(...litPane(DOOR.x + 2, TOP + DOOR.y, DOOR.w - 2, DOOR.h - 2))
  return finish(s)
}
