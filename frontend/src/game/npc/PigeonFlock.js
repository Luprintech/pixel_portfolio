// Dibuja las palomas de la plaza y las migas que se les echan (la conducta está en `pigeons.js`, sin Phaser). Cada paloma es una imagen con su
// sombra, a la profundidad de sus pies; al volar sube del suelo y bate las alas. No decide nada: solo pinta lo que dice `flock`.
import { PAL } from '../palette.js'
import { shadowSprite } from '../sprites.js'
import { FLOCK, createFlock, stepFlock } from './pigeons.js'
import { PIGEON_FRAMES, pigeonCanvas } from './pigeonSprites.js'

const KEYS = { stand: 'pigeon-stand', peck: 'pigeon-peck', flyUp: 'pigeon-fly-up', flyDown: 'pigeon-fly-down' }
const SHADOW = 'pigeon-shadow'

export default class PigeonFlock {
  // `homes` son los rincones donde descansan y `free(x, y)` dice si se puede pisar.
  constructor(scene, homes, count, free) {
    this.scene = scene
    this.free = free
    Object.entries(KEYS).forEach(([name, key]) => {
      if (!scene.textures.exists(key)) scene.textures.addCanvas(key, pigeonCanvas(PIGEON_FRAMES[name]))
    })
    if (!scene.textures.exists(SHADOW)) scene.textures.addCanvas(SHADOW, shadowSprite(9, 3))
    this.flock = createFlock(homes, count)
    this.birds = this.flock.pigeons.map((pigeon) => ({
      pigeon,
      shadow: scene.add.image(pigeon.x, pigeon.y - 1, SHADOW).setDepth(2),
      sprite: scene.add.image(pigeon.x, pigeon.y, KEYS.stand).setOrigin(0.5, 1),
    }))
    this.crumbDots = new Map()
    this.clock = 0
  }

  destroy() {
    this.birds.forEach(({ sprite, shadow }) => {
      sprite.destroy()
      shadow.destroy()
    })
    this.crumbDots.forEach((dot) => dot.destroy())
  }

  // `source` es quien da de comida ({ hand, feet }) o null y `scarers` quienes las espantan ({ x, y }).
  update(delta, { source = null, scarers = [] } = {}) {
    this.clock += delta
    stepFlock(this.flock, delta, { source, scarers, free: this.free })
    this.birds.forEach((bird, i) => this.drawBird(bird, i))
    this.drawCrumbs()
  }

  drawBird({ pigeon, sprite, shadow }, i) {
    const flying = pigeon.state === 'fly'
    const beat = Math.floor(this.clock / (flying ? 90 : 240) + i) % 2
    let key = KEYS.stand
    if (flying) key = beat ? KEYS.flyUp : KEYS.flyDown
    else if (pigeon.state === 'peck') key = beat ? KEYS.peck : KEYS.stand
    // Al andar da saltitos de un píxel.
    const hop = pigeon.state === 'walk' && Math.floor(this.clock / 150 + i) % 2 ? 1 : 0
    sprite.setTexture(key).setFlipX(pigeon.face === 'left').setPosition(pigeon.x, pigeon.y - pigeon.h - hop).setDepth(Math.round(pigeon.y))
    shadow.setPosition(pigeon.x, pigeon.y - 1).setAlpha(flying ? 0.5 : 1)
  }

  // Cada miga es un punto: mientras vuela describe un arco desde la mano hasta el suelo.
  drawCrumbs() {
    const live = new Set(this.flock.crumbs)
    this.crumbDots.forEach((dot, crumb) => {
      if (live.has(crumb)) return
      dot.destroy()
      this.crumbDots.delete(crumb)
    })
    this.flock.crumbs.forEach((crumb) => {
      let dot = this.crumbDots.get(crumb)
      if (!dot) {
        dot = this.scene.add.rectangle(crumb.x, crumb.y, 2, 2, Number.parseInt(PAL.bone.slice(1), 16))
        this.crumbDots.set(crumb, dot)
      }
      const k = crumb.landed ? 1 : Math.min(1, crumb.t / FLOCK.crumbFlightMs)
      const x = crumb.from.x + (crumb.x - crumb.from.x) * k
      const y = crumb.from.y + (crumb.y - crumb.from.y) * k - (crumb.landed ? 0 : Math.sin(k * Math.PI) * 8)
      dot.setPosition(x, y).setDepth(crumb.landed ? crumb.y - 0.5 : crumb.y + 20)
    })
  }
}
