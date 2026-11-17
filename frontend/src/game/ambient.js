// La vida ambiental del valle, sin Phaser: pájaros que cruzan, se posan en copas y tejados y echan a volar si alguien se acerca; mariposas que
// revolotean sobre los jardines; y los pétalos, hojas y manzanas que caen de los frutales según la estación. Todo es pequeño y no daña ni
// bloquea a nadie: son adornos que se pintan por encima y se pueden apagar con "reducir movimiento". Lo que hace cada cosa depende del cielo
// (`titleSky.js`: de noche, con lluvia o con nieve no hay pájaros ni mariposas) y de dónde está la viajera.
import { butterfliesOut } from './titleSky.js'

export const BIRDS = {
  // Cuántos a la vez, cada cuánto sale uno nuevo y cuánto se queda posado (ms).
  max: 3,
  spawnEvery: [14000, 30000],
  perchMs: [9000, 20000],
  // A esta distancia de un personaje echa a volar, y a qué velocidad vuela (px/s).
  scareRange: 44,
  speed: 52,
  // Altura sobre el suelo a la que vuela (px): por encima de la cabeza de los personajes.
  altitude: [30, 46],
  // De dónde llegan: a esta distancia de la viajera, fuera de la pantalla.
  spawnDistance: 330,
  // Los perchas que usa están a esta distancia de la viajera: ni tan cerca que la asusten, ni tan lejos que no se vea.
  perchNear: [70, 230],
}

const between = (range, rng) => range[0] + rng() * (range[1] - range[0])
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
const pick = (list, rng) => list[Math.floor(rng() * list.length)]

// ¿Hay pájaros? De día y sin lluvia ni nevada, ni nieve todavía sin retirar (con escarcha sí: es lo normal de un invierno sin nevada).
export const birdsOut = (sky) => Boolean(sky) && sky.dark < 0.45 && sky.rain < 0.2 && (sky.snow ?? 0) < 0.1 && (sky.snowCover ?? sky.winter) < 0.4

export function createAmbient(rng = Math.random) {
  return { rng, birds: [], nextBird: between([4000, 9000], rng) }
}

// Perchas de pájaros: la copa de cada árbol (`trees`, con `x`, `y` en teselas, plantado con la base en la fila de abajo) y los puntos altos que da la
// escena (`extra`, ya en píxeles). `tile` es el tamaño de la tesela. Cada percha es `{ x, y, depth }`: donde apoyan los pies y la profundidad a la
// que se dibuja el pájaro (la del objeto en que se posa, para quedar por delante de él y por detrás de quien pase delante).
export function perchesOf(trees, extra, tile) {
  return [...trees.map((t) => ({ x: t.x * tile + tile / 2, y: t.y * tile + tile - 48, depth: t.y * tile + tile + 0.5 })), ...extra]
}

function newBird(a, traveller, perches) {
  const near = perches.filter((p) => {
    const d = distance(p, traveller)
    return d >= BIRDS.perchNear[0] && d <= BIRDS.perchNear[1]
  })
  if (!near.length) return null
  const perch = pick(near, a.rng)
  // Llega desde fuera de la pantalla, por el lado contrario a la percha respecto a la viajera (así cruza por delante).
  const angle = Math.atan2(perch.y - traveller.y, perch.x - traveller.x) + Math.PI + (a.rng() - 0.5) * 1.2
  const altitude = between(BIRDS.altitude, a.rng)
  const start = { x: traveller.x + Math.cos(angle) * BIRDS.spawnDistance, y: traveller.y + Math.sin(angle) * BIRDS.spawnDistance * 0.6 }
  return { x: start.x, y: start.y, z: altitude, flyZ: altitude, state: 'fly', target: perch, left: 0, face: perch.x < start.x ? 'left' : 'right', species: Math.floor(a.rng() * 3), perch: null, flap: a.rng() * 1000 }
}

function leave(a, bird, traveller) {
  // Se va hacia fuera de la pantalla, alejándose de quien la asustó.
  const angle = Math.atan2(bird.y - traveller.y, bird.x - traveller.x) + (a.rng() - 0.5) * 0.9
  Object.assign(bird, {
    state: 'away',
    z: Math.max(bird.z, 8),
    target: { x: bird.x + Math.cos(angle) * BIRDS.spawnDistance, y: bird.y + Math.sin(angle) * BIRDS.spawnDistance * 0.6 - 30 },
    face: Math.cos(angle) < 0 ? 'left' : 'right',
    perch: null,
  })
}

