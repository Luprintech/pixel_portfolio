// Edificios de formación y lectura: colegio con torre del reloj, galería de artes con mural, universidad
// con arcadas y cúpula, y biblioteca con el libro abierto sobre la puerta.
import { PAL, TONE } from '../palette.js'
import { dot, ellipse, hash2, rect } from '../pixelKit.js'
import { WALL0, WALL1, WALL2, WOOD0, WOOD1, WOOD2, arcade, doorAt, finish, hipRoof, newSprite, signBoard, wall, windowAt } from './shared.js'

const SLATE = '#6b5b95'

// Colegio: cuerpo central alto con torre y reloj, y dos alas bajas con jardineras.
export function schoolSprite() {
  const s = newSprite(192, 128)
  const { g } = s
  ;[4, 124].forEach((x) => {
    wall(g, { x, y: 84, w: 64, h: 44 })
    hipRoof(g, { x: x - 4, y: 62, w: 72, rows: 5, color: SLATE })
  })
  wall(g, { x: 52, y: 60, w: 88, h: 68 })
  hipRoof(g, { x: 46, y: 36, w: 100, rows: 6, color: SLATE })
  // Torre del reloj.
  wall(g, { x: 84, y: 14, w: 24, h: 26, post: false })
  hipRoof(g, { x: 80, y: 3, w: 32, rows: 4, color: '#8a74b4', inset: 3 })
  ellipse(g, 96, 27, 8, 8, WOOD1)
  ellipse(g, 96, 27, 6.5, 6.5, '#f6f0e0')
  rect(g, 96, 22, 1, 6, WOOD0)
  rect(g, 96, 27, 4, 1, WOOD0)
  for (const [dx, dy] of [[0, -6], [6, 0], [0, 6], [-6, 0]]) dot(g, 96 + dx, 27 + dy, WOOD0)
  rect(g, 96, 0, 1, 4, WOOD0)
  rect(g, 97, 0, 5, 3, PAL.tile)
  // Ventanas: dos pisos en el cuerpo central, una por ala con jardinera.
  ;[62, 76, 112, 126].forEach((x) => {
    windowAt(s, x, 68, 10, 14)
    windowAt(s, x, 96, 10, 14)
  })
  ;[14, 44, 134, 164].forEach((x) => windowAt(s, x, 96, 10, 14, { shutters: PAL.teal, flowers: true }))
  doorAt(s, 89, 125, { w: 14, h: 24 })
  return finish(s)
}

// Galería de artes: sala baja con un mural de remolino de colores, puerta doble y ventanales.
export function gallerySprite() {
  const s = newSprite(160, 96)
  const { g } = s
  wall(g, { x: 4, y: 40, w: 152, h: 56 })
  hipRoof(g, { x: 0, y: 20, w: 160, rows: 5, color: '#7a6ab0', inset: 4 })
  // Mural: bandas de arcoíris que giran alrededor de un punto, recortadas en un marco.
  const bands = ['#e8504a', '#f2a33a', '#f2d84a', '#62b04a', '#4aa8d8', '#5a62c8', '#9a5ab8']
  rect(g, 11, 49, 42, 38, WOOD1)
  for (let y = 0; y < 36; y++) {
    for (let x = 0; x < 40; x++) {
      const dx = x - 20
      const dy = y - 18
      const angle = Math.atan2(dy, dx)
      const i = Math.floor(((Math.hypot(dx, dy) * 0.55 + angle * 1.8) % 7 + 7) % 7)
      dot(g, 12 + x, 50 + y, bands[i])
    }
  }
  doorAt(s, 68, 93, { w: 12, h: 22, color: WOOD2 })
  rect(g, 80, 71, 12, 22, WOOD0)
  rect(g, 81, 72, 10, 21, WOOD2)
  rect(g, 85, 72, 1, 21, WOOD0)
  ;[104, 126].forEach((x) => windowAt(s, x, 58, 16, 24, { flowers: true }))
  signBoard(g, 70, 44, 22, 9, { color: '#f4e8c8', ink: '#c4577f' })
  rect(g, 74, 47, 3, 3, '#e8504a')
  rect(g, 79, 47, 3, 3, '#4aa8d8')
  rect(g, 84, 47, 3, 3, '#f2d84a')
  return finish(s)
}

