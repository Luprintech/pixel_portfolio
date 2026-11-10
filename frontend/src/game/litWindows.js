// Cristales encendidos de un edificio. Se pintan por encima del oscurecimiento de la noche para que brillen,
// y por eso quedarían también por encima de quien pasa por delante de la ventana. Para evitarlo, mientras un
// personaje se solapa con el edificio se le recorta su silueta a la capa de cristales.
import { makeCanvas, rect } from './pixelKit.js'

export default class LitWindows {
  constructor(scene, key, { canvas, windows }, x, y, color) {
    this.scene = scene
    this.windows = windows
    this.color = color
    this.area = { x, y, w: canvas.width, h: canvas.height }
    this.canvas = makeCanvas(canvas.width, canvas.height)
    this.g = this.canvas.getContext('2d')
    this.cut = false
    this.paint()
    scene.textures.addCanvas(key, this.canvas)
    this.texture = scene.textures.get(key)
  }

  paint() {
    this.g.clearRect(0, 0, this.canvas.width, this.canvas.height)
    // Un cristal puede traer su propio color (ver `buildings/litPane.js`); sin él, el amarillo de siempre.
    this.windows.forEach((w) => rect(this.g, w.x, w.y, w.w, w.h, w.color ?? this.color))
  }

  // Recorta la silueta del sprite en su posición actual, o restaura los cristales si ya no se solapan.
  update(sprite) {
    const { frame } = sprite
    const width = frame.cutWidth
    const height = frame.cutHeight
    const left = Math.round(sprite.x - width / 2)
    const top = Math.round(sprite.y - height)
    const { x, y, w, h } = this.area
    const overlaps = left < x + w && left + width > x && top < y + h && top + height > y
    if (!overlaps && !this.cut) return
    this.paint()
    this.cut = overlaps
    if (overlaps) {
      this.g.globalCompositeOperation = 'destination-out'
      this.g.drawImage(frame.source.image, frame.cutX, frame.cutY, width, height, left - x, top - y, width, height)
      this.g.globalCompositeOperation = 'source-over'
    }
    this.texture.refresh()
  }
}
