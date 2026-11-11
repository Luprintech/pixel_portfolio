// El cielo dentro de una casa: la misma hora, estación y tiempo que fuera. No hay un segundo reloj ni una simulación aparte:
// cada fotograma se lee el reloj del valle (`SkyLayer.clock`, que sigue corriendo aunque el valle duerma) y se pide el mismo
// estado de cielo (`valleSkyAt`). De ahí salen
//   - el oscurecimiento de la noche y de las nubes cargadas, y el tono cálido del amanecer y el atardecer;
//   - lo que se ve por las ventanas (`windowView.js`): sol, luna, nubes, lluvia, nieve y rayos, siempre al otro lado del cristal;
//   - las luces de la casa (guirnalda y tiras led), que se encienden al anochecer en la capa de su mueble (`ledLights.js`);
//   - el fogonazo de los rayos sobre la sala, y el aviso al sonido de truenos y ambiente (`SkyLayer.publishWorld`).
// Con «reducir movimiento» no hay fogonazos, ni gotas que caigan, ni colores de led que cambien.
import { prefersReducedMotion } from '../../lib/reducedMotion.js'
import { tintLayers } from '../titleSkyPaint.js'
import { valleLightningAt, valleSkyAt } from '../valleSky.js'
import { WINDOWS } from './homeLayout.js'
import { duskGlow, lightsOn, roomFlash } from './interiorLight.js'
import { LED_DEPTH, LED_LAYERS, LED_PALETTES, bulbGlowCanvas, ledCanvas } from './ledLights.js'
import { windowOverlayCanvas } from './roomDecor.js'
import { paintWindowView, windowStars } from './windowView.js'

// Orden de dibujo: el cielo va detrás de la imagen de la sala (que tiene los cristales huecos), los travesaños justo encima y
// el oscurecimiento por encima de todo lo que hay en la sala.
const DEPTH = { view: -1, bars: 0.2, bulbs: 0.45, tint: 8000, warm: 8003, flash: 8010 }
const WARM_COLOR = 0xf2a65a
const WARM_MAX = 0.14
// Cada cuánto se repinta el cristal: rápido si hay algo que se mueve (lluvia, nieve), despacio si no (el cielo cambia lento).
const REPAINT_MOVING_MS = 70
const REPAINT_CALM_MS = 600
const LED_CYCLE_MS = 2200

const hex = (color) => Number.parseInt(color.slice(1), 16)

export default class InteriorSky {
  // `source` es la capa de cielo del valle (`ValleScene.sky`): da el reloj y la semilla.
  constructor(scene, { room, pastel, source }) {
    this.scene = scene
    this.source = source
    this.room = room
    this.pastel = pastel
    this.still = prefersReducedMotion()
    this.shown = new WeakMap()
    this.views = []
    this.leds = []
    this.lastPaint = -Infinity
    const { width, height } = room
    this.tints = tintLayers({ dark: 0, rain: 0, storm: 0, winter: 0 }).map(({ color }) =>
      scene.add.rectangle(width / 2, height / 2, width, height, hex(color)).setDepth(DEPTH.tint).setAlpha(0),
    )
    this.warm = scene.add.rectangle(width / 2, height / 2, width, height, WARM_COLOR).setDepth(DEPTH.warm).setAlpha(0)
    this.flash = scene.add.rectangle(width / 2, height / 2, width, height, 0xffffff).setDepth(DEPTH.flash).setAlpha(0)
    if (room.home) {
      this.buildWindows()
      this.buildLights()
    }
  }

