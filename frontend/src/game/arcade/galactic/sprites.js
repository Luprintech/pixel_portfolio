// Dibujo de «Invasión Galáctica»: la nave, los bichos del código (escarabajo, aro, polilla y ojo), el Nodo Maestro y los
// disparos, en píxeles con la paleta del valle y el contorno oscuro de siempre. Se pinta una sola vez (`galacticSprites`).
// Original de este proyecto. Sin dependencias de Phaser ni de React.
import { PAL } from '../../palette.js'
import { makeCanvas, outlineSolid, rect } from '../../pixelKit.js'

const INK = PAL.ink

function canvas(w, h, paint, outlined = true) {
  const c = makeCanvas(w, h)
  paint(c.getContext('2d'))
  return outlined ? outlineSolid(c, INK) : c
}

// Nave (16×14): casco turquesa, cabina clara y alas con luces; la llama de abajo parpadea en dos fotogramas.
const ship = (frame) =>
  canvas(16, 14, (g) => {
    rect(g, 7, 0, 2, 3, PAL.bone)
    rect(g, 6, 3, 4, 5, PAL.teal)
    rect(g, 7, 3, 2, 2, PAL.lagoonLight)
    rect(g, 2, 7, 12, 3, '#46a8a3')
    rect(g, 1, 9, 14, 2, PAL.teal)
    rect(g, 1, 8, 2, 4, PAL.tile)
    rect(g, 13, 8, 2, 4, PAL.tile)
    rect(g, 5, 8, 6, 3, '#2a6f6c')
    rect(g, 7, 6, 2, 1, PAL.saffronLight)
    if (frame) {
      rect(g, 6, 11, 4, 2, PAL.saffron)
      rect(g, 7, 13, 2, 1, PAL.tile)
    } else {
      rect(g, 7, 11, 2, 2, PAL.saffronLight)
    }
  })

// Escarabajo del código (12×12), con las patas en dos posiciones.
const bug = (frame) =>
  canvas(12, 12, (g) => {
    rect(g, 3, 2, 6, 8, '#62933f')
    rect(g, 2, 4, 8, 5, '#7da844')
    rect(g, 5, 2, 2, 8, '#34643a')
    rect(g, 4, 1, 1, 2, '#34643a')
    rect(g, 7, 1, 1, 2, '#34643a')
    rect(g, 4, 3, 1, 1, PAL.saffronLight)
    rect(g, 7, 3, 1, 1, PAL.saffronLight)
    const off = frame ? 1 : 0
    rect(g, 0, 4 + off, 2, 1, '#34643a')
    rect(g, 0, 7 - off, 2, 1, '#34643a')
    rect(g, 10, 4 + off, 2, 1, '#34643a')
    rect(g, 10, 7 - off, 2, 1, '#34643a')
  })

// Aro (12×12): un bucle con la punta de flecha, que se ve girar en dos fotogramas.
const loop = (frame) =>
  canvas(12, 12, (g) => {
    rect(g, 3, 1, 6, 2, PAL.lagoon)
    rect(g, 1, 3, 2, 6, PAL.lagoon)
    rect(g, 9, 3, 2, 6, PAL.lagoon)
    rect(g, 3, 9, 6, 2, PAL.lagoon)
    rect(g, 3, 1, 3, 1, PAL.lagoonLight)
    rect(g, 1, 3, 1, 3, PAL.lagoonLight)
    if (frame) {
      rect(g, 8, 0, 4, 1, PAL.saffron)
      rect(g, 10, 1, 2, 2, PAL.saffron)
    } else {
      rect(g, 8, 10, 4, 1, PAL.saffron)
      rect(g, 8, 8, 2, 2, PAL.saffron)
    }
  })

