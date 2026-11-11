// La sardina de peluche de Khalessi: un pececito azul plateado de 10×5 píxeles con la barriga clara, un ojo y la cola abierta.
// Sin dependencias de Phaser ni de React.
import { INK, canvasOf, rect } from './draw.js'

export function sardineCanvas() {
  const { canvas, g } = canvasOf(12, 6)
  rect(g, 2, 1, 7, 4, '#6f9fd8')
  rect(g, 3, 0, 5, 1, '#6f9fd8')
  rect(g, 2, 4, 7, 1, INK.white)
  rect(g, 0, 0, 2, 2, '#4f7fbf')
  rect(g, 0, 4, 2, 2, '#4f7fbf')
  rect(g, 1, 2, 1, 2, '#4f7fbf')
  rect(g, 8, 2, 1, 1, INK.night)
  rect(g, 4, 2, 1, 1, '#a9c8f0')
  rect(g, 9, 2, 2, 2, '#6f9fd8')
  return canvas
}
