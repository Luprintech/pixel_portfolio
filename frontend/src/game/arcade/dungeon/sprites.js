// Dibujo de «La espada del Bucle»: baldosas, el pequeño aventurero (túnica verde, escudo y espada, en cuatro direcciones), el
// mago, los monstruos, el Rey Limo y los objetos, todo en píxeles con la paleta del valle y el mismo contorno oscuro que los
// personajes del avatar. Se pinta una sola vez en lienzos pequeños (`dungeonSprites`) que el renderizador estampa. Original de
// este proyecto. Sin dependencias de Phaser ni de React.
import { PAL, TONE } from '../../palette.js'
import { hash2, makeCanvas, outlineSolid, rect } from '../../pixelKit.js'
import { TILE } from './world.js'

const INK = PAL.ink
const SKIN = '#f2c9a4'
const HAIR = '#6b4423'
const BOOT = '#7a4f35'
const HAT = '#3f9a3f'
const HAT_LIGHT = '#74c874'
const TUNIC = '#4aa84a'
const TUNIC_DARK = '#2f7a35'
const BELT = '#5a3a28'
const SHIELD = '#8d8aa8'
const SHIELD_RIM = '#5c5a7a'
const BLADE = '#e8f0ff'
const DIRECTIONS = ['up', 'down', 'left', 'right']

function canvas(w, h, paint, outlined = false) {
  const c = makeCanvas(w, h)
  const g = c.getContext('2d')
  paint(g)
  return outlined ? outlineSolid(c, INK) : c
}

const flipped = (source) =>
  canvas(source.width, source.height, (g) => {
    g.translate(source.width, 0)
    g.scale(-1, 1)
    g.drawImage(source, 0, 0)
  })