// Polilla (12×12): alas que baten.
const moth = (frame) =>
  canvas(12, 12, (g) => {
    const up = frame ? 0 : 2
    rect(g, 5, 2, 2, 8, '#7a3f8f')
    rect(g, 1, 2 + up, 4, 5, PAL.rose)
    rect(g, 7, 2 + up, 4, 5, PAL.rose)
    rect(g, 1, 6 + up, 3, 2, PAL.tile)
    rect(g, 8, 6 + up, 3, 2, PAL.tile)
    rect(g, 4, 0, 1, 2, '#7a3f8f')
    rect(g, 7, 0, 1, 2, '#7a3f8f')
    rect(g, 5, 3, 2, 1, PAL.saffronLight)
  })

// Ojo (12×12): una esfera morada con un ojo; al ser herido parpadea en claro.
const orb = (frame, hit) =>
  canvas(12, 12, (g) => {
    const body = hit ? PAL.bone : PAL.plum
    rect(g, 3, 1, 6, 10, body)
    rect(g, 1, 3, 10, 6, body)
    rect(g, 3, 2, 3, 1, hit ? '#ffffff' : '#a05fb5')
    rect(g, 4, 4, 4, 4, PAL.bone)
    rect(g, frame ? 5 : 6, 5, 2, 2, PAL.tile)
    rect(g, frame ? 5 : 6, 5, 1, 1, INK)
  })

// Nodo Maestro (48×28): una consola de mando hexagonal con antenas, un núcleo rojo y paneles de luces.
const boss = (tone) =>
  canvas(48, 28, (g) => {
    const hull = tone === 'hurt' ? '#f1e6cf' : tone === 'rage' ? '#7a3f8f' : '#5c5a7a'
    const light = tone === 'hurt' ? '#ffffff' : tone === 'rage' ? '#a05fb5' : '#8d8aa8'
    rect(g, 8, 4, 32, 20, hull)
    rect(g, 4, 8, 40, 12, hull)
    rect(g, 10, 4, 28, 2, light)
    rect(g, 6, 8, 36, 1, light)
    rect(g, 14, 9, 20, 10, '#1c1b3a')
    rect(g, 20, 11, 8, 6, PAL.tile)
    rect(g, 22, 12, 4, 4, PAL.saffronLight)
    rect(g, 23, 13, 2, 2, '#ffffff')
    rect(g, 11, 1, 1, 4, light)
    rect(g, 36, 1, 1, 4, light)
    rect(g, 10, 0, 3, 2, PAL.saffron)
    rect(g, 35, 0, 3, 2, PAL.saffron)
    for (let i = 0; i < 4; i++) {
      rect(g, 6 + i * 2, 21, 1, 3, PAL.lagoonLight)
      rect(g, 33 + i * 2, 21, 1, 3, PAL.lagoonLight)
    }
    rect(g, 4, 18, 4, 4, '#3b3572')
    rect(g, 40, 18, 4, 4, '#3b3572')
  })

const lifeIcon = () => canvas(10, 8, (g) => {
  rect(g, 4, 0, 2, 2, PAL.bone)
  rect(g, 3, 2, 4, 3, PAL.teal)
  rect(g, 0, 4, 10, 2, '#46a8a3')
  rect(g, 0, 5, 2, 3, PAL.tile)
  rect(g, 8, 5, 2, 3, PAL.tile)
}, false)

let cache = null

export function galacticSprites() {
  if (cache) return cache
  cache = {
    ship: [ship(0), ship(1)],
    foe: {
      bug: [bug(0), bug(1)],
      loop: [loop(0), loop(1)],
      moth: [moth(0), moth(1)],
      orb: [orb(0, false), orb(1, false)],
    },
    orbHit: orb(0, true),
    boss: { normal: boss('normal'), rage: boss('rage'), hurt: boss('hurt') },
    life: lifeIcon(),
    bullet: canvas(3, 8, (g) => {
      rect(g, 1, 0, 1, 8, PAL.saffronLight)
      rect(g, 0, 2, 3, 4, PAL.saffron)
    }, false),
    shot: canvas(5, 5, (g) => {
      rect(g, 1, 0, 3, 5, PAL.rose)
      rect(g, 0, 1, 5, 3, PAL.rose)
      rect(g, 1, 1, 3, 3, PAL.tile)
    }, false),
  }
  return cache
}
