// Lo que hace Khalessi en casa. No sigue un guion fijo: elige una actividad de una bolsa que se baraja (pasear, comer, usar el
// arenero, asearse, rascar, dormir arriba del rascador, echar una cabezada en su caja y la de la sardina) y la cumple paso a paso: caminar (por un camino que
// esquiva los muebles, ver `catNav.js`), esperar en una pose o dar un salto (al arenero, a la caja, al rascador). Esta parte es pura (sin
// Phaser ni lienzo), así se prueba sin navegador; la escena (`homeBuilder.js`) la dibuja.
// Los sitios clave salen del plano (`homeLayout.js`): caja, rascador, comedero y arenero contra la pared derecha, Atreus en su mesa.
import { FURNITURE, solidsOf } from './furniture/index.js'
import { ATREUS_BODY, FURNITURE_PLAN, NPC_PLAN, SPOTS, homeRoom } from './homeLayout.js'
import { createNav } from './catNav.js'

const atreus = NPC_PLAN.find((npc) => npc.id === 'atreus')

export const CAT_SPOTS = {
  // Delante de la caja, desde donde salta dentro y fuera; y dentro, con los pies un poco por encima del suelo (`z`).
  boxFront: { x: SPOTS.box.x, y: SPOTS.box.y + 18 },
  boxIn: { x: SPOTS.box.x, y: SPOTS.box.y - 4, z: 3 },
  // Ante el rascador, desde donde salta arriba y baja; y a su lado, donde se afila las uñas.
  scratcherFront: { x: SPOTS.scratcher.x, y: SPOTS.scratcher.y + 9 },
  scratcherSide: { x: SPOTS.scratcher.x - 16, y: SPOTS.scratcher.y + 4 },
  // Sobre la plataforma: sus pies quedan en la fila del rascador y `z` es lo que sube sobre ella.
  scratcherTop: { x: SPOTS.scratcher.x, y: SPOTS.scratcher.y + 1, z: FURNITURE.scratcher.h - 4 },
  // Ante el cuenco de pienso, con la cabeza (a su derecha) sobre él.
  bowls: { x: SPOTS.bowls.x - 12, y: SPOTS.bowls.y + 6 },
  litterFront: { x: SPOTS.litter.x, y: SPOTS.litter.y + 7 },
  litterIn: { x: SPOTS.litter.x, y: SPOTS.litter.y - 4 },
  // Junto a Atreus, de pie: a donde le lleva la sardina.
  atreus: { x: atreus.x + 18, y: atreus.y + 10 },
}

const SPEED = 24
// Lo que tarda en girarse sobre sí misma antes de echar a andar hacia el otro lado.
const TURN_MS = 320
// Tras soltar la sardina, lo que tarda en caer al suelo.
const DROP_MS = 520
// Por encima de esta fila no pasea: es la franja de los muebles de pared, donde se perdería de vista.
const MIN_Y = 100

export const NAV = createNav({
  bounds: homeRoom().bounds,
  solids: [...FURNITURE_PLAN.flatMap(solidsOf), { x: atreus.x + ATREUS_BODY.l, y: atreus.y + ATREUS_BODY.t, w: ATREUS_BODY.r - ATREUS_BODY.l, h: ATREUS_BODY.b - ATREUS_BODY.t }],
  minY: MIN_Y,
})

const WANDER_POINTS = NAV.wanderPoints()

// Pasos. `walk` camina hasta `to` (esquivando muebles), `hop` salta a `to` con una `z` de altura y `wait` se queda `ms`. `pose` es
// lo que se dibuja; `meow` el maullido que suelta al empezar (0 corto de 8 bits, 1 largo e insistente, 2 agudo y contento, 3 curioso, 4 ronroneo con trino); `face` hacia
// dónde se vuelve; `layer` dónde queda al acabar un salto (sobre el rascador, dentro de la caja o dentro del arenero, para dibujarla en su sitio).
// `grab` y `carry` son coger la sardina y llevarla en la boca; `drop` es soltarla y `gift` que es el regalo para Atreus.
const wait = (ms, pose, extra) => ({ kind: 'wait', ms, pose, ...extra })
const walk = (to, extra) => ({ kind: 'walk', to, pose: 'walk', ...extra })
const hop = (to, extra) => ({ kind: 'hop', to, ms: 650, pose: 'walk', ...extra })

const between = (cat, min, max) => Math.round(min + cat.rng() * (max - min))
const pick = (cat, list) => list[Math.floor(cat.rng() * list.length)]

