// Las portadas pixel art de los tres juegos para el selector de la recreativa: un lienzo de 120×80 por juego, dibujado con los
// mismos sprites que el juego (ampliados con píxeles enteros). Se pintan una vez (`coverCanvas`) y el selector las estampa.
// Sin dependencias de Phaser ni de React.
import { PAL, TONE } from '../palette.js'
import { ellipse, hash2, makeCanvas, rect } from '../pixelKit.js'
import { dungeonSprites } from './dungeon/sprites.js'
import { galacticSprites } from './galactic/sprites.js'
import { riverSprites } from './river/sprites.js'

export const COVER = { width: 120, height: 80 }

const draw = (g, image, x, y, scale = 1) => g.drawImage(image, Math.round(x), Math.round(y), image.width * scale, image.height * scale)

// La espada del Bucle: un bosque al atardecer con la cueva al fondo, la aventurera con la espada, un limo y el mago.
function dungeonCover(g) {
  const s = dungeonSprites()
  rect(g, 0, 0, COVER.width, COVER.height, '#3b3572')
  rect(g, 0, 30, COVER.width, 14, '#7a6ab0')
  rect(g, 0, 42, COVER.width, 6, '#f4b8cc')
  ellipse(g, 96, 28, 9, 9, PAL.saffronLight)
  // Montañas con la boca de la cueva.
  ellipse(g, 30, 56, 38, 22, '#2e2d5a')
  ellipse(g, 88, 60, 34, 20, '#46446a')
  rect(g, 22, 46, 16, 12, '#1c1b3a')
  rect(g, 20, 44, 20, 3, '#8d8aa8')
  rect(g, 0, 56, COVER.width, 24, TONE.grass[2])
  for (let i = 0; i < 26; i++) rect(g, Math.floor(hash2(i, 1, 6) * 118), 58 + Math.floor(hash2(i, 2, 6) * 20), 3, 1, i % 2 ? TONE.grass[3] : TONE.grass[1])
  // Árboles a los lados.
  draw(g, s.tile.T, -2, 40, 2)
  draw(g, s.tile.T, 92, 38, 2)
  draw(g, s.tile.T, 104, 50, 2)
  // Los personajes, ampliados.
  draw(g, s.enemy.slime[0], 8, 48, 2)
  draw(g, s.wizard, 84, 46, 2)
  draw(g, s.heroSwing.down[0], 46, 30, 3)
  draw(g, s.blade.down, 38, 66, 1)
  rect(g, 44, 74, 28, 2, '#34643a')
  draw(g, s.pickup.coin, 76, 40, 1)
  draw(g, s.pickup.heart, 14, 38, 1)
}

// Invasión Galáctica: espacio profundo, un planeta, una fila de bichos y la nave disparando.
function galacticCover(g) {
  const s = galacticSprites()
  rect(g, 0, 0, COVER.width, COVER.height, '#14122e')
  for (let i = 0; i < 40; i++) rect(g, Math.floor(hash2(i, 1, 8) * 120), Math.floor(hash2(i, 2, 8) * 80), 1, 1, i % 4 === 0 ? PAL.lagoonLight : i % 3 === 0 ? PAL.saffronLight : PAL.bone)
  ellipse(g, 100, 74, 36, 26, '#2e2d5a')
  ellipse(g, 96, 70, 30, 20, '#3b3572')
  rect(g, 70, 64, 22, 2, '#4b4380')
  const row = ['bug', 'loop', 'moth', 'orb', 'moth', 'loop', 'bug']
  row.forEach((type, i) => draw(g, s.foe[type][i % 2], 6 + i * 16, 10))
  row.slice(1, 6).forEach((type, i) => draw(g, s.foe[type][(i + 1) % 2], 14 + i * 16, 26))
  draw(g, s.foe.orb[0], 52, 40, 2)
  // El Nodo Maestro asoma por un lado y la nave sube disparando.
  rect(g, 59, 42, 2, 6, PAL.saffronLight)
  rect(g, 59, 32, 2, 6, PAL.saffron)
  draw(g, s.shot, 20, 44)
  draw(g, s.ship[0], 51, 50, 2)
}

// Río en Peligro: el río visto desde arriba con un puente, un barco, un depósito y la avioneta que se acerca.
function riverCover(g) {
  const s = riverSprites()
  rect(g, 0, 0, COVER.width, COVER.height, TONE.grass[3])
  for (let y = 0; y < COVER.height; y++) {
    const centre = 60 + Math.sin(y / 14) * 12
    const half = 26 + Math.sin(y / 9 + 1) * 4
    rect(g, centre - half - 2, y, 2, 1, TONE.sand[1])
    rect(g, centre + half, y, 2, 1, TONE.sand[1])
    rect(g, centre - half, y, half * 2, 1, PAL.lagoon)
    if (hash2(y, 3, 2) > 0.85) rect(g, centre - half + 6, y, 8, 1, PAL.lagoonLight)
  }
  for (let i = 0; i < 9; i++) {
    draw(g, s.tree, 4 + Math.floor(hash2(i, 1, 5) * 16), 4 + i * 8)
    draw(g, s.tree, 94 + Math.floor(hash2(i, 2, 5) * 16), 8 + i * 8)
  }
  // Puente de madera sobre el río.
  rect(g, 0, 20, COVER.width, 8, '#9a6a45')
  rect(g, 0, 20, COVER.width, 2, '#b98458')
  rect(g, 0, 26, COVER.width, 2, '#5a3a28')
  for (let x = 4; x < COVER.width; x += 8) rect(g, x, 22, 1, 4, '#7a4f35')
  rect(g, 54, 21, 12, 6, PAL.saffron)
  draw(g, s.ship, 40, 38)
  draw(g, s.tank, 66, 42, 1)
  draw(g, s.heli[0], 46, 6)
  draw(g, s.bullet, 59, 40)
  draw(g, s.bullet, 59, 32)
  draw(g, s.plane[0], 48, 52, 2)
}

const PAINTERS = { dungeon: dungeonCover, galactic: galacticCover, river: riverCover }
const cache = new Map()

// La portada de un juego como lienzo de 120×80, pintada la primera vez que se pide.
export function coverCanvas(id) {
  if (cache.has(id)) return cache.get(id)
  const canvas = makeCanvas(COVER.width, COVER.height)
  const g = canvas.getContext('2d')
  g.imageSmoothingEnabled = false
  PAINTERS[id]?.(g)
  cache.set(id, canvas)
  return canvas
}
