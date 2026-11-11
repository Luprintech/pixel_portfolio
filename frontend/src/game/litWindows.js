// Cristales encendidos de un edificio. Se pintan por encima del oscurecimiento de la noche para que brillen,
// y por eso quedarían también por encima de quien pasa por delante de la ventana. Para evitarlo, mientras un
// personaje (la viajera o cualquier NPC) se solapa con el edificio se le recorta su silueta a la capa de cristales.
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

  // Recorta la silueta de cada sprite que se solape con el edificio, o restaura los cristales si ya no se solapa ninguno. Vale para la viajera y para
  // quien anda por el valle (Lupe, la gata, Ylonem y Grace, la mascota): todos se dibujan por debajo de esta capa. Un sprite escondido o del todo
  // transparente no cuenta, y uno reflejado (`flipX`) se recorta también reflejado.
  update(sprites) {
    const { x, y, w, h } = this.area
    const cutters = sprites
      .filter((sprite) => sprite && sprite.visible && sprite.alpha > 0)
      .map((sprite) => {
        const { frame } = sprite
        const width = frame.cutWidth
        const height = frame.cutHeight
        return { sprite, frame, width, height, left: Math.round(sprite.x - width / 2), top: Math.round(sprite.y - height) }
      })
      .filter(({ left, top, width, height }) => left < x + w && left + width > x && top < y + h && top + height > y)
    if (!cutters.length && !this.cut) return
    this.paint()
    this.cut = cutters.length > 0
    this.g.globalCompositeOperation = 'destination-out'
    cutters.forEach(({ sprite, frame, width, height, left, top }) => {
      const at = { x: left - x, y: top - y }
      if (sprite.flipX) {
        this.g.save()
        this.g.translate(at.x + width, at.y)
        this.g.scale(-1, 1)
        this.g.drawImage(frame.source.image, frame.cutX, frame.cutY, width, height, 0, 0, width, height)
        this.g.restore()
      } else this.g.drawImage(frame.source.image, frame.cutX, frame.cutY, width, height, at.x, at.y, width, height)
    })
    this.g.globalCompositeOperation = 'source-over'
    this.texture.refresh()
  }
}
