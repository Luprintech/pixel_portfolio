// Compañero que sigue a la viajera por el rastro de sus pasos: Lupe, que acompaña al visitante por el valle y por la
// casa. Anda con la misma hoja y el mismo ciclo de marcha que cualquier personaje del generador del avatar. No es
// sólido: se mueve por donde ya pasó la viajera, así que no se atasca con nada.
import { WALK_CYCLE, frameName } from './avatar/index.js'
import { advanceWalk, facingFor } from './walk.js'

const SPEED = 92
// Pasos de retraso: cuanto mayor, más atrás va. Se queda a una distancia (`REST`) que deja ver a la viajera.
const TRAIL = 14
const REST = 18

export default class Follower {
  constructor(scene, key, x, y) {
    this.key = key
    this.facing = 'down'
    this.walk = { timer: 0, step: 0 }
    this.trail = []
    this.shadow = scene.add.image(x, y - 1, 'shadow').setDepth(2)
    this.sprite = scene.add.sprite(x, y, key, frameName('down', 0)).setOrigin(0.5, 1)
    this.sprite.setDepth(y)
  }

  // Pone a la compañera en un sitio (al entrar o salir de un edificio, o al subir a la cubierta) y borra su rastro.
  place(x, y) {
    this.trail = []
    this.sprite.setPosition(x, y)
    this.shadow.setPosition(x, y - 1)
    this.sprite.setDepth(y)
    this.walk.step = 0
    this.sprite.setFrame(frameName(this.facing, 0))
  }

  // `moving` es si la viajera anda; (px, py) donde tiene los pies. Un paso por fotograma.
  follow(moving, px, py, delta) {
    const { sprite } = this
    if (moving) {
      const last = this.trail[this.trail.length - 1]
      if (!last || Math.hypot(last.x - px, last.y - py) > 1.5) this.trail.push({ x: px, y: py })
      if (this.trail.length > TRAIL + 2) this.trail.shift()
    }
    const target = this.trail.length > TRAIL ? this.trail[0] : null
    const dx = target ? target.x - sprite.x : 0
    const dy = target ? target.y - sprite.y : 0
    const walking = Boolean(target) && Math.hypot(sprite.x - px, sprite.y - py) > REST
    if (walking) {
      const step = Math.min(Math.hypot(dx, dy), (SPEED * delta) / 1000)
      const angle = Math.atan2(dy, dx)
      sprite.x += Math.cos(angle) * step
      sprite.y += Math.sin(angle) * step
      this.facing = facingFor(dx, dy)
    }
    const step = advanceWalk(this.walk, walking, delta)
    sprite.setFrame(frameName(this.facing, WALK_CYCLE[step]))
    sprite.setDepth(Math.round(sprite.y))
    this.shadow.setPosition(sprite.x, sprite.y - 1)
  }

  destroy() {
    this.sprite.destroy()
    this.shadow.destroy()
  }
}
