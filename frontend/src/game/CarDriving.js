// El SEAT Córdoba que la viajera puede conducir: subirse con E junto al coche, llevarlo por el valle y bajarse donde quepa.
// Al volante, la viajera, su sombra y su mascota se ocultan (van dentro); el sprite de la viajera, ya sin cuerpo físico, sigue
// al coche para que la cámara y el guardado lo acompañen. Los sonidos los pone la página (`car-sound`, ver `Valle.jsx`).
import { COLS, ROWS, TILE } from './world.js'
import { SIT_POSE, avatarCanvas, frameName } from './avatar/index.js'
import { SEAT_CORDOBA_BODY, seatCordobaWithDriver } from './seatCordoba.js'
import { createCar, freeExitSpot, stepCar } from './driving.js'

const BOUNDS = { w: COLS * TILE, h: ROWS * TILE }
const DRIVING_KEY = 'car-driving'
// Zona donde E ofrece subir: el coche con algo de margen y la franja de paseo por delante.
const DOOR = { dx: -40, dy: -14, w: 80, h: 26 }
// Al volante el coche atraviesa todo, así que va por encima de los edificios (que lo taparían) y por debajo de lo que vuela
// (5800) y del tinte del cielo (9000). Aparcado vuelve a ordenarse por las ruedas.
const DRIVING_DEPTH = 5000
// Cambio mínimo de aceleración para avisar al sonido del motor: no hace falta un aviso por fotograma.
const THROTTLE_STEP = 0.04

export default class CarDriving {
  // `image` es el coche aparcado (con sus capas de estación), `key` su textura, `solid` su cuerpo sólido y `doorRect` un
  // rectángulo de Phaser para la zona de subir; la escena lo añade a sus puertas con el id `seatCordoba`.
  constructor(scene, { image, key, solid, doorRect }) {
    this.scene = scene
    this.image = image
    this.key = key
    this.solid = solid
    this.door = { id: 'seatCordoba', rect: doorRect }
    this.car = null
    this.solidRects = null
    this.throttle = 0
  }

  get driving() {
    return Boolean(this.car)
  }

  enter() {
    const scene = this.scene
    this.car = createCar(this.image.x, this.image.y, this.image.flipX ? 'right' : 'left')
    // Lo sólido no se mueve mientras se conduce: se toma una vez para buscar dónde bajarse.
    this.solidRects = scene.solids.filter((solid) => solid !== this.solid).map((solid) => solid.getBounds())
    this.solid.body.enable = false
    scene.doors = scene.doors.filter((door) => door !== this.door)
    this.paintDriver()
    const traveller = scene.princess
    traveller.body.setVelocity(0, 0)
    traveller.body.enable = false
    traveller.setVisible(false)
    scene.shadow.setVisible(false)
    this.showPet(false)
    this.throttle = 0
    scene.game.events.emit('car-sound', 'start')
  }

  // Avanza el coche según la dirección pedida. Devuelve si se mueve.
  update(vx, vy, delta) {
    const car = this.car
    const throttle = stepCar(car, { x: vx, y: vy }, delta, BOUNDS)
    this.scene.princess.setPosition(car.x, car.y)
    this.place(car.x, car.y, car.facing === 'right', DRIVING_DEPTH)
    if (Math.abs(throttle - this.throttle) > THROTTLE_STEP || (throttle === 0 && this.throttle !== 0)) {
      this.throttle = throttle
      this.scene.game.events.emit('car-sound', 'speed', throttle)
    }
    return throttle > 0.05
  }

  // Al volante solo se ofrece bajarse, y solo si hay sitio para los pies de la viajera.
  near() {
    return freeExitSpot(this.car, this.solidRects, BOUNDS) ? 'getout' : null
  }

  exit() {
    const car = this.car
    const spot = freeExitSpot(car, this.solidRects, BOUNDS)
    if (!spot) return
    const scene = this.scene
    this.image.setTexture(this.key)
    this.place(car.x, car.y, car.facing === 'right')
    const [{ l, t, r, b }] = SEAT_CORDOBA_BODY
    this.solid.setPosition(car.x + (l + r) / 2, car.y + (t + b) / 2)
    this.solid.body.enable = true
    this.solid.body.updateFromGameObject()
    this.door.rect.setPosition(car.x + DOOR.dx, car.y + DOOR.dy)
    scene.doors.push(this.door)
    this.car = null
    this.solidRects = null
    const traveller = scene.princess
    traveller.setVisible(true)
    traveller.body.enable = true
    traveller.body.reset(spot.x, spot.y)
    traveller.setDepth(Math.round(spot.y))
    scene.shadow.setVisible(true)
    scene.facing = 'down'
    traveller.setFrame(frameName('down', 0))
    if (scene.companion) {
      scene.companion.setPosition(spot.x - 12, spot.y + 4)
      scene.trail = []
    }
    this.showPet(true)
    scene.game.events.emit('car-sound', 'stop')
  }

  // La viajera de perfil, sentada, vista por la ventanilla. Se repinta si cambia su aspecto con el coche en marcha.
  paintDriver() {
    this.scene.addCanvas(DRIVING_KEY, seatCordobaWithDriver(avatarCanvas(this.scene.look, 'left', SIT_POSE)))
    this.image.setTexture(DRIVING_KEY)
  }

  // La mascota va dentro del coche: se oculta con su sombra.
  showPet(visible) {
    this.scene.companion?.setVisible(visible)
    this.scene.petShadow?.setVisible(visible)
  }

  // El coche y sus capas de estación van juntos; aparcado se ordena por las ruedas, como lo demás del valle.
  place(x, y, flip, depth = Math.round(y)) {
    ;[this.image, ...this.image.seasonImages].forEach((layer) => layer.setPosition(x, y).setFlipX(flip).setDepth(depth))
  }

  static doorArea(px, py) {
    return { x: px + DOOR.dx, y: py + DOOR.dy, w: DOOR.w, h: DOOR.h }
  }
}
