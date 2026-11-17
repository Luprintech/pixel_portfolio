// Triunfo de San Rafael: la ilustración de la usuaria (base rocosa con las figuras sentadas, el pedestal con el escudo, la columna
// y el arcángel con su vara). Reducida a 48 px se perdía el arcángel, así que va al triple de resolución (144×400) y se dibuja a un
// tercio (`scale`): ocupa 48×133 en el mapa y, al zoom habitual (3), cada píxel de la textura cae en un píxel de pantalla.
// Para que no parezca una imagen pegada encima del valle, el PNG lleva la paleta reducida a 16 colores (sombreado plano, como el
// resto) y aquí se le entinta como si estuviera pintado con código: un perfil fino y oscuro alrededor y líneas finas por dentro donde
// cambia la forma (pliegues, rocas, molduras). Un contorno de un píxel del mapa, como el de los edificios, resultaba demasiado grueso
// a esta resolución (decisión de la usuaria, 2026-11-13).
import { makeCanvas, outlineSolid } from './pixelKit.js'
import { drawPng } from './pngAssets.js'

const SCALE = 1 / 3
const INK = '#21171c'
// Diferencia de luz (0 a 255) entre dos píxeles vecinos a partir de la cual se traza una línea entre ellos. Más baja entintaría el
// sombreado suave; más alta dejaría sin línea los pliegues de las figuras.
const EDGE_STEP = 46
// El PNG mide 144×400 y su losa toca los bordes: el lienzo deja un píxel para el perfil a los lados y arriba. Abajo no hace falta
// (apoya en el suelo) y así el punto de apoyo, abajo en el centro, no se mueve.
const PNG = { w: 144, h: 400 }
const WIDTH = PNG.w + 2
const HEIGHT = PNG.h + 1

// Cuerpo sólido: solo la huella de la base, para poder rodearlo; la columna y el arcángel van en alto.
export const SAN_RAFAEL_BODY = [{ l: -22, t: -10, r: 22, b: -1 }]

// Líneas interiores: donde un píxel es bastante más oscuro que su vecino de la derecha o de abajo, se entinta el oscuro. Así la
// línea cae del lado de la sombra, de un píxel de grueso, como la trazaría quien dibuja.
function inkEdges(canvas) {
  const { width: w, height: h } = canvas
  const g = canvas.getContext('2d')
  const { data } = g.getImageData(0, 0, w, h)
  const light = (i) => 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2]
  const marks = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      if (data[i + 3] < 200) continue
      for (const [nx, ny] of [[x + 1, y], [x, y + 1]]) {
        if (nx >= w || ny >= h) continue
        const j = (ny * w + nx) * 4
        if (data[j + 3] < 200) continue
        const step = light(j) - light(i)
        if (step > EDGE_STEP) marks.push([x, y])
        else if (-step > EDGE_STEP) marks.push([nx, ny])
      }
    }
  }
  g.fillStyle = INK
  marks.forEach(([x, y]) => g.fillRect(x, y, 1, 1))
}

export function sanRafael() {
  const canvas = makeCanvas(WIDTH, HEIGHT)
  drawPng(canvas.getContext('2d'), 'sanRafael', 1, 1)
  inkEdges(canvas)
  outlineSolid(canvas, INK)
  return { canvas, body: SAN_RAFAEL_BODY, painted: true, scale: SCALE }
}
