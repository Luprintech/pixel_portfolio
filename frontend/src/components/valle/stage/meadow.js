// Prado de las escenas del creador. Se pinta a la resolución del juego y cubre toda la caja, con las
// mismas flores y matas en cada repintado (semilla fija) para que no parpadee al editar.
import { drawFlower, drawTuft, grassColor } from '../../../game/ground'
import { seeded } from '../../../game/palette'

export function paintMeadow(g, cols, rows) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      g.fillStyle = grassColor(x + 11, y + 23)
      g.fillRect(x, y, 1, 1)
    }
  }
  const rand = seeded(7)
  for (let i = 0; i < (cols * rows) / 70; i++) drawTuft(g, 2 + Math.floor(rand() * (cols - 4)), 4 + Math.floor(rand() * (rows - 5)))
  for (let i = 0; i < cols / 5; i++) drawFlower(g, 2 + Math.floor(rand() * (cols - 4)), 3 + Math.floor(rand() * (rows - 8)), i)
}
