// Los dos escritorios de la casa, hechos para distinguirse de un vistazo: el de Atreus es oscuro y de gamer (dos
// monitores, torre blanca con cristal, tira de luz bajo la mesa) y el de Lupe es de madera cálida, con tres monitores
// de desarrolladora y las pequeñas cosas de su trabajo. `paint(g, frame)` dibuja el fotograma `frame` del ciclo de
// animación (pantallas y luces); las medidas son del lienzo de cada pieza y el suelo cae en su última fila.
import { LUPE_TOWER_W } from '../homeLayout.js'
import { INK, WOOD, codeScreen, footballScreen, keyboard, monitor, mouse, pageScreen, rect, slab, streamScreen } from '../draw.js'

const RGB = [INK.lagoonLight, INK.rose, INK.saffronLight, INK.meadow]
const SYNTAX = [INK.lagoonLight, INK.saffronLight, INK.rose, INK.meadow, INK.steelLight]
// Luz blanca de los ventiladores de Atreus: pulsa entre un blanco frío y uno cálido, sin colores.
const WHITE_LIGHT = ['#ffffff', '#e3eeff', '#f1ece2', '#d4e4f7']

// Ventilador de un frontal de torre, de 6×6 píxeles: marco oscuro, aro de luz con el color del fotograma y cuatro aspas que
// giran un octavo de vuelta por fotograma (en cruz y en equis, alternando) alrededor del cubo.
function fan(g, x, y, ring, frame) {
  rect(g, x, y, 6, 6, INK.slate)
  rect(g, x + 1, y + 1, 4, 4, INK.night)
  rect(g, x + 1, y + 1, 4, 1, ring)
  rect(g, x + 1, y + 4, 4, 1, ring)
  rect(g, x + 1, y + 2, 1, 2, ring)
  rect(g, x + 4, y + 2, 1, 2, ring)
  if (frame % 2 === 0) {
    rect(g, x + 2, y + 1, 2, 4, INK.steelLight)
    rect(g, x + 1, y + 2, 4, 2, INK.steelLight)
  } else {
    ;[[1, 1], [4, 1], [1, 4], [4, 4], [2, 2], [3, 3], [2, 3], [3, 2]].forEach(([dx, dy]) => rect(g, x + dx, y + dy, 1, 1, INK.steelLight))
  }
  rect(g, x + 2, y + 2, 2, 2, INK.night)
}

// Torre blanca de cristal templado: el frontal deja ver dos ventiladores animados cuya luz sale de `lights` (una lista de
// colores que se recorre con el fotograma, desfasada entre uno y otro): RGB en la de Lupe, blanca en la de Atreus.
function whiteTower(g, x, y, frame, lights) {
  slab(g, x, y, 14, 30, INK.white, '#ffffff', INK.whiteShade)
  rect(g, x + 2, y + 3, 10, 18, INK.night2)
  for (let i = 0; i < 2; i++) fan(g, x + 4, y + 5 + i * 8, lights[(frame + i * 2) % lights.length], frame + i)
  rect(g, x + 2, y + 23, 10, 1, INK.whiteShade)
  for (let i = 0; i < 4; i++) rect(g, x + 3, y + 25 + (i % 2) * 2, 8, 1, INK.whiteShade)
  rect(g, x + 10, y + 27, 2, 2, lights[frame % lights.length])
  rect(g, x + 1, y + 30, 2, 1, INK.slate)
  rect(g, x + 11, y + 30, 2, 1, INK.slate)
}

export const atreusDesk = {
  w: 80,
  h: 48,
  frames: 4,
  ms: 520,
  body: [{ l: -40, t: -15, r: 40, b: 0 }],
  paint(g, frame) {
    whiteTower(g, 66, 18, frame, WHITE_LIGHT)
    // Tablero oscuro con luz arriba, canto y una tira de color bajo el borde delantero.
    slab(g, 0, 30, 64, 6, INK.slate, INK.slateLight, INK.night2)
    rect(g, 0, 36, 64, 2, INK.night2)
    rect(g, 1, 38, 62, 1, RGB[frame % RGB.length])
    ;[3, 59].forEach((x) => {
      rect(g, x, 38, 3, 9, INK.steel)
      rect(g, x + 2, 38, 1, 9, INK.slateLight)
      rect(g, x - 1, 47, 5, 1, INK.slate)
    })
    rect(g, 4, 43, 56, 1, INK.slate)
    monitor(g, 5, 11, 26, 16, (gg, x, y, w, h) => footballScreen(gg, x, y, w, h, frame))
    monitor(g, 33, 11, 26, 16, (gg, x, y, w, h) => streamScreen(gg, x, y, w, h, frame))
    // Teclado oscuro con teclas claras, un segundo teclado blanco en el borde (le gustan) y el ratón con su luz.
    keyboard(g, 19, 31, 24, INK.night2, INK.steelLight)
    keyboard(g, 2, 32, 12, INK.white, INK.whiteShade)
    mouse(g, 47, 31, INK.night2, RGB[(frame + 1) % RGB.length])
    rect(g, 45, 34, 9, 1, INK.night)
    rect(g, 56, 29, 4, 5, INK.white)
    rect(g, 56, 29, 4, 1, INK.whiteShade)
    rect(g, 60, 30, 1, 3, INK.whiteShade)
  },
}

