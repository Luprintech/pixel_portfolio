import Phaser from 'phaser'
import { WALK_CYCLE, frameName } from './avatar/index.js'
import { EXIT_ID, roomOf } from './interiors.js'
import { roomCanvas } from './interiorPaint.js'
import { roomZoom } from './viewport.js'
import { advanceWalk, facingFor, inputVector } from './walk.js'

const SPEED = 90
// Lo que cambia el cuerpo físico sobre los pies: el mismo de la viajera en el valle.
const FEET_BODY = 4
const FADE = [220, 203, 240]

// Sala interior de un edificio. Por ahora está vacía: el valle se duerme al entrar y despierta al salir, con la
// viajera donde la dejó. La textura de la viajera y su aspecto los pone el valle (`travellerKey` del registro).
export default class InteriorScene extends Phaser.Scene {
  constructor() {
    super('interior')
  }

  init(data) {
    this.building = data.building
    this.pastel = !!data.pastel
    this.facing = 'up'
    this.walk = { timer: 0, step: 0 }
    this.near = null
    this.leaving = false
  }

  create() {
    const room = roomOf(this.building)
    this.room = room
    const key = `room:${this.building.id}:${this.pastel}`
    if (!this.textures.exists(key)) this.textures.addCanvas(key, roomCanvas(room, this.pastel))
    this.add.image(0, 0, key).setOrigin(0, 0).setDepth(0)

    const { bounds, spawn } = room
    this.physics.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height)
    this.shadow = this.add.image(spawn.x, spawn.y, 'shadow').setDepth(2)
    const travellerKey = this.game.registry.get('travellerKey')
    this.princess = this.physics.add.sprite(spawn.x, spawn.y, travellerKey, frameName(this.facing, 0)).setOrigin(0.5, 1)
    this.princess.body.setSize(8, FEET_BODY).setOffset(5, 30)
    this.princess.setCollideWorldBounds(true)
    this.exitZone = new Phaser.Geom.Rectangle(room.exit.x, room.exit.y, room.exit.width, room.exit.height)

    const kb = this.input.keyboard
    this.cursors = kb.createCursorKeys()
    this.keys = kb.addKeys('W,A,S,D,E,SPACE')
    this.keys.E.on('down', this.leave, this)
    this.keys.SPACE.on('down', this.leave, this)

    this.cameras.main.centerOn(room.width / 2, room.height / 2)
    this.fit()
    this.cameras.main.fadeIn(250, ...FADE)

    this.scale.on('resize', this.fit, this)
    this.game.events.on('action', this.leave, this)
    this.game.registry.events.on('changedata-travellerKey', this.retexture, this)
    this.events.on('postupdate', this.settle, this)
    this.events.once('shutdown', () => {
      this.events.off('postupdate', this.settle, this)
      this.scale.off('resize', this.fit, this)
      this.game.events.off('action', this.leave, this)
      this.game.registry.events.off('changedata-travellerKey', this.retexture, this)
    })
  }

  // La sala entera cabe siempre en pantalla, así que no hay zoom del visitante: los botones + y - se apagan.
  fit() {
    const { width, height } = this.scale
    if (!width || !height) return
    this.cameras.main.setZoom(roomZoom(width, height, this.room.width, this.room.height))
    this.cameras.main.centerOn(this.room.width / 2, this.room.height / 2)
    this.game.registry.set('zoom', { canIn: false, canOut: false })
  }

  // El visitante cambió de aspecto: el valle ya ha creado la hoja nueva y borrará la anterior tras este aviso.
  retexture(_parent, _key, value) {
    this.princess.setTexture(value, frameName(this.facing, 0))
  }

  // Salir con E, Espacio o el botón de la pantalla: solo desde el felpudo.
  leave() {
    if (this.leaving || this.near !== EXIT_ID || this.game.registry.get('locked')) return
    this.leaving = true
    this.near = null
    this.game.events.emit('near', null)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop()
      this.scene.wake('valle')
    })
    this.cameras.main.fadeOut(220, ...FADE)
  }

  update(_time, delta) {
    const body = this.princess.body
    const locked = this.game.registry.get('locked') || this.leaving
    const { x, y } = locked ? { x: 0, y: 0 } : inputVector(this.cursors, this.keys, this.game.registry.get('joy'))
    const len = Math.hypot(x, y)
    const moving = len > 0.15
    if (moving) {
      const scale = Math.min(1, len) / len
      body.setVelocity(x * scale * SPEED, y * scale * SPEED)
      this.facing = facingFor(x, y)
    } else {
      body.setVelocity(0, 0)
    }
    const step = advanceWalk(this.walk, moving, delta)
    this.princess.setFrame(frameName(this.facing, WALK_CYCLE[step]))
  }

  // Lo que depende de dónde ha quedado la viajera va en `postupdate`, cuando la física ya movió el sprite
  // (mismo motivo que en el valle): la sombra, la profundidad y si está sobre el felpudo.
  settle() {
    const px = Math.round(this.princess.x)
    const py = Math.round(this.princess.y)
    this.princess.setDepth(py)
    this.shadow.setPosition(this.princess.x, this.princess.y - 1)
    const id = this.leaving || !this.exitZone.contains(px, py) ? null : EXIT_ID
    if (id !== this.near) {
      this.near = id
      this.game.events.emit('near', id)
    }
  }
}
