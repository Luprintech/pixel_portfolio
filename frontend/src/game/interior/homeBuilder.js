// Monta la casa de Lupe en una escena de Phaser: muebles (con su profundidad, sus colisiones y sus animaciones), a Atreus y a
// Khalessi. La escena (`InteriorScene.js`) solo le pasa a quien se mueve y recibe los cuerpos sólidos; aquí no hay
// lógica de movimiento ni de diálogos.
import { khalessiCanvas, khalessiEatCanvas, khalessiSitCanvas, khalessiSleepCanvas } from '../pets/index.js'
import { makeCanvas, rect } from '../pixelKit.js'
import { prefersReducedMotion } from '../../lib/reducedMotion.js'
import { atreusBlink, atreusSheet } from './atreusSheet.js'
import { buildNpcSprite } from './npcSprite.js'
import { buildExclamation } from '../npc/exclaim.js'
import { FURNITURE, framesOf, furnitureCanvas, solidsOf } from './furniture/index.js'
import { attachTvArt } from './tvArt.js'
import { catDepth, createCat, updateCat } from './catBrain.js'
import { ATREUS_BODY, FURNITURE_PLAN, NPC_PLAN } from './homeLayout.js'
import { sardineCanvas } from './sardine.js'

const addCanvas = (scene, key, canvas) => {
  if (!scene.textures.exists(key)) scene.textures.addCanvas(key, canvas)
}

const furnitureKey = (kind, frame, pastel) => `furn:${kind}:${frame}:${pastel}`

// Muebles: una imagen por pieza, con la base como origen y esa fila como profundidad (quien pase por delante, tapa; por
// detrás, queda tapado). Los que tienen fotogramas cambian de textura con su propio temporizador, salvo con movimiento reducido.
// Registra los fotogramas de todos los muebles para un tema (si ya están, no se repiten).
function registerFurniture(scene, pastel, plan = FURNITURE_PLAN) {
  plan.forEach((piece) => {
    for (let f = 0; f < framesOf(piece.kind); f++) addCanvas(scene, furnitureKey(piece.kind, f, pastel), furnitureCanvas(piece.kind, f, pastel))
  })
}

// Con la viajera dentro, el tema cambia sin reiniciar la sala: los muebles pasan a las texturas del tema nuevo en el
// fotograma en que estaban. Las animaciones leen `scene.pastel` en cada cambio, así que siguen sin cortarse.
export function rethemeFurniture(scene) {
  registerFurniture(scene, scene.pastel, scene.room.plan?.furniture ?? FURNITURE_PLAN)
  scene.children.list.forEach((child) => {
    const match = child.texture?.key.match(/^furn:(.+):(\d+):(?:true|false)$/)
    if (match) child.setTexture(furnitureKey(match[1], Number(match[2]), scene.pastel))
  })
}

// Coloca los muebles de un plano (el de la casa o el de otra sala con plano propio) y devuelve los que tienen modos.
export function placeFurniture(scene, plan, pastel, addSolid) {
  const still = prefersReducedMotion()
  registerFurniture(scene, pastel, plan)
  // Muebles con modos (la tele, la minicadena, la impresora pequeña): se devuelven para que la sala los cambie.
  const switches = {}
  plan.forEach((piece) => {
    const frames = framesOf(piece.kind)
    const sprite = scene.add.image(piece.x, piece.y, furnitureKey(piece.kind, 0, pastel)).setOrigin(0.5, 1).setDepth(piece.y + (piece.dz ?? 0))
    if (FURNITURE[piece.kind].modes) {
      switches[piece.kind] = modeFor(scene, sprite, piece.kind, still)
    } else if (frames > 1 && !still) {
      // El orden de los fotogramas es el del dibujo salvo que el mueble declare su propia secuencia (las impresoras repiten
      // unos y se detienen en otros).
      const order = FURNITURE[piece.kind].sequence ?? Array.from({ length: frames }, (_, i) => i)
      let step = 0
      // Cada pieza empieza en un punto distinto del ciclo para que los monitores no parpadeen todos a la vez.
      const offset = Math.round(piece.x) % order.length
      scene.time.addEvent({
        delay: FURNITURE[piece.kind].ms,
        loop: true,
        callback: () => {
          step = (step + 1) % order.length
          sprite.setTexture(furnitureKey(piece.kind, order[(step + offset) % order.length], scene.pastel))
        },
      })
    }
    solidsOf(piece).forEach(addSolid)
  })
  return switches
}

