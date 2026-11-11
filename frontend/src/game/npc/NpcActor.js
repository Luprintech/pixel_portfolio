// Dibujo de un personaje con la hoja del generador del avatar (la misma que la viajera): sprite y sombra que siguen lo
// que dice su cerebro (`x`, `y`, `facing`, `walking`). No decide nada: solo pinta, con el mismo ciclo de marcha que el resto.
import { SIT_POSE, WALK_CYCLE, frameName } from '../avatar/index.js'
import { advanceWalk } from '../walk.js'

export default class NpcActor {
  // `altKey` es otra hoja del mismo personaje (Ylonem con la cámara en la mano) que se usa mientras `alt` esté activo.
  constructor(scene, key, x, y, altKey = null) {
    this.key = key
    this.altKey = altKey
    this.walk = { timer: 0, step: 0 }
    this.shadow = scene.add.image(x, y - 1, 'shadow').setDepth(2)
    this.sprite = scene.add.sprite(x, y, key, frameName('down', 0)).setOrigin(0.5, 1)
    this.sprite.setDepth(y)
  }

  // `depth` fija la profundidad cuando no es la de la fila de los pies (sobre la cubierta, que se dibuja por encima de la casa, o sentada en un
  // banco, delante de él). Con `sitting` usa la pose sentada y esconde la sombra; con `alt`, la hoja alternativa si la hay.
  render({ x, y, facing, walking, sitting = false, alt = false }, delta, depth) {
    const step = advanceWalk(this.walk, walking, delta)
    const key = alt && this.altKey ? this.altKey : this.key
    const frame = frameName(facing, sitting ? SIT_POSE : WALK_CYCLE[step])
    if (this.sprite.texture.key === key) this.sprite.setFrame(frame)
    else this.sprite.setTexture(key, frame)
    this.sprite.setPosition(x, y)
    this.sprite.setDepth(depth ?? Math.round(y))
    this.shadow.setPosition(x, y - 1)
    if (depth !== undefined) this.shadow.setDepth(depth - 1)
    // Sentada no se ve su sombra en el suelo (el banco la tapa); si el actor está escondido, la sombra sigue su visibilidad.
    if (this.sprite.visible) this.shadow.setVisible(!sitting)
  }

  setAlpha(alpha) {
    this.sprite.setAlpha(alpha)
    this.shadow.setAlpha(alpha)
  }

  setVisible(visible) {
    this.sprite.setVisible(visible)
    this.shadow.setVisible(visible)
  }

  destroy() {
    this.sprite.destroy()
    this.shadow.destroy()
  }
}
