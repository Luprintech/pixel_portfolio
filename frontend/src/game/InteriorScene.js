import Phaser from 'phaser'
import { SIT_POSE, WALK_CYCLE, frameName } from './avatar/index.js'
import { EXIT_ID, roomOf } from './interiors.js'
import { roomCanvas } from './interiorPaint.js'
import { steppedRoomZoom } from './viewport.js'
import { advanceWalk, facingFor, inputVector } from './walk.js'
import { talkFor } from './dialogue/scripts.js'
import { loadSeen, markSeen } from './dialogue/seen.js'
import Follower from './follower.js'
import { buildHome, faceTraveller } from './interior/homeBuilder.js'
import { ARCADE_FRONT, SEATS, interactionAt } from './interior/homeLayout.js'
import { LED_PALETTES, ledCanvas } from './interior/ledLights.js'
import { jukebox } from '../lib/jukebox.js'
import { prefersReducedMotion } from '../lib/reducedMotion.js'
import { figureCanvas, FIGURES } from './interior/figures.js'
import { MINI_STAGES } from './interior/furniture/maker.js'
import { idleJob, jobAt, printView, startJob } from './interior/printJob.js'
import { sitDown, standUp } from './sitting.js'

const SPEED = 90
// Lo que cambia el cuerpo físico sobre los pies: el mismo de la viajera en el valle.
const FEET_BODY = 4
const FADE = [220, 203, 240]
// Tras cerrar un diálogo o un panel, durante este rato se ignora E: es la misma pulsación que lo cierra, y si no abriría
// otra vez lo que acaba de cerrarse.
const REOPEN_GUARD_MS = 250
const ENTRANCE = 'casa.entrada'
const TELEVISION = 'casa.television'
// Por donde se aparece al volver de la azotea: ante la escalera de la casa.
const ROOF_ARRIVAL = { x: 38, y: 98 }
const SEAT_IDS = new Set(SEATS.map((seat) => seat.id))

// Sala interior de un edificio. La mayoría están vacías; la casa de Lupe tiene su plano (`interior/homeLayout.js`) con
// muebles, personajes, asientos e interacciones. El valle se duerme al entrar y despierta al salir, con la viajera donde
// la dejó. La textura de la viajera y su aspecto los pone el valle (`travellerKey` del registro).
export default class InteriorScene extends Phaser.Scene {
  constructor() {
    super('interior')
  }

  init(data) {
    this.building = data.building
    this.pastel = !!data.pastel
    this.night = !!data.night
    this.fromRoof = data.from === 'deck'
    this.facing = this.fromRoof ? 'down' : 'up'
    this.walk = { timer: 0, step: 0 }
    this.near = null
    this.leaving = false
    this.seen = loadSeen()
    this.visits = {}
    this.unlockedAt = 0
    this.seat = null
    this.standFrom = null
    this.zoomSteps = 0
    this.lastWheel = 0
    this.showing = false
    this.printKind = 'idle'
    this.printStage = -1
  }

  create() {
    const room = roomOf(this.building)
    this.room = room
    const key = `room:${this.building.id}:${this.pastel}`
    if (!this.textures.exists(key)) this.textures.addCanvas(key, roomCanvas(room, this.pastel))
    this.add.image(0, 0, key).setOrigin(0, 0).setDepth(0)

    const { bounds, spawn } = room
    const start = this.fromRoof && room.home ? ROOF_ARRIVAL : spawn
    this.physics.world.setBounds(bounds.x, bounds.y, bounds.width, bounds.height)
    this.shadow = this.add.image(start.x, start.y, 'shadow').setDepth(2)
    const travellerKey = this.game.registry.get('travellerKey')
    this.princess = this.physics.add.sprite(start.x, start.y, travellerKey, frameName(this.facing, 0)).setOrigin(0.5, 1)
    this.princess.body.setSize(8, FEET_BODY).setOffset(5, 30)
    this.princess.setCollideWorldBounds(true)
    this.buildFurniture()
    this.buildNight()
    // Lupe acompaña a la viajera también dentro de casa.
    this.lupe = new Follower(this, 'npc-lupe', start.x - 14, start.y + 2)
    this.exitZone = new Phaser.Geom.Rectangle(room.exit.x, room.exit.y, room.exit.width, room.exit.height)

    const kb = this.input.keyboard
    this.cursors = kb.createCursorKeys()
    this.keys = kb.addKeys('W,A,S,D,E,SPACE')
    this.keys.E.on('down', this.act, this)
    this.keys.SPACE.on('down', this.act, this)

    // La sala llena la pantalla y la cámara sigue a la viajera dentro de sus límites (ver `roomCover`).
    this.cameras.main.setBounds(0, 0, room.width, room.height)
    this.cameras.main.startFollow(this.princess, true, 1, 1)
    this.cameras.main.setRoundPixels(false)
    this.fit()
    this.cameras.main.fadeIn(250, ...FADE)

    this.scale.on('resize', this.fit, this)
    this.game.events.on('action', this.act, this)
    this.game.events.on('interior-action', this.onDialogueAction, this)
    this.game.events.on('zoom', this.stepZoom, this)
    this.input.on('wheel', this.onWheel, this)
    this.game.registry.events.on('changedata-travellerKey', this.retexture, this)
    this.game.registry.events.on('changedata-locked', this.onLock, this)
    this.events.on('postupdate', this.settle, this)
    this.events.once('shutdown', () => {
      this.game.events.emit('print-sound', false)
      this.events.off('postupdate', this.settle, this)
      this.scale.off('resize', this.fit, this)
      this.game.events.off('action', this.act, this)
      this.game.events.off('interior-action', this.onDialogueAction, this)
      this.game.events.off('zoom', this.stepZoom, this)
      this.input.off('wheel', this.onWheel, this)
      this.game.registry.events.off('changedata-travellerKey', this.retexture, this)
      this.game.registry.events.off('changedata-locked', this.onLock, this)
    })
  }

