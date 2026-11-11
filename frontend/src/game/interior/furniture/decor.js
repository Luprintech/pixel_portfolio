// Lo que hace que la casa parezca habitada: sillas, la caja de cartón de Khalessi (en dos capas, para que la gata quede
// dentro), plantas y el acceso a la azotea (escalera con puerta de cristal y su cartel).
import { drawText, textWidth } from '../../pixelFont.js'
import { INK, WOOD, hash2, rect, slab } from '../draw.js'
import { ROOF_DOOR } from '../homeLayout.js'

// Silla gamer vista desde atrás: respaldo alto con reposacabezas, base de cinco brazos y ruedas.
function gamerChair(g, body, light, dark, accent) {
  rect(g, 8, 24, 2, 4, INK.night)
  rect(g, 4, 27, 12, 1, INK.slate)
  rect(g, 2, 28, 3, 2, INK.night)
  rect(g, 15, 28, 3, 2, INK.night)
  rect(g, 8, 28, 4, 2, INK.night)
  slab(g, 2, 9, 16, 15, body, light, dark)
  rect(g, 2, 14, 16, 1, accent)
  rect(g, 2, 19, 16, 1, accent)
  slab(g, 5, 0, 10, 9, body, light, dark)
  rect(g, 8, 3, 4, 3, accent)
  rect(g, 0, 15, 3, 7, INK.slate)
  rect(g, 17, 15, 3, 7, INK.slate)
}

// Las sillas van en dos capas para que quien se siente quede entre ellas: la de atrás (reposacabezas y base con ruedas, detrás
// de la persona) y la de delante (todo el respaldo y los reposabrazos). Vista de espaldas, el respaldo está entre la cámara y
// quien se sienta: le tapa la espalda y las caderas y solo asoman la cabeza y los hombros por encima. Se pintan igual y cada
// capa borra lo que no es suyo; las filas 9 a 23 son el respaldo.
const CHAIR_SPLIT = { from: 9, to: 24 }

function chairLayer(layer, colors) {
  return (g) => {
    gamerChair(g, ...colors)
    if (layer === 'back') g.clearRect(0, CHAIR_SPLIT.from, 20, CHAIR_SPLIT.to - CHAIR_SPLIT.from)
    else {
      g.clearRect(0, 0, 20, CHAIR_SPLIT.from)
      g.clearRect(0, CHAIR_SPLIT.to, 20, 30 - CHAIR_SPLIT.to)
    }
  }
}

const ATREUS_CHAIR = [INK.white, '#ffffff', INK.whiteShade, INK.lagoonLight]
const LUPE_CHAIR = [INK.plum, '#a05fb5', '#4f2a60', INK.rose]

export const chairAtreus = { w: 20, h: 30, body: [{ l: -8, t: -6, r: 8, b: 0 }], paint: chairLayer('back', ATREUS_CHAIR) }
export const chairAtreusFront = { w: 20, h: 30, body: [], paint: chairLayer('front', ATREUS_CHAIR) }
export const chairLupe = { w: 20, h: 30, body: [{ l: -8, t: -6, r: 8, b: 0 }], paint: chairLayer('back', LUPE_CHAIR) }
export const chairLupeFront = { w: 20, h: 30, body: [], paint: chairLayer('front', LUPE_CHAIR) }

// Caja de cartón abierta: la capa de atrás (fondo y solapas) y la de delante (la pared baja), con la gata entre ambas.
const CARDBOARD = ['#cba36a', '#b98f5a', '#dfbf86', '#9c7547']

export const boxBack = {
  w: 26,
  h: 14,
  body: [{ l: -12, t: -8, r: 12, b: 0 }],
  paint(g) {
    const [mid, dark, light, deep] = CARDBOARD
    rect(g, 1, 2, 24, 12, dark)
    rect(g, 0, 0, 7, 3, light)
    rect(g, 19, 0, 7, 3, light)
    rect(g, 0, 2, 26, 1, mid)
    rect(g, 1, 13, 24, 1, deep)
  },
}

export const boxFront = {
  w: 26,
  h: 14,
  body: [],
  paint(g) {
    const [mid, dark, light, deep] = CARDBOARD
    rect(g, 0, 6, 26, 8, mid)
    rect(g, 0, 6, 26, 1, light)
    rect(g, 0, 13, 26, 1, deep)
    rect(g, 0, 6, 1, 8, dark)
    rect(g, 25, 6, 1, 8, dark)
    // Cinta de embalar, con un trozo suelto.
    rect(g, 9, 6, 6, 8, light)
    rect(g, 9, 6, 6, 1, INK.white)
    rect(g, 17, 9, 4, 1, INK.white)
  },
}

