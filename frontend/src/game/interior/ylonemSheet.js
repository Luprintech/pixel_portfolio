// Ylonem con la cámara en la mano, tal como se le ve cuando graba por el valle (`npc/GranNeighbours.js`): su dibujo de siempre (`ylonem.js`, el mismo generador que la viajera) con una cámara de
// fotos en la mano. La cámara se pinta encima del fotograma ya compuesto, así que no cambia el aspecto fijo del personaje ni sus
// proporciones. Sin dependencias de Phaser ni de React.
import { DIRS, SHEET_POSES, frameRect } from '../avatar/index.js'
import { characterSheet } from '../characters.js'
import { rect } from '../pixelKit.js'

// Cuerpo gris grafito con canto claro, tapa plateada, objetivo azul con aro blanco y agarre marrón. Sobre una camiseta negra un
// cuerpo negro desaparece, así que el cuerpo se aclara lo justo para que el contorno y el objetivo se lean a tamaño real.
const BODY = '#4b4b5a'
const BODY_LIGHT = '#8a8a9c'
const TOP = '#d6d8e2'
const LENS = '#6f93d0'
const RING = '#f1f4fb'
const GRIP = '#2b2326'
const SKIN = '#e2ab82'

// Coordenadas del fotograma de 18×34, medidas sobre la mano de cada dirección (cae sobre las filas 22 a 25, como la taza de Atreus).
// De frente la cámara asoma por el lado de la mano con el objetivo hacia quien mira; de perfil apunta hacia delante; de espaldas
// solo asoma el costado.
const CAMERA_BOXES = {
  down: [[1, 22, 2, 1, TOP], [1, 23, 5, 3, BODY], [1, 23, 5, 1, BODY_LIGHT], [3, 24, 2, 2, LENS], [3, 24, 2, 1, RING], [1, 24, 1, 2, GRIP], [6, 24, 1, 1, SKIN]],
  up: [[16, 22, 2, 1, TOP], [15, 23, 3, 3, BODY], [15, 23, 3, 1, BODY_LIGHT]],
  left: [[5, 22, 3, 1, TOP], [5, 23, 5, 3, BODY], [5, 23, 5, 1, BODY_LIGHT], [3, 24, 2, 2, LENS], [3, 24, 1, 2, RING], [7, 25, 2, 1, GRIP], [10, 24, 1, 1, SKIN]],
  right: [[10, 22, 3, 1, TOP], [8, 23, 5, 3, BODY], [8, 23, 5, 1, BODY_LIGHT], [13, 24, 2, 2, LENS], [14, 24, 1, 2, RING], [9, 25, 2, 1, GRIP], [7, 24, 1, 1, SKIN]],
}

export function paintCamera(g, dir, ox = 0, oy = 0) {
  CAMERA_BOXES[dir].forEach(([x, y, w, h, color]) => rect(g, ox + x, oy + y, w, h, color))
}

// Hoja completa de Ylonem: la misma rejilla que cualquier personaje (`frameRect`). La cámara solo en reposo, que es cuando graba (parado, mirando
// a lo que filma); al andar se usa su hoja sin cámara, porque los brazos se mueven y la cámara no acompañaría.
export function ylonemSheet() {
  const sheet = characterSheet('ylonem')
  const g = sheet.getContext('2d')
  DIRS.forEach((dir) => {
    for (let pose = 0; pose < SHEET_POSES; pose++) {
      const { x, y } = frameRect(dir, pose)
      if (pose === 0) paintCamera(g, dir, x, y)
    }
  })
  return sheet
}
