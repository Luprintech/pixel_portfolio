// Señal de exclamación sobre un personaje que tiene una conversación nueva. Es la misma imagen en la casa y en el
// valle: se pinta una vez y cada personaje la coloca encima de su cabeza. Desaparece cuando la viajera escucha la
// conversación; el personaje sigue siendo interactivo con sus diálogos de repetición.
import { makeCanvas, rect } from '../pixelKit.js'
import { prefersReducedMotion } from '../../lib/reducedMotion.js'

const KEY = 'npc-exclaim'

// `anchor()` devuelve dónde va la señal (sobre la cabeza del personaje, que puede estar andando): se coloca cada fotograma.
export function buildExclamation(scene, anchor) {
  if (!scene.textures.exists(KEY)) {
    const canvas = makeCanvas(7, 12)
    const g = canvas.getContext('2d')
    rect(g, 1, 0, 5, 8, '#1c1b3a')
    rect(g, 2, 1, 3, 6, '#f8d77a')
    rect(g, 1, 9, 5, 3, '#1c1b3a')
    rect(g, 2, 9, 3, 2, '#f8d77a')
    scene.textures.addCanvas(KEY, canvas)
  }
  const mark = scene.add.image(0, 0, KEY).setDepth(9999)
  // Sube y baja sobre su sitio; con «reducir movimiento» se queda quieta. El tween mueve `bob`, no `y`, porque `y` lo fija el ancla.
  const bob = { value: 0 }
  if (!prefersReducedMotion()) scene.tweens.add({ targets: bob, value: 2, duration: 500, yoyo: true, repeat: -1 })
  const place = () => {
    const { x, y } = anchor()
    mark.setPosition(x, y - bob.value)
  }
  place()
  scene.events.on('update', place)
  scene.events.once('shutdown', () => scene.events.off('update', place))
  return mark
}
