// Dibujo del juego retro: baldosas, la viajera, el sabio, los monstruos y los objetos, todo en píxeles con la paleta del
// valle y el mismo contorno oscuro que los personajes del avatar. Se pinta una vez en lienzos pequeños (`retroSprites`)
// que el renderizador estampa. Sin dependencias de Phaser ni de React.
import { PAL, TONE } from '../palette.js'
import { hash2, makeCanvas, outlineSolid, rect } from '../pixelKit.js'
import { TILE } from './world.js'

const INK = PAL.ink
const SKIN = '#f2c9a4'
const HAIR = '#6b4423'
const TUNIC = '#2f8f8b'
const TUNIC_LIGHT = '#4eb2ad'
const BOOT = '#7a4f35'

function canvas(w, h, paint, outlined = false) {
  const c = makeCanvas(w, h)
  const g = c.getContext('2d')
  paint(g)
  return outlined ? outlineSolid(c, INK) : c
}

// Baldosas (16×16). El suelo del bosque es hierba con motas; el de la mazmorra, losas de piedra.
const tiles = {
  grass: (g) => {
    rect(g, 0, 0, TILE, TILE, TONE.grass[3])
    for (let i = 0; i < 9; i++) rect(g, Math.floor(hash2(i, 1, 3) * 14), Math.floor(hash2(i, 2, 3) * 14), 2, 1, i % 2 ? TONE.grass[4] : TONE.grass[2])
    rect(g, 11, 4, 1, 1, PAL.rose)
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
    rect(g, 0, 0, TILE, TILE, TONE.grass[3])
    rect(g, 6, 10, 4, 6, BOOT)
    rect(g, 1, 1, 14, 11, TONE.grass[1])
    rect(g, 2, 1, 12, 3, TONE.grass[2])
    rect(g, 3, 2, 3, 2, TONE.grass[4])
    rect(g, 1, 10, 14, 2, TONE.grass[0])
  },
  rock: (g) => {
    rect(g, 0, 0, TILE, TILE, TONE.grass[3])
    rect(g, 2, 4, 12, 10, '#8d8aa8')
    rect(g, 3, 3, 9, 3, '#aaa7c4')
    rect(g, 2, 12, 12, 2, '#5c5a7a')
    rect(g, 5, 7, 2, 1, '#6c6a8c')
  },
  bush: (g) => {
    rect(g, 0, 0, TILE, TILE, TONE.grass[3])
    rect(g, 2, 5, 12, 9, TONE.grass[1])
    rect(g, 4, 3, 8, 4, TONE.grass[2])
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
  lockedDoor: (g) => {
    tiles.wall(g)
    rect(g, 3, 2, 10, 14, '#7a4f35')
    rect(g, 3, 2, 10, 1, '#b98458')
    rect(g, 7, 7, 3, 4, PAL.saffron)
    rect(g, 8, 5, 1, 2, PAL.saffronLight)
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

// Viajera (16×16): cabeza, túnica turquesa y botas; los ojos y el pelo cambian con la dirección.
function hero(dir, step) {
  return canvas(16, 16, (g) => {
    const lift = step === 1 ? 1 : 0
    rect(g, 4, 13, 3, 2, BOOT)
    rect(g, 9, 13, 3, 2, BOOT)
    if (step === 1) rect(g, 4, 14, 3, 1, INK)
    if (step === 2) rect(g, 9, 14, 3, 1, INK)
    rect(g, 4, 8 + lift, 8, 5, TUNIC)
    rect(g, 4, 8 + lift, 8, 1, TUNIC_LIGHT)
    rect(g, 4, 11 + lift, 8, 1, BOOT)
    rect(g, 3, 9 + lift, 1, 3, SKIN)
    rect(g, 12, 9 + lift, 1, 3, SKIN)
    rect(g, 4, 2 + lift, 8, 6, SKIN)
    rect(g, 3, 1 + lift, 10, 3, HAIR)
    rect(g, 3, 3 + lift, 1, 3, HAIR)
    rect(g, 12, 3 + lift, 1, 3, HAIR)
    if (dir === 'down') {
      rect(g, 6, 5 + lift, 1, 2, INK)
      rect(g, 9, 5 + lift, 1, 2, INK)
    } else if (dir === 'up') {
      rect(g, 3, 1 + lift, 10, 7, HAIR)
    } else {
      const eye = dir === 'left' ? 5 : 10
      rect(g, eye, 5 + lift, 1, 2, INK)
      rect(g, dir === 'left' ? 9 : 3, 3 + lift, 4, 5, HAIR)
    }
  }, true)
}

// Hoja de la espada vista desde el lado al que mira (la caja del mandoble la calcula `logic.js`).
function blade(dir) {
  const horizontal = dir === 'left' || dir === 'right'
  return canvas(horizontal ? 16 : 8, horizontal ? 8 : 16, (g) => {
    if (horizontal) {
      rect(g, dir === 'left' ? 0 : 4, 3, 12, 2, '#e8f0ff')
      rect(g, dir === 'left' ? 11 : 3, 1, 2, 6, PAL.saffron)
    } else {
      rect(g, 3, dir === 'up' ? 0 : 4, 2, 12, '#e8f0ff')
      rect(g, 1, dir === 'up' ? 11 : 3, 6, 2, PAL.saffron)
    }
  }, true)
}

function sage() {
  return canvas(16, 16, (g) => {
    rect(g, 3, 8, 10, 7, '#7a3f8f')
    rect(g, 3, 8, 10, 1, '#a05fb5')
    rect(g, 4, 2, 8, 6, SKIN)
    rect(g, 3, 1, 10, 3, '#cfd0e3')
    rect(g, 6, 5, 1, 2, INK)
    rect(g, 9, 5, 1, 2, INK)
    rect(g, 4, 7, 8, 5, '#f1e6cf')
    rect(g, 7, 12, 2, 1, '#cfc6b4')
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
    rect(g, 6, 6, 4, 5, '#7a3f8f')
    rect(g, 1, 5 + up, 5, 3, '#4f2a60')
    rect(g, 10, 5 + up, 5, 3, '#4f2a60')
    rect(g, 6, 4, 1, 2, '#4f2a60')
    rect(g, 9, 4, 1, 2, '#4f2a60')
    rect(g, 7, 7, 1, 1, PAL.saffronLight)
    rect(g, 9, 7, 1, 1, PAL.saffronLight)
  }, true)

const boss = (frame) =>
  canvas(32, 28, (g) => {
    const squash = frame ? 2 : 0
    rect(g, 2, 10 + squash, 28, 14 - squash, '#b8402c')
    rect(g, 6, 5 + squash, 20, 7, '#d4503a')
    rect(g, 8, 5 + squash, 7, 2, '#f4b8cc')
    rect(g, 9, 13, 4, 4, INK)
    rect(g, 19, 13, 4, 4, INK)
    rect(g, 10, 14, 2, 2, PAL.saffronLight)
    rect(g, 20, 14, 2, 2, PAL.saffronLight)
    rect(g, 12, 20, 8, 2, INK)
  }, true)

const heart = (full) =>
  canvas(8, 7, (g) => {
    const color = full ? PAL.tile : '#46446a'
    ;[[1, 0, 2], [5, 0, 2], [0, 1, 4], [4, 1, 4], [0, 2, 8], [1, 3, 6], [2, 4, 4], [3, 5, 2]].forEach(([x, y, w]) => rect(g, x, y, w, 1, color))
    if (full) rect(g, 1, 1, 1, 1, PAL.rose)
  })

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
    rect(g, 5, 0, 2, 5, '#e8f0ff')
    rect(g, 3, 5, 4, 1, PAL.saffron)
    rect(g, 4, 6, 1, 2, BOOT)
  }),
}

let cache = null

// Todos los lienzos del juego, pintados una sola vez.
export function retroSprites() {
  if (cache) return cache
  const withBase = (base, paint) => canvas(TILE, TILE, (g) => paint(g, base))
  cache = {
    tile: {
      grass: canvas(TILE, TILE, tiles.grass),
      floor: canvas(TILE, TILE, tiles.floor),
      T: canvas(TILE, TILE, tiles.tree),
      R: canvas(TILE, TILE, tiles.rock),
      B: canvas(TILE, TILE, tiles.bush),
      '~': [0, 1].map(() => canvas(TILE, TILE, tiles.water)),
      '#': canvas(TILE, TILE, tiles.wall),
      P: canvas(TILE, TILE, tiles.pillar),
      U: canvas(TILE, TILE, tiles.stairs),
      L: canvas(TILE, TILE, tiles.lockedDoor),
      chest: withBase(tiles.floor, chest(false)),
      chestOpen: withBase(tiles.floor, chest(true)),
    },
    hero: Object.fromEntries(['up', 'down', 'left', 'right'].map((dir) => [dir, [0, 1, 2].map((step) => hero(dir, step))])),
    blade: Object.fromEntries(['up', 'down', 'left', 'right'].map((dir) => [dir, blade(dir)])),
    sage: sage(),
    enemy: { slime: [slime(0), slime(1)], bat: [bat(0), bat(1)], boss: [boss(0), boss(1)] },
    heart: { full: heart(true), empty: heart(false) },
    icon: { key: icons.key(), coin: icons.coin(), sword: icons.sword() },
    pickup: { heart: heart(true), coin: icons.coin() },
  }
  return cache
}