// Baldosas (16×16). El suelo del bosque es hierba con motas; el de la cueva, losas de piedra.
const tiles = {
  grass: (g) => {
    rect(g, 0, 0, TILE, TILE, TONE.grass[3])
    for (let i = 0; i < 9; i++) rect(g, Math.floor(hash2(i, 1, 3) * 14), Math.floor(hash2(i, 2, 3) * 14), 2, 1, i % 2 ? TONE.grass[4] : TONE.grass[2])
  },
  flowers: (g) => {
    tiles.grass(g)
    ;[[3, 4, PAL.rose], [10, 9, PAL.saffronLight], [6, 12, PAL.rose], [12, 3, PAL.bone]].forEach(([x, y, color]) => {
      rect(g, x, y, 2, 2, color)
      rect(g, x, y + 2, 1, 2, TONE.grass[0])
    })
  },
  floor: (g) => {
    rect(g, 0, 0, TILE, TILE, '#5c5a7a')
    rect(g, 0, 0, TILE, 1, '#7a789a')
    rect(g, 0, 0, 1, TILE, '#7a789a')
    rect(g, 0, 15, TILE, 1, '#46446a')
    rect(g, 15, 0, 1, TILE, '#46446a')
    rect(g, 5, 6, 2, 1, '#6c6a8c')
  },
  tree: (g) => {
    tiles.grass(g)
    rect(g, 6, 10, 4, 6, BOOT)
    rect(g, 1, 1, 14, 11, TONE.grass[1])
    rect(g, 2, 1, 12, 3, TONE.grass[2])
    rect(g, 3, 2, 3, 2, TONE.grass[4])
    rect(g, 1, 10, 14, 2, TONE.grass[0])
  },
  rock: (g) => {
    tiles.grass(g)
    rect(g, 2, 4, 12, 10, '#8d8aa8')
    rect(g, 3, 3, 9, 3, '#aaa7c4')
    rect(g, 2, 12, 12, 2, '#5c5a7a')
    rect(g, 5, 7, 2, 1, '#6c6a8c')
  },
  bush: (g) => {
    tiles.grass(g)
    rect(g, 2, 5, 12, 9, TONE.grass[1])
    rect(g, 4, 3, 8, 4, TONE.grass[2])
    rect(g, 5, 4, 2, 1, TONE.grass[4])
    rect(g, 9, 9, 1, 1, PAL.tile)
  },
  water: (g) => {
    rect(g, 0, 0, TILE, TILE, PAL.lagoon)
    rect(g, 2, 4, 5, 1, PAL.lagoonLight)
    rect(g, 9, 10, 5, 1, PAL.lagoonLight)
  },
  wall: (g) => {
    rect(g, 0, 0, TILE, TILE, '#3b3572')
    rect(g, 0, 0, TILE, 1, '#5c5a7a')
    rect(g, 0, 7, TILE, 1, '#2e2d5a')
    rect(g, 7, 0, 1, 7, '#2e2d5a')
    rect(g, 3, 8, 1, 8, '#2e2d5a')
    rect(g, 11, 8, 1, 8, '#2e2d5a')
    rect(g, 1, 1, 5, 1, '#4b4380')
  },
  pillar: (g) => {
    tiles.floor(g)
    rect(g, 3, 1, 10, 14, '#aaa7c4')
    rect(g, 3, 1, 10, 2, '#cfd0e3')
    rect(g, 3, 13, 10, 2, '#6c6a8c')
    rect(g, 10, 3, 3, 10, '#8d8aa8')
  },
  stairs: (g) => {
    rect(g, 0, 0, TILE, TILE, '#1c1b3a')
    for (let i = 0; i < 4; i++) rect(g, 1 + i, 2 + i * 3, 14 - i * 2, 2, i % 2 ? '#46446a' : '#5c5a7a')
  },
  // Boca de la cueva en el bosque: un arco de piedra con la oscuridad dentro.
  cave: (g) => {
    tiles.grass(g)
    rect(g, 0, 2, 16, 14, '#6c6a8c')
    rect(g, 1, 1, 14, 3, '#8d8aa8')
    rect(g, 3, 5, 10, 11, '#1c1b3a')
    rect(g, 4, 4, 8, 1, '#1c1b3a')
    rect(g, 0, 2, 16, 1, '#aaa7c4')
  },
  lockedDoor: (g) => {
    tiles.wall(g)
    rect(g, 3, 2, 10, 14, '#7a4f35')
    rect(g, 3, 2, 10, 1, '#b98458')
    rect(g, 7, 7, 3, 4, PAL.saffron)
    rect(g, 8, 5, 1, 2, PAL.saffronLight)
  },
  // Reja del acertijo: barrotes de hierro entre dos jambas; al abrirse solo queda el suelo.
  gate: (g) => {
    tiles.floor(g)
    rect(g, 0, 0, 2, TILE, '#3b3572')
    rect(g, 14, 0, 2, TILE, '#3b3572')
    for (let x = 3; x < 14; x += 3) rect(g, x, 0, 1, TILE, '#aaa7c4')
    rect(g, 2, 3, 12, 1, '#6c6a8c')
    rect(g, 2, 11, 12, 1, '#6c6a8c')
  },
  plate: (g) => {
    tiles.floor(g)
    rect(g, 2, 2, 12, 12, '#46446a')
    rect(g, 3, 3, 10, 10, '#7a789a')
    rect(g, 5, 5, 6, 6, '#5c5a7a')
  },
  plateOn: (g) => {
    tiles.floor(g)
    rect(g, 2, 2, 12, 12, '#46446a')
    rect(g, 3, 3, 10, 10, PAL.saffron)
    rect(g, 5, 5, 6, 6, PAL.saffronLight)
  },
  // Bloque de piedra con el bucle grabado.
  block: (g) => {
    rect(g, 1, 1, 14, 14, '#aaa7c4')
    rect(g, 1, 1, 14, 2, '#cfd0e3')
    rect(g, 1, 13, 14, 2, '#6c6a8c')
    rect(g, 12, 3, 3, 10, '#8d8aa8')
    ;[[5, 5, 6, 1], [5, 5, 1, 5], [5, 9, 6, 1], [10, 7, 1, 3], [7, 7, 3, 1]].forEach(([x, y, w, h]) => rect(g, x, y, w, h, '#5c5a7a'))
  },
}

