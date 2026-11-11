import Phaser from 'phaser'
import { PAL } from './palette.js'
import { ARRIVAL, BRIDGE, BUILDINGS, COLS, PROPS, ROWS, TILE, blockedWaterTiles, treePositions } from './world.js'
import { steppedZoom } from './viewport.js'
import { CHAIR, CHAIR_ZONE, DECK, FOOT, LUPE_SPOT, STAIRS, STAIR_PACE, climb, nearRoofDoor, nearTelescope } from './terrace.js'
import { DIRS, WALK_CYCLE, avatarSheet, frameName, frameRect, SHEET_POSES } from './avatar/index.js'
import { shadowSprite } from './sprites.js'
import { makeCanvas, wallRows } from './pixelKit.js'
import { petCanvas, petRestCanvas } from './pets/index.js'
import { createIdle, playOffset, takeSound, updateIdle } from './pets/idle.js'
import { bridgeAssets, buildingAssets, groundBase, groundSeasonJob, propAssets, treeAssets } from './worldAssets.js'
import SkyLayer from './SkyLayer.js'
import LitWindows from './litWindows.js'
import { advanceWalk, facingFor, inputVector } from './walk.js'
import { resumePoint } from './worldSave.js'
import { characterSheet } from './characters.js'
import ValleNpcs from './npc/ValleNpcs.js'
import GranNeighbours from './npc/GranNeighbours.js'
import { createValleNav } from './npc/valleNav.js'
import { getStory, updateStory } from './story/storyStore.js'
import { setTour, tourOnRoofEntry } from './story/story.js'
import { registerSheet } from './sheetTexture.js'
import { sitDown, standUp } from './sitting.js'
import { GAME_THEME_COLOR, GAME_THEME_FADE, themeName } from '../lib/gameTheme.js'

const SPEED = 90
// Lo máximo que cambia la altura de los pies por fotograma al entrar en la escalera: más que la pendiente de la rampa.
const CLIMB_EASE = 4
// Alto del cuerpo físico de la viajera: lo que separa sus pies del borde de lo que la frena.
const FEET_BODY = 4
// Las ventanas encendidas y la luz de las farolas.
const LIT_WINDOW = '#f8d77a'
const SEASONS = ['autumn', 'winter']
// Lo máximo que dura la entrada andando, por si algo la frena.
const ARRIVAL_MAX_MS = 6000

export default class ValleScene extends Phaser.Scene {
  constructor() {
    super('valle')
  }

  init(data) {
    this.look = data.look
    this.pet = data.pet
    this.pastel = !!data.pastel
    // Una partida guardada (`world`) reanuda su hora, su tiempo y su posición; sin ella, todo empieza de cero.
    this.seed = data.world?.seed ?? data.seed ?? Math.floor(Math.random() * 1e9)
    this.clock = data.world?.ms
    this.start = data.world ? resumePoint(data.world) : ARRIVAL
    // Una partida nueva entra andando por el arco del sur: hasta que llega, el teclado no mueve a la viajera.
    this.arriving = !data.world
    this.arrivingMs = 0
    this.near = null
    // Edificio en cuyo interior está la viajera: con él puesto el valle duerme y no atiende a nada.
    this.inside = null
    this.zoomSteps = 0
    this.terrace = null
    this.climbMode = 'ground'
    this.seat = null
    this.standFrom = null
    this.benches = []
    // Dibujos del escenario que dependen del tema (clave y cómo pedirlos al tema vigente): son los que se vuelven a registrar al cambiarlo.
    this.themed = []
    this.replaced = null
  }

