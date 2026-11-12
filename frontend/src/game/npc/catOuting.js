// La salida de Khalessi al pueblo, sin Phaser: sale andando de donde esté con Lupe, por los mismos caminos libres que ella (`nav`, ver
// `interior/catNav.js`), pasa un rato en la plaza haciendo sus cosas (a su aire, con Grace o sin ella) y vuelve andando con Lupe. Nunca
// aparece ni desaparece a la vista: empieza y acaba en el sitio de la gata de Lupe (quien la lleva le da el punto) y el resto es camino.
//
//  home    está con Lupe (no se dibuja aquí)
//  going   anda hasta la plaza
//  stay    hace actividades, una detrás de otra, durante un rato
//  leaving anda de vuelta con Lupe
//
// Las actividades (`ACTIVITIES`) se eligen por lo que haya alrededor: sentarse junto a Grace si está en un banco, perseguir palomas, tumbarse al
// sol, curiosear en la fuente, seguir una mariposa o acercarse a la viajera. Con lluvia o de noche no sale, y si empieza mientras está fuera,
// vuelve a casa en cuanto termina lo que hace.
export const OUTING = {
  walkSpeed: 50,
  runSpeed: 78,
  // Cuánto se queda en la plaza (ms) y cuánto espera en casa entre salidas.
  stayMs: [90000, 150000],
  restMs: [120000, 220000],
  // A esta distancia de Lupe da por terminada la vuelta.
  homeReach: 22,
  // Si algo ocupa el sitio al que iba, espera este tiempo antes de buscar otro camino.
  yieldMs: 1400,
  // Hueco que deja a otros personajes.
  gap: 11,
}

const between = (range, rng) => range[0] + rng() * (range[1] - range[0])
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
const pick = (list, rng) => list[Math.floor(rng() * list.length)]

export function createOuting(rng = Math.random) {
  return {
    rng,
    phase: 'home',
    x: 0,
    y: 0,
    face: 'right',
    pose: 'sit',
    tick: 0,
    path: [],
    speed: OUTING.walkSpeed,
    // La actividad en curso (ver `ACTIVITIES`), cuánto le queda y el tiempo total que lleva fuera.
    activity: null,
    left: 0,
    stayLeft: 0,
    waitFor: 0,
    blocked: 0,
    // En casa: cuánto falta para la siguiente salida.
    restLeft: between([20000, 40000], rng),
    lastKind: null,
    washIn: between([5000, 9000], rng),
  }
}

// ¿Puede salir ahora? Con lluvia, de noche o con algo que la reclame (visita guiada, azotea) se queda con Lupe.
export const mayGoOut = (ctx) => !ctx.rain && !ctx.night && !ctx.recalled

// Empieza la salida desde `at` (donde está la gata de Lupe). `goal` es el primer sitio al que va; si no hay camino, no sale y devuelve false.
export function beginOuting(o, at, goal, nav) {
  const path = nav.path(at, goal)
  if (!path) return false
  Object.assign(o, { phase: 'going', goal, x: at.x, y: at.y, path, speed: OUTING.walkSpeed, pose: 'walk', activity: null, stayLeft: between(OUTING.stayMs, o.rng), blocked: 0 })
  return true
}

function face(o, dx) {
  if (Math.abs(dx) > 0.3) o.face = dx < 0 ? 'left' : 'right'
}

// Anda por `o.path` un fotograma y devuelve si ha llegado al final. Si un personaje ocupa el siguiente tramo, espera (cede el paso) y, pasado
// `yieldMs`, pide otro camino desde donde está.
function walk(o, dt, ctx) {
  const next = o.path[0]
  if (!next) return true
  const step = (o.speed * dt) / 1000
  const dx = next.x - o.x
  const dy = next.y - o.y
  const left = Math.hypot(dx, dy)
  const to = left <= step ? next : { x: o.x + (dx / left) * step, y: o.y + (dy / left) * step }
  if ((ctx.others ?? []).some((other) => distance(other, to) < OUTING.gap && distance(other, to) < distance(other, o))) {
    o.pose = 'sit'
    o.blocked += dt
    if (o.blocked > OUTING.yieldMs && o.goal) {
      o.blocked = 0
      o.path = ctx.nav.path(o, o.goal) ?? []
    }
    return false
  }
  o.blocked = 0
  face(o, dx)
  o.x = to.x
  o.y = to.y
  o.pose = 'walk'
  if (left <= step) o.path.shift()
  return o.path.length === 0
}