function chest(open) {
  return (g, base) => {
    base(g)
    rect(g, 2, 5, 12, 9, '#7a4f35')
    rect(g, 2, 5, 12, 2, '#b98458')
    rect(g, 2, 8, 12, 1, '#5a3a28')
    if (open) {
      rect(g, 3, 2, 10, 3, '#5a3a28')
      rect(g, 4, 6, 8, 3, '#1c1b3a')
    } else {
      rect(g, 7, 7, 2, 3, PAL.saffron)
    }
  }
}

// Aventurero (16×16): gorro verde, túnica con cinturón, escudo con el bucle y espada. Se dibuja mirando a izquierda, arriba y
// abajo; la derecha es el espejo de la izquierda. `swinging` quita la espada de la mano (la hoja en el aire la pone el
// renderizador); sin espada conseguida se dibuja igual, con la mano vacía. `step` 0 es de pie y 1 y 2 son los pasos.
function hero(dir, step, swinging) {
  const lift = step === 0 ? 0 : 1
  const left = step === 1 ? 1 : 0
  const right = step === 2 ? 1 : 0
  return canvas(16, 16, (g) => {
    rect(g, 4, 13 - left, 3, 2, BOOT)
    rect(g, 9, 13 - right, 3, 2, BOOT)
    if (dir === 'left') {
      rect(g, 4, 8 + lift, 8, 5, TUNIC)
      rect(g, 4, 8 + lift, 8, 1, HAT_LIGHT)
      rect(g, 4, 12 + lift, 8, 1, TUNIC_DARK)
      rect(g, 4, 11 + lift, 8, 1, BELT)
      rect(g, 4, 3 + lift, 7, 5, SKIN)
      // Gorro redondeado (la cima no toca el borde del lienzo) con la punta caída hacia atrás.
      rect(g, 5, 1 + lift, 6, 1, HAT)
      rect(g, 4, 2 + lift, 8, 1, HAT)
      rect(g, 3, 3 + lift, 9, 1, HAT)
      rect(g, 6, 1 + lift, 3, 1, HAT_LIGHT)
      rect(g, 11, 3 + lift, 2, 3, HAT)
      rect(g, 9, 4 + lift, 2, 3, HAIR)
      rect(g, 5, 5 + lift, 1, 2, INK)
      // Escudo delante, con el bucle; la espada, al costado de atrás.
      rect(g, 1, 7 + lift, 5, 7, SHIELD_RIM)
      rect(g, 2, 8 + lift, 3, 5, SHIELD)
      rect(g, 3, 10 + lift, 1, 1, PAL.tile)
      rect(g, 3, 9 + lift, 1, 1, PAL.saffron)
      if (!swinging) {
        rect(g, 11, 9 + lift, 1, 5, BLADE)
        rect(g, 10, 8 + lift, 3, 1, PAL.saffron)
      }
    } else if (dir === 'up') {
      rect(g, 4, 8 + lift, 8, 5, TUNIC)
      rect(g, 4, 12 + lift, 8, 1, TUNIC_DARK)
      rect(g, 4, 11 + lift, 8, 1, BELT)
      rect(g, 4, 2 + lift, 8, 6, HAT)
      rect(g, 5, 1 + lift, 6, 1, HAT)
      rect(g, 3, 3 + lift, 1, 3, HAIR)
      rect(g, 12, 3 + lift, 1, 3, HAIR)
      rect(g, 5, 1 + lift, 4, 1, HAT_LIGHT)
      // Escudo a la espalda, con la espada asomando por el hombro.
      rect(g, 5, 8 + lift, 6, 5, SHIELD_RIM)
      rect(g, 6, 9 + lift, 4, 3, SHIELD)
      rect(g, 7, 10 + lift, 2, 1, PAL.tile)
      if (!swinging) {
        rect(g, 11, 5 + lift, 1, 4, BLADE)
        rect(g, 10, 9 + lift, 3, 1, PAL.saffron)
      }
    } else {
      rect(g, 4, 8 + lift, 8, 5, TUNIC)
      rect(g, 4, 8 + lift, 8, 1, HAT_LIGHT)
      rect(g, 4, 12 + lift, 8, 1, TUNIC_DARK)
      rect(g, 4, 11 + lift, 8, 1, BELT)
      rect(g, 7, 11 + lift, 2, 1, PAL.saffron)
      rect(g, 4, 3 + lift, 8, 5, SKIN)
      rect(g, 5, 1 + lift, 6, 1, HAT)
      rect(g, 4, 2 + lift, 8, 1, HAT)
      rect(g, 3, 3 + lift, 10, 1, HAT)
      rect(g, 6, 1 + lift, 3, 1, HAT_LIGHT)
      rect(g, 3, 4 + lift, 1, 2, HAIR)
      rect(g, 12, 4 + lift, 1, 2, HAIR)
      rect(g, 6, 5 + lift, 1, 2, INK)
      rect(g, 9, 5 + lift, 1, 2, INK)
      // Escudo en el brazo derecho del dibujo y espada en el otro.
      rect(g, 11, 8 + lift, 4, 6, SHIELD_RIM)
      rect(g, 12, 9 + lift, 2, 4, SHIELD)
      rect(g, 12, 10 + lift, 2, 1, PAL.tile)
      if (!swinging) {
        rect(g, 2, 9 + lift, 1, 6, BLADE)
        rect(g, 1, 8 + lift, 3, 1, PAL.saffron)
      }
    }
  }, true)
}