// Escritorio de Lupe: madera cálida, cajonera a la derecha, tres monitores (terminal, editor y navegador) y las cosas de
// su mesa: taza, patito de depuración, placa de desarrollo con un led, cactus, pieza impresa y notas adhesivas.
export const lupeDesk = {
  w: 76 + LUPE_TOWER_W,
  h: 48,
  frames: 4,
  ms: 520,
  body: [{ l: -(76 + LUPE_TOWER_W) / 2, t: -15, r: (76 + LUPE_TOWER_W) / 2, b: 0 }],
  paint(g, frame) {
    // La torre blanca con ventiladores RGB va a la izquierda de la mesa; el resto se dibuja desplazado a su derecha.
    whiteTower(g, 0, 18, frame, RGB)
    g.save()
    g.translate(LUPE_TOWER_W, 0)
    paintLupeDesk(g, frame)
    g.restore()
  },
}

// Mesa de madera de Lupe con todo lo que hay sobre ella, de la esquina (0, 0) de su propio dibujo.
function paintLupeDesk(g, frame) {
  const [deep, dark, mid, light] = WOOD
  slab(g, 0, 31, 76, 6, light, '#d9a173', mid)
  rect(g, 0, 37, 76, 2, dark)
  rect(g, 2, 39, 3, 8, mid)
  rect(g, 2, 39, 1, 8, light)
  // Cajonera: dos cajones con tirador y un hueco libre a la izquierda para las piernas.
  slab(g, 52, 39, 22, 9, mid, light, dark)
  rect(g, 53, 43, 20, 1, dark)
  rect(g, 61, 41, 4, 1, INK.saffronLight)
  rect(g, 61, 45, 4, 1, INK.saffronLight)
  rect(g, 2, 47, 3, 1, deep)

  monitor(g, 1, 14, 19, 14, (gg, x, y, w, h) => {
    codeScreen(gg, x, y, w, h, frame, [INK.meadow, INK.lagoonLight, INK.meadow])
    rect(gg, x + 1, y + h - 2, 2, 1, INK.meadow)
  })
  monitor(g, 21, 10, 34, 18, (gg, x, y, w, h) => codeScreen(gg, x, y, w, h, frame + 2, SYNTAX))
  monitor(g, 56, 14, 19, 14, (gg, x, y, w, h) => pageScreen(gg, x, y, w, h, frame))
  // Notas adhesivas en el marco del monitor de la izquierda y una pegatina en el del centro.
  rect(g, 3, 11, 4, 4, INK.saffronLight)
  rect(g, 3, 14, 4, 1, INK.saffron)
  rect(g, 8, 12, 3, 3, INK.rose)
  rect(g, 50, 11, 3, 3, INK.lagoonLight)
  rect(g, 51, 12, 1, 1, INK.white)

  keyboard(g, 24, 32, 22, INK.white, INK.rose)
  mouse(g, 49, 32, INK.white, INK.rose)
  rect(g, 47, 35, 8, 1, INK.rose)
  // Taza de café, con un vaho que sube y se reparte con el fotograma.
  rect(g, 7, 28, 5, 5, INK.white)
  rect(g, 12, 29, 1, 3, INK.white)
  rect(g, 8, 28, 3, 1, INK.tileDark)
  rect(g, 9 + (frame % 2), 25 - (frame % 2), 1, 2, INK.steelLight)
  // Patito de goma, el compañero de depuración.
  rect(g, 14, 29, 4, 3, INK.saffronLight)
  rect(g, 17, 28, 3, 3, INK.saffronLight)
  rect(g, 19, 29, 2, 1, INK.tile)
  rect(g, 18, 28, 1, 1, INK.night)
  // Placa de desarrollo con su led, y una piececita impresa en 3D junto a ella.
  rect(g, 2, 33, 8, 3, INK.moss)
  rect(g, 3, 33, 2, 1, INK.steelLight)
  rect(g, 8, 33, 1, 1, frame % 2 ? INK.saffronLight : INK.tile)
  rect(g, 60, 28, 4, 5, INK.lagoon)
  rect(g, 61, 27, 2, 1, INK.lagoonLight)
  rect(g, 60, 28, 1, 5, INK.lagoonLight)
  // Cactus en su maceta.
  rect(g, 68, 30, 5, 3, INK.tile)
  rect(g, 68, 30, 5, 1, INK.tileDark)
  rect(g, 70, 24, 2, 6, INK.moss)
  rect(g, 68, 26, 2, 1, INK.moss)
  rect(g, 68, 25, 1, 2, INK.moss)
  rect(g, 72, 27, 1, 1, INK.moss)
}
