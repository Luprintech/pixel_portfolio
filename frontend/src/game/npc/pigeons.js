// Las palomas de la plaza, sin Phaser: un puñado que picotea cerca de su rincón y, si alguien se sienta a darles de comer, se junta a sus pies
// a por las migas. Se espantan si la viajera o Khalessi se acercan, vuelan un trecho y vuelven al rato. Todo el movimiento comprueba `free(x, y)`
// (el suelo por el que se puede pisar), así que nunca cruzan un banco, un árbol ni una fuente.
//
//  wait   quieta un momento (mira)   walk   va a su destino andando   peck   picotea   fly   vuela hasta un sitio libre (lejos o por un susto)
export const FLOCK = {
  walkSpeed: 30,
  // Más lejos que esto vuelan en lugar de andar.
  flyAbove: 70,
  // A esta distancia de un intruso echan a volar, y esto vuelan (px y ms).
  scareRange: 34,
  flyRange: [60, 110],
  flyMs: 900,
  flyHeight: 14,
  // Mientras dura el susto no se acercan a la comida.
  scaredMs: 4500,
  // Migas: cada cuánto cae una, lo que tarda en llegar al suelo y lo que dura si nadie la come.
  crumbEvery: [1100, 1900],
  crumbFlightMs: 350,
  crumbLifeMs: 9000,
  crumbRadius: [8, 26],
  // A cuánto de la miga o del dueño de la comida se acercan para picotear.
  crumbSense: 90,
  roamRadius: 26,
}

const between = (range, rng) => range[0] + rng() * (range[1] - range[0])
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)

// `homes` son los rincones de la plaza donde descansan, uno por paloma (se reparten en vueltas si hay más palomas que rincones).
export function createFlock(homes, count, rng = Math.random) {
  const pigeons = Array.from({ length: count }, (_, i) => {
    const home = homes[i % homes.length]
    return { x: home.x, y: home.y, home, face: rng() < 0.5 ? 'left' : 'right', state: 'wait', t: between([300, 1800], rng), target: null, from: null, h: 0, scared: 0 }
  })
  return { pigeons, crumbs: [], nextCrumb: 0, rng }
}

// Punto libre al azar alrededor de `centre`, o null si no lo encuentra tras unos intentos.
function freePointAround(flock, free, centre, radius) {
  for (let i = 0; i < 8; i++) {
    const angle = flock.rng() * Math.PI * 2
    const r = 6 + flock.rng() * radius
    const p = { x: centre.x + Math.cos(angle) * r, y: centre.y + Math.sin(angle) * r * 0.6 }
    if (free(p.x, p.y)) return p
  }
  return null
}

// El que da de comida lanza una miga a un punto libre cerca de sus pies. `source` es `{ hand, feet }`.
function throwCrumb(flock, source, free) {
  const spot = freePointAround(flock, free, source.feet, FLOCK.crumbRadius[1])
  if (!spot) return
  flock.crumbs.push({ from: { ...source.hand }, x: spot.x, y: spot.y, t: 0, landed: false, claimedBy: null })
}

function choose(flock, pigeon, source, free) {
  pigeon.target = null
  const sense = FLOCK.crumbSense
  if (pigeon.scared <= 0) {
    const crumb = flock.crumbs
      .filter((c) => c.landed && (c.claimedBy === null || c.claimedBy === pigeon) && distance(c, pigeon) < sense * 2)
      .sort((a, b) => distance(a, pigeon) - distance(b, pigeon))[0]
    if (crumb) {
      crumb.claimedBy = pigeon
      pigeon.target = { x: crumb.x, y: crumb.y, crumb }
    } else if (source) pigeon.target = freePointAround(flock, free, source.feet, FLOCK.roamRadius)
  }
  pigeon.target ??= freePointAround(flock, free, pigeon.home, FLOCK.roamRadius)
  if (!pigeon.target) Object.assign(pigeon, { state: 'wait', t: 800 })
  // Lo lejano se vuela (no se atascan contra un banco ni un árbol); lo cercano se anda a saltitos.
  else if (distance(pigeon, pigeon.target) > FLOCK.flyAbove) takeOff(pigeon, pigeon.target)
  else pigeon.state = 'walk'
}

