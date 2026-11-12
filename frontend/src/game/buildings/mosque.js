// Mezquita-Catedral de Córdoba, como homenaje a la ciudad de Lupe. Un edificio de 17×11 teselas (272×176 px) que sigue la
// composición del monumento: la muralla de piedra con almenas delante, la Puerta del Perdón con su arco de herradura en el centro
// y una arcada de tres arcos de herradura a cada lado, el campanario (el antiguo alminar) en el extremo derecho, la gran nave con
// su tejado de teja, el pabellón de cúpula escalonada delante del crucero, el cimborrio a la izquierda y el ábside gótico con sus
// ojos de buey. Los volúmenes se dibujan de atrás adelante para que se vean escalonados. Sin interior: el edificio se mira desde
// la calle (ver `world.js`, `talk`). La puerta cae en la columna 136, el centro del lienzo y de la tesela de puerta. Los
// naranjos de la entrada son objetos aparte (`orangeTree` en `props.js`), para que la viajera pase por detrás de las copas.
import { PAL, tint } from '../palette.js'
import { dot, ellipse, rect } from '../pixelKit.js'
import { STONE0, STONE1, WOOD0, finish, newSprite } from './shared.js'
import {
  DARK, RIDGE, ROOF, SAND, SAND_SHADE,
  archShape, archWindow, bell, flyingButtress, horseshoe, masonry, merlons, pinnacle, stoneBlock, tileRoof,
} from './mosqueParts.js'

const WIDTH = 272
const HEIGHT = 176
const WALL_TOP = 122
const CENTRE = 136

// Columna de la esquina izquierda de una pieza de ancho `w` que sería la espejo de otra que empieza en `x`: los volúmenes altos se
// colocaron pensando en el lado izquierdo y aquí se reflejan con esta función.
const mirror = (x, w = 0) => WIDTH - x - w

// Cimborrio: el tambor octogonal que corona el crucero, con una hilera de arquillos, tres ventanas y tejado piramidal con su bola.
function cimborrio(s) {
  const { g } = s
  stoneBlock(g, mirror(149, 48), 46, 48, 66)
  for (let x = 153; x < 193; x += 7) archShape(g, mirror(x + 1, 4), 50, 4, 6, DARK)
  ;[153, 172, 190].forEach((x) => archWindow(s, mirror(x, 5), 61, 5, 11))
  ellipse(g, mirror(186), 84, 3.5, 2.5, SAND[2])
  ellipse(g, mirror(186), 84, 2.5, 1.5, DARK)
  tileRoof(g, { x: mirror(147, 52), y: 25, w: 52, rows: 5, inset: 5, rowH: 4 })
  rect(g, mirror(146, 54), 45, 54, 3, SAND[2])
  rect(g, mirror(146, 54), 48, 54, 1, SAND[0])
  rect(g, mirror(173, 2), 18, 2, 7, SAND[0])
  ellipse(g, mirror(173), 16, 2.5, 2.5, '#59605c')
  dot(g, mirror(173) - 1, 15, '#9aa6a0')
}

// Ábside gótico: bloque con tejado a cuatro aguas que lo cubre entero y su cornisa, ventanas, ojos de buey, contrafuerte volado
// y una torrecilla con su chapitel.
function transept(s) {
  const { g } = s
  stoneBlock(g, mirror(199, 40), 66, 40, 46)
  tileRoof(g, { x: mirror(197, 44), y: 50, w: 44, rows: 4, inset: 5, rowH: 4 })
  rect(g, mirror(197, 44), 66, 44, 2, SAND[2])
  rect(g, mirror(197, 44), 68, 44, 1, SAND[0])
  archWindow(s, mirror(204, 6), 74, 6, 14)
  archWindow(s, mirror(227, 6), 74, 6, 14)
  ;[82, 99].forEach((y) => {
    ellipse(g, mirror(219), y, 3.5, 2.5, SAND[2])
    ellipse(g, mirror(219), y, 2.5, 1.5, DARK)
  })
  flyingButtress(g, mirror(198), 100, mirror(206), 88)
  stoneBlock(g, mirror(238, 11), 58, 11, 48)
  tileRoof(g, { x: mirror(237, 13), y: 49, w: 13, rows: 2, inset: 3, rowH: 4 })
  rect(g, mirror(242, 1), 42, 1, 8, SAND[2])
  dot(g, mirror(242, 1), 41, PAL.saffronLight)
  archShape(g, mirror(241, 3), 66, 3, 8, DARK)
}