// Hoja de la espada vista desde el lado al que mira (la caja del mandoble la calcula `logic.js`).
function blade(dir) {
  const horizontal = dir === 'left' || dir === 'right'
  return canvas(horizontal ? 16 : 8, horizontal ? 8 : 16, (g) => {
    if (horizontal) {
      rect(g, dir === 'left' ? 0 : 4, 3, 12, 2, BLADE)
      rect(g, dir === 'left' ? 11 : 3, 1, 2, 6, PAL.saffron)
      rect(g, dir === 'left' ? 0 : 14, 3, 2, 2, '#ffffff')
    } else {
      rect(g, 3, dir === 'up' ? 0 : 4, 2, 12, BLADE)
      rect(g, 1, dir === 'up' ? 11 : 3, 6, 2, PAL.saffron)
      rect(g, 3, dir === 'up' ? 0 : 14, 2, 2, '#ffffff')
    }
  }, true)
}

// Mago del bosque: sombrero de ala ancha con una estrella, barba blanca y báculo con orbe.
function wizard() {
  return canvas(16, 16, (g) => {
    rect(g, 3, 8, 10, 7, PAL.plum)
    rect(g, 3, 8, 10, 1, '#a05fb5')
    rect(g, 6, 0, 4, 2, '#4f2a60')
    rect(g, 4, 2, 8, 2, PAL.plum)
    rect(g, 2, 4, 12, 1, '#4f2a60')
    rect(g, 8, 2, 1, 1, PAL.saffronLight)
    rect(g, 5, 5, 6, 3, SKIN)
    rect(g, 6, 6, 1, 1, INK)
    rect(g, 9, 6, 1, 1, INK)
    rect(g, 5, 8, 6, 5, '#f1e6cf')
    rect(g, 7, 13, 2, 1, '#cfc6b4')
    rect(g, 13, 4, 1, 11, '#7a4f35')
    rect(g, 12, 1, 3, 3, PAL.lagoonLight)
    rect(g, 13, 2, 1, 1, '#ffffff')
  }, true)
}

const slime = (frame) =>
  canvas(16, 16, (g) => {
    const squash = frame ? 1 : 0
    rect(g, 2, 7 + squash, 12, 7 - squash, '#62933f')
    rect(g, 4, 5 + squash, 8, 3, '#62933f')
    rect(g, 5, 5 + squash, 3, 1, '#a3c14f')
    rect(g, 5, 9, 2, 2, INK)
    rect(g, 9, 9, 2, 2, INK)
  }, true)