// Avanza `dt` ms. `ctx`: `sky`, `traveller`, `perches`, `scarers` (otros personajes que las asustan, `{ x, y }`) y `enabled` (falso con "reducir movimiento").
export function stepAmbient(a, dt, { sky, traveller, perches, scarers = [], enabled = true }) {
  const out = enabled && birdsOut(sky)
  a.nextBird -= dt
  if (out && a.nextBird <= 0 && a.birds.length < BIRDS.max) {
    const bird = newBird(a, traveller, perches)
    if (bird) a.birds.push(bird)
    a.nextBird = between(BIRDS.spawnEvery, a.rng)
  }
  a.birds.forEach((bird) => {
    bird.flap += dt
    if (bird.state === 'perch') {
      bird.left -= dt
      const threat = [traveller, ...scarers].some((who) => distance(who, bird.perch) < BIRDS.scareRange)
      if (threat || bird.left <= 0 || !out) leave(a, bird, traveller)
      return
    }
    // Vuelo: recto hacia el destino, bajando hasta la percha al llegar. Si el cielo se estropea, el que llega se va.
    const dx = bird.target.x - bird.x
    const dy = bird.target.y - bird.y
    const left = Math.hypot(dx, dy)
    const step = (BIRDS.speed * dt) / 1000
    if (bird.state === 'fly' && !out) leave(a, bird, traveller)
    if (left <= step) {
      Object.assign(bird, { x: bird.target.x, y: bird.target.y })
      if (bird.state === 'fly') Object.assign(bird, { state: 'perch', z: 0, left: between(BIRDS.perchMs, a.rng), perch: { ...bird.target } })
      else bird.state = 'gone'
      return
    }
    bird.x += (dx / left) * step
    bird.y += (dy / left) * step
    bird.face = dx < 0 ? 'left' : 'right'
    // Al acercarse a la percha baja hasta posarse; al irse, sube un poco.
    if (bird.state === 'fly') bird.z = Math.min(bird.flyZ, Math.max(0, (left / BIRDS.spawnDistance) * bird.flyZ * 2.2))
    else bird.z = Math.min(bird.z + dt * 0.012, BIRDS.altitude[1])
  })
  a.birds = a.birds.filter((bird) => bird.state !== 'gone')
}

// Mariposas: cada jardín `{ x, y, r }` tiene unas cuantas que revolotean en una curva suave (dos senos de distinta frecuencia) alrededor de su
// centro. Salen solo de día y sin lluvia ni nieve (`butterfliesOut`). Devuelve `{ x, y, z, open }` para cada una en el instante `ms`.
export function butterfliesAt(gardens, ms, sky, perGarden = 2) {
  if (!sky || !butterfliesOut(sky)) return []
  return gardens.flatMap((garden, g) =>
    Array.from({ length: perGarden }, (_, i) => {
      const seed = g * 7 + i * 3.1
      const t = ms / 1000 + seed
      return {
        x: garden.x + Math.sin(t * 0.5 + seed) * garden.r + Math.sin(t * 1.3) * 5,
        y: garden.y + Math.cos(t * 0.37 + seed * 1.7) * garden.r * 0.5,
        // Altura sobre el suelo: sube y baja al aletear.
        z: 8 + Math.sin(t * 0.9 + seed) * 5 + Math.sin(t * 6) * 1.2,
        open: Math.sin(t * 13 + seed) > 0,
        kind: (g + i) % 3,
      }
    }),
  )
}

// Lo que cae de un frutal según la estación del valle (`fruitTrees.js`): en primavera, pétalos; en otoño, hojas y alguna manzana; en invierno nada.
export const FALLING = {
  spring: { every: [2200, 5200], colors: ['#fffafa', '#f6c6d2', '#fffbe8'], size: 1, fall: 2200 },
  autumn: { every: [1800, 4200], colors: ['#cc7a24', '#e29c34', '#a85a1c', '#b8641e'], size: 2, fall: 2600, fruit: { chance: 0.22, color: '#d23a2a' } },
  winter: null,
}

// Un trozo que cae: `from` es de donde sale (en la copa), `to` donde cae (cerca del pie) y `drift` cuánto se mueve de lado con el viento.
export function newFall(tree, season, wind, rng) {
  const config = FALLING[season]
  if (!config) return null
  const isFruit = Boolean(config.fruit) && rng() < config.fruit.chance
  const from = { x: tree.x + (rng() - 0.5) * 30, y: tree.y - tree.height * (0.35 + rng() * 0.35) }
  const drift = (rng() - 0.5) * 14 + wind * 18
  return {
    from,
    to: { x: from.x + drift, y: tree.y + 2 + rng() * 6 },
    t: 0,
    ms: isFruit ? 900 : config.fall,
    color: isFruit ? config.fruit.color : pick(config.colors, rng),
    size: isFruit ? 3 : config.size,
    fruit: isFruit,
    sway: rng() * 6.28,
  }
}

// Dónde está un trozo que cae en el instante `k` (0 a 1): cae acelerando, y las hojas ondulan de lado; la fruta cae recta.
export function fallPosition(fall, k) {
  const sway = fall.fruit ? 0 : Math.sin(k * 9 + fall.sway) * 3
  const ease = fall.fruit ? k * k : k
  return { x: fall.from.x + (fall.to.x - fall.from.x) * k + sway, y: fall.from.y + (fall.to.y - fall.from.y) * ease }
}
