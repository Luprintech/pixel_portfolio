// Khalessi fuera de casa: acompaña a Lupe, no a la viajera. Va por el rastro que Lupe ha dejado (que ya es un camino
// libre), se sienta cuando ella se para y de vez en cuando se asea. Sin Phaser: la escena solo dibuja lo que dice.
const SPEED = 50
// A esta distancia de Lupe se queda sentada.
const REST = 22
const TRAIL_MAX = 24
// Cuánto pasa entre un aseo y el siguiente, y lo que dura.
const WASH_EVERY = [7000, 14000]
const WASH_MS = 2800

export function createCompanion(x, y, rng = Math.random) {
  return { x, y, face: 'right', pose: 'sit', trail: [], tick: 0, washIn: WASH_EVERY[0], washLeft: 0, rng }
}

export function placeCompanion(cat, x, y) {
  Object.assign(cat, { x, y, trail: [], pose: 'sit', washLeft: 0 })
}

// `leader` es Lupe ({ x, y }) y `leaderMoving` si anda.
export function updateCompanion(cat, dt, leader, leaderMoving) {
  cat.tick += dt
  if (leaderMoving) {
    const last = cat.trail[cat.trail.length - 1]
    if (!last || Math.hypot(last.x - leader.x, last.y - leader.y) > 2) cat.trail.push({ x: leader.x, y: leader.y })
    if (cat.trail.length > TRAIL_MAX) cat.trail.shift()
  }
  const far = Math.hypot(leader.x - cat.x, leader.y - cat.y) > REST
  if (!far) {
    cat.trail = []
    sit(cat, dt)
    return
  }
  // Sin rastro (acaba de aparecer lejos) va derecha a Lupe, que está cerca: nunca hay un tramo largo sin camino.
  const target = cat.trail[0] ?? leader
  const dx = target.x - cat.x
  const dy = target.y - cat.y
  const left = Math.hypot(dx, dy)
  const step = (SPEED * dt) / 1000
  if (left <= step) {
    cat.x = target.x
    cat.y = target.y
    if (cat.trail.length) cat.trail.shift()
  } else {
    cat.x += (dx / left) * step
    cat.y += (dy / left) * step
  }
  if (Math.abs(dx) > 0.4) cat.face = dx < 0 ? 'left' : 'right'
  cat.pose = 'walk'
  cat.washLeft = 0
}

function sit(cat, dt) {
  if (cat.washLeft > 0) {
    cat.washLeft -= dt
    cat.pose = 'wash'
    if (cat.washLeft <= 0) {
      cat.washLeft = 0
      cat.washIn = WASH_EVERY[0] + cat.rng() * (WASH_EVERY[1] - WASH_EVERY[0])
    }
    return
  }
  cat.pose = 'sit'
  cat.washIn -= dt
  if (cat.washIn <= 0) cat.washLeft = WASH_MS
}
