// Los bocadillos ambientales de quienes viven en el pueblo (Grace, Ylonem, Atreus): uno solo a la vez, que sigue la cabeza de quien habla
// (`bubble-anchor`) y que la página quita sola pasado el tiempo de lectura (`WorldBubble.jsx`). No abre ningún diálogo ni quita el control.
// `busyElsewhere()` dice si Lupe tiene ya uno abierto: nunca salen dos a la vez.
import { screenAnchor } from './bubbleAnchor.js'

export default class TownBubbles {
  constructor(scene, busyElsewhere = () => false) {
    this.scene = scene
    this.game = scene.game
    this.busyElsewhere = busyElsewhere
    this.open = false
    this.anchorOf = null
    this.onClosed = () => {
      this.open = false
      this.anchorOf = null
    }
    this.game.events.on('bubble-closed', this.onClosed)
  }

  destroy() {
    this.game.events.off('bubble-closed', this.onClosed)
  }

  // Dice `key` (de `copy.bubbles`) sobre la cabeza que da `anchorOf()` ({ x, y } del mapa). Devuelve false si ya hay uno abierto.
  say(key, anchorOf) {
    if (this.open || this.busyElsewhere()) return false
    this.open = true
    this.anchorOf = anchorOf
    this.game.events.emit('npc-bubble', key)
    return true
  }

  // Mientras está abierto, la página sabe dónde está la cabeza en la pantalla.
  publish() {
    if (!this.open || !this.anchorOf) return
    const { x, y } = this.anchorOf()
    this.game.events.emit('bubble-anchor', screenAnchor(this.scene, x, y))
  }
}
