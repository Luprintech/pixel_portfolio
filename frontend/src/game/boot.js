import Phaser from 'phaser'
import ValleScene from './ValleScene.js'

// Se importa de forma diferida desde la página del juego: Phaser no pesa en el resto del sitio.
export function startGame(parent, look, pet) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    backgroundColor: '#1c1b3a',
    pixelArt: true,
    roundPixels: true,
    physics: { default: 'arcade', arcade: { debug: false } },
    // El lienzo ocupa todo el contenedor; el zoom de la cámara (viewport.js) adapta el mundo.
    scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
    scene: [],
  })
  game.registry.set('locked', false)
  game.registry.set('joy', { x: 0, y: 0 })
  game.scene.add('valle', ValleScene, true, { look, pet })
  if (import.meta.env.DEV) window.__valle = game
  return game
}