  // Muebles, personajes y colisiones de la casa de Lupe (el resto de salas no tiene nada de esto).
  buildFurniture() {
    this.solids = []
    this.switches = {}
    if (!this.room.home) return
    const addSolid = ({ x, y, w, h }) => {
      const body = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0x000000, 0)
      this.physics.add.existing(body, true)
      this.solids.push(body)
    }
    const { atreus, exclamation, switches, khalessi, printMark } = buildHome(this, this.pastel, addSolid, (variant) => this.game.events.emit('meow', variant))
    this.atreus = atreus
    this.exclamation = exclamation
    this.switches = switches
    this.cat = khalessi
    this.printMark = printMark
    // Lo que se dejó puesto al salir (canal de la tele, impresora, música) se ve igual al volver a entrar.
    const { registry } = this.game
    this.switches.tvUnit?.set(registry.get('tvChannel') ?? 'off')
    this.switches.hifi?.set(jukebox.snapshot().playing ? 'on' : 'off')
    exclamation.setVisible(!this.seen.has(ENTRANCE))
    this.physics.add.collider(this.princess, this.solids)
  }

  // De noche la casa se queda a media luz y se encienden las tiras led, que cambian de color despacio.
  buildNight() {
    if (!this.night || !this.room.home) return
    this.add.rectangle(this.room.width / 2, this.room.height / 2, this.room.width, this.room.height, 0x1c1b3a, 0.4).setDepth(8000)
    const layers = LED_PALETTES.map((palette, i) => {
      const key = `leds:${i}`
      if (!this.textures.exists(key)) this.textures.addCanvas(key, ledCanvas(this.room, palette))
      return key
    })
    const leds = this.add.image(0, 0, layers[0]).setOrigin(0, 0).setDepth(8001)
    if (prefersReducedMotion()) return
    let index = 0
    this.time.addEvent({ delay: 2200, loop: true, callback: () => leds.setTexture(layers[(index = (index + 1) % layers.length)]) })
  }

  // El registro avisa cuando el juego se bloquea (diálogo o panel abierto) y cuando se desbloquea.
  onLock(_parent, locked) {
    if (!locked) this.unlockedAt = performance.now()
  }

  // La sala llena la pantalla; los botones + y - (y la rueda) acercan hasta tres niveles y alejan hasta ver la sala entera.
  // Con la sala entera a la vista (más pequeña que la pantalla) se queda el color del fondo en los lados.
  fit() {
    const { width, height } = this.scale
    if (!width || !height) return
    const { zoom, steps, canIn, canOut } = steppedRoomZoom(this.zoomSteps, width, height, this.room.width, this.room.height)
    this.zoomSteps = steps
    const camera = this.cameras.main
    camera.setZoom(zoom)
    // Los límites de la cámara se amplían por igual a los dos lados cuando la sala no llena la pantalla: así queda centrada y
    // con márgenes simétricos (con límites más pequeños que la vista, Phaser la pega a una esquina).
    const padX = Math.max(0, (width / zoom - this.room.width) / 2)
    const padY = Math.max(0, (height / zoom - this.room.height) / 2)
    camera.setBounds(-padX, -padY, this.room.width + padX * 2, this.room.height + padY * 2)
    this.cameras.main.setBackgroundColor('#2e2d5a')
    this.game.registry.set('zoom', { canIn, canOut })
  }

  stepZoom(delta) {
    this.zoomSteps += delta
    this.fit()
  }

  // Rueda del ratón: un nivel por gesto, como en el valle (un trackpad suelta decenas de eventos por segundo).
  onWheel(_pointer, _objects, _dx, dy) {
    const now = performance.now()
    if (!dy || this.game.registry.get('locked') || now - this.lastWheel < 150) return
    this.lastWheel = now
    this.stepZoom(dy < 0 ? 1 : -1)
  }

  // El visitante cambió de aspecto: el valle ya ha creado la hoja nueva y borrará la anterior tras este aviso.
  retexture(_parent, _key, value) {
    this.princess.setTexture(value, frameName(this.facing, this.seat ? SIT_POSE : 0))
  }

  // E, Espacio o el botón de la pantalla: salir si se está sobre el felpudo, sentarse o levantarse y, si no, usar lo que
  // haya cerca.
  act() {
    if (this.showing || this.leaving || !this.near || this.game.registry.get('locked')) return
    if (performance.now() - this.unlockedAt < REOPEN_GUARD_MS) return
    if (this.near === EXIT_ID) this.leave()
    else if (this.near === 'roof') this.goUpToRoof()
    else if (SEAT_IDS.has(this.near)) this.sit(SEATS.find((seat) => seat.id === this.near))
    else if (this.near === 'standup') this.stand()
    else if (this.near === 'television') this.useTelevision()
    else if (this.near === 'printerMini' || this.near === 'printerBusy') this.game.events.emit('enter', 'printer')
    else if (this.near === 'printerCollect') this.collectPrint()
    else if (this.near === 'arcade') this.game.events.emit('enter', 'console')
    else if (this.near === 'figures') this.game.events.emit('enter', 'figures')
    else this.talk(this.near)
  }

  // La tele: la primera vez se presenta (y ofrece encenderla); después, E abre su menú de canales.
  useTelevision() {
    if (this.seen.has(TELEVISION)) this.game.events.emit('enter', 'tv')
    else this.talk('television')
  }

  // Lo que la página le pide a la sala: cambiar el canal de la tele (`null` la apaga), lanzar la impresión, encender y apagar la
  // minicadena o devolver a la viajera ante la recreativa al cerrar el juego.
  onDialogueAction(action) {
    if (action.type === 'tv') {
      this.game.registry.set('tvChannel', action.channel)
      this.switches.tvUnit?.set(action.channel ?? 'off')
    } else if (action.type === 'print-start') this.game.registry.set('printJob', startJob(performance.now()))
    else if (action.type === 'music') this.switches.hifi?.set(action.on ? 'on' : 'off')
    else if (action.type === 'arcade-exit') this.returnToArcade()
  }

  // Al cerrar la recreativa la viajera reaparece ante ella, mirándola, aunque antes de abrirla estuviera algo más lejos.
  returnToArcade() {
    this.facing = ARCADE_FRONT.facing
    this.princess.body.reset(ARCADE_FRONT.x, ARCADE_FRONT.y)
    this.princess.setFrame(frameName(this.facing, 0))
  }

  // La impresión corre por reloj (ver `printJob.js`) y se ve en la propia impresora: la figura crece capa a capa y, al acabar,
  // un aviso sobre la máquina pide recogerla. El trabajo vive en el registro del juego, así sigue aunque la viajera salga.
  updatePrint() {
    const { registry } = this.game
    const stored = registry.get('printJob') ?? idleJob()
    const now = performance.now()
    const job = jobAt(stored, now)
    if (job !== stored) registry.set('printJob', job)
    const { kind, stage } = printView(job, now, MINI_STAGES)
    if (kind === this.printKind && stage === this.printStage) return
    const printer = this.switches.printerMini
    if (kind === 'printing') printer?.showFrame(1 + stage)
    else printer?.set(kind)
    this.printMark?.setVisible(kind === 'done')
    if (kind !== this.printKind) {
      this.game.events.emit('print-sound', kind === 'printing')
      if (kind === 'done' && this.printKind === 'printing') this.game.events.emit('print-done')
    }
    this.printKind = kind
    this.printStage = stage
  }

  // Recoger la impresión terminada: la figura sale de la placa, la viajera, de frente, levanta el Pikachu por encima de la
  // cabeza, con un destello, y lo enseña un momento antes de recibirlo (después se da el logro). Durante la escena no se anda
  // ni se usa nada. Con la impresión sin terminar no hay nada que recoger.
  collectPrint() {
    if (this.showing || this.printKind !== 'done') return
    this.showing = true
    this.game.registry.set('printJob', idleJob())
    if (this.seat) this.stand()
    this.princess.body.setVelocity(0, 0)
    this.facing = 'down'
    this.princess.setFrame(frameName('down', 0))
    const key = 'fig-pokemon'
    if (!this.textures.exists(key)) this.textures.addCanvas(key, figureCanvas(FIGURES.find((figure) => figure.id === 'pokemon')))
    const { x, y } = this.princess
    const glow = this.add.rectangle(x, y - 40, 22, 22, 0xf8d77a, 0.55).setDepth(9000).setAngle(45)
    const figure = this.add.image(x, y - 14, key).setOrigin(0.5, 1).setDepth(9001)
    if (prefersReducedMotion()) {
      figure.setY(y - 30)
      glow.setY(y - 40)
    } else {
      this.tweens.add({ targets: figure, y: y - 30, duration: 450, ease: 'Back.Out' })
      this.tweens.add({ targets: glow, angle: 135, alpha: 0.2, duration: 1600, yoyo: true })
    }
    this.time.delayedCall(1900, () => {
      figure.destroy()
      glow.destroy()
      this.showing = false
      this.game.events.emit('figure-shown')
    })
  }

  // Abre la conversación de lo que hay cerca. Primera vez o repetición lo decide `talkFor` según lo ya visto; la página
  // recibe el id del guion y se encarga de mostrarlo.
  talk(interaction) {
    const visits = this.visits[interaction] ?? 0
    const script = talkFor(interaction, this.seen, visits)
    if (!script) return
    this.visits[interaction] = visits + 1
    this.seen = markSeen(this.seen, script)
    if (script === ENTRANCE) this.exclamation?.setVisible(false)
    this.game.events.emit('talk', script)
  }

  sit(seat) {
    this.seat = seat
    this.facing = seat.facing
    this.standFrom = sitDown(this.princess, this.shadow, seat)
  }

  // Se levanta donde estaba antes de sentarse (siempre un sitio libre).
  stand() {
    standUp(this.princess, this.shadow, this.standFrom)
    this.seat = null
    this.standFrom = null
  }

  // Salir al valle desde el felpudo; `to` hace que la viajera aparezca en un sitio concreto (la cubierta).
  leave(to) {
    this.leaving = true
    this.near = null
    this.game.events.emit('near', null)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop()
      this.scene.wake('valle', to ? { to } : undefined)
    })
    this.cameras.main.fadeOut(220, ...FADE)
  }

  // La escalera de la casa lleva a la cubierta, donde sigue el telescopio de siempre.
  goUpToRoof() {
    this.leave('deck')
  }

  update(_time, delta) {
    if (this.room.home) this.updatePrint()
    const body = this.princess.body
    const locked = this.game.registry.get('locked') || this.leaving || this.showing
    const { x, y } = locked ? { x: 0, y: 0 } : inputVector(this.cursors, this.keys, this.game.registry.get('joy'))
    const len = Math.hypot(x, y)
    const moving = len > 0.15
    if (this.seat) {
      // Sentada no se anda: pedir una dirección la levanta.
      if (!moving) {
        this.frame = { moving: false, delta }
        return
      }
      this.stand()
    }
    if (moving) {
      const scale = Math.min(1, len) / len
      body.setVelocity(x * scale * SPEED, y * scale * SPEED)
      this.facing = facingFor(x, y)
    } else {
      body.setVelocity(0, 0)
    }
    const step = advanceWalk(this.walk, moving, delta)
    this.princess.setFrame(frameName(this.facing, WALK_CYCLE[step]))
    this.frame = { moving, delta }
  }

  // La impresora pequeña ofrece una cosa u otra según el trabajo: usarla, ver cómo va o recoger la figura terminada.
  printerAction(id) {
    if (id !== 'printerMini') return id
    return this.printKind === 'done' ? 'printerCollect' : this.printKind === 'printing' ? 'printerBusy' : id
  }

  // Khalessi fuera de la caja se puede saludar donde esté: cerca de ella, y no solo ante la caja.
  catNear(px, py) {
    const cat = this.cat?.cat
    return Boolean(cat) && !cat.inBox && Math.hypot(px - cat.x, py - cat.y) < 22
  }

  // Lo que depende de dónde ha quedado la viajera va en `postupdate`, cuando la física ya movió el sprite
  // (mismo motivo que en el valle): la sombra, la profundidad, Lupe y qué hay cerca.
  settle() {
    const px = Math.round(this.princess.x)
    const py = Math.round(this.princess.y)
    if (!this.seat) {
      this.princess.setDepth(py)
      this.shadow.setPosition(this.princess.x, this.princess.y - 1)
    }
    if (this.frame) this.lupe.follow(this.frame.moving, px, py, this.frame.delta)
    if (this.atreus) faceTraveller(this.atreus, this.cat?.cat.giving ? this.cat.sprite : this.princess, facingFor)
    let id = null
    if (this.leaving) id = null
    else if (this.seat) id = this.seat.use ?? 'standup'
    else if (this.exitZone.contains(px, py)) id = EXIT_ID
    else if (this.room.home) id = this.catNear(px, py) ? 'khalessi' : this.printerAction(interactionAt(px, py))
    if (id !== this.near) {
      this.near = id
      this.game.events.emit('near', id)
    }
  }
}
