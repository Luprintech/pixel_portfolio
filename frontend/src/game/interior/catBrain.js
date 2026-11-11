// Lo que hace Khalessi en casa: descansa en su caja, sale, juega con su sardina de peluche, se la lleva en la boca a
// Atreus y se la da maullando, y vuelve a la caja. Es una secuencia de pasos (esperar o caminar) que se repite; esta
// parte es pura (sin Phaser ni lienzo), así se prueba sin navegador. La escena (`homeBuilder.js`) la dibuja.
export const CAT_SPOTS = {
  box: { x: 172, y: 114 },
  doorstep: { x: 184, y: 128 },
  toy: { x: 200, y: 136 },
  atreus: { x: 150, y: 116 },
}

const SPEED = 24

// Pasos del ciclo. `walk` camina hasta `to`; `wait` se queda `ms`. `pose` es lo que se dibuja y `meow` el maullido que suelta
// al empezar (0 corto, 1 largo e insistente, 2 agudo y contento). `carry` lleva la sardina en la boca; `give` es el momento
// de dársela a Atreus (él se vuelve hacia ella); `toyAt` coloca la sardina en el suelo.
const SEQUENCE = [
  { kind: 'wait', ms: 7000, pose: 'sit', inBox: true },
  { kind: 'walk', to: CAT_SPOTS.doorstep, pose: 'walk', meow: 0 },
  { kind: 'walk', to: CAT_SPOTS.toy, pose: 'walk' },
  { kind: 'wait', ms: 4200, pose: 'play' },
  { kind: 'wait', ms: 700, pose: 'grab', carry: true },
  { kind: 'walk', to: CAT_SPOTS.atreus, pose: 'walk', carry: true, meow: 1 },
  { kind: 'wait', ms: 2400, pose: 'give', give: true, meow: 2, toyAt: CAT_SPOTS.atreus, again: { at: 1200, meow: 0 } },
  { kind: 'walk', to: CAT_SPOTS.doorstep, pose: 'walk', toyAt: CAT_SPOTS.toy },
  { kind: 'walk', to: CAT_SPOTS.box, pose: 'walk' },
]

export function createCat() {
  return { step: 0, t: 0, x: CAT_SPOTS.box.x, y: CAT_SPOTS.box.y, face: 'left', pose: 'sit', carrying: false, giving: false, inBox: true, toy: { ...CAT_SPOTS.toy }, againDone: false, events: [] }
}

function begin(cat) {
  const step = SEQUENCE[cat.step]
  cat.t = 0
  cat.pose = step.pose
  cat.carrying = Boolean(step.carry)
  cat.giving = Boolean(step.give)
  cat.inBox = Boolean(step.inBox)
  if (step.toyAt) cat.toy = { ...step.toyAt, x: step.toyAt.x + (step.give ? 6 : 0), y: step.toyAt.y + (step.give ? 2 : 0) }
  if (step.meow !== undefined) cat.events.push({ type: 'meow', variant: step.meow })
}

const next = (cat) => {
  cat.step = (cat.step + 1) % SEQUENCE.length
  begin(cat)
}

// Avanza a la gata `dt` milisegundos y devuelve los sucesos (maullidos) que soltó.
export function updateCat(cat, dt) {
  cat.events = []
  const step = SEQUENCE[cat.step]
  cat.t += dt
  if (step.kind === 'wait') {
    if (step.again && !cat.againDone && cat.t >= step.again.at) {
      cat.againDone = true
      cat.events.push({ type: 'meow', variant: step.again.meow })
    }
    if (cat.t >= step.ms) {
      cat.againDone = false
      next(cat)
    }
  } else {
    const dx = step.to.x - cat.x
    const dy = step.to.y - cat.y
    const distance = Math.hypot(dx, dy)
    const move = (SPEED * dt) / 1000
    if (Math.abs(dx) > 0.5) cat.face = dx > 0 ? 'right' : 'left'
    if (distance <= move) {
      cat.x = step.to.x
      cat.y = step.to.y
      next(cat)
    } else {
      cat.x += (dx / distance) * move
      cat.y += (dy / distance) * move
    }
  }
  return cat.events
}

export const CAT_SEQUENCE = SEQUENCE
