// La captura del canal de YouTube de Lupe, puesta como imagen real encima de la pantalla de la tele cuando ese canal está activo.
// Dentro del dibujo de la tele (40×22 píxeles) la captura saldría hecha una mancha; así se enseña entera y nítida, ajustada al hueco
// de la pantalla. Mientras la imagen no cargue (o no exista) se ve la versión en píxeles de la tele (`furniture/tvScreens.js`).
import { FURNITURE } from './furniture/index.js'
import { SCREEN, onTvArtLoaded, tvArtImage } from './furniture/tvScreens.js'

const KEY = 'tv-youtube-art'
// Estados de una escena de Phaser (`Phaser.Scenes`): del 8 en adelante ya se ha cerrado y no se puede añadir nada.
const SHUTDOWN = 8
// La captura se reduce primero a un lienzo de cuatro veces la pantalla con suavizado de calidad: el reescalado final de la tarjeta
// gráfica parte de ahí y no de 1255 píxeles, que saldrían con dientes de sierra.
const SUPERSAMPLE = 6

function ensureTexture(scene, image) {
  if (scene.textures.exists(KEY)) return
  const canvas = document.createElement('canvas')
  canvas.width = SCREEN.w * SUPERSAMPLE
  canvas.height = SCREEN.h * SUPERSAMPLE
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  const texture = scene.textures.addCanvas(KEY, canvas)
  // El resto del juego se ve con píxeles nítidos; esta captura, que ya es arte reducido, se suaviza al ajustarse a la pantalla.
  texture.setFilter(1)
}

// Engancha la captura a la tele de la sala: `tvSwitch` es su interruptor de modos (`homeBuilder.js`) y `piece` su sitio en el plano.
// Devuelve la imagen (o `null` mientras no haya cargado).
export function attachTvArt(scene, tvSwitch, piece) {
  if (!tvSwitch) return
  const { w, h } = FURNITURE.tvUnit
  let art = null
  const sync = () => art?.setVisible(tvSwitch.mode === 'youtube')
  const build = () => {
    const image = tvArtImage()
    if (!image || art || !scene.sys || scene.sys.settings.status >= SHUTDOWN) return
    ensureTexture(scene, image)
    const x = piece.x - w / 2 + SCREEN.x + SCREEN.w / 2
    const y = piece.y - h + SCREEN.y + SCREEN.h / 2
    art = scene.add.image(x, y, KEY).setDisplaySize(SCREEN.w, SCREEN.h).setDepth(piece.y + (piece.dz ?? 0) + 0.25)
    sync()
  }
  const original = tvSwitch.set
  tvSwitch.set = (next) => {
    original(next)
    sync()
  }
  if (tvArtImage()) build()
  else onTvArtLoaded(build)
}
