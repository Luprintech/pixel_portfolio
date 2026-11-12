// Mezquita-Catedral de Córdoba, como homenaje a la ciudad de Lupe. Un edificio de 15×8 teselas (240×128 px) que reúne lo que la
// hace reconocible: el muro largo de piedra clara con almenas escalonadas, la Puerta del Perdón con su alfiz, los arcos de herradura
// con dovelas rojas y crema, la nave de la catedral asomando con su cimborrio y el campanario (el antiguo alminar), alto y a la
// derecha, con su remate y San Rafael. Es una interpretación en píxel art, no un plano. Sin interior: el edificio se mira desde la
// calle (ver `world.js`, `talk`). La puerta cae en la columna 120, el centro de la tesela de puerta.
import { PAL, tint } from '../palette.js'
import { dot, rect } from '../pixelKit.js'
import { STONE0, STONE1, WOOD0, finish, hipRoof, newSprite, windowAt } from './shared.js'

const SAND = ['#b98f5a', '#d8b983', '#ecd7a6']
const RED = '#b84c3c'
const CREAM = '#f3e4bf'
const DARK = '#2e1f2a'
const TERRACOTTA = '#b35a43'
const SPRING = 0.35

// Arco de herradura de `w` de ancho: el hueco se ensancha por encima de la línea de arranque y se cierra un poco por debajo, y lo
// rodea un anillo de dovelas alternas rojas y crema que sigue por las jambas hasta el suelo. `top` es la cima del hueco.
function horseshoe(g, cx, top, w, h, ring = 3) {
  const radius = (w / 2) * 1.12
  const neck = w / 2 - 1
  const centreY = top + radius
  const springY = centreY + SPRING * radius
  const bottom = top + h
  const halfAt = (y) => {
    const dy = y + 0.5 - centreY
    return dy < SPRING * radius ? Math.sqrt(Math.max(0, radius * radius - dy * dy)) : neck
  }
  for (let y = top; y < bottom; y++) {
    const half = halfAt(y)
    rect(g, Math.round(cx - half), y, Math.round(half * 2), 1, DARK)
  }
  for (let y = Math.floor(top - ring); y < springY; y++) {
    for (let x = Math.floor(cx - radius - ring); x <= Math.ceil(cx + radius + ring); x++) {
      const dx = x + 0.5 - cx
      const dy = y + 0.5 - centreY
      const distance = Math.hypot(dx, dy)
      if (distance > radius && distance <= radius + ring && dy < SPRING * radius) {
        rect(g, x, y, 1, 1, Math.floor(Math.atan2(dy, dx) / (Math.PI / 11)) % 2 === 0 ? RED : CREAM)
      }
    }
  }
  for (let y = Math.floor(springY); y < bottom; y++) {
    const colour = Math.floor((y - springY) / 3) % 2 === 0 ? RED : CREAM
    rect(g, Math.round(cx - neck) - ring, y, ring, 1, colour)
    rect(g, Math.round(cx + neck), y, ring, 1, colour)
  }
}

// Almenas escalonadas del muro: cada una es una pequeña pirámide de dos peldaños.
function crenellations(g, x, y, w) {
  for (let cx = x; cx + 8 <= x + w; cx += 12) {
    rect(g, cx, y, 8, 3, SAND[1])
    rect(g, cx + 2, y - 3, 4, 3, SAND[1])
    rect(g, cx, y, 8, 1, SAND[2])
    rect(g, cx + 2, y - 3, 4, 1, SAND[2])
    rect(g, cx + 7, y, 1, 3, SAND[0])
  }
}

// Hiladas de sillares: líneas finas horizontales y juntas desfasadas, para que el muro no sea un plano liso.
function masonry(g, x, y, w, h) {
  for (let row = y + 5; row < y + h - 6; row += 6) {
    rect(g, x, row, w, 1, SAND[0])
    for (let joint = x + ((row / 6) % 2) * 6; joint < x + w; joint += 12) rect(g, joint, row + 1, 1, 5, SAND[0])
  }
}

