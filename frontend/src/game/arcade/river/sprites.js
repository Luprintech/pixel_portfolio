// Dibujo de «Río en Peligro»: la avioneta vista desde arriba (recta y ladeada), barcos, helicópteros, cazas, minas, depósitos
// de combustible, casitas de la orilla y las balas, en píxeles con la paleta del valle y el contorno oscuro de siempre. Se pinta
// una sola vez (`riverSprites`). Original de este proyecto. Sin dependencias de Phaser ni de React.
import { PAL, TONE } from '../../palette.js'
import { makeCanvas, outlineSolid, rect } from '../../pixelKit.js'

const INK = PAL.ink

function canvas(w, h, paint, outlined = true) {
  const c = makeCanvas(w, h)
  paint(c.getContext('2d'))
  return outlined ? outlineSolid(c, INK) : c
}

const flipped = (source) => {
  const c = makeCanvas(source.width, source.height)
  const g = c.getContext('2d')
  g.translate(source.width, 0)
  g.scale(-1, 1)
  g.drawImage(source, 0, 0)
  return c
}

// Avioneta (16×16): fuselaje claro, alas rectas con puntas rojas y cola. `bank` -1, 0 o 1 la ladea hacia un lado.
const plane = (bank) =>
  canvas(16, 16, (g) => {
    const lean = bank
    rect(g, 7, 1, 2, 13, PAL.bone)
    rect(g, 7, 0, 2, 2, PAL.saffronLight)
    rect(g, 6, 3, 4, 3, '#8d8aa8')
    rect(g, 7, 3, 2, 2, PAL.lagoonLight)
    // Alas: la que queda hacia dentro de la curva se ve más corta.
    rect(g, lean > 0 ? 3 : 1, 7, lean > 0 ? 10 : 14, 3, '#cfd0e3')
    rect(g, lean < 0 ? 12 : 2, 7, 2, 3, PAL.tile)
    rect(g, lean > 0 ? 12 : 2, 7, 2, 3, PAL.tile)
    rect(g, 5, 13, 6, 2, '#cfd0e3')
    rect(g, 7, 12, 2, 3, PAL.tile)
  })

// Sombra de la avioneta sobre el agua mientras despega o aterriza.
const shadow = () => canvas(16, 16, (g) => {
  rect(g, 7, 2, 2, 12, '#000000')
  rect(g, 2, 7, 12, 3, '#000000')
  rect(g, 5, 13, 6, 2, '#000000')
}, false)

// Barco (16×8): casco gris con la proa en punta, cabina y chimenea.
const ship = () =>
  canvas(16, 8, (g) => {
    rect(g, 1, 2, 14, 5, '#8d8aa8')
    rect(g, 0, 3, 1, 3, '#8d8aa8')
    rect(g, 15, 3, 1, 3, '#8d8aa8')
    rect(g, 1, 2, 14, 1, '#cfd0e3')
    rect(g, 5, 0, 6, 3, PAL.bone)
    rect(g, 6, 1, 4, 1, PAL.lagoon)
    rect(g, 11, 1, 2, 2, PAL.tile)
    rect(g, 1, 6, 14, 1, '#5c5a7a')
  })

// Helicóptero (16×12): cuerpo morado con la cola y el rotor, que gira en dos fotogramas.
const heli = (frame) =>
  canvas(16, 12, (g) => {
    rect(g, 4, 4, 7, 6, PAL.plum)
    rect(g, 5, 5, 3, 2, PAL.lagoonLight)
    rect(g, 11, 6, 5, 1, '#4f2a60')
    rect(g, 15, 4, 1, 4, '#4f2a60')
    rect(g, 4, 10, 8, 1, '#4f2a60')
    if (frame) {
      rect(g, 0, 3, 16, 1, '#cfd0e3')
    } else {
      rect(g, 2, 1, 12, 1, '#cfd0e3')
      rect(g, 7, 1, 2, 4, '#cfd0e3')
    }
  })

// Caza (16×8) mirando a la derecha; el de la izquierda es su espejo.
const jet = () =>
  canvas(16, 8, (g) => {
    rect(g, 1, 3, 14, 2, '#aaa7c4')
    rect(g, 12, 2, 4, 4, '#cfd0e3')
    rect(g, 5, 0, 4, 8, '#8d8aa8')
    rect(g, 1, 2, 3, 4, PAL.tile)
    rect(g, 13, 3, 2, 1, PAL.lagoonLight)
  })

// Mina (10×10): una bola oscura con pinchos y un destello.
const mine = () =>
  canvas(10, 10, (g) => {
    rect(g, 2, 2, 6, 6, '#3b3572')
    rect(g, 4, 0, 2, 10, '#3b3572')
    rect(g, 0, 4, 10, 2, '#3b3572')
    rect(g, 3, 3, 2, 2, PAL.mist)
    rect(g, 6, 6, 1, 1, PAL.tile)
  })

// Depósito de combustible (12×16): un bidón rojo con la F.
const tank = () =>
  canvas(12, 16, (g) => {
    rect(g, 1, 1, 10, 14, PAL.tile)
    rect(g, 1, 1, 10, 2, '#e8806b')
    rect(g, 1, 13, 10, 2, '#8a2f21')
    rect(g, 3, 5, 6, 6, PAL.bone)
    rect(g, 4, 5, 1, 6, INK)
    rect(g, 4, 5, 4, 1, INK)
    rect(g, 4, 7, 3, 1, INK)
    rect(g, 4, 0, 4, 1, '#8d8aa8')
  })

// Casita de la orilla (12×12): tejado a dos aguas y puerta.
const house = () =>
  canvas(12, 12, (g) => {
    rect(g, 1, 5, 10, 6, PAL.wall)
    rect(g, 0, 2, 12, 4, PAL.tileDark)
    rect(g, 2, 1, 8, 2, PAL.tile)
    rect(g, 5, 8, 2, 3, '#7a4f35')
    rect(g, 2, 7, 2, 2, PAL.lagoonLight)
    rect(g, 8, 7, 2, 2, PAL.lagoonLight)
  })

const tree = () =>
  canvas(8, 8, (g) => {
    rect(g, 1, 0, 6, 6, TONE.grass[1])
    rect(g, 2, 0, 3, 2, TONE.grass[2])
    rect(g, 3, 6, 2, 2, '#7a4f35')
  })

const life = () => canvas(10, 8, (g) => {
  rect(g, 4, 0, 2, 8, PAL.bone)
  rect(g, 0, 3, 10, 2, '#cfd0e3')
  rect(g, 3, 6, 4, 2, PAL.tile)
}, false)

let cache = null

export function riverSprites() {
  if (cache) return cache
  const right = jet()
  cache = {
    plane: { '-1': plane(-1), 0: plane(0), 1: plane(1) },
    shadow: shadow(),
    ship: ship(),
    heli: [heli(0), heli(1)],
    jet: { 1: right, '-1': flipped(right) },
    mine: mine(),
    tank: tank(),
    house: house(),
    tree: tree(),
    life: life(),
    bullet: canvas(3, 6, (g) => {
      rect(g, 1, 0, 1, 6, PAL.saffronLight)
      rect(g, 0, 1, 3, 3, PAL.saffron)
    }, false),
  }
  return cache
}