// Gran nave de la catedral: muro con pilastras y tres ventanas altas, y encima su tejado de teja.
function nave(s) {
  const { g } = s
  stoneBlock(g, mirror(54, 95), 68, 95, 32)
  ;[56, 80, 104].forEach((x) => {
    rect(g, mirror(x, 4), 69, 3, 31, SAND[2])
    rect(g, mirror(x, 4) + 3, 69, 1, 31, SAND[0])
  })
  // Solo dos ventanas: una tercera quedaría medio tapada por el pabellón y asomaría suelta sobre sus ventanas.
  ;[63, 87].forEach((x) => archWindow(s, mirror(x, 10), 77, 10, 19))
  tileRoof(g, { x: mirror(52, 99), y: 47, w: 99, rows: 5, inset: 1, rowH: 4 })
  rect(g, mirror(52, 99), 67, 99, 2, SAND[2])
  rect(g, mirror(52, 99), 69, 99, 1, SAND[0])
}

// Campanario: el antiguo alminar, en el extremo derecho y lo más alto del conjunto. De abajo arriba: cuerpo con dos ventanas y
// sus contrafuertes de esquina, cornisa con dentellones, cuerpo de campanas con dos arcos y una campana en cada uno, segunda
// cornisa, cuerpo alto con ventana y pináculos, tercera cornisa, linterna con tejadillo y, encima, San Rafael dorado.
function bellTower(s) {
  const { g } = s
  const cornice = (x, y, w) => {
    rect(g, x, y, w, 2, SAND[2])
    rect(g, x, y + 2, w, 2, SAND[1])
    rect(g, x, y + 4, w, 1, SAND[0])
    for (let dx = x + 1; dx < x + w - 1; dx += 3) rect(g, dx, y + 2, 1, 2, SAND[0])
  }
  // Cuerpo bajo.
  stoneBlock(g, 220, 76, 26, 36)
  masonry(g, 222, 76, 22, 36)
  archWindow(s, 225, 84, 5, 11)
  archWindow(s, 236, 84, 5, 11)
  ;[218, 244].forEach((x) => {
    stoneBlock(g, x, 98, 5, 14)
    pinnacle(g, x + 1, 90, 9)
  })
  cornice(218, 71, 30)
  // Cuerpo de campanas: dos arcos con su campana.
  stoneBlock(g, 221, 46, 24, 25)
  ;[224, 235].forEach((x) => {
    archShape(g, x - 1, 49, 10, 20, SAND[2])
    archShape(g, x, 50, 8, 19, DARK)
    bell(g, x + 4, 56)
  })
  rect(g, 232, 50, 1, 19, SAND[1])
  ;[221, 242].forEach((x) => stoneBlock(g, x, 46, 3, 25))
  cornice(219, 42, 28)
  // Cuerpo alto.
  stoneBlock(g, 223, 25, 20, 17)
  archWindow(s, 230, 29, 6, 11)
  ;[221, 241].forEach((x) => pinnacle(g, x, 24, 17))
  cornice(221, 21, 24)
  // Linterna con su tejadillo y San Rafael.
  stoneBlock(g, 226, 9, 14, 12)
  archWindow(s, 231, 11, 4, 8)
  tileRoof(g, { x: 224, y: 4, w: 18, rows: 2, inset: 3, rowH: 3, color: ROOF.warm })
  rect(g, 232, 0, 2, 4, PAL.saffron)
  rect(g, 231, 1, 4, 1, PAL.saffronLight)
}

// Pabellón central, delante del crucero: tejado piramidal sobre un tambor con tres arcos y pináculos en las esquinas.
function pavilion(s) {
  const { g } = s
  stoneBlock(g, 114, 82, 45, 40)
  ;[122, 134, 146].forEach((x) => archWindow(s, x, 97, 5, 12))
  tileRoof(g, { x: 112, y: 66, w: 49, rows: 4, inset: 6, rowH: 4, color: ROOF.main })
  rect(g, 112, 82, 49, 3, SAND[2])
  rect(g, 112, 85, 49, 1, SAND[0])
  ;[111, 158].forEach((x) => pinnacle(g, x, 72, 12))
  pinnacle(g, 136, 53, 14)
}

// Naves laterales: a cada lado del pabellón, un solo faldón apoyado contra los muros altos (el ábside, el cimborrio, la nave y el
// pie del campanario), con su alero y, debajo, una cornisa de modillones. Tapa lo que queda de muro detrás y acaba en el alero.
const AISLE = { top: 100, rows: 3, rowH: 4 }

function aisleRoof(g, x, w) {
  tileRoof(g, { x, y: AISLE.top, w, rows: AISLE.rows, inset: 0, rowH: AISLE.rowH })
  const eave = AISLE.top + AISLE.rows * AISLE.rowH
  rect(g, x, eave, w, 1, RIDGE)
  rect(g, x, eave + 1, w, 1, SAND_SHADE)
  rect(g, x, eave + 2, w, 2, SAND[2])
  for (let dx = x + 1; dx < x + w - 1; dx += 3) rect(g, dx, eave + 4, 1, 2, SAND[0])
}