  // Un lienzo vivo por cristal, detrás de la imagen de la sala, y los travesaños y cortinas por delante.
  buildWindows() {
    const { scene, room, pastel } = this
    WINDOWS.forEach((window) => {
      const key = `window-view:${window.id}`
      // El lienzo de cada cristal se conserva entre visitas: solo se vuelve a pintar.
      const texture = scene.textures.exists(key) ? scene.textures.get(key) : scene.textures.createCanvas(key, window.w, window.h)
      const image = scene.add.image(window.x, window.y, key).setOrigin(0, 0).setDepth(DEPTH.view)
      this.views.push({ window, texture, image, stars: windowStars(window.w, window.h, window.x) })
    })
    const barsKey = `window-bars:${pastel}`
    if (!scene.textures.exists(barsKey)) scene.textures.addCanvas(barsKey, windowOverlayCanvas(room, pastel))
    scene.add.image(0, 0, barsKey).setOrigin(0, 0).setDepth(DEPTH.bars)
  }

  // Las luces decorativas: cada capa va a la profundidad del objeto al que está pegada (ver `ledLights.js`), así los
  // personajes pasan por delante o por detrás de ellas como de cualquier mueble. La guirnalda tiene su propio resplandor.
  buildLights() {
    const { scene, room } = this
    this.textureKey = (layer, palette) => `leds:${layer}:${palette}`
    LED_LAYERS.forEach((layer) => {
      LED_PALETTES.forEach((palette, i) => {
        const key = this.textureKey(layer, i)
        if (!scene.textures.exists(key)) scene.textures.addCanvas(key, ledCanvas(room, palette, layer))
      })
      this.leds.push(scene.add.image(0, 0, this.textureKey(layer, 0)).setOrigin(0, 0).setDepth(LED_DEPTH[layer]).setAlpha(0).setData('layer', layer))
    })
    if (!scene.textures.exists('bulb-glow')) scene.textures.addCanvas('bulb-glow', bulbGlowCanvas(room))
    this.bulbs = scene.add.image(0, 0, 'bulb-glow').setOrigin(0, 0).setDepth(DEPTH.bulbs).setAlpha(0)
    if (this.still) return
    let index = 0
    this.cycle = scene.time.addEvent({
      delay: LED_CYCLE_MS,
      loop: true,
      callback: () => {
        index = (index + 1) % LED_PALETTES.length
        this.leds.forEach((image) => image.setTexture(this.textureKey(image.getData('layer'), index)))
      },
    })
  }

  // Cambiar una opacidad solo cuando cambia de verdad (a centésimas): no se toca el objeto en cada fotograma.
  setIfChanged(object, alpha) {
    const rounded = Math.round(alpha * 100) / 100
    if (this.shown.get(object) === rounded) return
    this.shown.set(object, rounded)
    object.setAlpha(rounded)
  }

  // Un fotograma: lee el reloj del valle y deja la sala como está el cielo.
  update() {
    const { source } = this
    const ms = source.clock()
    const sky = valleSkyAt(ms, source.seed)
    source.publishWorld(ms, sky)

    tintLayers(sky).forEach(({ alpha }, i) => this.setIfChanged(this.tints[i], alpha))
    this.setIfChanged(this.warm, WARM_MAX * duskGlow(sky))
    const lit = lightsOn(sky)
    this.leds.forEach((image) => this.setIfChanged(image, lit))
    if (this.bulbs) this.setIfChanged(this.bulbs, lit)
    const strike = this.still ? null : valleLightningAt(ms, source.seed)
    this.setIfChanged(this.flash, roomFlash(strike))
    this.paintWindows(sky, ms, Boolean(strike))
  }

  paintWindows(sky, ms, striking) {
    if (!this.views.length) return
    const now = performance.now()
    const moving = !this.still && (sky.rain > 0 || sky.snow > 0 || striking)
    if (now - this.lastPaint < (moving ? REPAINT_MOVING_MS : REPAINT_CALM_MS)) return
    this.lastPaint = now
    this.views.forEach(({ window, texture, stars }) => {
      paintWindowView(texture.getContext(), { w: window.w, h: window.h, stars }, sky, ms, this.source.seed, { still: this.still, pastel: this.pastel })
      texture.refresh()
    })
  }

  destroy() {
    this.cycle?.remove()
  }
}
