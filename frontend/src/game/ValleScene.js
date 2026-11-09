import Phaser from 'phaser'
import { PAL } from './palette.js'
import { BRIDGE, BUILDINGS, COLS, PROPS, ROWS, SPAWN, TILE, blockedWaterTiles, treePositions } from './world.js'
import { cameraZoom } from './viewport.js'
import { DIRS, WALK_CYCLE, avatarSheet, frameName, frameRect, POSES } from './avatar/index.js'
import { shadowSprite } from './sprites.js'
import { makeCanvas, rect } from './pixelKit.js'
import { petCanvas } from './pets/index.js'
import { bridgeAssets, buildingAssets, groundBase, groundSeasonJob, propAssets, treeAssets } from './worldAssets.js'
import SkyLayer from './SkyLayer.js'

const SPEED = 90
// Las ventanas encendidas y la luz de las farolas.
const LIT_WINDOW = '#f8d77a'
const SEASONS = ['autumn', 'winter']

export default class ValleScene extends Phaser.Scene {
  constructor() {
    super('valle')
  }

  init(data) {
    this.look = data.look
    this.pet = data.pet
    this.pastel = !!data.pastel
    this.seed = data.seed ?? Math.floor(Math.random() * 1e9)
    this.near = null
    this.armed = true
  }

