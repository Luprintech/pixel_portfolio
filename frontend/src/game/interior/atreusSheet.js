// Atreus tal como se le ve en casa: su dibujo de siempre (`atreus.js`, el mismo generador que la viajera) con unos
// cascos gaming sobre las orejas. Los cascos se pintan encima del fotograma ya compuesto, así que no cambian el
// aspecto fijo del personaje ni sus proporciones. Sin dependencias de Phaser ni de React.
import { DIRS, SHEET_POSES, SIT_DROP, SIT_POSE, avatarCanvas, frameRect } from '../avatar/index.js'
import { ATREUS_LOOK } from '../atreus.js'
import { characterSheet } from '../characters.js'
import { rect } from '../pixelKit.js'

// Gris pizarra con luz arriba y un brillo turquesa en la copa: se separa del pelo negro y pega con el valle.
const BAND = '#5c5a7a'
const BAND_LIGHT = '#8d8aa8'
const CUP = '#3b3957'
const CUP_RIM = '#aaa7c4'
const GLOW = '#7fd0dc'

// Diadema que rodea la cabeza y copas sobre las orejas. Coordenadas del fotograma de 18×34, medidas sobre el dibujo.
const HEADSET = {
  down: [
    ['band', [[6, 2, 6, 1], [5, 3, 1, 1], [12, 3, 1, 1], [4, 4, 1, 1], [13, 4, 1, 1], [3, 5, 1, 2], [14, 5, 1, 2], [2, 7, 1, 2], [15, 7, 1, 2]]],
    ['cup', [[1, 9, 3, 6], [14, 9, 3, 6]]],
    ['mic', [[3, 15, 1, 1], [4, 16, 2, 1]]],
  ],
  up: [
    ['band', [[6, 2, 6, 1], [5, 3, 1, 1], [12, 3, 1, 1], [4, 4, 1, 1], [13, 4, 1, 1], [3, 5, 1, 2], [14, 5, 1, 2], [2, 7, 1, 2], [15, 7, 1, 2]]],
    ['cup', [[1, 9, 3, 6], [14, 9, 3, 6]]],
  ],
  // De perfil la diadema sale de la mitad superior de la copa, sube por el lado de la cabeza, cruza la coronilla (la fila 2,
  // por encima del pelo) y baja por el otro lado, que queda oculto: se ve el arco entero hasta la coronilla.
  left: [
    ['band', [[9, 8, 2, 1], [9, 7, 2, 1], [9, 6, 2, 1], [9, 5, 2, 1], [9, 4, 2, 1], [9, 3, 3, 1], [10, 2, 4, 1], [13, 3, 2, 1], [15, 4, 1, 2]]],
    ['cup', [[8, 9, 5, 6]]],
    ['mic', [[7, 14, 1, 1], [6, 15, 1, 1], [4, 16, 2, 1]]],
  ],
  right: [
    ['band', [[7, 8, 2, 1], [7, 7, 2, 1], [7, 6, 2, 1], [7, 5, 2, 1], [7, 4, 2, 1], [6, 3, 3, 1], [4, 2, 4, 1], [3, 3, 2, 1], [2, 4, 1, 2]]],
    ['cup', [[5, 9, 5, 6]]],
    ['mic', [[10, 14, 1, 1], [11, 15, 1, 1], [12, 16, 2, 1]]],
  ],
}

function paintCup(g, x, y, w, h) {
  rect(g, x, y, w, h, CUP)
  rect(g, x, y, w, 1, CUP_RIM)
  rect(g, x, y, 1, h, CUP_RIM)
  rect(g, x + Math.floor(w / 2), y + Math.floor(h / 2) - 1, 1, 2, GLOW)
}

// Pinta los cascos en un fotograma cuyo origen está en (ox, oy) del lienzo.
export function paintHeadset(g, dir, ox = 0, oy = 0) {
  HEADSET[dir].forEach(([part, boxes]) => {
    boxes.forEach(([x, y, w, h]) => {
      if (part === 'cup') paintCup(g, ox + x, oy + y, w, h)
      else if (part === 'mic') rect(g, ox + x, oy + y, w, h, CUP_RIM)
      else {
        rect(g, ox + x, oy + y, w, h, BAND)
        rect(g, ox + x, oy + y, w, 1, BAND_LIGHT)
      }
    })
  })
}

// Hoja completa de Atreus con cascos: la misma rejilla que cualquier personaje (`frameRect`).
export function atreusSheet() {
  const sheet = characterSheet('atreus')
  const g = sheet.getContext('2d')
  DIRS.forEach((dir) => {
    for (let pose = 0; pose < SHEET_POSES; pose++) {
      const { x, y } = frameRect(dir, pose)
      // Sentado el cuerpo baja `SIT_DROP` filas con la cabeza: los cascos bajan con ella.
      paintHeadset(g, dir, x, y + (pose === SIT_POSE ? SIT_DROP : 0))
    }
  })
  return sheet
}

// Fotograma de frente con los ojos cerrados (y los cascos): se alterna con el de reposo para que parpadee.
export function atreusBlink() {
  const frame = avatarCanvas(ATREUS_LOOK, 'down', 0, true)
  paintHeadset(frame.getContext('2d'), 'down')
  return frame
}