  create() {
    this.physics.world.setBounds(0, 0, COLS * TILE, ROWS * TILE)
    this.sky = new SkyLayer(this, { seed: this.seed, clock: this.clock })
    this.buildTextures()
    this.buildGround()
    this.solids = []
    this.doors = []
    this.litWindows = []
    this.buildScenery()
    this.buildBuildings()
    this.buildProps()
    this.buildWater()
    this.buildCharacters()
    this.buildInput()

    const cam = this.cameras.main
    cam.setBounds(0, 0, COLS * TILE, ROWS * TILE)
    // Seguimiento sin retardo: con un lerp suave, al caminar en continuo el scroll fraccionario de la cámara y el
    // redondeo del sprite van desfasados y la viajera vibra 1 px. Pegada a ella, ambos redondean a la vez.
    cam.startFollow(this.princess, true, 1, 1)
    cam.centerOn(this.princess.x, this.princess.y)
    // El scroll no se redondea: el redondeo a píxel lo hace el renderizador (`roundPixels` del juego) igual para todo
    // lo que se dibuja. Si la cámara redondeaba aparte, a zoom 3 la viajera oscilaba hasta 1,5 px respecto al centro.
    cam.setRoundPixels(false)
    this.fitCamera()
    this.scale.on('resize', this.fitCamera, this)

    // Con un panel abierto, las teclas vuelven a la página (Enter y Espacio activan botones).
    const onLock = (_parent, locked) => {
      if (locked) this.input.keyboard.disableGlobalCapture()
      else {
        this.input.keyboard.enableGlobalCapture()
        // Lupe retoma lo que hacía al cerrarse el diálogo.
        this.npcs.onUnlock()
        this.neighbours.onUnlock()
      }
    }
    this.game.registry.events.on('changedata-locked', onLock)
    this.game.events.on('action', this.tryEnter, this)
    this.game.events.on('appearance', this.setAppearance, this)
    this.game.events.on('theme', this.onTheme, this)
    this.game.events.on('zoom', this.stepZoom, this)
    this.events.on('wake', this.onWake, this)
    this.input.on('wheel', this.onWheel, this)
    // Entrar al valle: un fundido corto desde el color de la página en lugar de un corte.
    cam.fadeIn(350, ...GAME_THEME_FADE[themeName(this.pastel)])
    this.events.once('shutdown', () => {
      this.events.off('wake', this.onWake, this)
      this.input.off('wheel', this.onWheel, this)
      this.scale.off('resize', this.fitCamera, this)
      this.game.registry.events.off('changedata-locked', onLock)
      this.game.events.off('action', this.tryEnter, this)
      this.game.events.off('appearance', this.setAppearance, this)
      this.game.events.off('theme', this.onTheme, this)
      this.game.events.off('zoom', this.stepZoom, this)
    })
  }

  // Lo que se guarda del valle: la hora del mundo y dónde está la viajera (ver worldSave.js).
  snapshot() {
    return { seed: this.seed, ms: Math.round(this.sky.clock()), x: Math.round(this.princess.x), y: Math.round(this.princess.y) }
  }

  fitCamera() {
    const { width, height } = this.scale
    // Con la página oculta el lienzo mide 0: no hay nada que ajustar. Dentro de un edificio la cámara y el zoom
    // que publica el registro son los de la sala; al volver, `onWake` ajusta de nuevo.
    if (!width || !height || this.inside) return
    // Los pasos de zoom del visitante se miden sobre el zoom de la pantalla: al girar el móvil se recortan a lo posible.
    const { zoom, steps, canIn, canOut } = steppedZoom(this.zoomSteps, width, height, COLS * TILE, ROWS * TILE)
    this.zoomSteps = steps
    this.cameras.main.setZoom(zoom)
    this.sky.resize()
    // React lee el estado del registro para activar o apagar los botones + y -.
    this.game.registry.set('zoom', { canIn, canOut })
  }

  // Acerca (+1) o aleja (-1) la vista un nivel entero.
  stepZoom(delta) {
    // Dentro de un edificio el zoom es el de la sala (lo gobierna `InteriorScene`).
    if (this.inside) return
    this.zoomSteps += delta
    this.fitCamera()
  }

  // Rueda del ratón: un nivel por gesto. Un trackpad o una rueda libre sueltan decenas de eventos por segundo, y
  // con un nivel por evento el zoom saltaría de un extremo a otro: se deja pasar uno cada 150 ms.
  onWheel(_pointer, _objects, _dx, dy) {
    if (this.inside || !dy || this.game.registry.get('locked')) return
    const now = performance.now()
    if (now - (this.lastWheel ?? 0) < 150) return
    this.lastWheel = now
    this.stepZoom(dy < 0 ? 1 : -1)
  }

  // Texturas
  addCanvas(key, canvas) {
    if (this.textures.exists(key)) this.textures.remove(key)
    this.textures.addCanvas(key, canvas)
    this.replaced?.add(key)
  }

  // Dibujo del escenario ya preparado en `worldAssets` (paleta pastel incluida): se registra con sus
  // versiones de otoño e invierno (`clave:autumn`, `clave:winter`), que se funden por encima según el
  // tiempo. La viajera, la mascota y las sombras no pasan por ahí y conservan su color.
  addPrepared(key, set) {
    this.addCanvas(key, set.base)
    SEASONS.forEach((season) => set[season] && this.addCanvas(`${key}:${season}`, set[season]))
  }

  // Un dibujo del escenario que cambia con el tema. `assetsOf()` lo pide al tema vigente (`this.pastel`), así que al
  // cambiarlo basta con volver a registrar todos los de `themed` (ver `applyTheme`).
  addThemed(key, assetsOf) {
    this.addPrepared(key, assetsOf())
    this.themed = this.themed.filter((entry) => entry.key !== key).concat({ key, assetsOf })
  }

