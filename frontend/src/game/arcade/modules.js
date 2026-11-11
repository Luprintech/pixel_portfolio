// Los módulos de cada juego de la recreativa, con la misma forma para todos. Así `ArcadeMachine` (selector, pausa, resultados,
// controles y bucle) no sabe nada de ninguno en concreto. Cada juego es una carpeta con su lógica pura, su dibujo y sus
// sprites; este archivo los junta. Para añadir uno hay que darlo de alta también en `games.js`.
//   create(seed)             -> estado nuevo
//   step(state, input, dt)   -> sucesos (para sonido y logros); input = { dx, dy, action, hold }
//   draw(g, state, time)     -> pinta un fotograma de 240×192
//   view(state)              -> { status, message, bubble, hint, hud } (lo que enseña la interfaz)
//   result(state)            -> { score, won, stats, reward } (pantalla de resultados)
//   seeds                    -> semillas que se alternan entre partidas, para que no sean siempre idénticas
import { drawGame as drawDungeon } from './dungeon/render.js'
import * as dungeon from './dungeon/logic.js'
import { drawGame as drawGalactic } from './galactic/render.js'
import * as galactic from './galactic/logic.js'
import { drawGame as drawRiver } from './river/render.js'
import * as river from './river/logic.js'
import { RIVER_SEEDS } from './river/level.js'

const defineGame = (logic, draw, seeds) => ({ create: logic.createGame, step: logic.step, draw, view: logic.view, result: logic.result, seeds })

export const MODULES = {
  dungeon: defineGame(dungeon, drawDungeon, [7, 13, 29]),
  galactic: defineGame(galactic, drawGalactic, [11, 31, 53]),
  river: defineGame(river, drawRiver, RIVER_SEEDS),
}
