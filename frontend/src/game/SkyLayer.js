// Capas del cielo sobre el mapa: oscurecimiento de la hora y el tiempo, luz de ventanas y farolas, lluvia,
// nieve y rayos, y el fundido entre estaciones. Es la parte de Phaser de valleSky.js: ValleScene le
// registra las imágenes que cambian y llama a `update` en cada fotograma.
import { clockOffset, lampGlow, paintWeather, tintLayers, valleSkyAt, valleStrikesBetween, windowGlow } from './valleSky.js'

const DEPTH = { tint: 9000, glow: 9100, weather: 9200 }
// El estado del cielo se publica a este ritmo: de sobra para el sonido ambiente, sin trabajo de más.
const PUBLISH_MS = 100
const FX_KEY = 'valle-weather'

export default class SkyLayer {
  // `clock` (ms de mundo) reanuda una partida guardada; sin él, el día empieza en su primera fase.
  constructor(scene, { seed, clock }) {
    this.scene = scene
    this.seed = seed
    this.origin = null
    this.offset = clock ?? clockOffset(seed)
    this.lastMs = this.offset
    this.lastPublish = -PUBLISH_MS
    this.seasons = { autumn: [], winter: [] }
    // El último estado del cielo calculado: lo leen los personajes y la vida ambiental sin recalcularlo (null hasta el primer fotograma).
    this.last = null
    this.lit = []
    this.lamps = []
    this.shown = new WeakMap()
    this.tints = tintLayers({ dark: 0, rain: 0, storm: 0, winter: 0 }).map(({ color }) =>
      scene.add.rectangle(0, 0, 10, 10, Number.parseInt(color.slice(1), 16)).setScrollFactor(0).setDepth(DEPTH.tint).setAlpha(0),
    )
    this.fx = null
    this.resize()
  }

  // Imagen que aparece con una estación: se funde con su opacidad mientras dura el cambio.
  addSeason(season, image) {
    image.setAlpha(0)
    this.seasons[season].push(image)
  }

  // Cristales encendidos de un edificio, con un `rank` (0 a 1) que escalona la hora a la que se encienden.
  addWindows(image, rank) {
    image.setAlpha(0).setDepth(DEPTH.glow)
    this.lit.push({ image, rank })
  }

  addLamp(image) {
    image.setAlpha(0).setDepth(DEPTH.glow)
    this.lamps.push(image)
  }

  // La pantalla puede cambiar de tamaño (girar el móvil): el tiempo se repinta a su resolución de juego.
  resize() {
    const { scene } = this
    const { width, height } = scene.scale
    // Con la página oculta el lienzo mide 0 y no hay tiempo que dibujar: se conserva lo que había.
    if (this.fx && (!width || !height)) return
    const zoom = scene.cameras.main.zoom
    this.tints.forEach((rect) => rect.setPosition(width / 2, height / 2).setSize(width * 2, height * 2))
    this.size = { width: Math.ceil(width / zoom), height: Math.ceil(height / zoom) }
    this.fx?.destroy()
    if (scene.textures.exists(FX_KEY)) scene.textures.remove(FX_KEY)
    const texture = scene.textures.createCanvas(FX_KEY, this.size.width, this.size.height)
    this.texture = texture
    this.fx = scene.add.image(width / 2, height / 2, FX_KEY).setScrollFactor(0).setDepth(DEPTH.weather)
  }

  setIfChanged(image, alpha) {
    const rounded = Math.round(alpha * 100) / 100
    if (this.shown.get(image) === rounded) return
    this.shown.set(image, rounded)
    image.setAlpha(rounded)
  }

  // Hora del mundo ahora mismo, en ms. El reloj de Phaser y `performance.now` comparten base, y así sigue
  // corriendo aunque `update` no se llame (la viajera dentro de un edificio).
  clock() {
    return this.origin === null ? this.offset : performance.now() - this.origin + this.offset
  }

  update(time) {
    if (this.origin === null) this.origin = time
    const ms = time - this.origin + this.offset
    const sky = valleSkyAt(ms, this.seed)
    this.last = sky

    tintLayers(sky).forEach(({ alpha }, i) => this.setIfChanged(this.tints[i], alpha))
    this.seasons.autumn.forEach((image) => this.setIfChanged(image, sky.autumn))
    this.seasons.winter.forEach((image) => this.setIfChanged(image, sky.winter))
    this.lit.forEach(({ image, rank }) => this.setIfChanged(image, windowGlow(sky.gloom, rank)))
    this.lamps.forEach((image) => this.setIfChanged(image, lampGlow(sky.gloom)))

    paintWeather(this.texture.getContext(), sky, ms, this.seed, this.size)
    this.texture.refresh()
    this.publishWorld(ms, sky)
    return sky
  }

  // Lo que el resto del juego oye del cielo: los truenos de los rayos que han caído y el estado del tiempo (que el sonido
  // ambiente sigue). Lo comparten el valle y el interior de las casas, así hay un solo reloj y cada rayo suena una vez.
  publishWorld(ms, sky) {
    const { game } = this.scene
    // Con la pestaña oculta el reloj da un salto: no se recuperan los rayos que hubo mientras tanto.
    const live = ms - this.lastMs <= 500
    if (live) valleStrikesBetween(this.lastMs, ms, this.seed).forEach((strike) => game.events.emit('thunder', strike.delay))
    this.lastMs = ms
    if (ms - this.lastPublish >= PUBLISH_MS) {
      this.lastPublish = ms
      game.events.emit('sky', sky)
    }
  }
}
