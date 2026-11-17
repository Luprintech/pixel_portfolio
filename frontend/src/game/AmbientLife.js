// La vida ambiental del valle en pantalla: pájaros, mariposas y lo que cae de los frutales (la conducta está en `ambient.js`, sin Phaser). No
// decide nada: dibuja lo que dicen los pasos. Al acabar la escena se destruye todo con ella; con "reducir movimiento" no hay pájaros ni mariposas ni
// nada que caiga.
import { butterflyCanvas, birdCanvas } from './ambientSprites.js'
import { FALLING, butterfliesAt, createAmbient, fallPosition, newFall, perchesOf, stepAmbient } from './ambient.js'
import { fruitSeasonOf } from './fruitTrees.js'
import { shadowSprite } from './sprites.js'
import { BUILDINGS, TILE, treePositions } from './world.js'
import { prefersReducedMotion } from '../lib/reducedMotion.js'
import { shiftPx, shiftPxX } from './mapRows.js'

const FLY_DEPTH = 6000
// Cuántos trozos caen a la vez como máximo y a qué distancia de la viajera se molesta en soltarlos (más lejos no se ven).
const MAX_FALLING = 24
const FALL_RANGE = 280
// Dónde revolotean las mariposas: los jardines (la fuente, el manzano entre Copos y RACE, la orilla del puente y la piscina) y el césped junto a la
// entrada de la casa de Lupe, entre su fachada y el eje de la plaza.
const GARDENS = [{ x: shiftPxX(592), y: shiftPx(478), r: 40 }, { x: 296, y: 618, r: 34 }, { x: shiftPxX(760), y: shiftPx(520), r: 26 }, { x: 176, y: 808, r: 36 }, { x: 676, y: 832, r: 30 }]
const BIRD_FRAMES = ['perch', 'up', 'down']
const SPECIES = 3
// Edificios con tejado donde se posan.
const ROOFED = ['home', 'bar', 'shop', 'garage', 'patio']

const between = (range) => range[0] + Math.random() * (range[1] - range[0])

export default class AmbientLife {
  // `fruit` son los frutales `{ x, y, height, fallsIn }` (apoyo en el suelo, alto de la copa y estaciones en que sueltan algo) y `extraPerches` los
  // puntos altos que da la escena, ya con su profundidad.
  constructor(scene, fruit, extraPerches = []) {
    this.scene = scene
    this.fruit = fruit
    this.enabled = !prefersReducedMotion()
    this.ambient = createAmbient()
    const roofs = BUILDINGS.filter((b) => ROOFED.includes(b.kind)).map((b) => ({ x: b.x * TILE + (b.w * TILE) / 2 + 20, y: b.y * TILE + 10, depth: (b.y + b.h) * TILE + 0.5 }))
    this.perches = perchesOf(treePositions(), [...extraPerches, ...roofs], TILE)
    this.clock = 0
    this.birds = []
    this.flies = []
    this.falls = []
    this.nextFall = fruit.map(() => between([1000, 4000]))
    this.registerTextures()
  }

  registerTextures() {
    const { textures } = this.scene
    for (let species = 0; species < SPECIES; species++) {
      BIRD_FRAMES.forEach((frame) => !textures.exists(`bird-${species}-${frame}`) && textures.addCanvas(`bird-${species}-${frame}`, birdCanvas(species, frame)))
      ;[true, false].forEach((open) => !textures.exists(`butterfly-${species}-${open}`) && textures.addCanvas(`butterfly-${species}-${open}`, butterflyCanvas(species, open)))
    }
    if (!textures.exists('bird-shadow')) textures.addCanvas('bird-shadow', shadowSprite(8, 3))
  }

  destroy() {
    this.birds.forEach(({ sprite, shadow }) => {
      sprite.destroy()
      shadow.destroy()
    })
    this.flies.forEach((fly) => fly.destroy())
    this.falls.forEach(({ dot }) => dot.destroy())
  }

  // Dónde están las mariposas ahora, en el suelo (para que Khalessi pueda seguir una).
  butterflyPoints() {
    return this.flies.filter((fly) => fly.visible).map((fly) => ({ x: fly.x, y: fly.baseY }))
  }

