// Guion de la portada: qué hacen Lupe y Khalessi y qué dice cada una, en el tiempo. Es una lista de
// escenas que se recorre una vez (la bienvenida) y luego se repite en bucle (la vida del valle:
// comentarios del tiempo, la visita de la gata y consejos). Todo son funciones puras del tiempo para
// poder probarlas sin canvas; los textos viven en i18n y aquí solo hay sus claves.
//
// Cada escena dura `ms` y puede llevar:
//   pose  'idle' (de pie), 'wave' (saluda con la mano) o 'pet' (acaricia a la gata)
//   cat   por defecto descansa en su sitio. 'sit' y 'wash' (sentada y aseándose) y 'near' (junto a Lupe)
//         son posturas fijas; `route` es una ruta andando (game/titleCat.js) y 'play' un juego que se
//         elige según el cielo: mariposas, avellanas o, sin nada con qué jugar, lavarse
//   say   { key, who } lo que se dice ('lupe' por defecto, o 'khalessi')
//   event avisos puntuales, como el maullido, con su instante dentro de la escena

import {
  CAT_HOME, CAT_NEAR, COMING, LEAVING, NUTS_STILL, PLAY_MS, STROLL, butterflyPlay, groomPlay, nutAt, nutsPlay, standAt,
} from './titleCat.js'
import { butterfliesOut } from './titleSky.js'

const INTRO = [
  { ms: 900 },
  { ms: 4500, pose: 'wave', say: 'hello' },
  { ms: 4200, say: 'welcome1' },
  { ms: 4500, say: 'welcome2' },
  { ms: 4500, say: 'journey1' },
  { ms: 4500, say: 'journey2' },
  { ms: 4800, say: 'journey3' },
  { ms: 4500, say: 'classic1' },
  { ms: 4500, say: 'classic2' },
  { ms: 2500 },
]

// Cada bocadillo se queda unos 4,5 s. Las frases largas van partidas en varios (welcome1, welcome2...):
// en pantallas estrechas un bocadillo alto subía hasta tapar el subtítulo bajo el título.
const LOOP = [
  { ms: STROLL.ms, route: STROLL },
  { ms: 5500, say: 'ambient' },
  { ms: PLAY_MS, cat: 'play' },
  // `fair`: la visita de la gata solo ocurre con buen tiempo (ver `visitIsOff`).
  { ms: Math.max(COMING.ms, 3600), route: COMING, say: 'notice', fair: true },
  { ms: 5200, cat: 'near', say: 'meetCat', fair: true },
  { ms: 5200, cat: 'near', pose: 'pet', say: 'petting', fair: true },
  { ms: 2200, cat: 'near', pose: 'pet', say: { key: 'meow', who: 'khalessi' }, events: [{ at: 0, name: 'meow' }], fair: true },
  { ms: 6000, cat: 'near', pose: 'pet', say: 'catLoves', fair: true },
  { ms: Math.max(LEAVING.ms, 2000), route: LEAVING, fair: true },
  { ms: 1400, cat: 'sit' },
  { ms: 4200, cat: 'wash' },
  { ms: 1000, cat: 'sit' },
  { ms: 4800, say: 'tip' },
  { ms: 4200, say: 'tipMore' },
  { ms: 2500 },
]

// Cada consejo es una lista de bocadillos; 'tipMore' dice el segundo si lo hay y, si no, hace una pausa.
const TIPS = [['tipRelax'], ['tipOptions'], ['tipCustomize', 'tipCustomize2']]

const total = (scenes) => scenes.reduce((sum, scene) => sum + scene.ms, 0)
export const INTRO_MS = total(INTRO)
export const LOOP_MS = total(LOOP)

// Cada escena del bucle sabe dónde empieza dentro de la vuelta, y la visita de la gata (las escenas
// `fair`) empieza en la primera de ellas.
let loopAt = 0
LOOP.forEach((scene) => {
  scene.at = loopAt
  loopAt += scene.ms
})
const VISIT_AT = LOOP.find((scene) => scene.fair).at

// Con tormenta la gata no se acerca a que la acaricien: se queda en casa, y el susto de los truenos
// (titleArt.js) ya cuenta cómo Lupe la consuela. Se decide una vez, al empezar la visita, con el cielo de
// ese instante, para no cortarla a la mitad si el tiempo cambia.
const STORM_NO_VISIT = 0.3
const visitIsOff = (visitStart, skyOf) => skyOf(visitStart).storm > STORM_NO_VISIT

