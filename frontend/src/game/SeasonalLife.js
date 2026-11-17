// Flora y fauna de cada estación en pantalla: flores en los bordes de los caminos (primavera), hojas caídas (otoño), patos en el río, libélulas junto a la
// piscina, luciérnagas en la ribera, una ardilla cerca de los institutos y un petirrojo en la plaza. No decide nada: dibuja lo que dicen `seasonDecor.js` y
// `seasonalFauna.js`. Nada de esto tiene cuerpo físico ni bloquea el paso. Con «reducir movimiento» se quedan las flores y las hojas, quietas, y no hay
// animales. Al acabar la escena se destruye todo con ella.
import { dragonflyCanvas, duckCanvas, fireflyCanvas, flowerCanvas, leafCanvas, robinCanvas, squirrelCanvas } from './seasonalSprites.js'
import { DECOR, decorSpots, edgeTiles } from './seasonDecor.js'
import {
  DRAGONFLIES,
  DUCKS,
  FAUNA_LEVELS,
  createDragonfly,
  createDuck,
  createFireflies,
  createRobin,
  createSquirrel,
  duckHomes,
  fireflyAt,
  fireflyHomes,
  robinPerches,
  stepDragonfly,
  stepDuck,
  stepRobin,
  stepSquirrel,
  weightOf,
} from './seasonalFauna.js'
import { COLS, PROPS, ROWS, TILE } from './world.js'
import { prefersReducedMotion } from '../lib/reducedMotion.js'
import { seeded } from './palette.js'

// Profundidades: las flores y hojas van pegadas al suelo (sobre sus capas de estación y bajo todo lo demás); los patos, sobre el agua y bajo los puentes;
// lo que vuela, por encima de quien pasa; las luciérnagas brillan sobre la penumbra de la noche.
const DEPTH = { decor: 0.25, duck: 1, fly: 5800, firefly: 9150 }
// Qué estación pesa en cada capa de decorado: con ese peso del cielo se funde.
const DECOR_SEASON = { flowers: 'spring', leaves: 'autumn' }

const addTextures = (textures, entries) => entries.forEach(([key, make]) => !textures.exists(key) && textures.addCanvas(key, make()))

export default class SeasonalLife {
  // `pool`: el vaso de la piscina `{ x, y }` (centro del agua, en píxeles) o null.
  constructor(scene, { pool }) {
    this.scene = scene
    this.enabled = !prefersReducedMotion()
    this.rand = seeded(2027)
    this.clock = 0
    this.tiles = null
    this.decor = {}
    this.registerTextures()
    this.buildFauna(pool)
    scene.events.once('shutdown', () => this.destroy())
  }

  registerTextures() {
    const { textures } = this.scene
    addTextures(textures, [
      ['duck-0', () => duckCanvas(0)],
      ['duck-1', () => duckCanvas(1)],
      ['dragonfly-up', () => dragonflyCanvas(true)],
      ['dragonfly-down', () => dragonflyCanvas(false)],
      ['firefly', fireflyCanvas],
      ['robin-perch', () => robinCanvas('perch')],
      ['robin-fly0', () => robinCanvas('fly0')],
      ['robin-fly1', () => robinCanvas('fly1')],
      ['squirrel-run0', () => squirrelCanvas('run0')],
      ['squirrel-run1', () => squirrelCanvas('run1')],
      ['squirrel-sit', () => squirrelCanvas('sit')],
    ])
  }

  buildFauna(pool) {
    const { add } = this.scene
    const image = (texture, depth) => add.image(0, 0, texture).setOrigin(0.5, 1).setDepth(depth).setVisible(false)
    this.ducks = duckHomes().slice(0, DUCKS.count).map((home, i) => ({ duck: createDuck(home, this.rand, i), sprite: image('duck-0', DEPTH.duck) }))
    this.dragonflies = pool ? Array.from({ length: DRAGONFLIES.count }, (_, i) => ({ fly: createDragonfly(pool, this.rand, i), sprite: image('dragonfly-up', DEPTH.fly) })) : []
    this.fireflies = createFireflies(fireflyHomes()).map((fly) => ({ fly, sprite: image('firefly', DEPTH.firefly).setOrigin(0.5, 0.5).setBlendMode(1) }))
    this.squirrel = { state: createSquirrel(this.rand), sprite: image('squirrel-sit', 0) }
    const perches = robinPerches(PROPS)
    this.perches = perches
    this.robin = perches.length ? { state: createRobin(perches, this.rand), sprite: image('robin-perch', DEPTH.fly) } : null
  }

  // Flores y hojas: se pintan en un lienzo del tamaño del mapa la primera vez que su estación pesa algo, y se quitan del todo cuando ya no pesa nada.
  // Así no se acumulan ni se duplican: hay como mucho uno de cada, con la clave de su capa.
  syncDecor(sky) {
    this.tiles ??= edgeTiles()
    Object.keys(DECOR_SEASON).forEach((layer) => {
      const weight = sky ? weightOf(sky, DECOR_SEASON[layer]) : 0
      const entry = this.decor[layer]
      if (weight <= 0.01) {
        if (entry) this.removeDecor(layer)
        return
      }
      const built = entry ?? this.buildDecor(layer)
      const alpha = Math.round(weight * 100) / 100
      if (built.alpha !== alpha) {
        built.alpha = alpha
        built.image.setAlpha(alpha)
      }
    })
  }