  // Un sprite por cada pájaro del estado: se crea al salir y se destruye al irse.
  drawBirds() {
    const live = new Set(this.ambient.birds)
    this.birds = this.birds.filter((entry) => {
      if (live.has(entry.bird)) return true
      entry.sprite.destroy()
      entry.shadow.destroy()
      return false
    })
    this.ambient.birds.forEach((bird) => {
      let entry = this.birds.find((item) => item.bird === bird)
      if (!entry) {
        entry = {
          bird,
          sprite: this.scene.add.image(bird.x, bird.y, `bird-${bird.species}-up`).setOrigin(0.5, 1),
          shadow: this.scene.add.image(bird.x, bird.y, 'bird-shadow').setAlpha(0.4).setDepth(2),
        }
        this.birds.push(entry)
      }
      const perched = bird.state === 'perch'
      const frame = perched ? 'perch' : Math.floor(bird.flap / 110) % 2 ? 'up' : 'down'
      const depth = perched ? (bird.perch.depth ?? bird.y) : FLY_DEPTH
      entry.sprite.setTexture(`bird-${bird.species}-${frame}`).setFlipX(bird.face === 'left').setPosition(bird.x, bird.y - bird.z).setDepth(depth)
      // La sombra solo se ve en el suelo cuando vuela: posado, el pájaro está en una copa.
      entry.shadow.setVisible(!perched).setPosition(bird.x, bird.y + 6).setAlpha(Math.max(0.12, 0.4 - bird.z * 0.006))
    })
  }

  drawButterflies(sky) {
    const points = butterfliesAt(GARDENS, this.clock, sky)
    while (this.flies.length < points.length) this.flies.push(this.scene.add.image(0, 0, 'butterfly-0-true').setOrigin(0.5, 1))
    this.flies.forEach((fly, i) => {
      const point = points[i]
      fly.setVisible(Boolean(point))
      if (!point) return
      fly.baseY = point.y
      fly.setTexture(`butterfly-${point.kind}-${point.open}`).setPosition(point.x, point.y - point.z).setDepth(point.y + 40)
    })
  }

  // Pétalos en primavera y hojas y alguna manzana en otoño, cayendo de cada frutal cuando la viajera está cerca. Nada en invierno.
  drawFalls(delta, sky, traveller) {
    const season = fruitSeasonOf(sky)
    const bits = FALLING[season]
    this.falls = this.falls.filter((fall) => {
      fall.t += delta
      const k = Math.min(1, fall.t / fall.ms)
      const { x, y } = fallPosition(fall, k)
      fall.dot.setPosition(x, y)
      // Aterriza y se desvanece pasado un momento: la fruta se queda un poco más.
      const rest = fall.t - fall.ms
      const stay = fall.fruit ? 4500 : 900
      if (rest > stay) {
        fall.dot.destroy()
        return false
      }
      if (rest > 0) fall.dot.setAlpha(Math.max(0, 1 - rest / stay))
      return true
    })
    if (!bits || !this.enabled) return
    const wind = sky?.wind ?? 0
    this.fruit.forEach((tree, i) => {
      this.nextFall[i] -= delta
      if (this.nextFall[i] > 0) return
      this.nextFall[i] = between(bits.every)
      // Solo los de la zona que se ve, y con tope: no hay que soltar nada que nadie va a mirar.
      if (!tree.fallsIn.includes(season) || Math.hypot(tree.x - traveller.x, tree.y - traveller.y) > FALL_RANGE || this.falls.length >= MAX_FALLING) return
      const fall = newFall(tree, season, wind, Math.random)
      if (!fall) return
      fall.dot = this.scene.add.rectangle(fall.from.x, fall.from.y, fall.size, fall.size, Number.parseInt(fall.color.slice(1), 16)).setDepth(tree.y + 1)
      this.falls.push(fall)
    })
  }

  // `sky` es el estado del cielo del fotograma anterior (o null), `traveller` los pies de la viajera y `scarers` otros personajes que asustan a los pájaros.
  update(delta, sky, traveller, scarers = []) {
    this.clock += delta
    if (this.enabled) {
      stepAmbient(this.ambient, delta, { sky, traveller, perches: this.perches, scarers, enabled: true })
      this.drawBirds()
      this.drawButterflies(sky)
    }
    this.drawFalls(delta, sky, traveller)
  }
}