const ACTIVITIES = {
  // Un paseo por varios puntos del suelo libre, parando a sentarse o a asearse.
  wander: (cat) =>
    Array.from({ length: 3 }, () => [walk(pick(cat, WANDER_POINTS)), wait(between(cat, 1500, 3200), pick(cat, ['sit', 'sit', 'wash']))]).flat(),
  eat: () => [walk(CAT_SPOTS.bowls), wait(4200, 'eat', { face: 'right' }), wait(2800, 'wash')],
  litter: () => [
    walk(CAT_SPOTS.litterFront),
    hop(CAT_SPOTS.litterIn, { layer: 'litter' }),
    wait(3800, 'sit'),
    hop(CAT_SPOTS.litterFront, { layer: null }),
    wait(2600, 'wash'),
  ],
  wash: () => [wait(3800, 'wash')],
  // Se mete en su caja de cartón, se acomoda y echa una cabezada.
  nap: (cat) => [
    walk(CAT_SPOTS.boxFront),
    hop(CAT_SPOTS.boxIn, { layer: 'box' }),
    wait(1600, 'sit'),
    wait(between(cat, 7000, 12000), 'sleep'),
    wait(1800, 'sit'),
    hop(CAT_SPOTS.boxFront, { layer: null }),
  ],
  scratch: () => [walk(CAT_SPOTS.scratcherSide), wait(3200, 'scratch', { face: 'right' })],
  sleep: (cat) => [
    walk(CAT_SPOTS.scratcherFront),
    hop(CAT_SPOTS.scratcherTop, { layer: 'scratcher', ms: 800 }),
    wait(1400, 'sit'),
    wait(between(cat, 14000, 22000), 'sleep'),
    hop(CAT_SPOTS.scratcherFront, { layer: null, ms: 800 }),
  ],
  // Va a por la sardina (donde esté), la lleva en la boca a Atreus y se la da. Si la sardina quedó junto a Atreus de un regalo
  // anterior, antes la lleva a jugar a otro rincón de la sala.
  sardine: (cat) => {
    const { toy } = cat
    const steps = [walk({ x: toy.x - 9, y: toy.y - 1 }, { meow: 3 }), wait(900, 'grab', { grab: true, face: 'right' })]
    if (Math.hypot(toy.x - CAT_SPOTS.atreus.x, toy.y - CAT_SPOTS.atreus.y) < 40) {
      const centre = WANDER_POINTS.filter((p) => p.x > 200 && p.x < 440)
      steps.push(walk(pick(cat, centre), { carry: true }), wait(600, 'drop', { drop: true }), wait(3600, 'play'), wait(900, 'grab', { grab: true }))
    }
    steps.push(walk(CAT_SPOTS.atreus, { carry: true, meow: 1 }), wait(2400, 'give', { drop: true, gift: true, meow: 2, again: { at: 1200, meow: 4 } }))
    return steps
  },
}

// Lo que hay en la bolsa de cada vuelta: todo ocurre una vez por vuelta y el paseo, dos.
const BAG = ['wander', 'eat', 'litter', 'sleep', 'nap', 'sardine', 'scratch', 'wander', 'wash']

function shuffled(cat) {
  const bag = [...BAG]
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(cat.rng() * (i + 1))
    ;[bag[i], bag[j]] = [bag[j], bag[i]]
  }
  // Nunca repite la actividad con la que acaba la vuelta anterior.
  if (bag[0] === cat.last) [bag[0], bag[1]] = [bag[1], bag[0]]
  return bag
}

function chooseActivity(cat) {
  if (!cat.bag.length) cat.bag = shuffled(cat)
  cat.last = cat.bag.shift()
  return ACTIVITIES[cat.last](cat)
}

// `rng` es el generador de azar (de 0 a 1): la escena usa `Math.random` y las pruebas uno con semilla. Empieza dormida sobre el
// rascador.
export function createCat(rng = Math.random) {
  const top = CAT_SPOTS.scratcherTop
  return {
    rng, bag: [], last: null, plan: [wait(6000, 'sleep'), hop(CAT_SPOTS.scratcherFront, { layer: null, ms: 800 })], step: 0, t: 0, route: [], from: null,
    x: top.x, y: top.y, z: top.z, layer: 'scratcher', face: 'left', pose: 'sleep', carrying: false, giving: false,
    toy: { x: CAT_SPOTS.atreus.x + 6, y: CAT_SPOTS.atreus.y + 2 }, toyPhase: 'ground', toyT: 0,
    turning: 0, nextFace: 'left', againDone: false, skipped: 0, events: [],
  }
}

// Dónde se dibuja la gata en orden de profundidad: dentro de la caja va entre sus dos capas; sobre el rascador o dentro del arenero va justo por encima de ese mueble y,
// en el suelo, con la fila de sus pies.
export function catDepth(cat) {
  if (cat.layer === 'box') return SPOTS.box.y
  if (cat.layer === 'scratcher') return SPOTS.scratcher.y + 1
  if (cat.layer === 'litter') return SPOTS.litter.y + 1
  return Math.round(cat.y)
}

// Empieza a girarse hacia `face` si mira al otro lado: durante el giro no avanza (se queda parada y se vuelve), así nunca anda
// de espaldas a donde va.
function turnTo(cat, face) {
  if (cat.face === face) return
  cat.turning = TURN_MS
  cat.nextFace = face
}