// Universidad: edificio largo con arcadas en la planta baja, frontón central y cúpula.
export function universitySprite() {
  const s = newSprite(240, 128)
  const { g } = s
  wall(g, { x: 4, y: 58, w: 232, h: 70, base: WALL1 })
  ;[0, 150].forEach((x) => hipRoof(g, { x, y: 40, w: 90, rows: 4, color: SLATE, inset: 4 }))
  // Cuerpo central más alto con frontón y óculo.
  wall(g, { x: 92, y: 36, w: 56, h: 92, post: false })
  for (let row = 0; row < 12; row++) {
    const half = 6 + Math.round(row * 4.2)
    rect(g, 120 - half, 26 + row, half * 2, 1, row === 0 ? WALL0 : row === 11 ? WALL0 : WALL2)
  }
  ellipse(g, 120, 40, 5, 5, WOOD1)
  ellipse(g, 120, 40, 3.5, 3.5, '#9fd6e0')
  // Cúpula sobre el frontón.
  ellipse(g, 120, 24, 14, 12, '#8a74b4')
  rect(g, 106, 24, 29, 6, '#8a74b4')
  ellipse(g, 118, 20, 5, 4, '#b8a2e0')
  rect(g, 120, 6, 1, 8, WOOD0)
  rect(g, 121, 6, 6, 3, PAL.saffron)
  // Arcadas de la planta baja y ventanas del piso de arriba.
  arcade(g, { x: 15, y: 98, w: 14, h: 28, count: 8, gap: 14 })
  for (let i = 0; i < 8; i++) windowAt(s, 18 + i * 28, 70, 10, 16, { flowers: i % 2 === 0 })
  doorAt(s, 113, 125, { w: 14, h: 26, glow: false, color: WOOD2 })
  // Banderines de colores colgando entre las ventanas.
  for (let x = 14; x < 226; x += 7) {
    const y = 62 + Math.round(Math.sin(x / 9) * 1.4)
    rect(g, x, y, 1, 2, ['#e07a9c', '#f2b134', '#b8a2e0', '#6fb3c6'][Math.floor(x / 7) % 4])
  }
  return finish(s)
}

// Biblioteca: dos pisos con ventanales cálidos y un libro abierto sobre una buhardilla.
export function librarySprite() {
  const s = newSprite(144, 128)
  const { g } = s
  wall(g, { x: 4, y: 60, w: 136, h: 68 })
  hipRoof(g, { x: 0, y: 38, w: 144, rows: 5, color: SLATE, inset: 4 })
  // Buhardilla con el libro.
  wall(g, { x: 54, y: 30, w: 36, h: 22, post: false })
  hipRoof(g, { x: 50, y: 14, w: 44, rows: 4, color: '#8a74b4', inset: 3 })
  signBoard(g, 62, 34, 20, 14, { icon: 'book', color: '#f4e8c8', ink: '#b8402c' })
  ;[22, 46, 98, 118].forEach((x) => windowAt(s, x, 82, 14, 22, { shutters: '#c4577f' }))
  ;[24, 50, 100, 120].forEach((x) => windowAt(s, x - 2, 66, 10, 10))
  doorAt(s, 64, 125, { w: 16, h: 26, glow: true })
  // Estantes que se ven por las ventanas: lomos de colores.
  ;[22, 46, 98, 118].forEach((x) => {
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < 12; i++) {
        if (hash2(x + i, r, 3) > 0.15) rect(g, x + i, 84 + r * 9, 1, 8, [PAL.tile, PAL.teal, PAL.saffron, PAL.plum, '#6fb3c6'][Math.floor(hash2(i, x + r, 5) * 5)])
      }
    }
  })
  rect(g, 4, 124, 136, 1, TONE.stone[0])
  return finish(s)
}