// Monstera grande de maceta de barro, para la esquina.
export const bigPlant = {
  w: 28,
  h: 36,
  body: [{ l: -6, t: -6, r: 6, b: 0 }],
  paint(g) {
    rect(g, 8, 26, 12, 9, INK.tile)
    rect(g, 8, 26, 12, 2, INK.tileDark)
    rect(g, 9, 34, 10, 1, INK.tileDark)
    rect(g, 13, 14, 2, 12, INK.moss)
    const leaves = [[2, 6, 8], [10, 1, 9], [18, 6, 8], [4, 15, 8], [16, 15, 8], [10, 10, 8]]
    leaves.forEach(([x, y, size], i) => {
      rect(g, x, y, size, size - 2, i % 2 ? '#62933f' : INK.moss)
      rect(g, x + 1, y, size - 2, 1, INK.meadow)
      rect(g, x + Math.floor(size / 2), y + 2, 1, size - 4, '#34643a')
      // Los cortes de la hoja, como en una monstera.
      rect(g, x, y + 3, 2, 1, i % 2 ? '#7da844' : '#62933f')
      rect(g, x + size - 2, y + 4, 2, 1, i % 2 ? '#7da844' : '#62933f')
    })
  },
}

// Planta alta y fina, para junto al sofá.
export const tallPlant = {
  w: 20,
  h: 44,
  body: [{ l: -5, t: -5, r: 5, b: 0 }],
  paint(g) {
    rect(g, 5, 34, 10, 9, INK.white)
    rect(g, 5, 34, 10, 2, INK.whiteShade)
    rect(g, 6, 42, 8, 1, INK.whiteShade)
    rect(g, 9, 12, 2, 22, '#34643a')
    for (let i = 0; i < 9; i++) {
      const side = i % 2 ? 1 : -1
      const y = 6 + i * 3
      const reach = 2 + Math.round(hash2(i, 2, 47) * 3)
      rect(g, side > 0 ? 11 : 9 - reach, y, reach, 2, i % 3 ? INK.moss : '#62933f')
      rect(g, side > 0 ? 10 + reach : 8 - reach, y - 1, 2, 3, i % 3 ? '#62933f' : INK.meadow)
    }
    rect(g, 8, 3, 4, 4, INK.meadow)
  },
}

// Escalera a la azotea: peldaños de madera con barandilla hasta una puerta de cristal por la que entra el cielo, vista de
// frente en la pared de la izquierda, como la escalera exterior de la casa. El cartel va encima (`roofSign`). El cristal de
// la puerta es un hueco (no pinta cielo), igual que las ventanas de la pared.
export const roofStairs = {
  w: ROOF_DOOR.w,
  h: ROOF_DOOR.h,
  body: [{ l: -17, t: -16, r: 17, b: 0 }],
  paint(g) {
    const [deep, dark, mid, light] = WOOD
    slab(g, 4, 0, 28, 38, dark, mid, deep)
    // El cristal queda hueco: por él se ve el cielo vivo del valle (`InteriorSky`), que está detrás del mueble.
    const { glass } = ROOF_DOOR
    g.clearRect(glass.x, glass.y, glass.w, glass.h)
    rect(g, 17, 3, 2, 24, dark)
    rect(g, 7, 14, 22, 2, dark)
    rect(g, 7, 30, 22, 6, mid)
    rect(g, 27, 29, 2, 2, INK.saffronLight)
    for (let i = 0; i < 5; i++) {
      const y = 38 + i * 5
      const inset = Math.max(0, 4 - i)
      rect(g, inset, y, 36 - inset * 2, 2, light)
      rect(g, inset, y + 2, 36 - inset * 2, 3, i % 2 ? mid : dark)
    }
    rect(g, 0, 61, 36, 1, deep)
    rect(g, 0, 36, 2, 25, dark)
    rect(g, 0, 34, 3, 3, mid)
    rect(g, 34, 36, 2, 25, dark)
    rect(g, 33, 34, 3, 3, mid)
  },
}

// Cartel de pared de la azotea, en el mismo rótulo de píxeles que la placa de la fachada.
export function roofSign(g, x, y) {
  const text = 'AZOTEA'
  slab(g, x, y, textWidth(text) + 6, 9, WOOD[2], WOOD[3], WOOD[0])
  drawText(g, x + 3, y + 2, text, INK.night)
}