// Qué comentario del tiempo toca: la tormenta manda sobre la lluvia, y esta sobre el arcoíris.
export function ambientKey(sky) {
  if (sky.storm > 0.6) return 'ambientStorm'
  if (sky.rain > 0.3) return 'ambientRain'
  if (sky.rainbow > 0.4) return 'ambientRainbow'
  if (sky.dark > 0.7) return 'ambientNight'
  if (sky.dark > 0.2 && sky.phase < 0.5) return 'ambientDawn'
  return 'ambientDay'
}

// Escena que toca en el instante `ms`, cuándo empezó (en tiempo absoluto) y en qué vuelta del bucle va.
function sceneAt(ms) {
  if (ms < INTRO_MS) return locate(INTRO, ms, 0, 0)
  const after = ms - INTRO_MS
  const lap = Math.floor(after / LOOP_MS)
  return locate(LOOP, after % LOOP_MS, lap + 1, INTRO_MS + lap * LOOP_MS)
}

function locate(scenes, local, lap, base) {
  let from = 0
  for (const scene of scenes) {
    if (local < from + scene.ms) return { scene, local: local - from, start: base + from, lap }
    from += scene.ms
  }
  const last = scenes[scenes.length - 1]
  return { scene: last, local: last.ms, start: base + from - last.ms, lap }
}

// Qué juego toca, decidido con el cielo del momento en que empieza la escena para que no cambie a mitad.
export function playKind(sky) {
  if (sky.autumn > 0.9) return 'nuts'
  return butterfliesOut(sky) ? 'butterflies' : 'groom'
}

function playCat(kind, local, ms) {
  if (kind === 'nuts') return nutsPlay(local)
  if (kind === 'butterflies') return butterflyPlay(local, ms)
  return groomPlay(local)
}

// Dónde y cómo está Khalessi en esta escena. `ms` es el tiempo absoluto, `local` el de la escena.
function catIn(scene, local, ms, kind) {
  if (scene.route) return scene.route.at(local)
  switch (scene.cat) {
    case 'near':
      return standAt(CAT_NEAR)
    case 'sit':
    case 'wash':
      return { ...standAt(CAT_HOME), sit: scene.cat }
    case 'play':
      return playCat(kind, local, ms)
    default:
      return standAt(CAT_HOME)
  }
}

// Lo que pasa en el instante `ms`. `skyOf(t)` da el estado del cielo en cualquier instante: decide el
// comentario del tiempo y a qué juega la gata. `nuts` son las avellanas del suelo, si las hay.
export function lifeAt(ms, skyOf) {
  const found = sceneAt(ms)
  const { local, start, lap } = found
  // Una visita cancelada por la tormenta se queda en una pausa: la gata en su sitio y Lupe quieta.
  const scene = found.scene.fair && visitIsOff(start - found.scene.at + VISIT_AT, skyOf) ? { ms: found.scene.ms } : found.scene
  let say = scene.say
  if (say === 'ambient') say = ambientKey(skyOf(ms))
  else if (say === 'tip') say = TIPS[(lap - 1) % TIPS.length][0]
  else if (say === 'tipMore') say = TIPS[(lap - 1) % TIPS.length][1]
  if (typeof say === 'string') say = { key: say, who: 'lupe' }
  const kind = scene.cat === 'play' ? playKind(skyOf(start)) : null
  return {
    pose: scene.pose || 'idle',
    say: say || null,
    cat: catIn(scene, local, ms, kind),
    nuts: [nutAt(kind === 'nuts' ? local : 0), ...NUTS_STILL],
  }
}

// Avisos puntuales (el maullido) cuyo instante cae entre `fromMs` (sin incluir) y `toMs`.
// Con `skyOf` se descartan los de la visita de la gata si la tormenta la canceló.
export function eventsBetween(fromMs, toMs, skyOf) {
  const names = []
  const visit = (scenes, base) => {
    let from = base
    scenes.forEach((scene) => {
      scene.events?.forEach((event) => {
        const time = from + event.at
        if (time <= fromMs || time > toMs) return
        if (skyOf && scene.fair && visitIsOff(base + VISIT_AT, skyOf)) return
        names.push(event.name)
      })
      from += scene.ms
    })
  }
  visit(INTRO, 0)
  const firstLap = Math.max(0, Math.floor((fromMs - INTRO_MS) / LOOP_MS))
  const lastLap = Math.floor((toMs - INTRO_MS) / LOOP_MS)
  for (let lap = firstLap; lap <= lastLap; lap++) visit(LOOP, INTRO_MS + lap * LOOP_MS)
  return names
}