// Hacia qué lado mira para moverse (dx, dy): solo si el movimiento es sobre todo horizontal; en uno casi vertical conserva el suyo.
const faceOf = (dx, dy) => (Math.abs(dx) > 1.5 && Math.abs(dx) > Math.abs(dy) * 0.6 ? (dx > 0 ? 'right' : 'left') : null)

function begin(cat) {
  const step = cat.plan[cat.step]
  cat.t = 0
  cat.pose = step.pose
  cat.carrying = Boolean(step.carry)
  cat.giving = Boolean(step.gift)
  if (step.drop) cat.toy = { x: cat.x + (cat.face === 'right' ? 8 : -8), y: cat.y + 2 }
  if (step.meow !== undefined) cat.events.push({ type: 'meow', variant: step.meow })
  if (step.face) turnTo(cat, step.face)
  if (step.kind === 'walk') {
    const route = NAV.path(cat, step.to)
    if (!route) {
      // Sin camino (no debería pasar: lo comprueban las pruebas): deja la actividad y descansa un momento.
      cat.skipped += 1
      cat.plan = [wait(800, 'sit')]
      cat.step = 0
      begin(cat)
      return
    }
    cat.route = route
    // Ya está en el destino: no hay nada que andar.
    if (!route.length) {
      next(cat)
      return
    }
  }
  if (step.kind === 'hop') {
    cat.from = { x: cat.x, y: cat.y, z: cat.z }
    const side = faceOf(step.to.x - cat.x, step.to.y - cat.y)
    if (side) turnTo(cat, side)
  }
}

function next(cat) {
  cat.step += 1
  if (cat.step >= cat.plan.length) {
    cat.plan = chooseActivity(cat)
    cat.step = 0
  }
  begin(cat)
}

// La sardina: en el suelo, subiendo a la boca (al cogerla), en la boca (al llevarla) o cayendo al suelo (al soltarla).
function trackToy(cat) {
  const step = cat.plan[cat.step]
  if (step.grab) {
    cat.toyPhase = 'lifting'
    cat.toyT = Math.min(1, cat.t / step.ms)
  } else if (step.carry) {
    cat.toyPhase = 'carried'
    cat.toyT = 1
  } else if (step.drop && cat.t < DROP_MS) {
    cat.toyPhase = 'dropping'
    cat.toyT = cat.t / DROP_MS
  } else {
    cat.toyPhase = 'ground'
    cat.toyT = 0
  }
}

// Mueve a la gata hacia el siguiente punto de su camino; si antes tiene que volverse, se gira primero y no avanza.
function stepWalk(cat, dt) {
  const target = cat.route[0]
  const dx = target.x - cat.x
  const dy = target.y - cat.y
  const side = faceOf(dx, dy)
  if (side && side !== cat.face) {
    turnTo(cat, side)
    return
  }
  cat.t += dt
  const distance = Math.hypot(dx, dy)
  const move = (SPEED * dt) / 1000
  if (distance <= move) {
    cat.x = target.x
    cat.y = target.y
    cat.route.shift()
    if (!cat.route.length) next(cat)
  } else {
    cat.x += (dx / distance) * move
    cat.y += (dy / distance) * move
  }
}

// Salto: de `from` a `to` en `ms`, con un arco que sube por encima de los dos extremos.
function stepHop(cat, dt, step) {
  cat.t += dt
  const u = Math.min(1, cat.t / step.ms)
  const { from, to } = { from: cat.from, to: { z: 0, ...step.to } }
  cat.x = from.x + (to.x - from.x) * u
  cat.y = from.y + (to.y - from.y) * u
  cat.z = from.z + (to.z - from.z) * u + 7 * Math.sin(Math.PI * u)
  if (u < 1) return
  cat.x = to.x
  cat.y = to.y
  cat.z = to.z
  if (step.layer !== undefined) cat.layer = step.layer
  next(cat)
}

// Avanza a la gata `dt` milisegundos y devuelve los sucesos que soltó: los maullidos.
export function updateCat(cat, dt) {
  cat.events = []
  if (cat.turning > 0) {
    cat.turning -= dt
    if (cat.turning <= 0) {
      cat.turning = 0
      cat.face = cat.nextFace
    }
    return cat.events
  }
  const step = cat.plan[cat.step]
  if (step.kind === 'walk') stepWalk(cat, dt)
  else if (step.kind === 'hop') stepHop(cat, dt, step)
  else {
    cat.t += dt
    if (step.again && !cat.againDone && cat.t >= step.again.at) {
      cat.againDone = true
      cat.events.push({ type: 'meow', variant: step.again.meow })
    }
    if (cat.t >= step.ms) {
      cat.againDone = false
      next(cat)
    }
  }
  trackToy(cat)
  return cat.events
}
