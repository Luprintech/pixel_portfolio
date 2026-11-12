// Edificios de formación y lectura: galería de artes con mural, universidad
// con arcadas y cúpula, instituto de DAW (IES Gran Capitán) con pórtico y parabólica, y biblioteca con el libro abierto sobre la puerta.
import { PAL, TONE } from '../palette.js'
import { dot, ellipse, hash2, rect } from '../pixelKit.js'
import { drawText, textWidth } from '../pixelFont.js'
import { STONE0, STONE1, STONE2, WALL0, WALL1, WALL2, WOOD0, WOOD1, WOOD2, arcade, doorAt, finish, hipRoof, iconAt, newSprite, signBoard, wall, windowAt } from './shared.js'

const SLATE = '#6b5b95'

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

// IES Gran Capitán: instituto de dos plantas con tejado plano y pórtico con frontón sobre la puerta, el rótulo con el nombre
// (la fuente de píxeles no tiene tildes: la del último "A" se dibuja a mano), una parabólica y una bandera con el icono de código
// en el tejado, pantallas encendidas en las ventanas de arriba y el rótulo "DAW" en el ala izquierda. El dibujo mide lo mismo que
// el edificio (10×5 teselas) y su puerta cae en la columna 88, que es el centro de la tesela de puerta.
const INSTITUTE_TEAL = '#2f8f8b'

function schoolSign(g, x, y, w) {
  const name = 'GRAN CAPITAN'
  signBoard(g, x, y, w, 13, { color: '#2e2d5a', ink: '#f8d77a' })
  const left = x + Math.floor((w - textWidth(name)) / 2)
  drawText(g, left, y + 4, name, '#f8d77a')
  // Tilde del último "A" (CAPITÁN).
  const accent = left + 10 * 4 + 1
  dot(g, accent + 1, y + 2, '#f8d77a')
  dot(g, accent, y + 3, '#f8d77a')
}

function satelliteDish(g, x, y) {
  rect(g, x + 4, y + 8, 1, 6, STONE1)
  rect(g, x + 1, y + 13, 7, 2, STONE0)
  ellipse(g, x + 5, y + 4, 6, 5, STONE2)
  ellipse(g, x + 5, y + 4, 4.5, 3.5, '#f1e6cf')
  rect(g, x + 5, y + 1, 1, 4, STONE0)
  dot(g, x + 5, y, PAL.tile)
}

// Una ventana de arriba con una pantalla de código: tres líneas de colores sobre azul oscuro.
function codeWindow(s, x, y) {
  windowAt(s, x, y, 12, 12, { screen: '#1f3f78', muntins: false })
  rect(s.g, x + 2, y + 3, 6, 1, '#8fd3dd')
  rect(s.g, x + 2, y + 6, 8, 1, '#f8d77a')
  rect(s.g, x + 2, y + 9, 5, 1, '#8fd3dd')
}

export function instituteSprite() {
  const s = newSprite(160, 80)
  const { g } = s
  // Cuerpo bajo y largo, con el tejado plano y su antepecho.
  wall(g, { x: 4, y: 28, w: 152, h: 52 })
  rect(g, 0, 22, 160, 7, '#5c5a7a')
  rect(g, 0, 22, 160, 1, '#7a789a')
  rect(g, 0, 28, 160, 1, '#3b3957')
  for (let x = 6; x < 154; x += 8) rect(g, x, 24, 4, 1, '#7a789a')
  satelliteDish(g, 14, 7)
  rect(g, 40, 10, 1, 12, STONE1)
  rect(g, 37, 14, 7, 1, STONE2)
  // Pórtico central: frontón verde azulado, pared más clara y dos columnas a los lados de la puerta.
  hipRoof(g, { x: 54, y: 8, w: 68, rows: 3, color: INSTITUTE_TEAL, inset: 5 })
  wall(g, { x: 56, y: 20, w: 64, h: 60, base: WALL2, post: false })
  ;[62, 109].forEach((x) => {
    rect(g, x, 40, 6, 36, '#f1e6cf')
    rect(g, x, 40, 1, 36, '#ffffff')
    rect(g, x + 5, 40, 1, 36, '#c9b994')
    rect(g, x - 1, 38, 8, 3, '#e8d3a8')
    rect(g, x - 1, 75, 8, 2, '#c9b994')
  })
  schoolSign(g, 61, 28, 54)
  // Bandera con el icono de código sobre el frontón.
  rect(g, 88, 1, 1, 9, WOOD0)
  rect(g, 89, 2, 15, 9, INSTITUTE_TEAL)
  rect(g, 89, 2, 15, 1, '#5cc6bf')
  iconAt(g, 93, 3, 'code', '#f1e6cf')
  // Alas: arriba pantallas de código, en medio el rótulo DAW y abajo ventanas normales con jardinera.
  ;[10, 34, 126, 142].forEach((x) => codeWindow(s, x, 34))
  ;[10, 34].forEach((x) => windowAt(s, x, 60, 12, 12, { flowers: true }))
  ;[126, 142].forEach((x) => windowAt(s, x, 60, 12, 12, { flowers: true }))
  signBoard(g, 16, 49, 24, 8, { color: INSTITUTE_TEAL })
  drawText(g, 22, 51, 'DAW', '#f1e6cf')
  doorAt(s, 80, 77, { w: 16, h: 22 })
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