// Cada actividad dice si se puede hacer ahora y devuelve `{ kind, to, pose, ms, ... }` con el sitio al que va y lo que hace allí.
export const ACTIVITIES = {
  // Sentada junto a Grace, que está en un banco: se echa a su lado, se asea o se sienta a mirarla.
  bench: (ctx, rng) => {
    if (!ctx.grace?.sitting) return null
    const side = rng() < 0.5 ? -1 : 1
    const to = ctx.nav.nearestFree(ctx.grace.x + side * 24, ctx.grace.y + 15)
    return to && { kind: 'bench', to, pose: pick(['sit', 'sleep', 'wash'], rng), ms: between([9000, 17000], rng), look: ctx.grace }
  },
  // Persigue a una paloma (a la que no toca: ellas echan a volar cuando se acerca) y después se queda mirando adónde se fue.
  chase: (ctx, rng) => {
    const birds = (ctx.pigeons ?? []).filter((p) => p.state !== 'fly')
    if (!birds.length) return null
    const prey = pick(birds, rng)
    return { kind: 'chase', to: ctx.nav.nearestFree(prey.x, prey.y), pose: 'sit', ms: between([3000, 5000], rng), run: true, prey }
  },
  // Tumbada al sol en un sitio abierto de la plaza.
  sun: (ctx, rng) => {
    if (!ctx.sunSpots?.length) return null
    const spot = pick(ctx.sunSpots, rng)
    const to = ctx.nav.nearestFree(spot.x, spot.y)
    return to && { kind: 'sun', to, pose: 'sleep', ms: between([12000, 20000], rng) }
  },
  // Curiosea en la fuente: se sienta en el borde y la mira.
  fountain: (ctx, rng) => {
    if (!ctx.fountain) return null
    const to = ctx.nav.nearestFree(ctx.fountain.x + (rng() < 0.5 ? -34 : 34), ctx.fountain.y + 16)
    return to && { kind: 'fountain', to, pose: 'sit', ms: between([6000, 10000], rng), look: ctx.fountain }
  },
  // Sigue a una mariposa que ande por la plaza.
  butterfly: (ctx, rng) => {
    const flies = ctx.butterflies ?? []
    if (!flies.length) return null
    const prey = pick(flies, rng)
    return { kind: 'butterfly', to: ctx.nav.nearestFree(prey.x, prey.y + 8), pose: 'sit', ms: between([4000, 7000], rng), prey, look: prey }
  },
  // Se acerca a la viajera, si anda cerca, y se sienta a su lado un rato.
  traveller: (ctx, rng) => {
    if (!ctx.traveller || distance(ctx.traveller, ctx.fountain ?? ctx.traveller) > 260) return null
    const to = ctx.nav.nearestFree(ctx.traveller.x + (rng() < 0.5 ? -22 : 22), ctx.traveller.y + 8)
    return to && { kind: 'traveller', to, pose: 'sit', ms: between([6000, 11000], rng), look: ctx.traveller }
  },
}

function chooseActivity(o, ctx) {
  const kinds = Object.keys(ACTIVITIES).filter((kind) => kind !== o.lastKind)
  const options = kinds.map((kind) => ACTIVITIES[kind](ctx, o.rng)).filter(Boolean)
  if (!options.length) return null
  // Con Grace sentada, quedarse a su lado pesa el doble: es lo que la hizo venir.
  const weighted = options.flatMap((option) => (option.kind === 'bench' ? [option, option] : [option]))
  return pick(weighted, o.rng)
}