// Modos de un mueble (`modes` en el catálogo): cada uno es una lista de fotogramas que se alternan cada `ms`, o uno solo
// si no hay animación. `set(modo)` cambia de modo; `mode` es el actual. El primero que declara el mueble es el de partida.
function modeFor(scene, sprite, kind, still) {
  const { modes, ms } = FURNITURE[kind]
  let mode = Object.keys(modes)[0]
  let timer = null
  const show = (frame) => sprite.setTexture(furnitureKey(kind, frame, scene.pastel))
  const api = {
    get mode() {
      return mode
    },
    get on() {
      return mode !== Object.keys(modes)[0]
    },
    // Recorre en bucle unos fotogramas concretos (la impresora pequeña enseña los movimientos de la capa en curso) y avisa
    // de cada uno con `onFrame`, así el sonido va al ritmo de lo que se ve. Con movimiento reducido enseña solo el primero.
    playFrames(frames, onFrame) {
      mode = 'printing'
      timer?.remove()
      timer = null
      let i = 0
      const showNext = () => {
        show(frames[i])
        onFrame?.(frames[i])
      }
      showNext()
      if (frames.length < 2 || still) return
      timer = scene.time.addEvent({ delay: ms, loop: true, callback: () => { i = (i + 1) % frames.length; showNext() } })
    },
    set(next) {
      if (!modes[next]) return
      mode = next
      timer?.remove()
      timer = null
      const frames = modes[next]
      // Un modo `once` recorre sus fotogramas una vez y se queda en el último; con movimiento reducido enseña directamente el último.
      const once = FURNITURE[kind].once?.includes(next)
      show(once && still ? frames[frames.length - 1] : frames[0])
      if (frames.length < 2 || still) return
      let i = 0
      timer = scene.time.addEvent({
        delay: ms,
        loop: !once,
        repeat: once ? frames.length - 2 : 0,
        callback: () => show(frames[once ? ++i : (i = (i + 1) % frames.length)]),
      })
    },
  }
  show(modes[mode][0])
  return api
}

// Atreus: su hoja (con cascos y taza) y su cuerpo sólido, sobre el idle común de los personajes quietos (`npcSprite.js`).
const buildAtreus = (scene, plan, addSolid) =>
  buildNpcSprite(scene, { key: 'npc-atreus', sheet: atreusSheet, blink: atreusBlink, plan, body: ATREUS_BODY }, addSolid)

// La sardina según lo que haga la gata: en el suelo (con meneo si juega), subiendo a la boca al cogerla con un saltito, en la boca
// mientras la lleva, o cayendo al suelo al soltarla. La boca está en el lado al que mira.
const lerp = (a, b, t) => a + (b - a) * t

function placeToy(toy, cat, flip, beat) {
  const mouth = { x: cat.x + (flip ? -10 : 10), y: cat.y - 3 }
  const arc = (t) => -5 * Math.sin(Math.PI * t)
  let x = cat.toy.x
  let y = cat.toy.y
  let angle = 0
  if (cat.toyPhase === 'lifting') {
    x = lerp(cat.toy.x, mouth.x, cat.toyT)
    y = lerp(cat.toy.y, mouth.y, cat.toyT) + arc(cat.toyT)
    angle = flip ? -25 * cat.toyT : 25 * cat.toyT
  } else if (cat.toyPhase === 'carried') {
    x = mouth.x
    y = mouth.y + (beat ? 1 : 0)
    angle = flip ? -10 : 10
  } else if (cat.toyPhase === 'dropping') {
    x = lerp(mouth.x, cat.toy.x, cat.toyT)
    y = lerp(mouth.y, cat.toy.y, cat.toyT) + arc(cat.toyT)
    angle = (flip ? -1 : 1) * 40 * cat.toyT
  } else if (cat.pose === 'play') {
    x += beat ? 2 : -2
    angle = beat ? 12 : -12
  }
  toy.setPosition(x, y).setDepth(Math.round(Math.max(y, cat.toyPhase === 'ground' ? y : cat.y + 1))).setFlipX(flip).setAngle(angle)
}

// Fotograma de Khalessi según su pose (la gata del dibujo mira a la derecha: se refleja al mirar a la izquierda). Mientras gira se
// ve compacta (sentada). `tick` es el tiempo en milisegundos.
function khalessiFrame(cat, tick) {
  const beat = Math.floor(tick / 220) % 2
  if (cat.turning > 0) return 'npc-khalessi-sit-0'
  switch (cat.pose) {
    case 'walk':
      return `npc-khalessi-walk-${beat}`
    case 'play':
    case 'grab':
    case 'give':
    case 'drop':
      return `npc-khalessi-walk-${Math.floor(tick / 160) % 2}`
    case 'scratch':
      return `npc-khalessi-walk-${Math.floor(tick / 110) % 2}`
    case 'eat':
      return `npc-khalessi-eat-${Math.floor(tick / 500) % 2}`
    case 'wash':
      return `npc-khalessi-wash-${beat}`
    case 'sleep':
      return `npc-khalessi-sleep-${Math.floor(tick / 1400) % 2}`
    default:
      return `npc-khalessi-sit-${Math.floor(tick / 800) % 2}`
  }
}