  // La página avisa de un cambio de tema (Opciones) con el juego en marcha. Los dibujos nuevos ya están preparados
  // (`warmWorld` termina antes del aviso), así que el cambio es inmediato y la viajera no se mueve.
  onTheme(pastel) {
    if (!!pastel === this.pastel) return
    this.applyTheme(!!pastel)
  }

  // Cambia el tema sin reiniciar la escena: las texturas se vuelven a registrar con la misma clave y las imágenes ya
  // colocadas (suelo, árboles, edificios, estaciones...) apuntan a la nueva. Posición, hora, tiempo y personajes no se tocan.
  applyTheme(pastel) {
    this.pastel = pastel
    this.replaced = new Set()
    this.themed.forEach(({ key, assetsOf }) => this.addPrepared(key, assetsOf()))
    // Las estaciones del suelo que aún se estaban preparando se piden ya para el tema nuevo.
    this.groundPending = this.groundPending.map(([season]) => [season, groundSeasonJob(season, pastel)])
    this.children.list.forEach((child) => {
      const key = child.texture?.key
      if (key && this.replaced.has(key)) child.setTexture(key)
    })
    this.replaced = null
    this.cameras.main.setBackgroundColor(GAME_THEME_COLOR[themeName(pastel)])
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
      for (let pose = 0; pose < SHEET_POSES; pose++) {
        const { x, y, w, h } = frameRect(dir, pose)
        texture.add(frameName(dir, pose), 0, x, y, w, h)
      }
    })
    const previous = this.travellerKey
    this.travellerKey = key
    // Los interiores dibujan a la viajera con la misma hoja: se les avisa antes de que se borre la anterior.
    this.game.registry.set('travellerKey', key)
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
    // Las posturas de cuando se queda parada: sentada y, en los gatos, aseándose (dos fotogramas cada una).
    ;['sit', 'wash'].forEach((pose) => {
      if (pose === 'wash' && this.pet.kind !== 'gato') return
      ;[0, 1].forEach((step) => this.addCanvas(`pet-${pose}-${step}`, petRestCanvas(this.pet, pose, step)))
    })
    this.petIdle = createIdle()
    this.petStill = 0
    this.petOffset = { dx: 0, dy: 0 }
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
    ;[0, 1, 2].forEach((v) => this.addThemed(`tree-${v}`, () => treeAssets(v, this.pastel)))
    // Lupe, que acompaña a la viajera: la misma hoja del generador, compartida con los interiores.
    if (!this.textures.exists('npc-lupe')) registerSheet(this.textures, 'npc-lupe', characterSheet('lupe'))
    this.addCanvas('shadow', shadowSprite(14, 5))
    this.addCanvas('lamp-glow', lampGlowCanvas())
    this.addThemed('bridge', () => bridgeAssets(this.pastel))
  }

  // Para entrar solo hace falta la base del suelo. El otoño y el invierno se terminan de preparar mientras se
  // juega (porciones por fotograma, ver `advanceGroundSeasons`) y se añaden cuando están listos.
  buildGround() {
    this.addThemed('ground', () => ({ base: groundBase(this.pastel) }))
    this.placeScenery('ground', 0, 0, [0, 0], 0)
    this.groundPending = SEASONS.map((season) => [season, groundSeasonJob(season, this.pastel)])
  }

  // No se empieza hasta que la viajera ha terminado de subir por el camino: en un móvil, preparar las estaciones
  // durante esos primeros pasos la dejaba como a cámara lenta. En pantallas táctiles la porción es menor.
  advanceGroundSeasons() {
    if (!this.groundPending.length || this.arriving) return
    const budget = this.sys.game.device.input.touch ? 2 : 4
    const start = performance.now()
    while (this.groundPending.length && performance.now() - start < budget) {
      const [season, work] = this.groundPending[0]
      if (!work.step()) continue
      this.addThemed(`ground:${season}`, () => ({ base: groundSeasonJob(season, this.pastel).get() }))
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
      const { sprite, overlay } = buildingAssets(b, this.pastel)
      const key = `building-${b.id}`
      this.addThemed(key, () => buildingAssets(b, this.pastel).set)
      const px = b.door.x * TILE + TILE / 2 - sprite.doorCol
      const py = b.y * TILE
      // Cuerpo sólido: el muro del dibujo, del borde del tejado a su base. Arriba no puede quedarse en la mitad
      // baja (la viajera subiría al tejado y se ocultaría tras él) ni en el margen vacío del lienzo (muro
      // invisible). Abajo, el cuerpo de la viajera mide 4 px sobre sus pies: se resta para que los pies lleguen
      // justo a la base y no parezca que flota ante la fachada.
      const { top, bottom } = wallRows(sprite.canvas)
      const bodyTop = py + top
      const bodyBottom = py + bottom - FEET_BODY
      this.placeScenery(key, px, py, [0, 0], bodyBottom)
      if (b.terrace) {
        this.buildTerrace(px, py, bodyTop, bodyBottom, sprite.canvas.width)
        if (overlay) this.addFrontRail(key, overlay, px, py, () => buildingAssets(b, this.pastel).overlay.set)
      } else this.solid(px + 2, bodyTop, sprite.canvas.width - 4, bodyBottom - bodyTop)
      this.addLitWindows(`${key}:lit`, sprite, px, py, i / (BUILDINGS.length - 1))
      if (sprite.glow) this.addGlow(`${key}:glow`, sprite.glow, px, py, i / (BUILDINGS.length - 1))
      this.addDoor(b.id, b.door.x, b.door.y)
    })
  }

  // Escalera y cubierta de la casa: la viajera sube por ellas (ver `climb`). Los peldaños se pisan desde la franja
  // `FOOT`, así que bajo ellos el muro acaba antes que en el resto de la fachada. Una pared baja ante los peldaños
  // deja entrar solo por el primero, para que nadie aparezca a media altura. Mientras está arriba se dibuja por
  // encima del edificio, que en el suelo la taparía al quedar más al fondo.
  buildTerrace(px, py, bodyTop, bodyBottom, width) {
    this.terrace = { px, py, depth: bodyBottom + 1 }
    // La escalera solo se pisa por su primer peldaño, desde la izquierda: un muro corre por debajo de ella, del primer peldaño
    // a la casa, y otro cierra por arriba la franja de entrada (`FOOT`), sin dejar hueco ni por delante ni por detrás.
    this.solid(px + STAIRS.x, py + STAIRS.bottom + 1, DECK.left - STAIRS.x, 3)
    this.solid(px + STAIRS.x, bodyTop, DECK.left - STAIRS.x, py + FOOT.top - FEET_BODY - bodyTop)
    this.solid(px + DECK.left, bodyTop, width - DECK.left - 2, bodyBottom - bodyTop)
    this.addDeckChair(px, py)
  }

  // La silla de la cubierta se ocupa como un banco, pero sentada la viajera mira por el telescopio (`use`): el mismo
  // patrón que las sillas de los interiores. Se dibuja al nivel de la viajera sobre la cubierta, por delante de la casa y
  // por detrás de la barandilla.
  addDeckChair(px, py) {
    this.benches.push({
      id: 'chairDeck',
      deck: true,
      zone: new Phaser.Geom.Rectangle(px + CHAIR_ZONE.x, py + CHAIR_ZONE.y, CHAIR_ZONE.w, CHAIR_ZONE.h),
      seat: { x: px + CHAIR.x, y: py + CHAIR.base - 4, facing: 'down', depth: this.terrace.depth, use: 'telescope' },
    })
  }

  // Pasamanos de la escalera y barandilla delantera de la cubierta: una imagen aparte, un nivel por encima de la viajera
  // cuando está arriba, para que suba y ande por detrás de ellos. Quien anda por el suelo queda siempre más abajo.
  addFrontRail(key, overlay, px, py, setOf) {
    const railKey = `${key}:front`
    this.addThemed(railKey, setOf)
    this.placeScenery(railKey, px + overlay.x, py + overlay.y, [0, 0], this.terrace.depth + 1)
  }

  // Cambia entre suelo, escalera y cubierta: en el suelo chocan los edificios; arriba no, porque la cubierta
  // queda dentro de la silueta de la casa y se limita a su franja a mano.
  setClimbMode(mode) {
    this.climbMode = mode
    this.groundCollider.active = mode === 'ground'
    this.shadow.setDepth(mode === 'ground' ? 2 : this.terrace.depth - 1)
    // La primera vez que se sube a la cubierta, Lupe sale a saludar junto al telescopio y se va al terminar.
    if (mode === 'deck') this.npcs?.greetOnDeck({ x: this.terrace.px + LUPE_SPOT.x, y: this.terrace.py + LUPE_SPOT.y }, this.terrace.depth)
  }

  // Aplica la escalera y la cubierta a la posición ya movida de la viajera; devuelve si está en el suelo.
  applyTerrace() {
    const { px, py } = this.terrace
    const { princess } = this
    const next = climb(this.climbMode, princess.x - px, princess.y - py, this.stairColumn)
    if (next.mode !== this.climbMode) this.setClimbMode(next.mode)
    if (next.mode === 'ground') return true
    // Al subir al primer peldaño desde el suelo la altura se alcanza en unos fotogramas, no de golpe.
    const y = next.mode === 'stairs' ? princess.y + Math.max(-CLIMB_EASE, Math.min(CLIMB_EASE, py + next.y - princess.y)) : py + next.y
    const { x: beforeX, y: beforeY } = princess
    princess.setPosition(px + next.x, y)
    this.stairColumn = next.x
    // El cuerpo físico se alinea con la corrección y, en el eje donde ha topado con el límite, pierde la velocidad:
    // si no, la física la empuja contra el borde en cada fotograma y se la devuelve, y todo vibra.
    princess.body.updateFromGameObject()
    if (Math.abs(princess.x - beforeX) > 0.01) princess.body.setVelocityX(0)
    if (Math.abs(princess.y - beforeY) > 0.01) princess.body.setVelocityY(0)
    return false
  }

  addLitWindows(key, sprite, x, y, rank) {
    if (!sprite.windows.length) return
    if (this.textures.exists(key)) this.textures.remove(key)
    this.litWindows.push(new LitWindows(this, key, sprite, x, y, LIT_WINDOW))
    this.sky.addWindows(this.add.image(x, y, key).setOrigin(0, 0), rank)
  }

  // Luz cálida que las ventanas y las bombillas de un edificio echan a su alrededor. Se enciende con las mismas curvas
  // que las ventanas y se pinta por encima del oscurecimiento, así que de noche caldea la fachada, el suelo y a quien pase.
  addGlow(key, canvas, x, y, rank) {
    this.addCanvas(key, canvas)
    this.sky.addWindows(this.add.image(x, y, key).setOrigin(0, 0), rank)
  }

  // Puerta de un edificio o de un panel: acercarse la ofrece (`near`) y se entra con E, Espacio o el botón.
  addDoor(id, tx, ty) {
    this.doors.push({ id, rect: new Phaser.Geom.Rectangle(tx * TILE - 6, ty * TILE - 6, TILE + 12, TILE + 6) })
  }

  // Objetos sueltos: cada tipo se dibuja una vez y se coloca por su punto de apoyo.
  buildProps() {
    PROPS.forEach((prop) => {
      const key = `prop-${prop.kind}-${prop.variant ?? 0}`
      const { sprite } = propAssets(prop, this.pastel)
      if (!this.textures.exists(key)) this.addThemed(key, () => propAssets(prop, this.pastel).set)
      const px = prop.at[0] * TILE
      const py = prop.at[1] * TILE
      this.placeScenery(key, px, py, [0.5, 1], py)
      sprite.body.forEach(({ l, t, r, b }) => this.solid(px + l, py + t, r - l, b - t))
      if (sprite.glow) this.sky.addLamp(this.add.image(px + sprite.glow.dx, py + sprite.glow.dy, 'lamp-glow'))
      if (prop.zone) this.addDoor(prop.zone, prop.door.x, prop.door.y)
      if (prop.kind === 'bench') this.addBench(px, py)
    })
    this.placeScenery('bridge', BRIDGE.x * TILE, BRIDGE.y * TILE - 6, [0, 0], 1)
  }

  // Un banco se puede ocupar: desde delante sale «Sentarse». La viajera se sienta de frente, con la cadera en la tabla.
  addBench(px, py) {
    this.benches.push({
      id: `bench:${this.benches.length}`,
      zone: new Phaser.Geom.Rectangle(px - 18, py - 2, 36, 18),
      seat: { x: px, y: py - 5, facing: 'down', depth: py + 0.5 },
    })
  }

  // Arroyo: colisión por tramos de teselas contiguas de cada fila, y destellos lentos en el agua.
  buildWater() {
    const blocked = blockedWaterTiles()
    // Las filas con el mismo tramo se funden en un solo bloque: con una colisión por fila, al rozar el agua en
    // diagonal la viajera se enganchaba en las juntas entre bloques y se sacudía.
    const open = new Map()
    const close = (key) => {
      const { start, end, top, rows } = open.get(key)
      this.solid(start * TILE, top * TILE, (end - start) * TILE, rows * TILE)
      open.delete(key)
    }
    for (let y = 0; y <= ROWS; y++) {
      const runs = new Set()
      let start = null
      for (let x = 0; x <= COLS; x++) {
        const isWater = y < ROWS && blocked.has(`${x},${y}`)
        if (isWater && start === null) start = x
        if (!isWater && start !== null) {
          const key = `${start},${x}`
          runs.add(key)
          if (open.has(key)) open.get(key).rows++
          else open.set(key, { start, end: x, top: y, rows: 1 })
          start = null
        }
      }
      ;[...open.keys()].filter((key) => !runs.has(key)).forEach(close)
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
    const { x, y } = this.start
    this.shadow = this.add.image(x, y, 'shadow').setDepth(2)

    this.princess = this.physics.add.sprite(x, y, this.travellerKey, frameName('down', 0)).setOrigin(0.5, 1)
    this.princess.body.setSize(8, FEET_BODY).setOffset(5, 30)
    this.princess.setCollideWorldBounds(true)
    this.groundCollider = this.physics.add.collider(this.princess, this.solids)
    // Se registra después de la física, así que `settle` corre tras el `postupdate` que sincroniza el sprite.
    this.events.on('postupdate', this.settle, this)
    this.events.once('shutdown', () => this.events.off('postupdate', this.settle, this))

    // Lupe y Khalessi tienen vida propia: andan por los mismos caminos libres que la viajera (los cuerpos sólidos del mapa).
    const bodies = this.solids.map((body) => ({ x: body.x - body.width / 2, y: body.y - body.height / 2, w: body.width, h: body.height }))
    const travellerAt = () => ({ x: this.princess.x, y: this.princess.y })
    this.npcs = new ValleNpcs(this, createValleNav(bodies), travellerAt, () => this.companion && { x: this.companion.x, y: this.companion.y })
    // Ylonem y Grace viven junto al IES Gran Capitán; Lupe sale a presentárselos a la viajera la primera vez.
    this.neighbours = new GranNeighbours(this, bodies, travellerAt, this.npcs)
    this.buildPet(x, y)
    this.facing = this.arriving ? 'up' : 'down'
    this.walk = { timer: 0, step: 0 }
  }

  buildInput() {
    const kb = this.input.keyboard
    this.cursors = kb.createCursorKeys()
    this.keys = kb.addKeys('W,A,S,D,E,SPACE')
    const act = () => this.tryEnter()
    this.keys.E.on('down', act)
    this.keys.SPACE.on('down', act)
  }

  // Un edificio lleva a su interior; el telescopio y el buzón avisan a la página para abrir su panel.
  tryEnter() {
    if (this.inside || this.arriving || this.game.registry.get('locked') || !this.near) return
    if (this.near === 'standup') this.stand()
    else if (this.near === 'npc:lupe') this.npcs.talk()
    else if (this.near.startsWith('npc:')) this.neighbours.talk(this.near.slice('npc:'.length))
    else if (this.near.startsWith('bench:') || this.near === 'chairDeck') this.sit(this.benches.find((bench) => bench.id === this.near).seat)
    else if (this.near === 'telescope' && this.npcs.onDeck()) this.npcs.talkAtTelescope()
    else if (this.near === 'rooftopDoor') this.enterBuilding('about', 'deck')
    else if (BUILDINGS.some((b) => b.id === this.near)) this.enterBuilding(this.near)
    else this.game.events.emit('enter', this.near)
  }

  // Fundido a color de página, y el valle se duerme mientras la sala interior hace de escena.
  // `from` es 'deck' si se entra por la puerta de la cubierta: la sala sitúa a la viajera ante la escalera.
  enterBuilding(id, from) {
    this.inside = id
    this.near = null
    this.game.events.emit('near', null)
    this.princess.body.setVelocity(0, 0)
    const cam = this.cameras.main
    cam.once('camerafadeoutcomplete', () => {
      // Con una visita guiada en marcha, Lupe ya espera dentro y la lleva de parada en parada (ver `npc/homeTour.js`).
      // Por la puerta de la azotea también: si aún no ha hecho ni rechazado la visita, Lupe sale a recibirla dentro.
      const story = getStory(this.game)
      const home = id === 'about'
      const guided = home && (story.tour === 'accepted' || (from === 'deck' && tourOnRoofEntry(story)))
      if (guided && story.tour !== 'accepted') updateStory(this.game, (current) => setTour(current, 'accepted'))
      // Lupe vive en la casa: esté la visita en marcha o no, mientras la viajera está dentro no la hay fuera (y su visita al telescopio acaba).
      if (home) {
        this.npcs.cancelDeckVisit()
        this.npcs.goInside()
      }
      this.scene.launch('interior', { building: BUILDINGS.find((b) => b.id === id), pastel: this.pastel, from, guided })
      this.scene.sleep()
    })
    cam.fadeOut(220, ...GAME_THEME_FADE[themeName(this.pastel)])
  }

  sit(seat) {
    this.seat = seat
    this.facing = seat.facing
    this.standFrom = sitDown(this.princess, this.shadow, seat)
  }

  // Se levanta donde estaba antes de sentarse.
  stand() {
    standUp(this.princess, this.shadow, this.standFrom)
    this.seat = null
    this.standFrom = null
  }

  // Al volver la viajera sigue ante la puerta, mirando al camino, salvo si sube por la escalera de la casa (`to: 'deck'`):
  // entonces aparece en la cubierta, junto al telescopio. Las teclas soltadas durante el sueño no llegaron a
  // registrarse: se reinician, o seguirían "pulsadas" y echaría a andar sola.
  onWake(_sys, data) {
    this.inside = null
    this.input.keyboard.resetKeys()
    if (data?.to === 'deck' && this.terrace) this.placeOnDeck()
    else {
      // Si se entró por la puerta de la cubierta, se sale por la de la calle: de vuelta al suelo, ante ella.
      if (this.climbMode !== 'ground') this.placeAtFrontDoor()
      this.facing = 'down'
      this.princess.setFrame(frameName('down', 0))
    }
    // Al salir de la casa, Lupe vuelve a su sitio fuera; si había visita en marcha queda hecha o pendiente según hasta dónde llegó.
    if (data?.home) this.npcs.leaveHome()
    this.fitCamera()
    this.cameras.main.fadeIn(250, ...GAME_THEME_FADE[themeName(this.pastel)])
  }

  // Coloca a la viajera junto a la puerta de la derecha de la cubierta, mirando hacia la izquierda, como quien acaba de salir
  // de la casa. Es un punto de entrada propio: la escalera de la calle sigue entrando por el pie de los peldaños.
  placeOnDeck() {
    const { px, py } = this.terrace
    this.setClimbMode('deck')
    this.princess.setPosition(px + DECK.right - 18, py + DECK.feet)
    this.princess.body.updateFromGameObject()
    this.princess.body.setVelocity(0, 0)
    this.facing = 'left'
    this.princess.setFrame(frameName('left', 0))
    this.near = null
  }

  placeAtFrontDoor() {
    const { rect: door } = this.doors.find((d) => d.id === 'about')
    this.setClimbMode('ground')
    this.princess.setPosition(door.x + door.width / 2, door.y + door.height)
    this.princess.body.updateFromGameObject()
  }

  // Bucle
  update(time, delta) {
    if (this.inside) return
    const locked = this.game.registry.get('locked')
    const body = this.princess.body
    let vx = 0
    let vy = 0

    // Lupe y Khalessi siguen a lo suyo aunque la viajera esté sentada o leyendo.
    this.npcs.update(delta, locked, this.climbMode === 'deck')
    this.neighbours.update(delta, locked)

    if (this.arriving) {
      // Sube por el camino sola. Si algo la frena (o la página estuvo oculta) no se queda atascada: el tiempo manda.
      this.arrivingMs += delta
      if (this.princess.y <= ARRIVAL.stopY || this.arrivingMs > ARRIVAL_MAX_MS) this.arriving = false
      else vy = -1
    } else if (!locked) {
      const move = inputVector(this.cursors, this.keys, this.game.registry.get('joy') || undefined)
      vx = move.x
      vy = move.y
    }
    // Sentada no se anda: pedir una dirección la levanta.
    if (this.seat) {
      if (Math.hypot(vx, vy) <= 0.15) {
        this.frame = { moving: false, delta }
        this.sky.update(time)
        return
      }
      this.stand()
    }

    const len = Math.hypot(vx, vy)
    const moving = len > 0.15
    if (moving) {
      const scale = Math.min(1, len) / len
      const speed = this.climbMode === 'stairs' ? SPEED * STAIR_PACE : SPEED
      body.setVelocity(vx * scale * speed, vy * scale * speed)
      this.facing = facingFor(vx, vy)
    } else {
      body.setVelocity(0, 0)
    }

    advanceWalk(this.walk, moving, delta)
    this.princess.setFrame(frameName(this.facing, WALK_CYCLE[this.walk.step]))
    this.frame = { moving, delta }

    this.sky.update(time)
    this.advanceGroundSeasons()
  }

  // Lo que depende de dónde ha quedado la viajera se hace en `postupdate`, cuando Phaser ya ha pasado el avance de
  // la física al sprite. En `update` el sprite aún tiene la posición del fotograma anterior: corregirla ahí
  // (escalera, cubierta) borraba el paso que acababa de dar la física y la viajera se quedaba clavada.
  settle() {
    if (!this.frame || this.inside) return
    if (this.seat) {
      // Sentada en la silla de la cubierta se puede usar el telescopio; levantarse es pedir una dirección.
      const use = this.seat.use ?? 'standup'
      if (this.near !== use) {
        this.near = use
        this.game.events.emit('near', use)
      }
      return
    }
    const { moving, delta } = this.frame
    // En la escalera la franja sube con los peldaños, pero se anda por toda su anchura.
    const onGround = !this.terrace || this.applyTerrace()

    const px = Math.round(this.princess.x)
    const py = Math.round(this.princess.y)
    this.princess.setDepth(onGround ? py : this.terrace.depth)
    // La sombra usa la misma posición sin redondear que el sprite: si no, se desfasa de él al caminar.
    this.shadow.setPosition(this.princess.x, this.princess.y - 1)
    // Los cristales encendidos van por encima de todo: se recortan las siluetas de la viajera y de cuantos andan por el valle.
    const cutters = [this.princess, this.companion, ...this.npcs.sprites(), ...this.neighbours.sprites()]
    this.litWindows.forEach((lit) => lit.update(cutters))

    // La mascota espera al pie de la escalera: no sabe subir y se perdería tras la pared.
    if (this.companion) this.followPet(moving && onGround, px, py, delta)
    this.checkDoors(px, py, onGround)
  }

  followPet(moving, px, py, delta) {
    const pet = this.companion
    // Se quita el desplazamiento de los saltitos del fotograma anterior: el seguimiento cuenta con la posición real.
    pet.x -= this.petOffset.dx
    pet.y -= this.petOffset.dy
    this.petOffset = { dx: 0, dy: 0 }
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
      pet.setTexture(`pet-${this.walk.step % 2}`)
      this.petStill = 0
    } else {
      this.petStill = moving ? 0 : this.petStill + delta
      this.restPet(pet, delta)
    }
    pet.setDepth(Math.round(pet.y))
    const bodyShift = Math.round(this.petWidth * 0.12) * (pet.flipX ? 1 : -1)
    this.petShadow.setPosition(pet.x + bodyShift, pet.y - this.petOffset.dy - 1)
  }

  // La mascota parada hace lo suyo (ver `pets/idle.js`). Ante Khalessi, que se acerca a conocerla, se sienta a mirarla y luego juega.
  restPet(pet, delta) {
    const meet = this.npcs.petCue()
    const forced = meet?.phase === 'sniff' ? 'sit' : meet?.phase === 'play' ? 'play' : null
    const idle = updateIdle(this.petIdle, delta, { still: this.petStill, kind: this.pet.kind, forced })
    if (meet) pet.setFlipX(meet.x < pet.x)
    if (takeSound(idle)) this.game.events.emit('pet-sound', this.pet.kind, this.pet.breed)
    const beat = Math.floor(idle.t / (idle.pose === 'wash' ? 220 : 480)) % 2
    if (idle.pose === 'sit' || idle.pose === 'meow') pet.setTexture(`pet-sit-${beat}`)
    else if (idle.pose === 'wash') pet.setTexture(`pet-wash-${beat}`)
    else if (idle.pose === 'play') {
      const { dx, dy, face } = playOffset(idle.t)
      this.petOffset = { dx, dy }
      pet.x += dx
      pet.y += dy
      if (!meet) pet.setFlipX(face === 'left')
      pet.setTexture(`pet-${Math.floor(idle.t / 160) % 2}`)
    } else pet.setTexture('pet-0')
  }

  checkDoors(px, py, onGround) {
    // Lupe, si está al lado, tiene prioridad sobre una puerta cercana: hablar con ella es lo que se espera junto a su casa. Salvo si
    // la viajera ya eligió ir por su cuenta: ante la puerta, E entra; para hablar con ella basta apartarse un paso.
    const hit = this.doors.find((d) => d.rect.contains(px, py))
    const ownWay = hit && getStory(this.game).tour !== 'accepted'
    if (onGround && !ownWay && this.npcs.canTalk(px, py)) {
      if (this.near !== 'npc:lupe') {
        this.near = 'npc:lupe'
        this.game.events.emit('near', 'npc:lupe')
      }
      return
    }
    // El telescopio se usa con E, no al pisarlo: solo cuenta como "cerca" para ofrecerlo.
    const chair = !hit && this.climbMode === 'deck' && this.benches.find((b) => b.deck && b.zone.contains(this.princess.x, this.princess.y))
    const atScope = !hit && !chair && this.terrace && nearTelescope(this.climbMode, this.princess.x - this.terrace.px, this.princess.y - this.terrace.py)
    const atRoofDoor = !hit && !chair && !atScope && this.terrace && nearRoofDoor(this.climbMode, this.princess.x - this.terrace.px, this.princess.y - this.terrace.py)
    const bench = chair || (!hit && !atScope && !atRoofDoor && this.benches.find((b) => !b.deck && b.zone.contains(px, py)))
    // Ylonem y Grace se atienden desde fuera de la puerta: ante ella, E entra.
    const neighbour = !hit && onGround && this.neighbours.talkTarget(px, py)
    const id = hit ? hit.id : neighbour ? `npc:${neighbour}` : atScope ? 'telescope' : atRoofDoor ? 'rooftopDoor' : bench ? bench.id : null
    if (id !== this.near) {
      this.near = id
      this.game.events.emit('near', id)
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
