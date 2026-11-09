// Lo que hace Khalessi por el prado, en las tres dimensiones útiles del dibujo: ancho, profundidad (la
// altura en la imagen) y tiempo. Son funciones puras: dadas las coordenadas de la imagen, dicen dónde
// está y qué hace en cada instante. Las posiciones son la esquina superior izquierda de su sprite
// (26×16), que apoya los pies unos 16 píxeles más abajo.
//
// Tiene tres juegos, que el guion elige según el cielo: perseguir y saltar a una mariposa en
// primavera, golpear una avellana de un lado a otro en otoño y, si no hay nada con qué jugar, lavarse.
import { butterfliesAt } from './titleMotion.js'

export const CAT_HOME = [236, 140]
export const CAT_NEAR = [207, 136]
// Franja del prado por la que se mueve: de la casa hacia delante, sin salirse por abajo.
export const CAT_MIN_Y = 128
export const CAT_MAX_Y = 162

const SPEED = 16
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
const lerp = (a, b, t) => a + (b - a) * t
const smooth = (t) => {
  const k = Math.min(1, Math.max(0, t))
  return k * k * (3 - 2 * k)
}
const easeOut = (t) => 1 - (1 - Math.min(1, Math.max(0, t))) ** 3

// Una ruta parte de `start` y sigue sus pasos: { to } camina hasta ahí y { stay, face, bat } se queda
// quieta un rato mirando hacia `face` (con `bat`, dando un zarpazo). La duración sale de las
// distancias, así que la gata siempre camina a la misma velocidad.
export function buildRoute(start, steps, facing = -1, speed = SPEED) {
  const segments = []
  let position = start
  let face = facing
  let time = 0
  steps.forEach((step) => {
    if (step.to) {
      const ms = (distance(position, step.to) / speed) * 1000
      const dx = step.to[0] - position[0]
      if (Math.abs(dx) >= 1) face = dx > 0 ? 1 : -1
      segments.push({ from: time, to: time + ms, a: position, b: step.to, face, walking: true, bat: false })
      time += ms
      position = step.to
    } else {
      if (step.face) face = step.face
      segments.push({ from: time, to: time + step.stay, a: position, b: position, face, walking: false, bat: !!step.bat })
      time += step.stay
    }
  })
  const last = { x: position[0], y: position[1], facing: face, walking: false, lift: 0 }
  return {
    ms: time,
    segments,
    at(local) {
      const seg = segments.find((s) => local >= s.from && local < s.to)
      if (!seg) return last
      const p = seg.to > seg.from ? (local - seg.from) / (seg.to - seg.from) : 1
      return {
        x: lerp(seg.a[0], seg.b[0], p),
        y: lerp(seg.a[1], seg.b[1], p),
        facing: seg.face,
        walking: seg.walking,
        lift: seg.bat ? 3 * Math.sin(Math.PI * p) : 0,
      }
    },
  }
}

export const standAt = (position, facing = -1) => ({ x: position[0], y: position[1], facing, walking: false, lift: 0 })

// Paseo corto por el prado en profundidad: sale de casa, baja hacia delante, mira un poco y vuelve.
export const STROLL = buildRoute(CAT_HOME, [
  { to: [210, 160] },
  { stay: 900 },
  { to: [172, 156] },
  { stay: 700, face: 1 },
  { to: CAT_HOME },
  { stay: 900 },
])
export const COMING = buildRoute(CAT_HOME, [{ to: CAT_NEAR }])
export const LEAVING = buildRoute(CAT_NEAR, [{ to: CAT_HOME }])

// Mariposas: la gata sigue a la primera con medio segundo de retraso, que es lo que tarda en
// reaccionar, y da un salto cada 1,7 s. Entra y sale del juego con una transición de tres segundos,
// para cruzar el prado a paso normal.
export const BUTTERFLY_MS = 12000
const FOLLOW_LAG = 650
const BLEND_MS = 3000
const POUNCE_EVERY = 1700
const POUNCE_MS = 450

export function butterflyPlay(local, ms) {
  const blend = smooth(Math.min(local / BLEND_MS, (BUTTERFLY_MS - local) / BLEND_MS))
  if (blend <= 0) return standAt(CAT_HOME)
  const [target] = butterfliesAt(ms - FOLLOW_LAG)
  const [before] = butterfliesAt(ms - FOLLOW_LAG - 300)
  const follow = [target.x - 12, Math.min(CAT_MAX_Y, Math.max(CAT_MIN_Y, target.y - 6))]
  const phase = local % POUNCE_EVERY
  return {
    x: lerp(CAT_HOME[0], follow[0], blend),
    y: lerp(CAT_HOME[1], follow[1], blend),
    facing: target.x >= before.x ? 1 : -1,
    walking: true,
    lift: phase < POUNCE_MS ? 7 * Math.sin((Math.PI * phase) / POUNCE_MS) : 0,
  }
}

// Avellanas: tres en el suelo, y la gata juega con una. La golpea hacia la izquierda dos veces, rodea
// por detrás y la devuelve con otros dos golpes; la avellana acaba donde empezó.
const NUT_PATH = [[214, 166], [200, 168], [186, 166]]
export const NUTS_STILL = [[168, 164, 0], [226, 166, 0]]
const NUT_SLIDE_MS = 700
const BAT_STAY = 320
const BAT_HIT_AT = 120

