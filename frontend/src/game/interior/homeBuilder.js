// Monta la casa de Lupe en una escena de Phaser: muebles (con su profundidad, sus colisiones y sus animaciones), a Atreus y a
// Khalessi. La escena (`InteriorScene.js`) solo le pasa a quien se mueve y recibe los cuerpos sólidos; aquí no hay
// lógica de movimiento ni de diálogos.
import { DIRS, POSES, frameName, frameRect } from '../avatar/index.js'
import { khalessiCanvas, khalessiSitCanvas } from '../pets/index.js'
import { makeCanvas, rect } from '../pixelKit.js'
import { prefersReducedMotion } from '../../lib/reducedMotion.js'
import { atreusBlink, atreusSheet } from './atreusSheet.js'
import { FURNITURE, framesOf, furnitureCanvas, solidsOf } from './furniture/index.js'
import { createCat, updateCat } from './catBrain.js'
import { ATREUS_BODY, FURNITURE_PLAN, NPC_PLAN } from './homeLayout.js'
import { sardineCanvas } from './sardine.js'

const addCanvas = (scene, key, canvas) => {
  if (!scene.textures.exists(key)) scene.textures.addCanvas(key, canvas)
}

const furnitureKey = (kind, frame, pastel) => `furn:${kind}:${frame}:${pastel}`

// Muebles: una imagen por pieza, con la base como origen y esa fila como profundidad (quien pase por delante, tapa; por
// detrás, queda tapado). Los que tienen fotogramas cambian de textura con su propio temporizador, salvo con movimiento reducido.
function buildFurniture(scene, pastel, addSolid) {
  const still = prefersReducedMotion()
  // Muebles con modos (la tele, la minicadena, la impresora pequeña): se devuelven para que la sala los cambie.
  const switches = {}
  FURNITURE_PLAN.forEach((piece) => {
    const frames = framesOf(piece.kind)
    for (let f = 0; f < frames; f++) addCanvas(scene, furnitureKey(piece.kind, f, pastel), furnitureCanvas(piece.kind, f, pastel))
    const sprite = scene.add.image(piece.x, piece.y, furnitureKey(piece.kind, 0, pastel)).setOrigin(0.5, 1).setDepth(piece.y + (piece.dz ?? 0))
    if (FURNITURE[piece.kind].modes) {
      switches[piece.kind] = modeFor(scene, sprite, piece.kind, pastel, still)
    } else if (frames > 1 && !still) {
      let frame = 0
      // Cada pieza empieza en un punto distinto del ciclo para que los monitores no parpadeen todos a la vez.
      const offset = Math.round(piece.x) % frames
      scene.time.addEvent({
        delay: FURNITURE[piece.kind].ms,
        loop: true,
        callback: () => {
          frame = (frame + 1) % frames
          sprite.setTexture(furnitureKey(piece.kind, (frame + offset) % frames, pastel))
        },
      })
    }
    solidsOf(piece).forEach(addSolid)
  })
  return switches
}

// Modos de un mueble (`modes` en el catálogo): cada uno es una lista de fotogramas que se alternan cada `ms`, o uno solo
// si no hay animación. `set(modo)` cambia de modo; `mode` es el actual. El primero que declara el mueble es el de partida.
function modeFor(scene, sprite, kind, pastel, still) {
  const { modes, ms } = FURNITURE[kind]
  let mode = Object.keys(modes)[0]
  let timer = null
  const show = (frame) => sprite.setTexture(furnitureKey(kind, frame, pastel))
  const api = {
    get mode() {
      return mode
    },
    get on() {
      return mode !== Object.keys(modes)[0]
    },
    // Enseña un fotograma concreto del modo actual sin animar (la impresora pequeña sigue el avance de la pantalla).
    showFrame(frame) {
      mode = 'printing'
      timer?.remove()
      timer = null
      show(frame)
    },
    set(next) {
      if (!modes[next]) return
      mode = next
      timer?.remove()
      timer = null
      const frames = modes[next]
      show(frames[0])
      if (frames.length < 2 || still) return
      let i = 0
      timer = scene.time.addEvent({ delay: ms, loop: true, callback: () => show(frames[(i = (i + 1) % frames.length)]) })
    },
  }
  show(modes[mode][0])
  return api
}

// Hoja de sprites de Atreus: la misma rejilla que la viajera, con un fotograma por pose y dirección.
function addAtreusSheet(scene) {
  if (scene.textures.exists('npc-atreus')) return
  const texture = scene.textures.addCanvas('npc-atreus', atreusSheet())
  DIRS.forEach((dir) => {
    for (let pose = 0; pose < POSES; pose++) {
      const { x, y, w, h } = frameRect(dir, pose)
      texture.add(frameName(dir, pose), 0, x, y, w, h)
    }
  })
  scene.textures.addCanvas('npc-atreus-blink', atreusBlink())
}

// Idle de Atreus: parpadea de vez en cuando y se vuelve hacia quien se acerca. Devuelve lo que la escena necesita para
// girarlo y para colocarle encima la exclamación de "quiere hablar".
function buildAtreus(scene, plan, addSolid) {
  addAtreusSheet(scene)
  const sprite = scene.add.sprite(plan.x, plan.y, 'npc-atreus', frameName(plan.facing, 0)).setOrigin(0.5, 1).setDepth(plan.y)
  scene.add.image(plan.x, plan.y - 1, 'shadow').setDepth(2)
  addSolid({ x: plan.x + ATREUS_BODY.l, y: plan.y + ATREUS_BODY.t, w: ATREUS_BODY.r - ATREUS_BODY.l, h: ATREUS_BODY.b - ATREUS_BODY.t })
  const atreus = { sprite, facing: plan.facing }
  if (!prefersReducedMotion()) {
    const blink = () => {
      scene.time.delayedCall(2600 + Math.random() * 2600, () => {
        if (atreus.facing === 'down') sprite.setTexture('npc-atreus-blink')
        scene.time.delayedCall(140, () => {
          sprite.setTexture('npc-atreus', frameName(atreus.facing, 0))
          blink()
        })
      })
    }
    blink()
  }
  return atreus
}

