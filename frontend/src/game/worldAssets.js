// Dibujos del valle ya preparados (con la paleta pastel y las versiones de verano, otoño, escarcha y nieve). Pintarlos cuesta
// unos 3 s de procesador, que antes se pasaban con la pantalla de carga: ahora se hacen en segundo plano
// mientras el visitante está en el creador (`warmWorld`), y al entrar la escena solo los recoge.
//
// Cada pieza es un `Job` (sliced.js): se puede avanzar a porciones de pocos milisegundos, para que ni el
// creador ni la animación se paren en un móvil, o terminar al momento si la escena la pide antes de tiempo.
// Sin Phaser.
import { groundCanvasSteps } from './ground.js'
import { BUILDINGS, COLS, PROPS, ROWS, TILE, plazaTiles, roadTiles } from './world.js'
import { signedDistance as riverDistance } from './river.js'
import { buildingSprite } from './buildings/index.js'
import { FRUIT_LOOKS, isFruitTree } from './fruitTrees.js'
import { propSprite } from './props.js'
import { loadPngAssets } from './pngAssets.js'
import { Job, runSliced } from './sliced.js'
import { treeSprite } from './sprites.js'
import { lightenSteps, softenSteps } from './titleSoften.js'
import { autumnSteps, copyCanvas, frostSteps, snowSteps, summerSteps } from './valleSeasons.js'

// Capas de estación que se funden sobre la base (la primavera), de abajo arriba (ver `SkyLayer`).
export const SEASON_LAYERS = ['summer', 'autumn', 'frost', 'snow']
// Los edificios y objetos solo cambian con la nieve: no tienen hierba ni copas que secar o helar.
const SNOW_ONLY = ['snow']
const jobs = new Map()
const job = (key, make) => {
  if (!jobs.has(key)) jobs.set(key, new Job(make))
  return jobs.get(key)
}

// Un dibujo con sus versiones de estación: `{ base, summer, autumn, frost, snow }` (las que no se piden, nulas). Con `pastel` primero se aclara y
// las estaciones salen del dibujo aclarado; al final se suaviza cada versión (igual que la portada). `thin` quita hojas a la escarcha (árboles).
function* sceneryFrom(canvas, pastel, { seasons = SEASON_LAYERS, cap = true, thin = false, recolor = true } = {}) {
  const base = pastel ? yield* lightenSteps(canvas) : canvas
  const make = {
    summer: () => summerSteps(base),
    autumn: () => autumnSteps(base),
    frost: () => frostSteps(base, { thin }),
    snow: () => snowSteps(base, { cap, recolor }),
  }
  const set = { base }
  for (const layer of SEASON_LAYERS) set[layer] = seasons.includes(layer) ? yield* make[layer]() : null
  if (pastel) {
    yield* softenSteps(base)
    for (const layer of SEASON_LAYERS) if (set[layer]) yield* softenSteps(set[layer])
  }
  return set
}

const treeJob = (variant, pastel) => job(`tree:${variant}:${pastel}`, () => sceneryFrom(treeSprite(variant), pastel, { thin: true }))
export const treeAssets = (variant, pastel) => treeJob(variant, pastel).get()

// Si el edificio trae una capa que va por encima de quien pasa (la barandilla delantera de la casa de Lupe), se
// prepara igual que el dibujo principal para que cambie con la paleta y la nieve a la vez.
// Si además trae una capa de nieve propia (`snow`: la que `snowCap` no alcanza, como pasamanos o bordes), se pinta
// encima de su versión de nieve.
const addSnow = (set, snow) => {
  if (snow && set.snow) set.snow.getContext('2d').drawImage(snow, 0, 0)
}

function* withSprite(sprite, pastel) {
  // `painted`: dibujos con colores propios (los PNG de la usuaria o fachadas copiadas de ellos, como la bandera andaluza de la
  // Escuela de Artes), cuyos verdes no son hierba y no se cubren de nieve.
  const recolor = !sprite.painted
  const set = yield* sceneryFrom(sprite.canvas, pastel, { seasons: SNOW_ONLY, recolor })
  addSnow(set, sprite.snow)
  if (!sprite.overlay) return { sprite, set }
  const { x, y, canvas, snow } = sprite.overlay
  const overlaySet = yield* sceneryFrom(canvas, pastel, { seasons: SNOW_ONLY, cap: false, recolor })
  addSnow(overlaySet, snow)
  return { sprite, set, overlay: { x, y, set: overlaySet } }
}

const buildingJob = (building, pastel) => job(`building:${building.id}:${pastel}`, () => withSprite(buildingSprite(building), pastel))
export const buildingAssets = (building, pastel) => buildingJob(building, pastel).get()