function startActivity(o, activity, ctx) {
  const path = ctx.nav.path(o, activity.to)
  if (!path) return false
  Object.assign(o, { activity, path, goal: activity.to, left: activity.ms, speed: activity.run ? OUTING.runSpeed : OUTING.walkSpeed, lastKind: activity.kind, blocked: 0 })
  return true
}

// Mira hacia lo que le interesa mientras está quieta.
function lookAt(o, point) {
  if (point) face(o, point.x - o.x)
}

function rest(o, dt) {
  o.washIn -= dt
  if (o.pose === 'sit' && o.washIn <= 0) {
    o.pose = 'wash'
    o.washIn = between([6000, 11000], o.rng)
  }
}

// Avanza `dt` ms. `ctx`: `nav`, `home` (dónde está Lupe ahora, `{ x, y }`), `rain`, `night`, `recalled` (algo la reclama), `others` (cuerpos de
// otros personajes `{ x, y }`), y lo que mire cada actividad (`grace`, `pigeons`, `sunSpots`, `fountain`, `butterflies`, `traveller`).
// Devuelve 'home' el fotograma en que llega de vuelta con Lupe.
export function updateOuting(o, dt, ctx) {
  o.tick += dt
  if (o.phase === 'home') {
    o.restLeft -= dt
    return null
  }
  if (o.phase === 'going') {
    if (walk(o, dt, ctx)) Object.assign(o, { phase: 'stay', activity: null, left: 0 })
    return null
  }
  if (o.phase === 'leaving') {
    // Lupe puede moverse: cuando el camino que llevaba se acaba, se vuelve a pedir hacia donde está ahora.
    if (o.path.length === 0 && distance(o, ctx.home) > OUTING.homeReach) o.path = ctx.nav.path(o, ctx.home) ?? [{ x: ctx.home.x, y: ctx.home.y }]
    o.goal = ctx.home
    walk(o, dt, { ...ctx, others: [] })
    if (distance(o, ctx.home) > OUTING.homeReach) return null
    Object.assign(o, { phase: 'home', path: [], pose: 'sit', activity: null, restLeft: between(OUTING.restMs, o.rng) })
    return 'home'
  }
  // stay
  o.stayLeft -= dt
  const wantsHome = o.stayLeft <= 0 || ctx.rain || ctx.night || ctx.recalled
  if (!o.activity) {
    if (wantsHome) return leave(o, ctx)
    const next = chooseActivity(o, ctx)
    if (!next || !startActivity(o, next, ctx)) {
      o.pose = 'sit'
      rest(o, dt)
      // Sin nada que hacer, espera un poco antes de volver a mirar (y no se queda toda la salida así).
      o.waitFor = (o.waitFor ?? 0) + dt
      if (o.waitFor > 8000) return leave(o, ctx)
    }
    return null
  }
  const act = o.activity
  if (o.path.length) {
    // La presa se mueve: la persecución repite el camino cada poco hacia donde está ahora.
    if (act.prey && o.tick % 700 < dt) o.path = ctx.nav.path(o, act.prey) ?? o.path
    if (walk(o, dt, ctx) && act.kind === 'chase') o.left = Math.min(o.left, 1500)
    return null
  }
  o.waitFor = 0
  o.pose = act.pose
  lookAt(o, act.look ?? act.prey)
  if (act.pose === 'sit') rest(o, dt)
  o.left -= dt
  if (o.left <= 0) o.activity = null
  return null
}

function leave(o, ctx) {
  const path = ctx.nav.path(o, ctx.home)
  Object.assign(o, { phase: 'leaving', activity: null, goal: ctx.home, path: path ?? [{ x: ctx.home.x, y: ctx.home.y }], speed: OUTING.walkSpeed })
  return null
}

// ¿Toca salir? En casa, con la espera cumplida y sin motivo para quedarse.
export const dueToGoOut = (o, ctx) => o.phase === 'home' && o.restLeft <= 0 && mayGoOut(ctx)

// ¿Se ve en el valle? Todo menos estar en casa.
export const isOut = (o) => o.phase !== 'home'
