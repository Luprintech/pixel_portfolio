// Capas del cielo sobre el mapa: oscurecimiento de la hora y el tiempo, luz de ventanas y farolas, lluvia,
// nieve y rayos, y el fundido entre estaciones. Es la parte de Phaser de valleSky.js: ValleScene le
// registra las imágenes que cambian y llama a `update` en cada fotograma.
import SeasonClock from './seasonClock.js'
import { clockOffset, lampGlow, paintWeather, tintLayers, valleSkyAt, valleStrikesBetween, windowGlow } from './valleSky.js'

const DEPTH = { tint: 9000, glow: 9100, weather: 9200 }
// El estado del cielo se publica a este ritmo: de sobra para el sonido ambiente, sin trabajo de más.
const PUBLISH_MS = 100
const FX_KEY = 'valle-weather'

export default class SkyLayer {
  // `clock` (ms de mundo) reanuda una partida guardada; sin él, el día empieza en su primera fase. `season` es el progreso de estación guardado
  // (`SeasonClock.snapshot`); sin él, empieza la primavera.
  constructor(scene, { seed, clock, season }) {
    this.scene = scene
    this.seed = seed
    this.origin = null
    this.offset = clock ?? clockOffset(seed)
    this.lastMs = this.offset
    this.lastPublish = -PUBLISH_MS
    // Imágenes de cada capa de estación (ver `valleClimate.blendOf`): verano, otoño, escarcha de invierno y nieve acumulada.
    this.seasons = { summer: [], autumn: [], frost: [], snow: [] }
    this.trees = new Set()
    this.treeBases = []
    // El reloj de estaciones cuenta tiempo activo, dentro y fuera de las casas, y avisa a la página de cada cambio (ver `publishSeason`).
    this.seasonClock = new SeasonClock({ seed, saved: season })
    this.seasonChanges = 0
    this.seasonClock.onChange(() => this.publishSeason(++this.seasonChanges))
    this.publishSeason(0)
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

  // Imagen que aparece con una estación: se funde con su opacidad mientras dura el cambio. `tree` marca las de un árbol: la escarcha le quita hojas (deja
  // huecos), así que lo que hay debajo (la base y las demás estaciones) se apaga a la vez que ella entra, para que por los huecos se vea el suelo y no
  // el árbol de antes.
  addSeason(season, image, tree = false) {
    image.setAlpha(0)
    this.seasons[season].push(image)
    if (tree) this.trees.add(image)
  }

  // La imagen base de un árbol (la primavera), que se apaga con la escarcha.
  addTreeBase(image) {
    this.treeBases.push(image)
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

  // La estación vigente en el registro del juego: la página lee de ahí el icono y el nombre del indicador. `changes` cuenta los cambios desde que
  // se abrió el valle, para que la página enseñe el nombre al cambiar y no al entrar.
  publishSeason(changes) {
    this.scene.game.registry.set('season', { name: this.seasonClock.value.name, changes })
  }

  // Estado del cielo a la hora `ms` con el clima de ahora: lo piden el valle y el interior de las casas, que comparten reloj y estación.
  skyAt(ms) {
    return valleSkyAt(ms, this.seed, this.seasonClock.tick())
  }

  // Hora del mundo ahora mismo, en ms. El reloj de Phaser y `performance.now` comparten base, y así sigue
  // corriendo aunque `update` no se llame (la viajera dentro de un edificio).
  clock() {
    return this.origin === null ? this.offset : performance.now() - this.origin + this.offset
  }

  update(time) {
    if (this.origin === null) this.origin = time
    const ms = time - this.origin + this.offset
    const sky = this.skyAt(ms)
    this.last = sky

    tintLayers(sky).forEach(({ alpha }, i) => this.setIfChanged(this.tints[i], alpha))
    // Bajo la escarcha, un árbol pierde lo que hay debajo: el alpha de esas capas se multiplica por lo que falta para que la escarcha cubra del todo.
    const bare = 1 - sky.layers.frost
    Object.entries(this.seasons).forEach(([layer, images]) =>
      images.forEach((image) => this.setIfChanged(image, layer === 'frost' || layer === 'snow' || !this.trees.has(image) ? sky.layers[layer] : sky.layers[layer] * bare)),
    )
    this.treeBases.forEach((image) => this.setIfChanged(image, bare))
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
