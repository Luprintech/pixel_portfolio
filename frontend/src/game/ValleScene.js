import Phaser from 'phaser'
import { PAL } from './palette.js'
import { BUILDINGS, COLS, LAKE, ROWS, SPAWN, TILE, roadTiles, treePositions } from './world.js'
import {
  catCanvas,
  dungeonSprite,
  grassTile,
  houseSprite,
  pathTile,
  princessCanvas,
  shadowSprite,
  treeSprite,
  waterTile,
} from './sprites.js'

const SPEED = 90
const DIRS = ['down', 'up', 'left', 'right']

export default class ValleScene extends Phaser.Scene {
  constructor() {
    super('valle')
  }

  init(data) {
    this.look = data.look
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

    // Con un panel abierto, las teclas vuelven a la página (Enter y Espacio activan botones).
    const onLock = (_parent, locked) => {
      if (locked) this.input.keyboard.disableGlobalCapture()
      else this.input.keyboard.enableGlobalCapture()
    }
    this.game.registry.events.on('changedata-locked', onLock)
    this.game.events.on('action', this.tryEnter, this)
    this.events.once('shutdown', () => {
      this.game.registry.events.off('changedata-locked', onLock)
      this.game.events.off('action', this.tryEnter, this)
    })
  }

  // Texturas
  addCanvas(key, canvas) {
    if (this.textures.exists(key)) this.textures.remove(key)
    this.textures.addCanvas(key, canvas)
  }

  buildTextures() {
    DIRS.forEach((dir) => [0, 1].forEach((f) => this.addCanvas(`pr-${dir}-${f}`, princessCanvas(this.look, dir, f))))
    ;[0, 1].forEach((f) => this.addCanvas(`cat-${f}`, catCanvas(f)))
    ;[0, 1].forEach((v) => this.addCanvas(`tree-${v}`, treeSprite(v)))
    this.addCanvas('shadow', shadowSprite(10, 4))
    this.addCanvas('shadow-cat', shadowSprite(12, 4))
    this.addCanvas('dungeon', dungeonSprite())
    BUILDINGS.filter((b) => b.kind === 'house').forEach((b) => this.addCanvas(`house-${b.id}`, houseSprite(b.style)))
  }

  buildGround() {
    const canvas = document.createElement('canvas')
    canvas.width = COLS * TILE
    canvas.height = ROWS * TILE
    const ctx = canvas.getContext('2d')
    const roads = roadTiles()
    const grass = [grassTile(0), grassTile(1), grassTile(2), grassTile(0)]
    const paths = [pathTile(0), pathTile(1)]
    const water = waterTile()
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const key = `${x},${y}`
        const inLake = x >= LAKE.x && x < LAKE.x + LAKE.w && y >= LAKE.y && y < LAKE.y + LAKE.h
        let tile
        if (inLake) tile = water
        else if (roads.has(key)) tile = paths[(x + y) % 2]
        else tile = grass[(x * 7 + y * 13) % 4 === 2 ? 2 : (x + y) % 2]
        ctx.drawImage(tile, x * TILE, y * TILE)
      }
    }
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
  }

  buildBuildings() {
    this.doors = []
    BUILDINGS.forEach((b) => {
      const px = b.x * TILE
      const py = b.y * TILE
      const sprite = b.kind === 'dungeon' ? 'dungeon' : `house-${b.id}`
      const img = this.add.image(px, py, sprite).setOrigin(0, 0)
      img.setDepth(py + img.height - 2)
      // Cuerpo sólido: la parte baja del edificio, sin la puerta.
      const bodyTop = py + (b.kind === 'dungeon' ? 14 : 22)
      this.solid(px + 2, bodyTop, b.w * TILE - 4, py + img.height - bodyTop - 8)
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
    this.catShadow = this.add.image(SPAWN.x - 14, SPAWN.y + 4, 'shadow-cat').setDepth(2)

    this.princess = this.physics.add.sprite(SPAWN.x, SPAWN.y, 'pr-down-0').setOrigin(0.5, 1)
    this.princess.body.setSize(8, 4).setOffset(1, 9)
    this.princess.setCollideWorldBounds(true)
    this.physics.add.collider(this.princess, this.solids)

    this.cat = this.add.sprite(SPAWN.x - 14, SPAWN.y + 4, 'cat-0').setOrigin(0.5, 1)
    this.trail = []
    this.facing = 'down'
    this.stepTimer = 0
    this.stepFrame = 0
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
        this.stepFrame = 1 - this.stepFrame
      }
    } else {
      body.setVelocity(0, 0)
      this.stepFrame = 0
    }

    const side = this.facing === 'left' || this.facing === 'right'
    this.princess.setTexture(`pr-${side ? 'right' : this.facing}-${this.stepFrame}`)
    this.princess.setFlipX(this.facing === 'left')

    const px = Math.round(this.princess.x)
    const py = Math.round(this.princess.y)
    this.princess.setDepth(py)
    this.shadow.setPosition(px, py - 1)

    this.followCat(moving, px, py, delta)
    this.checkDoors(px, py)
  }

  followCat(moving, px, py, delta) {
    if (moving) {
      const last = this.trail[this.trail.length - 1]
      if (!last || Math.hypot(last.x - px, last.y - py) > 1.5) this.trail.push({ x: px, y: py })
      if (this.trail.length > 11) this.trail.shift()
    }
    const target = this.trail.length > 9 ? this.trail[0] : null
    const dist = Phaser.Math.Distance.Between(this.cat.x, this.cat.y, px, py)
    if (target && dist > 12) {
      const dx = target.x - this.cat.x
      const dy = target.y - this.cat.y
      const step = Math.min(Math.hypot(dx, dy), (SPEED * 1.05 * delta) / 1000)
      const angle = Math.atan2(dy, dx)
      this.cat.x += Math.cos(angle) * step
      this.cat.y += Math.sin(angle) * step
      if (Math.abs(dx) > 0.4) this.cat.setFlipX(dx < 0)
      this.cat.setTexture(`cat-${this.stepFrame}`)
    } else {
      this.cat.setTexture('cat-0')
    }
    this.cat.setDepth(Math.round(this.cat.y))
    this.catShadow.setPosition(Math.round(this.cat.x), Math.round(this.cat.y) - 1)
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
