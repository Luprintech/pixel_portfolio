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
// Lo que tarda en girarse sobre sí misma antes de echar a andar hacia el otro lado.
const TURN_MS = 320
// Tras soltar la sardina, lo que tarda en caer a los pies de Atreus.
const DROP_MS = 520

// Pasos del ciclo. `walk` camina hasta `to`; `wait` se queda `ms`. `pose` es lo que se dibuja y `meow` el maullido que suelta
// al empezar (0 corto, 1 largo e insistente, 2 agudo y contento). `carry` lleva la sardina en la boca; `give` es el momento
// de dársela a Atreus (él se vuelve hacia ella); `toyAt` coloca la sardina en el suelo.
const SEQUENCE = [
  { kind: 'wait', ms: 7000, pose: 'sit', inBox: true },
  { kind: 'walk', to: CAT_SPOTS.doorstep, pose: 'walk', meow: 0 },
  { kind: 'walk', to: CAT_SPOTS.toy, pose: 'walk' },
  { kind: 'wait', ms: 4200, pose: 'play' },
  { kind: 'wait', ms: 900, pose: 'grab', face: 'left' },
  { kind: 'walk', to: CAT_SPOTS.atreus, pose: 'walk', carry: true, meow: 1 },
  { kind: 'wait', ms: 2400, pose: 'give', give: true, meow: 2, toyAt: CAT_SPOTS.atreus, again: { at: 1200, meow: 0 } },
  { kind: 'walk', to: CAT_SPOTS.doorstep, pose: 'walk', toyAt: CAT_SPOTS.toy },
  { kind: 'walk', to: CAT_SPOTS.box, pose: 'walk' },
]

export function createCat() {
  return { step: 0, t: 0, x: CAT_SPOTS.box.x, y: CAT_SPOTS.box.y, face: 'left', pose: 'sit', carrying: false, giving: false, inBox: true, toy: { ...CAT_SPOTS.toy }, toyPhase: 'ground', toyT: 0, turning: 0, nextFace: 'left', againDone: false, events: [] }
}

// Empieza a girarse hacia `face` si mira al otro lado: durante el giro no avanza (se queda parada y se vuelve), así nunca anda
// de espaldas a donde va.
function turnTo(cat, face) {
  if (cat.face === face) return
  cat.turning = TURN_MS
  cat.nextFace = face
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
  if (step.face) turnTo(cat, step.face)
}

const next = (cat) => {
  cat.step = (cat.step + 1) % SEQUENCE.length
  begin(cat)
}

// La sardina: en el suelo, subiendo a la boca (al cogerla), en la boca (al llevarla) o cayendo a los pies de Atreus (al dársela).
function trackToy(cat) {
  const step = SEQUENCE[cat.step]
  if (step.pose === 'grab') {
    cat.toyPhase = 'lifting'
    cat.toyT = Math.min(1, cat.t / step.ms)
  } else if (step.carry) {
    cat.toyPhase = 'carried'
    cat.toyT = 1
  } else if (step.give && cat.t < DROP_MS) {
    cat.toyPhase = 'dropping'
    cat.toyT = cat.t / DROP_MS
  } else {
    cat.toyPhase = 'ground'
    cat.toyT = 0
  }
}

// Avanza a la gata `dt` milisegundos y devuelve los sucesos (maullidos) que soltó.
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
  const step = SEQUENCE[cat.step]
  if (step.kind === 'walk') {
    const dx = step.to.x - cat.x
    // Antes de andar hacia el otro lado se gira; si el paso es casi vertical conserva hacia dónde mira.
    if (Math.abs(dx) > 1 && cat.face !== (dx > 0 ? 'right' : 'left')) {
      turnTo(cat, dx > 0 ? 'right' : 'left')
      return cat.events
    }
  }
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
    if (distance <= move) {
      cat.x = step.to.x
      cat.y = step.to.y
      next(cat)
    } else {
      cat.x += (dx / distance) * move
      cat.y += (dy / distance) * move
    }
  }
  trackToy(cat)
  return cat.events
}

export const CAT_SEQUENCE = SEQUENCE
