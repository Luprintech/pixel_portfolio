import Phaser from 'phaser'
import ValleScene from './ValleScene.js'

// Se importa de forma diferida desde la página del juego: Phaser no pesa en el resto del sitio.
// `pastel` pinta el escenario con la paleta del tema valle; en modo noche conserva sus colores de siempre.
export function startGame(parent, look, pet, pastel = false) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    // El color de la página (lavanda en el tema valle, tinta en modo noche): mientras la escena se crea no hay
    // salto de color entre la página y el lienzo.
    backgroundColor: pastel ? '#dccbf0' : '#1c1b3a',
    pixelArt: true,
    roundPixels: true,
    physics: { default: 'arcade', arcade: { debug: false } },
    // El lienzo ocupa todo el contenedor; el zoom de la cámara (viewport.js) adapta el mundo.
    scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
    scene: [],
  })
  game.registry.set('locked', false)
  game.registry.set('joy', { x: 0, y: 0 })
  game.scene.add('valle', ValleScene, true, { look, pet, pastel })
  if (import.meta.env.DEV) window.__valle = game
  return game
}