function takeOff(pigeon, dest) {
  Object.assign(pigeon, { state: 'fly', t: 0, from: { x: pigeon.x, y: pigeon.y }, target: dest, face: dest.x < pigeon.x ? 'left' : 'right' })
}

function scare(flock, pigeon, from, free) {
  pigeon.scared = FLOCK.scaredMs
  const away = Math.atan2(pigeon.y - from.y, pigeon.x - from.x)
  // Primero lejos de quien las espanta; si ahí no hay suelo libre, a cualquier lado.
  for (let i = 0; i < 16; i++) {
    const angle = i < 8 ? away + (flock.rng() - 0.5) * 1.6 : flock.rng() * Math.PI * 2
    const d = between(FLOCK.flyRange, flock.rng)
    const dest = { x: pigeon.x + Math.cos(angle) * d, y: pigeon.y + Math.sin(angle) * d * 0.6 }
    if (!free(dest.x, dest.y)) continue
    if (pigeon.target?.crumb) pigeon.target.crumb.claimedBy = null
    takeOff(pigeon, dest)
    return
  }
}

// Avanza `dt` ms. `source` es quien da de comida ({ hand, feet }) o null, `scarers` quienes las espantan al acercarse y `free(x, y)` si se puede pisar.
export function stepFlock(flock, dt, { source = null, scarers = [], free }) {
  if (source) {
    flock.nextCrumb -= dt
    if (flock.nextCrumb <= 0) {
      throwCrumb(flock, source, free)
      flock.nextCrumb = between(FLOCK.crumbEvery, flock.rng)
    }
  }
  flock.crumbs.forEach((crumb) => {
    crumb.t += dt
    if (!crumb.landed && crumb.t >= FLOCK.crumbFlightMs) Object.assign(crumb, { landed: true, t: 0 })
  })
  flock.crumbs = flock.crumbs.filter((crumb) => !crumb.eaten && (!crumb.landed || crumb.t < FLOCK.crumbLifeMs))

  flock.pigeons.forEach((pigeon) => {
    pigeon.scared = Math.max(0, pigeon.scared - dt)
    if (pigeon.state !== 'fly') {
      const threat = scarers.find((who) => distance(who, pigeon) < FLOCK.scareRange)
      if (threat) scare(flock, pigeon, threat, free)
    }
    if (pigeon.state === 'fly') {
      pigeon.t += dt
      const k = Math.min(1, pigeon.t / FLOCK.flyMs)
      pigeon.x = pigeon.from.x + (pigeon.target.x - pigeon.from.x) * k
      pigeon.y = pigeon.from.y + (pigeon.target.y - pigeon.from.y) * k
      pigeon.h = Math.sin(k * Math.PI) * FLOCK.flyHeight
      if (k >= 1) Object.assign(pigeon, { state: 'wait', t: 600, h: 0, target: null })
      return
    }
    if (pigeon.state === 'wait' || pigeon.state === 'peck') {
      pigeon.t -= dt
      if (pigeon.t <= 0) choose(flock, pigeon, source, free)
      return
    }
    // walk: da pasos cortos hacia su destino; si algo le cierra el paso, elige otro.
    const { target } = pigeon
    const left = distance(pigeon, target)
    const step = (FLOCK.walkSpeed * dt) / 1000
    if (left > 0.01) pigeon.face = target.x < pigeon.x ? 'left' : 'right'
    const next = left <= step ? { x: target.x, y: target.y } : { x: pigeon.x + ((target.x - pigeon.x) / left) * step, y: pigeon.y + ((target.y - pigeon.y) / left) * step }
    if (!free(next.x, next.y)) return choose(flock, pigeon, source, free)
    pigeon.x = next.x
    pigeon.y = next.y
    if (left > step) return
    if (target.crumb && !target.crumb.eaten) target.crumb.eaten = true
    Object.assign(pigeon, { state: 'peck', t: between([700, 1500], flock.rng), target: null })
  })
}
