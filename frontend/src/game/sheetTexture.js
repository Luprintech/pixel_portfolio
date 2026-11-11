// Registra una hoja de sprites del generador del avatar (poses en columnas, direcciones en filas) en el gestor de
// texturas de Phaser con un fotograma por pose y dirección. Lo usan la viajera, Lupe y Atreus. Recibe el gestor ya
// creado, así que el módulo no importa Phaser.
import { DIRS, SHEET_POSES, frameName, frameRect } from './avatar/index.js'

export function registerSheet(textures, key, canvas) {
  const texture = textures.addCanvas(key, canvas)
  DIRS.forEach((dir) => {
    for (let pose = 0; pose < SHEET_POSES; pose++) {
      const { x, y, w, h } = frameRect(dir, pose)
      texture.add(frameName(dir, pose), 0, x, y, w, h)
    }
  })
  return texture
}