function sideAisles(s) {
  const { g } = s
  // Muro bajo tras el faldón en los extremos, donde no hay ningún volumen alto detrás, para que el faldón se apoye en algo.
  ;[[2, 21], [249, 21]].forEach(([x, w]) => {
    stoneBlock(g, x, 92, w, 20)
    rect(g, x - 1, 90, w + 2, 2, SAND[2])
    rect(g, x - 1, 92, w + 2, 1, SAND[0])
  })
  rect(g, 2, 112, 268, 10, SAND[1])
  masonry(g, 2, 112, 268, 10, 6)
  aisleRoof(g, 2, 110)
  aisleRoof(g, 160, 110)
}

// Una arcada de tres arcos de herradura: dovelas rojas y crema alrededor de un hueco oscuro con su ventana, sobre sillería.
function arcade(s, centres) {
  centres.forEach((cx) => {
    horseshoe(s.g, cx, 132, 12, 26, 2)
    s.windows.push({ x: cx - 4, y: 146, w: 8, h: 10 })
  })
}

// Muralla frontal: sillería con almenas, contrafuertes entre arcos y a cada lado de la puerta una arcada de tres arcos.
function frontWall(s) {
  const { g } = s
  stoneBlock(g, 0, WALL_TOP, WIDTH, 50)
  masonry(g, 2, WALL_TOP, WIDTH - 4, 50)
  for (let x = 2; x < 106; x += 8) {
    merlons(g, x, WALL_TOP, 5)
    merlons(g, mirror(x, 5), WALL_TOP, 5)
  }
  // Quedan fuera de las copas de los naranjos, que tapan el tramo de muro junto a la puerta.
  const left = [12, 33, 54]
  arcade(s, left)
  arcade(s, left.map((cx) => mirror(cx)))
  ;[68, 108].forEach((x) => {
    ;[x, mirror(x, 4)].forEach((px) => {
      stoneBlock(g, px, 118, 4, 54)
      rect(g, px - 1, 115, 6, 4, SAND[2])
    })
  })
  ;[0, mirror(0, 108)].forEach((x) => {
    rect(g, x, 158, 108, 2, SAND[2])
    rect(g, x, 160, 108, 1, SAND[0])
  })
  rect(g, 0, 172, WIDTH, 4, STONE1)
  for (let x = 2; x < WIDTH; x += 7) rect(g, x + ((x / 7) % 2 ? 3 : 0), 172, 1, 4, STONE0)
  rect(g, 0, 172, WIDTH, 1, tint(STONE1, 0.3))
}

// Puerta del Perdón: portada de dos pilares con pináculos, friso con tres paneles, alfiz y arco de herradura con dovelas rojas y
// crema ante una puerta oscura de tablones.
function pardonGate(s) {
  const { g } = s
  stoneBlock(g, 112, 116, 48, 56)
  rect(g, 120, 120, 32, 52, SAND[2])
  rect(g, 111, 118, 50, 3, SAND[2])
  rect(g, 111, 121, 50, 1, SAND[0])
  ;[114, 154].forEach((x) => {
    pinnacle(g, x + 2, 104, 14)
    rect(g, x, 122, 6, 50, SAND[1])
    rect(g, x, 122, 1, 50, SAND[2])
    rect(g, x + 5, 122, 1, 50, SAND[0])
    for (let y = 128; y < 170; y += 7) rect(g, x, y, 6, 1, SAND[0])
  })
  // Friso de tres paneles hundidos con su adorno dorado.
  rect(g, 122, 123, 28, 8, SAND[1])
  ;[123, 132, 141].forEach((x, i) => {
    rect(g, x, 124, 8, 6, i === 1 ? '#8c6a8c' : SAND[0])
    rect(g, x + 3, 126, 2, 2, PAL.saffronLight)
  })
  // Alfiz: marco rectangular de la portada.
  rect(g, 121, 131, 30, 1, SAND_SHADE)
  rect(g, 121, 131, 1, 41, SAND_SHADE)
  rect(g, 150, 131, 1, 41, SAND_SHADE)
  horseshoe(g, CENTRE, 135, 19, 37, 3)
  for (let x = CENTRE - 8; x < CENTRE + 9; x += 4) rect(g, x, 156, 1, 16, '#3c2a38')
  rect(g, CENTRE - 9, 150, 18, 1, '#3c2a38')
  rect(g, 120, 168, 32, 4, STONE1)
  rect(g, 120, 171, 32, 1, STONE0)
}

export function mosqueSprite() {
  const s = newSprite(WIDTH, HEIGHT)
  cimborrio(s)
  transept(s)
  nave(s)
  bellTower(s)
  pavilion(s)
  sideAisles(s)
  frontWall(s)
  pardonGate(s)
  s.doorCol = CENTRE
  return finish(s)
}