// Un frutal trae su dibujo de cada estación ya hecho (no recoloreado): la primavera es la base y el verano, el otoño, la escarcha y la nieve las
// capas que funde el cielo.
const FRUIT_LAYERS = { base: FRUIT_LOOKS.spring, summer: FRUIT_LOOKS.summer, autumn: FRUIT_LOOKS.autumn, frost: FRUIT_LOOKS.winter, snow: FRUIT_LOOKS.snow }

function* fruitWithSprite(kind, pastel) {
  const set = {}
  for (const [layer, state] of Object.entries(FRUIT_LAYERS)) {
    const { canvas } = propSprite(kind, state)
    const lit = pastel ? yield* lightenSteps(copyCanvas(canvas)) : canvas
    if (pastel) yield* softenSteps(lit)
    set[layer] = lit
  }
  return { sprite: propSprite(kind, 0), set }
}

const propJob = (prop, pastel) =>
  job(`prop:${prop.kind}:${prop.variant ?? 0}:${pastel}`, () => (isFruitTree(prop.kind) ? fruitWithSprite(prop.kind, pastel) : withSprite(propSprite(prop.kind, prop.variant ?? 0), pastel)))
export const propAssets = (prop, pastel) => propJob(prop, pastel).get()

// El suelo es lo más pesado (más de un millón de píxeles): pintar, aclarar y suavizar la base es lo que hace
// falta para entrar; el otoño y el invierno se preparan después y la escena los añade cuando están listos.
const groundRawJob = (pastel) =>
  job(`ground:raw:${pastel}`, () => groundCanvasSteps({ cols: COLS, rows: ROWS, tile: TILE, roads: roadTiles(), plaza: plazaTiles(), waterField: riverDistance }))

function* litGround(pastel) {
  const raw = yield* groundRawJob(pastel).steps()
  return pastel ? yield* lightenSteps(raw) : raw
}
const groundLitJob = (pastel) => job(`ground:lit:${pastel}`, () => litGround(pastel))

// La base se suaviza sobre una copia, para que las estaciones sigan saliendo del dibujo aclarado.
const groundBaseJob = (pastel) =>
  job(`ground:base:${pastel}`, function* base() {
    const lit = yield* groundLitJob(pastel).steps()
    if (!pastel) return lit
    const copy = copyCanvas(lit)
    yield* softenSteps(copy)
    return copy
  })

export const groundBase = (pastel) => groundBaseJob(pastel).get()

// Versión de estación del suelo (`summer`, `autumn`, `frost` o `snow`), como trabajo que se puede ir avanzando.
const GROUND_STEPS = { summer: summerSteps, autumn: autumnSteps, frost: frostSteps, snow: (canvas) => snowSteps(canvas, { cap: false }) }
export const groundSeasonJob = (season, pastel) =>
  job(`ground:${season}:${pastel}`, function* seasonal() {
    const lit = yield* groundLitJob(pastel).steps()
    const result = yield* GROUND_STEPS[season](lit)
    if (pastel) yield* softenSteps(result)
    return result
  })

// Prepara el valle en segundo plano, a porciones. Se puede pedir las veces que haga falta: la segunda vez
// devuelve la misma promesa. `warmEntry` es lo que hace falta para entrar (suelo, árboles, edificios y
// objetos); la pantalla de carga espera solo a eso, y así la escena lo encuentra hecho en vez de pintarlo de
// golpe y congelar el móvil. `warmWorld` añade después las estaciones del suelo.
const entryWarming = new Map()
export function warmEntry(pastel) {
  if (entryWarming.has(pastel)) return entryWarming.get(pastel)
  const props = [...new Map(PROPS.map((p) => [`${p.kind}:${p.variant ?? 0}`, p])).values()]
  // La grúa y las fachadas de RACE y Copos salen de un PNG: hay que tenerlos decodificados antes de pintarlos (ver `pngAssets.js`).
  const done = loadPngAssets().then(() =>
    runSliced([
      groundBaseJob(pastel),
      ...[0, 1, 2].map((v) => treeJob(v, pastel)),
      ...BUILDINGS.map((b) => buildingJob(b, pastel)),
      ...props.map((p) => propJob(p, pastel)),
    ]),
  )
  entryWarming.set(pastel, done)
  return done
}

const warming = new Map()
export function warmWorld(pastel) {
  if (warming.has(pastel)) return warming.get(pastel)
  const done = warmEntry(pastel).then(() => runSliced(SEASON_LAYERS.map((season) => groundSeasonJob(season, pastel))))
  warming.set(pastel, done)
  return done
}
