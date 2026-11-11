// Hoja de sprites del avatar: tres poses (reposo y dos pasos) por cuatro direcciones, todas del
// mismo tamaño. El juego la registra como una sola textura con un fotograma por pose y dirección;
// el creador pide el fotograma suelto. Al caminar se recorre `WALK_CYCLE`.
import { makeCanvas } from '../pixelKit.js'
import { DIRS, FRAME_H, FRAME_W } from './compose.js'
import { avatarCanvas } from './paint.js'
import { POSES, SIT_POSE } from './stance.js'

// La hoja lleva, tras las `POSES` del ciclo de marcha, el fotograma sentado.
export const SHEET_POSES = POSES + 1

export { DIRS, FRAME_H, FRAME_W, POSES, SIT_POSE }

// Reposo, paso, reposo, paso contrario: el pie que avanza alterna sin pasar por dos pasos seguidos.
export const WALK_CYCLE = [0, 1, 0, 2]

export const frameName = (dir, pose) => `${dir}-${pose}`

// Posición de un fotograma dentro de la hoja: las poses van en columnas y las direcciones en filas.
export function frameRect(dir, pose) {
  return { x: pose * FRAME_W, y: DIRS.indexOf(dir) * FRAME_H, w: FRAME_W, h: FRAME_H }
}

export function avatarSheet(look) {
  const sheet = makeCanvas(SHEET_POSES * FRAME_W, DIRS.length * FRAME_H)
  const g = sheet.getContext('2d')
  DIRS.forEach((dir) => {
    for (let pose = 0; pose < SHEET_POSES; pose++) {
      const { x, y } = frameRect(dir, pose)
      g.drawImage(avatarCanvas(look, dir, pose), x, y)
    }
  })
  return sheet
}
