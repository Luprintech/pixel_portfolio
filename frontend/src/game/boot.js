import Phaser from 'phaser'
import ValleScene from './ValleScene.js'

// Se importa de forma diferida desde la página del juego: Phaser no pesa en el resto del sitio.
export function startGame(parent, look) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: 320,
    height: 180,
    backgroundColor: '#1c1b3a',
    pixelArt: true,
    roundPixels: true,
    physics: { default: 'arcade', arcade: { debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [],
  })
  game.registry.set('locked', false)
  game.registry.set('joy', { x: 0, y: 0 })
  game.scene.add('valle', ValleScene, true, { look })
  if (import.meta.env.DEV) window.__valle = game
  return game
}
