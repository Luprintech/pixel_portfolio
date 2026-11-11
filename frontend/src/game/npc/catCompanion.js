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
  Object.assign(cat, { x, y, trail: [], pose: 'sit', washLeft: 0, meet: null })
}

// Khalessi conoce a la mascota de la viajera: se acerca, la huele (avanza y retrocede un poco) y juega dando vueltas a su alrededor.
// Termina sola y vuelve con Lupe. `pet` es dónde está la mascota ({ x, y }); se actualiza cada fotograma porque puede moverse.
const MEET = { approachAt: 11, sniffMs: 1800, playMs: 5000, orbit: 13, spin: 0.004, giveUpMs: 6000 }

export function startMeet(cat, pet) {
  cat.trail = []
  cat.washLeft = 0
  cat.meet = { phase: 'approach', t: 0, angle: Math.atan2(cat.y - pet.y, cat.x - pet.x), pet }
}

export const meetPhase = (cat) => cat.meet?.phase ?? null

function moveTo(cat, x, y, dt) {
  const dx = x - cat.x
  const dy = y - cat.y
  const left = Math.hypot(dx, dy)
  const step = (SPEED * dt) / 1000
  if (left <= step) Object.assign(cat, { x, y })
  else Object.assign(cat, { x: cat.x + (dx / left) * step, y: cat.y + (dy / left) * step })
  if (Math.abs(dx) > 0.4) cat.face = dx < 0 ? 'left' : 'right'
  return left <= step
}

function updateMeet(cat, dt) {
  const meet = cat.meet
  const { pet } = meet
  meet.t += dt
  if (meet.phase === 'approach') {
    cat.pose = 'walk'
    // Se queda a un paso de la mascota, por el lado por el que llega.
    const gap = Math.hypot(cat.x - pet.x, cat.y - pet.y) || 1
    const goal = { x: pet.x + ((cat.x - pet.x) / gap) * MEET.approachAt, y: pet.y + ((cat.y - pet.y) / gap) * MEET.approachAt }
    if (moveTo(cat, goal.x, goal.y, dt) || meet.t > MEET.giveUpMs) Object.assign(meet, { phase: 'sniff', t: 0 })
    return
  }
  cat.face = pet.x < cat.x ? 'left' : 'right'
  if (meet.phase === 'sniff') {
    // Olfatea: asoma hacia la mascota y se echa atrás, con el paso del andar.
    cat.pose = 'walk'
    cat.x += (pet.x < cat.x ? -1 : 1) * Math.sin(meet.t / 160) * 0.35
    if (meet.t > MEET.sniffMs) Object.assign(meet, { phase: 'play', t: 0 })
    return
  }
  // Juega: da vueltas a su alrededor, con el paso del andar.
  meet.angle += dt * MEET.spin
  const x = pet.x + Math.cos(meet.angle) * MEET.orbit
  const y = pet.y + Math.sin(meet.angle) * MEET.orbit * 0.5
  cat.face = x < cat.x ? 'left' : 'right'
  Object.assign(cat, { x, y, pose: 'walk' })
  if (meet.t > MEET.playMs) cat.meet = null
}

// `leader` es Lupe ({ x, y }) y `leaderMoving` si anda.
export function updateCompanion(cat, dt, leader, leaderMoving) {
  cat.tick += dt
  if (cat.meet) return updateMeet(cat, dt)
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
