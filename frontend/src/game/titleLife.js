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
  { ms: 3200, pose: 'wave', say: 'hello' },
  { ms: 4800, say: 'welcome' },
  { ms: 5600, say: 'journey' },
  { ms: 4600, say: 'classic' },
  { ms: 2500 },
]

const LOOP = [
  { ms: STROLL.ms, route: STROLL },
  { ms: 3600, say: 'ambient' },
  { ms: PLAY_MS, cat: 'play' },
  { ms: Math.max(COMING.ms, 2400), route: COMING, say: 'notice' },
  { ms: 3600, cat: 'near', say: 'meetCat' },
  { ms: 3800, cat: 'near', pose: 'pet', say: 'petting' },
  { ms: 1600, cat: 'near', pose: 'pet', say: { key: 'meow', who: 'khalessi' }, events: [{ at: 0, name: 'meow' }] },
  { ms: 3600, cat: 'near', pose: 'pet', say: 'catLoves' },
  { ms: Math.max(LEAVING.ms, 2000), route: LEAVING },
  { ms: 1400, cat: 'sit' },
  { ms: 4200, cat: 'wash' },
  { ms: 1000, cat: 'sit' },
  { ms: 4200, say: 'tip' },
  { ms: 5000 },
]

const TIPS = ['tipRelax', 'tipOptions', 'tipCustomize']

const total = (scenes) => scenes.reduce((sum, scene) => sum + scene.ms, 0)
export const INTRO_MS = total(INTRO)
export const LOOP_MS = total(LOOP)

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
  const { scene, local, start, lap } = sceneAt(ms)
  let say = scene.say
  if (say === 'ambient') say = ambientKey(skyOf(ms))
  else if (say === 'tip') say = TIPS[(lap - 1) % TIPS.length]
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
export function eventsBetween(fromMs, toMs) {
  const names = []
  const visit = (scenes, base) => {
    let from = base
    scenes.forEach((scene) => {
      scene.events?.forEach((event) => {
        const time = from + event.at
        if (time > fromMs && time <= toMs) names.push(event.name)
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