const bat = (frame) =>
  canvas(16, 16, (g) => {
    const up = frame ? 0 : 3
    rect(g, 6, 6, 4, 5, PAL.plum)
    rect(g, 1, 5 + up, 5, 3, '#4f2a60')
    rect(g, 10, 5 + up, 5, 3, '#4f2a60')
    rect(g, 6, 4, 1, 2, '#4f2a60')
    rect(g, 9, 4, 1, 2, '#4f2a60')
    rect(g, 7, 7, 1, 1, PAL.saffronLight)
    rect(g, 9, 7, 1, 1, PAL.saffronLight)
  }, true)

// Rey Limo (32×28): un limo enorme azul verdoso con corona. `tone` cambia la piel: 'flash' al avisar la embestida y 'calm' al
// cambiar de fase (así se reconocen sus patrones sin leer nada).
const BOSS_SKIN = { normal: ['#2f8f8b', '#4eb2ad', '#a7e3df'], flash: ['#f1e6cf', '#ffffff', '#ffffff'], calm: ['#7a3f8f', '#a05fb5', '#d9b6e6'] }
const boss = (frame, tone) =>
  canvas(32, 28, (g) => {
    const [base, light, shine] = BOSS_SKIN[tone]
    const squash = frame ? 2 : 0
    rect(g, 2, 11 + squash, 28, 14 - squash, base)
    rect(g, 5, 7 + squash, 22, 6, base)
    rect(g, 7, 7 + squash, 8, 2, light)
    rect(g, 8, 8 + squash, 3, 1, shine)
    rect(g, 7, 15, 5, 5, INK)
    rect(g, 20, 15, 5, 5, INK)
    rect(g, 8, 16, 3, 3, tone === 'calm' ? PAL.lagoonLight : PAL.tile)
    rect(g, 21, 16, 3, 3, tone === 'calm' ? PAL.lagoonLight : PAL.tile)
    rect(g, 6, 14, 6, 1, INK)
    rect(g, 20, 14, 6, 1, INK)
    rect(g, 11, 22, 10, 2, INK)
    // Corona de oro.
    rect(g, 9, 3 + squash, 14, 4, PAL.saffron)
    rect(g, 9, 1 + squash, 2, 3, PAL.saffron)
    rect(g, 15, 0 + squash, 2, 4, PAL.saffron)
    rect(g, 21, 1 + squash, 2, 3, PAL.saffron)
    rect(g, 12, 4 + squash, 2, 1, PAL.saffronLight)
    rect(g, 19, 4 + squash, 2, 1, PAL.tile)
  }, true)

const slimeBall = () =>
  canvas(8, 8, (g) => {
    rect(g, 1, 2, 6, 4, '#62933f')
    rect(g, 2, 1, 4, 6, '#62933f')
    rect(g, 2, 2, 2, 1, '#d9f0a0')
  }, true)

const heart = (full) =>
  canvas(8, 7, (g) => {
    const color = full ? PAL.tile : '#46446a'
    ;[[1, 0, 2], [5, 0, 2], [0, 1, 4], [4, 1, 4], [0, 2, 8], [1, 3, 6], [2, 4, 4], [3, 5, 2]].forEach(([x, y, w]) => rect(g, x, y, w, 1, color))
    if (full) rect(g, 1, 1, 1, 1, PAL.rose)
  })

const crystal = () =>
  canvas(14, 18, (g) => {
    rect(g, 6, 0, 2, 2, PAL.lagoonLight)
    rect(g, 4, 2, 6, 3, PAL.lagoonLight)
    rect(g, 2, 5, 10, 5, PAL.lagoon)
    rect(g, 4, 10, 6, 4, PAL.lagoon)
    rect(g, 6, 14, 2, 3, '#2f7a92')
    rect(g, 5, 3, 2, 3, '#ffffff')
    rect(g, 4, 6, 1, 3, PAL.lagoonLight)
    rect(g, 9, 7, 2, 4, '#2f7a92')
  }, true)