// Donde se coloca la gata para dar el golpe: al lado de la avellana contrario al de su empuje.
const behind = (nut, dir) => (dir < 0 ? [nut[0] + 3, nut[1] - 13] : [nut[0] - 29, nut[1] - 13])

const [N0, N1, N2] = NUT_PATH
const NUT_STEPS = [
  { to: behind(N0, -1) },
  { stay: BAT_STAY, face: -1, bat: true },
  { to: behind(N1, -1) },
  { stay: BAT_STAY, face: -1, bat: true },
  // Para rodear la avellana pasa por delante, por la parte baja del prado, y así no pisa a Lupe.
  { to: [N2[0] + 6, CAT_MAX_Y] },
  { to: behind(N2, 1) },
  { stay: BAT_STAY, face: 1, bat: true },
  { to: behind(N1, 1) },
  { stay: BAT_STAY, face: 1, bat: true },
  { to: CAT_HOME },
  { stay: 900 },
]
const NUT_ROUTE = buildRoute(CAT_HOME, NUT_STEPS)
export const NUTS_MS = NUT_ROUTE.ms

// Cada golpe lanza la avellana al siguiente punto del camino: ida y vuelta.
const NUT_MOVES = [[N0, N1], [N1, N2], [N2, N1], [N1, N0]]
const NUT_HITS = NUT_ROUTE.segments.filter((s) => s.bat).map((s) => s.from + BAT_HIT_AT)

export const nutsPlay = (local) => NUT_ROUTE.at(local)

// Altura del rebote de la avellana al rodar: dos botes que se van apagando hasta pararse.
const BOUNCE_HEIGHT = 5
const bounce = (t) => (t >= 1 ? 0 : Math.abs(Math.sin(t * Math.PI * 2.5)) * BOUNCE_HEIGHT * (1 - t))

// Dónde está la avellana que se mueve, como [x, y, altura]: quieta en su sitio y, tras cada golpe,
// deslizándose y botando. `y` es el suelo; la altura se resta al dibujarla y su sombra se queda abajo.
export function nutAt(local) {
  let position = [N0[0], N0[1], 0]
  NUT_HITS.forEach((hit, i) => {
    if (local < hit) return
    const [from, to] = NUT_MOVES[i]
    const t = (local - hit) / NUT_SLIDE_MS
    position = [lerp(from[0], to[0], easeOut(t)), lerp(from[1], to[1], easeOut(t)), bounce(t)]
  })
  return position
}

// Sin mariposas ni avellanas, se sienta, se lava y se vuelve a levantar.
export const GROOM_MS = 8000
export function groomPlay(local) {
  const sit = local < 1600 || (local >= 6800 && local < GROOM_MS) ? 'sit' : local < 6800 ? 'wash' : null
  return { ...standAt(CAT_HOME), sit }
}

// Susto por un trueno: corre desde donde esté hasta quedar tras Lupe (el sprite de la gata queda casi
// tapado por el de ella), tiembla allí con las orejas y el rabo caídos y, pasado el susto, vuelve a casa
// andando. Con otro trueno mientras tanto, el susto empieza de nuevo desde donde esté.
// Lupe está en x 190 (LUPE_X en titleArt.js, que no se importa aquí para evitar un ciclo); con y 128 la
// gata se pinta detrás de ella.
const SCARE_HIDE = [186, CAT_MIN_Y]
const SCARE_RUN_SPEED = 55
const SCARE_HIDE_MS = 4500
const COMFORT_MS = 9000

export function startScare(from, ms) {
  const route = buildRoute(
    [from.x, from.y],
    // Al salir de detrás, se acerca a Lupe y se deja consolar antes de volver a casa.
    [{ to: SCARE_HIDE }, { stay: SCARE_HIDE_MS }, { to: CAT_NEAR }, { stay: COMFORT_MS, face: -1 }, { to: CAT_HOME }],
    -1,
    SCARE_RUN_SPEED,
  )
  const [, hiding, , comfort] = route.segments
  return { start: ms, route, fearEnd: hiding.to, comfort }
}

// La gata en el instante `ms` de un susto, o null cuando ya ha vuelto a casa. `scared` indica orejas y rabo
// caídos. Mientras Lupe la consuela, `comfort` dice cuál de las dos frases toca ('comfort1' o 'comfort2').
export function scaredCat(scare, ms) {
  const local = ms - scare.start
  if (local >= scare.route.ms) return null
  const { from, to } = scare.comfort
  const comforting = local >= from && local < to
  const comfort = comforting ? (local < (from + to) / 2 ? 'comfort1' : 'comfort2') : null
  return { ...scare.route.at(local), scared: local < scare.fearEnd, comfort }
}

// Tiempo que ocupa la escena de juego: el del juego más largo.
export const PLAY_MS = Math.ceil(Math.max(BUTTERFLY_MS, NUTS_MS, GROOM_MS) / 100) * 100