// La sardina según lo que haga la gata: en el suelo (con meneo si juega), subiendo a la boca al cogerla con un saltito, en la boca
// mientras la lleva, o cayendo a los pies de Atreus al dársela. La boca está en el lado al que mira.
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

// Khalessi (ver `catBrain.js`): descansa en su caja, sale a jugar con su sardina de peluche, se la lleva en la boca a Atreus
// y la deja a sus pies maullando. Va entre las dos capas de la caja mientras está dentro y, fuera, con la profundidad de su fila.
// `onMeow(variante)` avisa de cada maullido. Con «reducir movimiento» se queda sentada en la caja.
function buildKhalessi(scene, plan, onMeow) {
  ;[0, 1].forEach((step) => {
    addCanvas(scene, `npc-khalessi-sit-${step}`, khalessiSitCanvas(false, step))
    addCanvas(scene, `npc-khalessi-wash-${step}`, khalessiSitCanvas(true, step))
    addCanvas(scene, `npc-khalessi-walk-${step}`, khalessiCanvas(step, step))
  })
  addCanvas(scene, 'npc-sardine', sardineCanvas())
  const sprite = scene.add.image(plan.x, plan.y - 3, 'npc-khalessi-sit-0').setOrigin(0.5, 1).setDepth(plan.y)
  const toy = scene.add.image(0, 0, 'npc-sardine').setOrigin(0.5, 1)
  const cat = createCat()
  const brain = { cat, sprite, toy }
  toy.setPosition(cat.toy.x, cat.toy.y).setDepth(cat.toy.y)
  if (prefersReducedMotion()) return brain
  let tick = 0
  const onUpdate = (_time, delta) => {
    tick += delta
    updateCat(cat, delta).forEach((event) => onMeow(event.variant))
    const beat = Math.floor(tick / 220) % 2
    // La gata del dibujo mira a la derecha: se refleja al mirar a la izquierda. Mientras gira se ve compacta (sentada).
    const flip = cat.face === 'left'
    let key = `npc-khalessi-sit-${Math.floor(tick / 800) % 2}`
    if (cat.turning > 0) key = 'npc-khalessi-sit-0'
    else if (cat.pose === 'walk') key = `npc-khalessi-walk-${beat}`
    else if (cat.pose === 'play' || cat.pose === 'grab' || cat.pose === 'give') key = `npc-khalessi-walk-${Math.floor(tick / 160) % 2}`
    else if (cat.inBox && Math.floor(tick / 800) % 8 >= 5) key = `npc-khalessi-wash-${beat}`
    sprite.setTexture(key).setFlipX(flip)
    sprite.setPosition(cat.x, cat.inBox ? cat.y - 3 : cat.y).setDepth(cat.inBox ? plan.y : Math.round(cat.y))
    placeToy(toy, cat, flip, beat)
  }
  scene.events.on('update', onUpdate)
  scene.events.once('shutdown', () => scene.events.off('update', onUpdate))
  return brain
}

// Exclamación discreta sobre Atreus mientras no se haya hablado con él: avisa de una conversación opcional.
function buildExclamation(scene, atreus) {
  if (!scene.textures.exists('npc-exclaim')) {
    const canvas = makeCanvas(7, 12)
    const g = canvas.getContext('2d')
    rect(g, 1, 0, 5, 8, '#1c1b3a')
    rect(g, 2, 1, 3, 6, '#f8d77a')
    rect(g, 1, 9, 5, 3, '#1c1b3a')
    rect(g, 2, 9, 3, 2, '#f8d77a')
    scene.textures.addCanvas('npc-exclaim', canvas)
  }
  const mark = scene.add.image(atreus.sprite.x, atreus.sprite.y - 38, 'npc-exclaim').setDepth(9999)
  if (!prefersReducedMotion()) scene.tweens.add({ targets: mark, y: mark.y - 2, duration: 500, yoyo: true, repeat: -1 })
  return mark
}

// Monta todo y devuelve a Atreus y la exclamación para que la escena los gobierne. `addSolid(rect)` registra un cuerpo
// sólido en la escena.
export function buildHome(scene, pastel, addSolid, onMeow = () => {}) {
  const switches = buildFurniture(scene, pastel, addSolid)
  const atreusPlan = NPC_PLAN.find((npc) => npc.id === 'atreus')
  const khalessiPlan = NPC_PLAN.find((npc) => npc.id === 'khalessi')
  const atreus = buildAtreus(scene, atreusPlan, addSolid)
  const khalessi = buildKhalessi(scene, khalessiPlan, onMeow)
  return { atreus, exclamation: buildExclamation(scene, atreus), switches, khalessi }
}

// Hacia dónde mira Atreus según dónde esté la viajera; vuelve a mirar de frente cuando se aleja.
export function faceTraveller(atreus, from, facingFor) {
  const { sprite } = atreus
  const dx = from.x - sprite.x
  const dy = from.y - sprite.y
  const next = Math.hypot(dx, dy) < 56 ? facingFor(dx, dy) : 'down'
  if (next === atreus.facing) return
  atreus.facing = next
  sprite.setTexture('npc-atreus', frameName(next, 0))
}
