// Los peces del río: unos cuantos nadando despacio y, de vez en cuando, uno que salta y deja un anillo en el agua. Se mueven por dentro
// del cauce (`river.js`) y van por debajo de los puentes. Es la parte de Phaser; dónde cae cada cosa está en `riverPlaces.js`.
import { randomWaterPoint } from './riverPlaces.js'
import { signedDistance } from './river.js'
import { fish as fishCanvas, splash as splashCanvas } from './riverSprites.js'
import { seeded } from './palette.js'

const FISH_COUNT = 14
const FISH_DEPTH = 0.9
const MIN_SPEED = 9
const MAX_SPEED = 20
// Cada cuánto salta un pez (ms) y lo que dura cada fotograma del anillo.
const JUMP_EVERY = [6500, 13000]
const SPLASH_STEP_MS = 150
const SPLASH_STEPS = 3

export default class RiverFish {
  constructor(scene) {
    this.scene = scene
    this.rand = seeded(2026)
    this.fish = []
    this.splashes = []
    this.nextJump = JUMP_EVERY[0]
    this.registerTextures()
    for (let i = 0; i < FISH_COUNT; i++) this.addFish(i)
  }

  registerTextures() {
    const { textures } = this.scene
    ;[0, 1, 2].forEach((tone) => [0, 1].forEach((frame) => !textures.exists(`fish-${tone}-${frame}`) && textures.addCanvas(`fish-${tone}-${frame}`, fishCanvas(tone, frame))))
    for (let step = 0; step < SPLASH_STEPS; step++) if (!textures.exists(`splash-${step}`)) textures.addCanvas(`splash-${step}`, splashCanvas(step))
  }

  addFish(index) {
    const start = randomWaterPoint(this.rand, 10)
    const tone = index % 3
    const sprite = this.scene.add.image(start.x, start.y, `fish-${tone}-0`).setDepth(FISH_DEPTH).setAlpha(0.9)
    const fish = { sprite, tone, x: start.x, y: start.y, target: start, speed: MIN_SPEED + this.rand() * (MAX_SPEED - MIN_SPEED), t: this.rand() * 1000 }
    this.pickTarget(fish)
    this.fish.push(fish)
  }

  // El siguiente destino de un pez: un punto de agua cercano, para que recorra el río en tramos cortos y sin saltos de un extremo a otro.
  pickTarget(fish) {
    for (let tries = 0; tries < 12; tries++) {
      const angle = this.rand() * Math.PI * 2
      const reach = 24 + this.rand() * 50
      const x = fish.x + Math.cos(angle) * reach
      const y = fish.y + Math.sin(angle) * reach
      if (signedDistance(x, y) > 10) {
        fish.target = { x, y }
        return
      }
    }
    fish.target = randomWaterPoint(this.rand, 10)
  }

  update(delta) {
    this.fish.forEach((fish) => {
      const dx = fish.target.x - fish.x
      const dy = fish.target.y - fish.y
      const distance = Math.hypot(dx, dy)
      if (distance < 3) {
        this.pickTarget(fish)
        return
      }
      const step = Math.min(distance, (fish.speed * delta) / 1000)
      fish.x += (dx / distance) * step
      fish.y += (dy / distance) * step
      fish.t += delta
      // La cola bate más rápido cuanto más deprisa va; el pez mira hacia donde nada.
      fish.sprite.setTexture(`fish-${fish.tone}-${Math.floor(fish.t / 260) % 2}`)
      fish.sprite.setFlipX(dx > 0)
      fish.sprite.setPosition(Math.round(fish.x), Math.round(fish.y))
    })
    this.nextJump -= delta
    if (this.nextJump <= 0) {
      this.nextJump = JUMP_EVERY[0] + this.rand() * (JUMP_EVERY[1] - JUMP_EVERY[0])
      this.jump(this.fish[Math.floor(this.rand() * this.fish.length)])
    }
  }

  // Un pez salta: aparece un anillo en su sitio que crece en tres fotogramas y se apaga.
  jump(fish) {
    const ring = this.scene.add.image(fish.x, fish.y, 'splash-0').setDepth(FISH_DEPTH + 0.05)
    this.splashes.push(ring)
    for (let step = 1; step <= SPLASH_STEPS; step++) {
      this.scene.time.delayedCall(step * SPLASH_STEP_MS, () => {
        if (step === SPLASH_STEPS) {
          ring.destroy()
          this.splashes = this.splashes.filter((item) => item !== ring)
        } else ring.setTexture(`splash-${step}`)
      })
    }
  }

  destroy() {
    this.fish.forEach(({ sprite }) => sprite.destroy())
    this.splashes.forEach((ring) => ring.destroy())
    this.fish = []
    this.splashes = []
  }
}