  create() {
    this.physics.world.setBounds(0, 0, COLS * TILE, ROWS * TILE)
    this.sky = new SkyLayer(this, { seed: this.seed })
    this.buildTextures()
    this.buildGround()
    this.solids = []
    this.doors = []
    this.buildScenery()
    this.buildBuildings()
    this.buildProps()
    this.buildWater()
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
    this.game.events.on('appearance', this.setAppearance, this)
    // Entrar al valle: un fundido corto desde el color de la página en lugar de un corte.
    cam.fadeIn(350, 220, 203, 240)
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.fitCamera, this)
      this.game.registry.events.off('changedata-locked', onLock)
      this.game.events.off('action', this.tryEnter, this)
      this.game.events.off('appearance', this.setAppearance, this)
    })
  }

  fitCamera() {
    const { width, height } = this.scale
    // Con la página oculta el lienzo mide 0: no hay nada que ajustar.
    if (!width || !height) return
    this.cameras.main.setZoom(cameraZoom(width, height, COLS * TILE, ROWS * TILE))
    this.sky.resize()
  }

  // Texturas
  addCanvas(key, canvas) {
    if (this.textures.exists(key)) this.textures.remove(key)
    this.textures.addCanvas(key, canvas)
  }

  // Dibujo del escenario ya preparado en `worldAssets` (paleta pastel incluida): se registra con sus
  // versiones de otoño e invierno (`clave:autumn`, `clave:winter`), que se funden por encima según el
  // tiempo. La viajera, la mascota y las sombras no pasan por ahí y conservan su color.
  addPrepared(key, set) {
    this.addCanvas(key, set.base)
    SEASONS.forEach((season) => set[season] && this.addCanvas(`${key}:${season}`, set[season]))
  }

  // Imagen de un dibujo con sus versiones de estación apiladas encima, al mismo sitio y profundidad.
  placeScenery(key, x, y, origin, depth) {
    const image = this.add.image(x, y, key).setOrigin(...origin).setDepth(depth)
    SEASONS.forEach((season) => {
      if (!this.textures.exists(`${key}:${season}`)) return
      this.sky.addSeason(season, this.add.image(x, y, `${key}:${season}`).setOrigin(...origin).setDepth(depth))
    })
    return image
  }

  // La viajera es una sola hoja (poses en columnas, direcciones en filas) con un fotograma por
  // pose y dirección: el perfil izquierdo ya viene dibujado, no se refleja al pintarlo. Cada aspecto
  // tiene su propia textura (`traveller-1`, `traveller-2`...) para poder cambiarlo sin parar el juego;
  // devuelve la clave de la anterior.
  addTravellerSheet() {
    const key = `traveller-${(this.sheetCount = (this.sheetCount ?? 0) + 1)}`
    const texture = this.textures.addCanvas(key, avatarSheet(this.look))
    DIRS.forEach((dir) => {
      for (let pose = 0; pose < POSES; pose++) {
        const { x, y, w, h } = frameRect(dir, pose)
        texture.add(frameName(dir, pose), 0, x, y, w, h)
      }
    })
    const previous = this.travellerKey
    this.travellerKey = key
    return previous
  }

  // Mascota del visitante junto al punto dado (o ninguna): se vuelve a crear entera, porque cada raza
  // tiene su tamaño y su sombra.
  buildPet(anchorX, anchorY) {
    this.companion?.destroy()
    this.petShadow?.destroy()
    this.companion = null
    this.petShadow = null
    this.trail = []
    if (this.pet.kind === 'ninguna') return
    const frames = [0, 1].map((f) => petCanvas(this.pet, f))
    frames.forEach((canvas, f) => this.addCanvas(`pet-${f}`, canvas))
    // Cada raza tiene su tamaño: la sombra cubre el cuerpo y se desplaza con él, no con la cabeza.
    this.petWidth = frames[0].width
    this.addCanvas('shadow-pet', shadowSprite(Math.round(this.petWidth * 0.62), 4))
    const startX = anchorX - Math.round(this.petWidth / 2) - 4
    this.petShadow = this.add.image(startX, anchorY + 4, 'shadow-pet').setDepth(2)
    this.companion = this.add.sprite(startX, anchorY + 4, 'pet-0').setOrigin(0.5, 1)
  }

  // Cambia el aspecto de la viajera y su mascota sin reiniciar el mundo: se queda donde estaba.
  setAppearance(look, pet) {
    this.look = look
    this.pet = pet
    const previous = this.addTravellerSheet()
    this.princess.setTexture(this.travellerKey, frameName(this.facing, 0))
    if (previous) this.textures.remove(previous)
    this.buildPet(this.princess.x, this.princess.y)
  }

  buildTextures() {
    this.addTravellerSheet()
    ;[0, 1, 2].forEach((v) => this.addPrepared(`tree-${v}`, treeAssets(v, this.pastel)))
    this.addCanvas('shadow', shadowSprite(14, 5))
    this.addCanvas('lamp-glow', lampGlowCanvas())
    this.addPrepared('bridge', bridgeAssets(this.pastel))
  }

  // Para entrar solo hace falta la base del suelo. El otoño y el invierno se terminan de preparar mientras se
  // juega (porciones de unos 4 ms por fotograma, ver `advanceGroundSeasons`) y se añaden cuando están listos.
  buildGround() {
    this.addCanvas('ground', groundBase(this.pastel))
    this.placeScenery('ground', 0, 0, [0, 0], 0)
    this.groundPending = SEASONS.map((season) => [season, groundSeasonJob(season, this.pastel)])
  }

  advanceGroundSeasons() {
    if (!this.groundPending.length) return
    const start = performance.now()
    while (this.groundPending.length && performance.now() - start < 4) {
      const [season, work] = this.groundPending[0]
      if (!work.step()) continue
      this.addCanvas(`ground:${season}`, work.value)
      this.sky.addSeason(season, this.add.image(0, 0, `ground:${season}`).setOrigin(0, 0).setDepth(0))
      this.groundPending.shift()
    }
  }

  // Decorado y colisiones
  solid(x, y, w, h) {
    const rectangle = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0)
    this.physics.add.existing(rectangle, true)
    this.solids.push(rectangle)
  }

  buildScenery() {
    treePositions().forEach((t) => {
      const px = t.x * TILE + TILE / 2
      const py = t.y * TILE + TILE
      this.placeScenery(`tree-${t.variant}`, px, py, [0.5, 1], py)
      this.solid(px - 5, py - 6, 10, 6)
    })
  }

  // Edificios: cada dibujo se alinea para que su puerta caiga en la tesela de la puerta. Las ventanas
  // se encienden de noche con una copia de los cristales que se pinta por encima del oscurecimiento.
  buildBuildings() {
    BUILDINGS.forEach((b, i) => {
      const { sprite, set } = buildingAssets(b, this.pastel)
      const key = `building-${b.id}`
      this.addPrepared(key, set)
      const px = b.door.x * TILE + TILE / 2 - sprite.doorCol
      const py = b.y * TILE
      const height = sprite.canvas.height
      // Cuerpo sólido: la parte baja del edificio. Deja libre la franja del escalón para llegar a la puerta.
      const bodyTop = py + Math.round(height * 0.5)
      const bodyBottom = py + height - 12
      this.placeScenery(key, px, py, [0, 0], bodyBottom)
      this.solid(px + 2, bodyTop, sprite.canvas.width - 4, bodyBottom - bodyTop)
      this.addLitWindows(`${key}:lit`, sprite, px, py, i / (BUILDINGS.length - 1))
      if (b.zone) this.addDoor(b.zone, b.door.x, b.door.y)
    })
  }

  addLitWindows(key, { canvas, windows }, x, y, rank) {
    if (!windows.length) return
    const lit = makeCanvas(canvas.width, canvas.height)
    const g = lit.getContext('2d')
    windows.forEach((w) => rect(g, w.x, w.y, w.w, w.h, LIT_WINDOW))
    this.addCanvas(key, lit)
    this.sky.addWindows(this.add.image(x, y, key).setOrigin(0, 0), rank)
  }

  // Puerta de un panel: pisar el felpudo entra directamente, sin pulsar nada.
  addDoor(zone, tx, ty) {
    this.doors.push({
      id: zone,
      rect: new Phaser.Geom.Rectangle(tx * TILE - 6, ty * TILE - 6, TILE + 12, TILE + 6),
      mat: new Phaser.Geom.Rectangle(tx * TILE + 1, ty * TILE - 4, TILE - 2, 12),
    })
  }

  // Objetos sueltos: cada tipo se dibuja una vez y se coloca por su punto de apoyo.
  buildProps() {
    PROPS.forEach((prop) => {
      const key = `prop-${prop.kind}-${prop.variant ?? 0}`
      const { sprite, set } = propAssets(prop, this.pastel)
      if (!this.textures.exists(key)) this.addPrepared(key, set)
      const px = prop.at[0] * TILE
      const py = prop.at[1] * TILE
      this.placeScenery(key, px, py, [0.5, 1], py)
      sprite.body.forEach(({ l, t, r, b }) => this.solid(px + l, py + t, r - l, b - t))
      if (sprite.glow) this.sky.addLamp(this.add.image(px + sprite.glow.dx, py + sprite.glow.dy, 'lamp-glow'))
      if (prop.zone) this.addDoor(prop.zone, prop.door.x, prop.door.y)
    })
    this.placeScenery('bridge', BRIDGE.x * TILE, BRIDGE.y * TILE - 6, [0, 0], 1)
  }

  // Arroyo: colisión por tramos de teselas contiguas de cada fila, y destellos lentos en el agua.
  buildWater() {
    const blocked = blockedWaterTiles()
    for (let y = 0; y < ROWS; y++) {
      let start = null
      for (let x = 0; x <= COLS; x++) {
        const isWater = blocked.has(`${x},${y}`)
        if (isWater && start === null) start = x
        if (!isWater && start !== null) {
          this.solid(start * TILE, y * TILE, (x - start) * TILE, TILE)
          start = null
        }
      }
    }
    // Destellos: pequeños, lentos y sin repetirse a la vez.
    const tiles = [...blocked].map((k) => k.split(',').map(Number))
    for (let i = 0; i < 24; i++) {
      const [tx, ty] = tiles[(i * 37) % tiles.length]
      const glint = this.add.rectangle(tx * TILE + 4 + ((i * 5) % 8), ty * TILE + 6 + ((i * 3) % 6), 4, 1, 0xf1e6cf).setDepth(1).setAlpha(0)
      this.tweens.add({ targets: glint, alpha: 0.9, duration: 500, yoyo: true, repeat: -1, delay: i * 420, repeatDelay: 1800 })
    }
  }

  // Personajes
  buildCharacters() {
    this.shadow = this.add.image(SPAWN.x, SPAWN.y, 'shadow').setDepth(2)

    this.princess = this.physics.add.sprite(SPAWN.x, SPAWN.y, this.travellerKey, frameName('down', 0)).setOrigin(0.5, 1)
    this.princess.body.setSize(8, 4).setOffset(5, 30)
    this.princess.setCollideWorldBounds(true)
    this.physics.add.collider(this.princess, this.solids)

    this.buildPet(SPAWN.x, SPAWN.y)
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
  update(time, delta) {
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
    this.sky.update(time)
    this.advanceGroundSeasons()
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

// Halo de una farola: discos concentricos cada vez más claros, sin degradados ni transparencias suaves.
function lampGlowCanvas() {
  const size = 40
  const canvas = makeCanvas(size, size)
  const g = canvas.getContext('2d')
  ;[[19, 0.12], [14, 0.16], [9, 0.22], [5, 0.3]].forEach(([r, alpha]) => {
    g.globalAlpha = alpha
    g.fillStyle = LIT_WINDOW
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) if (Math.hypot(x + 0.5 - size / 2, y + 0.5 - size / 2) <= r) g.fillRect(x, y, 1, 1)
    }
  })
  return canvas
}

export { PAL }
