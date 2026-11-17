// Biblioteca con el libro abierto sobre la puerta. La Escuela de Artes, la Universidad, el IES Gran Capitán y el CPIFP Alan Turing
// se dibujan en sus propios archivos (`artes.js`, `university.js`, `ies.js` y `turing.js`).
import { PAL, TONE } from '../palette.js'
import { hash2, rect } from '../pixelKit.js'
import { STONE0, STONE1, STONE2, WALL0, WALL1, WALL2, WOOD0, WOOD1, WOOD2, doorAt, finish, hipRoof, newSprite, signBoard, wall, windowAt } from './shared.js'

const SLATE = '#6b5b95'

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
