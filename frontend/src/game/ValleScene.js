import Phaser from 'phaser'
import { PAL } from './palette.js'
import { BUILDINGS, COLS, LAKE, ROWS, SIGNPOST, SPAWN, TILE, plazaTiles, roadTiles, treePositions } from './world.js'
import { groundCanvas } from './ground.js'
import { cameraZoom } from './viewport.js'
import { DIRS, WALK_CYCLE, avatarSheet, frameName, frameRect, POSES } from './avatar/index.js'
import {
  dungeonSprite,
  houseSprite,
  shadowSprite,
  signpostSprite,
  treeSprite,
} from './sprites.js'
import { petCanvas } from './pets/index.js'

const SPEED = 90
// Columna del dibujo donde está el centro de la puerta, según el tipo de edificio.
const DOOR_CENTER = { house: 32, dungeon: 40 }

export default class ValleScene extends Phaser.Scene {
  constructor() {
    super('valle')
  }

  init(data) {
    this.look = data.look
    this.pet = data.pet
    this.near = null
    this.armed = true
  }

  create() {
    this.physics.world.setBounds(0, 0, COLS * TILE, ROWS * TILE)
    this.buildTextures()
    this.buildGround()
    this.solids = []
    this.buildScenery()
    this.buildBuildings()
    this.buildLake()
    this.buildCharacters()
    this.buildInput()

    const cam = this.cameras.main
    cam.setBounds(0, 0, COLS * TILE, ROWS * TILE)
    cam.startFollow(this.princess, true, 0.12, 0.12)
    cam.centerOn(this.princess.x, this.princess.y)
    cam.setRoundPixels(true)
    this.fitCamera()
    this.scale.on('resize', this.fitCamera, this)

    // Con un panel abierto, las teclas vuelven a la página (Enter y Espacio activan botones).
    const onLock = (_parent, locked) => {
      if (locked) this.input.keyboard.disableGlobalCapture()
      else this.input.keyboard.enableGlobalCapture()
    }
    this.game.registry.events.on('changedata-locked', onLock)
    this.game.events.on('action', this.tryEnter, this)
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.fitCamera, this)
      this.game.registry.events.off('changedata-locked', onLock)
      this.game.events.off('action', this.tryEnter, this)
    })
  }

  fitCamera() {
    const { width, height } = this.scale
    this.cameras.main.setZoom(cameraZoom(width, height, COLS * TILE, ROWS * TILE))
  }

  // Texturas
  addCanvas(key, canvas) {
    if (this.textures.exists(key)) this.textures.remove(key)
    this.textures.addCanvas(key, canvas)
  }

  // La viajera es una sola hoja (poses en columnas, direcciones en filas) con un fotograma por
  // pose y dirección: el perfil izquierdo ya viene dibujado, no se refleja al pintarlo.
  addTravellerSheet() {
    const texture = this.textures.addCanvas('traveller', avatarSheet(this.look))
    DIRS.forEach((dir) => {
      for (let pose = 0; pose < POSES; pose++) {
        const { x, y, w, h } = frameRect(dir, pose)
        texture.add(frameName(dir, pose), 0, x, y, w, h)
      }
    })
  }

  buildTextures() {
    if (this.textures.exists('traveller')) this.textures.remove('traveller')
    this.addTravellerSheet()
    if (this.pet.kind !== 'ninguna') {
      const frames = [0, 1].map((f) => petCanvas(this.pet, f))
      frames.forEach((canvas, f) => this.addCanvas(`pet-${f}`, canvas))
      // Cada raza tiene su tamaño: la sombra cubre el cuerpo y se desplaza con él, no con la cabeza.
      this.petWidth = frames[0].width
      this.addCanvas('shadow-pet', shadowSprite(Math.round(this.petWidth * 0.62), 4))
    }
    ;[0, 1, 2].forEach((v) => this.addCanvas(`tree-${v}`, treeSprite(v)))
    this.addCanvas('shadow', shadowSprite(14, 5))
    this.addCanvas('dungeon', dungeonSprite())
    this.addCanvas('signpost', signpostSprite())
    BUILDINGS.filter((b) => b.kind === 'house').forEach((b) => this.addCanvas(`house-${b.id}`, houseSprite(b.style)))
  }

  buildGround() {
    const canvas = groundCanvas({ cols: COLS, rows: ROWS, tile: TILE, roads: roadTiles(), plaza: plazaTiles(), lake: LAKE })
    this.addCanvas('ground', canvas)
    this.add.image(0, 0, 'ground').setOrigin(0, 0).setDepth(0)
  }

  // Decorado y colisiones
  solid(x, y, w, h) {
    const rect = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0)
    this.physics.add.existing(rect, true)
    this.solids.push(rect)
  }

  buildScenery() {
    treePositions().forEach((t) => {
      const px = t.x * TILE + TILE / 2
      const py = t.y * TILE + TILE
      this.add.image(px, py, `tree-${t.variant}`).setOrigin(0.5, 1).setDepth(py)
      this.solid(px - 5, py - 6, 10, 6)
    })

    const signX = SIGNPOST.x * TILE + TILE / 2
    const signY = SIGNPOST.y * TILE + TILE
    this.add.image(signX, signY, 'signpost').setOrigin(0.5, 1).setDepth(signY)
    this.solid(signX - 4, signY - 5, 8, 5)
  }

  buildBuildings() {
    this.doors = []
    BUILDINGS.forEach((b) => {
      const py = b.y * TILE
      const sprite = b.kind === 'dungeon' ? 'dungeon' : `house-${b.id}`
      // La puerta del dibujo queda en el centro del sprite: se alinea con la tesela de la puerta
      // para que el camino llegue justo a ella.
      const px = b.door.x * TILE + TILE / 2 - DOOR_CENTER[b.kind]
      const img = this.add.image(px, py, sprite).setOrigin(0, 0)
      // Cuerpo sólido: la parte baja del edificio. Deja libre la franja del escalón para llegar a la puerta.
      const bodyTop = py + (b.kind === 'dungeon' ? 14 : 30)
      const bodyBottom = py + img.height - 12
      img.setDepth(bodyBottom)
      this.solid(px + 2, bodyTop, img.width - 4, bodyBottom - bodyTop)
      this.doors.push({
        id: b.id,
        rect: new Phaser.Geom.Rectangle(b.door.x * TILE - 6, b.door.y * TILE - 6, TILE + 12, TILE + 6),
        // Felpudo: pisarlo entra directamente, sin pulsar nada.
        mat: new Phaser.Geom.Rectangle(b.door.x * TILE + 1, b.door.y * TILE - 4, TILE - 2, 12),
      })
    })
  }

  buildLake() {
    this.solid(LAKE.x * TILE, LAKE.y * TILE, LAKE.w * TILE, LAKE.h * TILE)
    // Destellos: pequeños, lentos y sin repetirse a la vez.
    for (let i = 0; i < 7; i++) {
      const x = (LAKE.x + 1 + ((i * 5) % (LAKE.w - 2))) * TILE + 4
      const y = (LAKE.y + 1 + ((i * 3) % (LAKE.h - 2))) * TILE + 6
      const glint = this.add.rectangle(x, y, 4, 1, 0xf1e6cf).setDepth(1).setAlpha(0)
      this.tweens.add({ targets: glint, alpha: 0.9, duration: 500, yoyo: true, repeat: -1, delay: i * 420, repeatDelay: 1800 })
    }
  }

  // Personajes
  buildCharacters() {
    this.shadow = this.add.image(SPAWN.x, SPAWN.y, 'shadow').setDepth(2)

    this.princess = this.physics.add.sprite(SPAWN.x, SPAWN.y, 'traveller', frameName('down', 0)).setOrigin(0.5, 1)
    this.princess.body.setSize(8, 4).setOffset(5, 30)
    this.princess.setCollideWorldBounds(true)
    this.physics.add.collider(this.princess, this.solids)

    if (this.pet.kind !== 'ninguna') {
      const startX = SPAWN.x - Math.round(this.petWidth / 2) - 4
      this.petShadow = this.add.image(startX, SPAWN.y + 4, 'shadow-pet').setDepth(2)
      this.companion = this.add.sprite(startX, SPAWN.y + 4, 'pet-0').setOrigin(0.5, 1)
    }
    this.trail = []
    this.facing = 'down'
    this.stepTimer = 0
    this.walkStep = 0
  }

  buildInput() {
    const kb = this.input.keyboard
    this.cursors = kb.createCursorKeys()
    this.keys = kb.addKeys('W,A,S,D,E,SPACE')
    const act = () => this.tryEnter()
    this.keys.E.on('down', act)
    this.keys.SPACE.on('down', act)
  }

  tryEnter() {
    if (this.game.registry.get('locked')) return
    if (this.near) {
      this.armed = false
      this.game.events.emit('enter', this.near)
    }
  }

  // Bucle
  update(_time, delta) {
    const locked = this.game.registry.get('locked')
    const body = this.princess.body
    let vx = 0
    let vy = 0

    if (!locked) {
      const joy = this.game.registry.get('joy') || { x: 0, y: 0 }
      if (this.cursors.left.isDown || this.keys.A.isDown) vx -= 1
      if (this.cursors.right.isDown || this.keys.D.isDown) vx += 1
      if (this.cursors.up.isDown || this.keys.W.isDown) vy -= 1
      if (this.cursors.down.isDown || this.keys.S.isDown) vy += 1
      if (vx === 0 && vy === 0) {
        vx = joy.x
        vy = joy.y
      }
    }

    const len = Math.hypot(vx, vy)
    const moving = len > 0.15
    if (moving) {
      const scale = Math.min(1, len) / len
      body.setVelocity(vx * scale * SPEED, vy * scale * SPEED)
      this.facing = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? 'left' : 'right') : vy < 0 ? 'up' : 'down'
      this.stepTimer += delta
      if (this.stepTimer > 140) {
        this.stepTimer = 0
        this.walkStep = (this.walkStep + 1) % WALK_CYCLE.length
      }
    } else {
      body.setVelocity(0, 0)
      this.walkStep = 0
    }

    this.princess.setFrame(frameName(this.facing, WALK_CYCLE[this.walkStep]))

    const px = Math.round(this.princess.x)
    const py = Math.round(this.princess.y)
    this.princess.setDepth(py)
    this.shadow.setPosition(px, py - 1)

    if (this.companion) this.followPet(moving, px, py, delta)
    this.checkDoors(px, py)
  }

  followPet(moving, px, py, delta) {
    const pet = this.companion
    if (moving) {
      const last = this.trail[this.trail.length - 1]
      if (!last || Math.hypot(last.x - px, last.y - py) > 1.5) this.trail.push({ x: px, y: py })
      if (this.trail.length > 11) this.trail.shift()
    }
    const target = this.trail.length > 9 ? this.trail[0] : null
    const dist = Phaser.Math.Distance.Between(pet.x, pet.y, px, py)
    if (target && dist > 12) {
      const dx = target.x - pet.x
      const dy = target.y - pet.y
      const step = Math.min(Math.hypot(dx, dy), (SPEED * 1.05 * delta) / 1000)
      const angle = Math.atan2(dy, dx)
      pet.x += Math.cos(angle) * step
      pet.y += Math.sin(angle) * step
      if (Math.abs(dx) > 0.4) pet.setFlipX(dx < 0)
      pet.setTexture(`pet-${this.walkStep % 2}`)
    } else {
      pet.setTexture('pet-0')
    }
    pet.setDepth(Math.round(pet.y))
    const bodyShift = Math.round(this.petWidth * 0.12) * (pet.flipX ? 1 : -1)
    this.petShadow.setPosition(Math.round(pet.x) + bodyShift, Math.round(pet.y) - 1)
  }

  checkDoors(px, py) {
    const hit = this.doors.find((d) => d.rect.contains(px, py))
    const id = hit ? hit.id : null
    if (id !== this.near) {
      this.near = id
      this.game.events.emit('near', id)
    }
    if (!id) {
      this.armed = true
    } else if (this.armed && !this.game.registry.get('locked') && hit.mat.contains(px, py)) {
      this.tryEnter()
    }
  }
}

export { PAL }