// Khalessi (ver `catBrain.js`): pasea, come, usa el arenero, se asea, rasca, duerme en su caja y le lleva la sardina a
// Atreus. Se dibuja con la profundidad de su fila (o justo sobre el mueble en que está subida o metida) y con la altura del salto.
// `onMeow(variante)` avisa de cada maullido. Con «reducir movimiento» se queda dormida en su caja.
function buildKhalessi(scene, onMeow) {
  ;[0, 1].forEach((step) => {
    addCanvas(scene, `npc-khalessi-sit-${step}`, khalessiSitCanvas(false, step))
    addCanvas(scene, `npc-khalessi-wash-${step}`, khalessiSitCanvas(true, step))
    addCanvas(scene, `npc-khalessi-walk-${step}`, khalessiCanvas(step, step))
    addCanvas(scene, `npc-khalessi-eat-${step}`, khalessiEatCanvas(step))
    addCanvas(scene, `npc-khalessi-sleep-${step}`, khalessiSleepCanvas(step))
  })
  addCanvas(scene, 'npc-sardine', sardineCanvas())
  const cat = createCat()
  const sprite = scene.add.image(cat.x, cat.y - cat.z, 'npc-khalessi-sleep-0').setOrigin(0.5, 1).setDepth(catDepth(cat))
  const toy = scene.add.image(0, 0, 'npc-sardine').setOrigin(0.5, 1)
  const brain = { cat, sprite, toy }
  toy.setPosition(cat.toy.x, cat.toy.y).setDepth(cat.toy.y)
  if (prefersReducedMotion()) return brain
  let tick = 0
  const onUpdate = (_time, delta) => {
    tick += delta
    updateCat(cat, delta).forEach((event) => onMeow(event.variant))
    const flip = cat.face === 'left'
    sprite.setTexture(khalessiFrame(cat, tick)).setFlipX(flip)
    sprite.setPosition(cat.x, cat.y - cat.z).setDepth(catDepth(cat))
    placeToy(toy, cat, flip, Math.floor(tick / 220) % 2)
  }
  scene.events.on('update', onUpdate)
  scene.events.once('shutdown', () => scene.events.off('update', onUpdate))
  return brain
}

// Exclamación discreta sobre Atreus mientras no se haya hablado con él: avisa de una conversación opcional.
const buildAtreusExclamation = (scene, atreus) => buildExclamation(scene, () => ({ x: atreus.sprite.x, y: atreus.sprite.y - 38 }))

// Aviso sobre la impresora pequeña cuando la figura está lista: una exclamación verde (el color de la marca) que sube y baja
// sobre la máquina. Empieza oculta; la escena la enseña mientras haya algo que recoger.
function buildPrintMark(scene) {
  if (!scene.textures.exists('print-exclaim')) {
    const canvas = makeCanvas(9, 14)
    const g = canvas.getContext('2d')
    rect(g, 1, 0, 7, 10, '#1c1b3a')
    rect(g, 2, 1, 5, 8, '#00ae42')
    rect(g, 3, 2, 1, 5, '#b8f5c8')
    rect(g, 1, 11, 7, 3, '#1c1b3a')
    rect(g, 3, 11, 3, 2, '#00ae42')
    scene.textures.addCanvas('print-exclaim', canvas)
  }
  const printer = FURNITURE_PLAN.find((piece) => piece.kind === 'printerMini')
  const mark = scene.add.image(printer.x, printer.y - FURNITURE.printerMini.h - 10, 'print-exclaim').setDepth(9999).setVisible(false)
  if (!prefersReducedMotion()) scene.tweens.add({ targets: mark, y: mark.y - 3, duration: 450, yoyo: true, repeat: -1 })
  return mark
}

// Monta todo y devuelve a Atreus y la exclamación para que la escena los gobierne. `addSolid(rect)` registra un cuerpo
// sólido en la escena y `onMeow(variante)` recibe los maullidos de la gata.
export function buildHome(scene, pastel, addSolid, onMeow = () => {}) {
  const switches = placeFurniture(scene, FURNITURE_PLAN, pastel, addSolid)
  attachTvArt(scene, switches.tvUnit, FURNITURE_PLAN.find((piece) => piece.kind === 'tvUnit'))
  const atreusPlan = NPC_PLAN.find((npc) => npc.id === 'atreus')
  const atreus = buildAtreus(scene, atreusPlan, addSolid)
  const khalessi = buildKhalessi(scene, onMeow)
  return { atreus, exclamation: buildAtreusExclamation(scene, atreus), switches, khalessi, printMark: buildPrintMark(scene) }
}
