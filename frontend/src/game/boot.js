import Phaser from 'phaser'
import InteriorScene from './InteriorScene.js'
import ValleScene from './ValleScene.js'
import { initialStory } from './story/story.js'

// Píxeles del lienzo por píxel CSS. Con una escala del sistema fraccionaria (125 % o 150 % en Windows) un
// lienzo en píxeles CSS se estira con un factor no entero y el pixel art vibra y se ve borroso al moverse; con
// el tamaño real del dispositivo se muestra 1:1. Se limita a 2 para no cargar de más a los móviles.
const MAX_RESOLUTION = 2

function canvasSize(parent) {
  const factor = Math.min(window.devicePixelRatio || 1, MAX_RESOLUTION)
  return {
    width: Math.max(1, Math.round(parent.clientWidth * factor)),
    height: Math.max(1, Math.round(parent.clientHeight * factor)),
  }
}

// El modo RESIZE de Phaser mediría el contenedor en píxeles CSS, así que el tamaño se gestiona aquí; el CSS
// (`.valle-host canvas`) estira el lienzo al contenedor.
function keepSized(game, parent) {
  const fit = () => {
    const { width, height } = canvasSize(parent)
    if (parent.clientWidth && parent.clientHeight) game.scale.resize(width, height)
  }
  const observer = new ResizeObserver(fit)
  observer.observe(parent)
  window.addEventListener('resize', fit)
  game.events.once('destroy', () => {
    observer.disconnect()
    window.removeEventListener('resize', fit)
  })
}

// Se importa de forma diferida desde la página del juego: Phaser no pesa en el resto del sitio.
// `pastel` pinta el escenario con la paleta del tema valle; en modo noche conserva sus colores de siempre.
// `world` es el estado guardado del valle (hora y posición); sin él se empieza en la entrada, de mañana. `story` es la memoria
// de la historia (bienvenida, visita guiada, conversaciones); sin ella la partida empieza por la bienvenida de Lupe.
export function startGame(parent, look, pet, pastel = false, world = null, story = initialStory()) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    // El color de la página (lavanda en el tema valle, tinta en modo noche): mientras la escena se crea no hay
    // salto de color entre la página y el lienzo.
    backgroundColor: pastel ? '#dccbf0' : '#1c1b3a',
    pixelArt: true,
    roundPixels: true,
    physics: { default: 'arcade', arcade: { debug: false } },
    // El zoom de la cámara (viewport.js) adapta el mundo al tamaño del lienzo.
    scale: { mode: Phaser.Scale.NONE, ...canvasSize(parent) },
    scene: [],
  })
  keepSized(game, parent)
  game.registry.set('locked', false)
  game.registry.set('joy', { x: 0, y: 0 })
  game.registry.set('story', story)
  game.scene.add('interior', InteriorScene, false)
  game.scene.add('valle', ValleScene, true, { look, pet, pastel, world })
  if (import.meta.env.DEV) window.__valle = game
  return game
}
