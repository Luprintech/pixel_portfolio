// Dibujo de un personaje con la hoja del generador del avatar (la misma que la viajera): sprite y sombra que siguen lo
// que dice su cerebro (`x`, `y`, `facing`, `walking`). No decide nada: solo pinta, con el mismo ciclo de marcha que el resto.
import { WALK_CYCLE, frameName } from '../avatar/index.js'
import { advanceWalk } from '../walk.js'

export default class NpcActor {
  constructor(scene, key, x, y) {
    this.walk = { timer: 0, step: 0 }
    this.shadow = scene.add.image(x, y - 1, 'shadow').setDepth(2)
    this.sprite = scene.add.sprite(x, y, key, frameName('down', 0)).setOrigin(0.5, 1)
    this.sprite.setDepth(y)
  }

  // `depth` fija la profundidad cuando no es la de la fila de los pies (sobre la cubierta, que se dibuja por encima de la casa).
  render({ x, y, facing, walking }, delta, depth) {
    const step = advanceWalk(this.walk, walking, delta)
    this.sprite.setPosition(x, y)
    this.sprite.setFrame(frameName(facing, WALK_CYCLE[step]))
    this.sprite.setDepth(depth ?? Math.round(y))
    this.shadow.setPosition(x, y - 1)
    if (depth !== undefined) this.shadow.setDepth(depth - 1)
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