const icons = {
  key: () => canvas(8, 8, (g) => {
    rect(g, 1, 1, 3, 3, PAL.saffron)
    rect(g, 2, 2, 1, 1, INK)
    rect(g, 4, 2, 4, 1, PAL.saffron)
    rect(g, 6, 3, 1, 2, PAL.saffron)
  }),
  coin: () => canvas(8, 8, (g) => {
    rect(g, 1, 1, 6, 6, PAL.saffron)
    rect(g, 2, 2, 4, 4, PAL.saffronLight)
    rect(g, 3, 3, 1, 2, PAL.saffron)
  }),
  sword: () => canvas(8, 8, (g) => {
    rect(g, 5, 0, 2, 5, BLADE)
    rect(g, 3, 5, 4, 1, PAL.saffron)
    rect(g, 4, 6, 1, 2, BOOT)
  }),
}

let cache = null

// Todos los lienzos del juego, pintados una sola vez.
export function dungeonSprites() {
  if (cache) return cache
  const withBase = (base, paint) => canvas(TILE, TILE, (g) => paint(g, base))
  const heroFrames = (swinging) =>
    Object.fromEntries(
      DIRECTIONS.map((dir) => {
        const frames = dir === 'right' ? [0, 1, 2].map((step) => flipped(hero('left', step, swinging))) : [0, 1, 2].map((step) => hero(dir, step, swinging))
        return [dir, frames]
      }),
    )
  cache = {
    tile: {
      grass: canvas(TILE, TILE, tiles.grass),
      flowers: canvas(TILE, TILE, tiles.flowers),
      floor: canvas(TILE, TILE, tiles.floor),
      T: canvas(TILE, TILE, tiles.tree),
      R: canvas(TILE, TILE, tiles.rock),
      B: canvas(TILE, TILE, tiles.bush),
      '~': [canvas(TILE, TILE, tiles.water), canvas(TILE, TILE, (g) => {
        tiles.water(g)
        rect(g, 4, 4, 5, 1, PAL.lagoon)
        rect(g, 2, 4, 2, 1, PAL.lagoonLight)
        rect(g, 11, 10, 3, 1, PAL.lagoonLight)
      })],
      '#': canvas(TILE, TILE, tiles.wall),
      P: canvas(TILE, TILE, tiles.pillar),
      U: canvas(TILE, TILE, tiles.stairs),
      caveMouth: canvas(TILE, TILE, tiles.cave),
      L: canvas(TILE, TILE, tiles.lockedDoor),
      G: canvas(TILE, TILE, tiles.gate),
      S: canvas(TILE, TILE, tiles.plate),
      SOn: canvas(TILE, TILE, tiles.plateOn),
      block: canvas(TILE, TILE, tiles.block),
      chest: withBase(tiles.floor, chest(false)),
      chestOpen: withBase(tiles.floor, chest(true)),
      forestChest: withBase(tiles.grass, chest(false)),
      forestChestOpen: withBase(tiles.grass, chest(true)),
    },
    hero: heroFrames(false),
    heroSwing: heroFrames(true),
    blade: Object.fromEntries(DIRECTIONS.map((dir) => [dir, blade(dir)])),
    wizard: wizard(),
    enemy: { slime: [slime(0), slime(1)], bat: [bat(0), bat(1)], boss: [boss(0, 'normal'), boss(1, 'normal')] },
    bossFlash: [boss(0, 'flash'), boss(1, 'flash')],
    bossCalm: [boss(0, 'calm'), boss(1, 'calm')],
    ball: slimeBall(),
    heart: { full: heart(true), empty: heart(false) },
    icon: { key: icons.key(), coin: icons.coin(), sword: icons.sword() },
    pickup: { heart: heart(true), coin: icons.coin() },
    crystal: crystal(),
  }
  return cache
}