// Campanario: el antiguo alminar. Cuatro cuerpos que se van estrechando (base, cuerpo con ventanas, cuerpo de campanas abierto y
// remate de tejas) y encima San Rafael, con su dorado.
function bellTower(s, left) {
  const { g } = s
  const section = (x, y, w, h) => {
    rect(g, x, y, w, h, SAND[1])
    rect(g, x, y, 3, h, SAND[2])
    rect(g, x + w - 3, y, 3, h, SAND[0])
    rect(g, x, y, w, 2, SAND[2])
    rect(g, x - 1, y + h - 2, w + 2, 2, SAND[0])
  }
  section(left, 74, 34, 54)
  section(left + 3, 44, 28, 32)
  section(left + 5, 24, 24, 22)
  // Hiladas y esquinas de piedra más oscura en la base.
  for (let row = 80; row < 124; row += 6) rect(g, left + 2, row, 30, 1, SAND[0])
  horseshoe(g, left + 17, 90, 10, 24, 2)
  // Ventanas en arco del cuerpo medio y arcos abiertos del de campanas, con la campana a la vista.
  windowAt(s, left + 8, 51, 6, 12, { arched: true, muntins: false, lit: true })
  windowAt(s, left + 20, 51, 6, 12, { arched: true, muntins: false, lit: true })
  rect(g, left + 8, 29, 8, 12, DARK)
  rect(g, left + 18, 29, 8, 12, DARK)
  rect(g, left + 9, 28, 6, 1, DARK)
  rect(g, left + 19, 28, 6, 1, DARK)
  rect(g, left + 11, 33, 4, 5, PAL.saffron)
  rect(g, left + 11, 33, 4, 1, tint(PAL.saffron, 0.4))
  dot(g, left + 12, 38, WOOD0)
  // Remate: tejado de tejas en pirámide con su bola y San Rafael.
  hipRoof(g, { x: left + 5, y: 10, w: 24, rows: 3, color: TERRACOTTA, inset: 3, rowH: 4 })
  rect(g, left + 16, 4, 2, 7, PAL.saffron)
  rect(g, left + 15, 3, 4, 2, PAL.saffronLight)
  dot(g, left + 16, 1, PAL.saffronLight)
  dot(g, left + 17, 2, PAL.saffron)
}

// Nave de la catedral que asoma por encima del muro, con su tejado de tejas, ventanas altas y el cimborrio (la linterna que corona
// el crucero) con su cúpula.
function cathedralNave(s) {
  const { g } = s
  rect(g, 32, 38, 128, 28, SAND[1])
  rect(g, 32, 38, 128, 3, SAND[2])
  rect(g, 32, 38, 4, 28, SAND[2])
  rect(g, 156, 38, 4, 28, SAND[0])
  hipRoof(g, { x: 26, y: 24, w: 140, rows: 4, color: TERRACOTTA, inset: 5, rowH: 4 })
  for (let x = 44; x < 150; x += 20) windowAt(s, x, 46, 7, 14, { arched: true, muntins: false })
  // Cimborrio: cuerpo cuadrado con arcos y un pequeño chapitel.
  rect(g, 96, 6, 32, 24, SAND[1])
  rect(g, 96, 6, 3, 24, SAND[2])
  rect(g, 125, 6, 3, 24, SAND[0])
  rect(g, 95, 28, 34, 3, SAND[0])
  windowAt(s, 102, 12, 6, 12, { arched: true, muntins: false })
  windowAt(s, 116, 12, 6, 12, { arched: true, muntins: false })
  hipRoof(g, { x: 94, y: 0, w: 36, rows: 2, color: '#8e9c9e', inset: 6, rowH: 3 })
}

// Puerta del Perdón: portada con alfiz (el marco rectangular), arco de herradura con dovelas y un friso de azulejos arriba.
function pardonGate(s, cx) {
  const { g } = s
  rect(g, cx - 24, 60, 48, 68, SAND[2])
  rect(g, cx - 24, 60, 48, 2, SAND[1])
  rect(g, cx - 24, 60, 3, 68, SAND[1])
  rect(g, cx + 21, 60, 3, 68, SAND[0])
  rect(g, cx - 20, 64, 40, 3, RED)
  for (let x = cx - 20; x < cx + 20; x += 4) rect(g, x, 67, 2, 2, CREAM)
  rect(g, cx - 18, 70, 36, 2, SAND[0])
  horseshoe(g, cx, 80, 22, 44, 3)
  rect(g, cx - 18, 70, 36, 1, CREAM)
  // Peldaños ante la puerta.
  rect(g, cx - 18, 124, 36, 4, STONE1)
  rect(g, cx - 18, 127, 36, 1, STONE0)
}

export function mosqueSprite() {
  const s = newSprite(240, 128)
  const { g } = s
  // Muro largo con almenas, sillares y contrafuertes.
  rect(g, 4, 66, 188, 62, SAND[1])
  rect(g, 4, 66, 188, 3, SAND[2])
  rect(g, 4, 66, 3, 62, SAND[2])
  rect(g, 189, 66, 3, 62, SAND[0])
  masonry(g, 6, 66, 184, 62)
  crenellations(g, 6, 66, 184)
  cathedralNave(s)
  // Contrafuertes entre los arcos.
  ;[46, 92, 148, 190].forEach((x) => {
    rect(g, x, 68, 4, 60, SAND[2])
    rect(g, x + 3, 68, 1, 60, SAND[0])
  })
  ;[26, 70, 170].forEach((cx) => {
    horseshoe(g, cx, 92, 14, 32, 3)
    windowAt(s, cx - 3, 74, 6, 11, { arched: true, muntins: false })
  })
  pardonGate(s, 120)
  rect(g, 4, 122, 188, 6, STONE1)
  for (let x = 6; x < 190; x += 7) rect(g, x + ((x / 7) % 2 ? 3 : 0), 122, 1, 6, STONE0)
  rect(g, 4, 122, 188, 1, tint(STONE1, 0.3))
  bellTower(s, 198)
  s.doorCol = 120
  return finish(s)
}