  buildDecor(layer) {
    const { scene } = this
    const key = `decor:${layer}`
    const canvas = document.createElement('canvas')
    canvas.width = COLS * TILE
    canvas.height = ROWS * TILE
    const g = canvas.getContext('2d')
    const kinds = DECOR[layer].kinds
    const sprites = Array.from({ length: kinds }, (_, kind) => (layer === 'flowers' ? flowerCanvas(kind) : leafCanvas(kind)))
    const base = layer === 'flowers' ? { dx: 2, dy: 5 } : { dx: 2, dy: 2 }
    decorSpots(layer, this.tiles).forEach(({ x, y, kind }) => g.drawImage(sprites[kind], x - base.dx, y - base.dy))
    if (scene.textures.exists(key)) scene.textures.remove(key)
    scene.textures.addCanvas(key, canvas)
    const image = scene.add.image(0, 0, key).setOrigin(0, 0).setDepth(DEPTH.decor).setAlpha(0)
    this.decor[layer] = { key, image, alpha: 0 }
    return this.decor[layer]
  }

  removeDecor(layer) {
    const { key, image } = this.decor[layer]
    image.destroy()
    if (this.scene.textures.exists(key)) this.scene.textures.remove(key)
    delete this.decor[layer]
  }

  show(sprite, x, y, alpha, face) {
    if (alpha <= 0.01) return sprite.setVisible(false)
    return sprite.setVisible(true).setPosition(Math.round(x), Math.round(y)).setAlpha(alpha).setFlipX(face === 'left')
  }

  drawDucks(delta, level) {
    this.ducks.forEach(({ duck, sprite }) => {
      stepDuck(duck, delta, level, this.rand)
      const frame = Math.floor(duck.t / (duck.rest > 0 ? 900 : 480)) % 2
      sprite.setTexture(`duck-${frame}`)
      this.show(sprite, duck.x, duck.y + 4, duck.presence.alpha, duck.face)
    })
  }

  drawDragonflies(delta, level) {
    this.dragonflies.forEach(({ fly, sprite }) => {
      stepDragonfly(fly, delta, level, this.rand)
      sprite.setTexture(Math.floor(fly.flap / 55) % 2 ? 'dragonfly-up' : 'dragonfly-down').setDepth(fly.y + 45)
      this.show(sprite, fly.x, fly.y - fly.z, fly.presence.alpha, fly.face)
    })
  }

  drawFireflies(level) {
    this.fireflies.forEach(({ fly, sprite }) => {
      const at = fireflyAt(fly, this.clock)
      this.show(sprite, at.x, at.y - at.z, at.glow * level * 0.95, 'right')
    })
  }

  drawSquirrel(delta, level, traveller) {
    const { state, sprite } = this.squirrel
    stepSquirrel(state, delta, level, traveller, this.rand)
    const frame = state.state === 'sit' ? 'sit' : `run${Math.floor(state.t / 110) % 2}`
    sprite.setTexture(`squirrel-${frame}`).setDepth(state.y + 1)
    this.show(sprite, state.x, state.y, state.state === 'away' ? 0 : state.alpha, state.face)
  }

  drawRobin(delta, level, traveller) {
    if (!this.robin) return
    const { state, sprite } = this.robin
    stepRobin(state, delta, level, this.perches, traveller, this.rand)
    const flying = state.state === 'fly'
    sprite.setTexture(flying ? `robin-fly${Math.floor(state.t / 70) % 2}` : 'robin-perch').setDepth(flying ? DEPTH.fly : state.perch.depth)
    this.show(sprite, state.x, state.y - state.z - state.hop, state.presence.alpha, state.face)
  }

  // `sky` es el estado del cielo del fotograma anterior (o null) y `traveller` los pies de la viajera.
  update(delta, sky, traveller) {
    this.clock += delta
    this.syncDecor(sky)
    if (!this.enabled) return
    const levels = Object.fromEntries(Object.entries(FAUNA_LEVELS).map(([name, level]) => [name, level(sky)]))
    this.drawDucks(delta, levels.ducks)
    this.drawDragonflies(delta, levels.dragonflies)
    this.drawFireflies(levels.fireflies)
    this.drawSquirrel(delta, levels.squirrel, traveller)
    this.drawRobin(delta, levels.robin, traveller)
  }

  destroy() {
    Object.keys(this.decor).forEach((layer) => this.removeDecor(layer))
    ;[...this.ducks, ...this.dragonflies, ...this.fireflies].forEach(({ sprite }) => sprite.destroy())
    this.squirrel.sprite.destroy()
    this.robin?.sprite.destroy()
  }
}
