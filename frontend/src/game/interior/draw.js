// Piezas de dibujo comunes a todos los muebles de la casa: colores, un lienzo con la misma conversión pastel que el
// resto del valle y los elementos que se repiten (monitores, teclados, macetas). Sin dependencias de Phaser ni de React.
import { PAL, TONE } from '../palette.js'
import { hash2, makeCanvas, rect } from '../pixelKit.js'

export { rect, hash2 }

// Colores propios de la electrónica y los textiles de la casa. Todos salen de la paleta del valle o de un tono
// de su familia; no hay colores sueltos fuera de aquí.
export const INK = {
  night: '#22213f',
  night2: '#2e2d5a',
  slate: '#3b3957',
  slateLight: '#5c5a7a',
  steel: '#8d8aa8',
  steelLight: '#aaa7c4',
  white: '#f1ece2',
  whiteShade: '#cfc6b4',
  plum: PAL.plum,
  teal: PAL.teal,
  lagoon: PAL.lagoon,
  lagoonLight: PAL.lagoonLight,
  saffron: PAL.saffron,
  saffronLight: PAL.saffronLight,
  rose: PAL.rose,
  tile: PAL.tile,
  tileDark: PAL.tileDark,
  meadow: PAL.meadow,
  moss: PAL.moss,
  blue: '#3f5f9e',
  twitch: '#8f5fe8',
}
export const WOOD = TONE.wood
// El mismo reparto de tonos que `WOOD` (de más oscuro a más claro) para los muebles blancos de la casa: estanterías y mesas del
// rincón maker.
export const WHITE_FURNITURE = ['#b3aa97', INK.whiteShade, INK.white, '#ffffff']

// Con el tema pastel todo lo que se dibuja se aclara igual que el resto del valle (mismo `tint` que la sala y el
// escenario). Se aplica a la pieza ya terminada, así los dibujos usan siempre los colores base.
export function pastelize(canvas, pastel) {
  if (!pastel) return canvas
  const g = canvas.getContext('2d')
  const image = g.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = image
  for (let i = 0; i < data.length; i += 4) {
    if (!data[i + 3]) continue
    data[i] = Math.round(data[i] + (255 - data[i]) * 0.3)
    data[i + 1] = Math.round(data[i + 1] + (255 - data[i + 1]) * 0.3)
    data[i + 2] = Math.round(data[i + 2] + (255 - data[i + 2]) * 0.3)
  }
  g.putImageData(image, 0, 0)
  return canvas
}

// Lienzo con su contexto 2D, para pintar una pieza de `w` por `h` píxeles.
export function canvasOf(w, h) {
  const canvas = makeCanvas(w, h)
  return { canvas, g: canvas.getContext('2d') }
}

// Marco con luz arriba y a la izquierda y sombra abajo y a la derecha: la forma básica de casi todo lo que no es redondo.
export function slab(g, x, y, w, h, base, light, dark) {
  rect(g, x, y, w, h, base)
  rect(g, x, y, w, 1, light)
  rect(g, x, y, 1, h, light)
  rect(g, x, y + h - 1, w, 1, dark)
  rect(g, x + w - 1, y, 1, h, dark)
}

// Pantalla de código: líneas de colores que suben una fila con cada fotograma. `tones` son los colores de la sintaxis.
export function codeScreen(g, x, y, w, h, frame, tones) {
  rect(g, x, y, w, h, INK.night)
  const rows = Math.floor((h - 1) / 2)
  for (let r = 0; r < rows; r++) {
    const line = r + frame
    const indent = hash2(line, 3, 11) < 0.4 ? 3 : 0
    const length = 3 + Math.floor(hash2(line, 5, 11) * (w - indent - 6))
    const first = 1 + indent
    const tone = tones[Math.floor(hash2(line, 7, 11) * tones.length)]
    rect(g, x + first, y + 1 + r * 2, Math.min(length, w - first - 1), 1, tone)
    if (hash2(line, 9, 11) < 0.5) rect(g, x + first + Math.min(length, w - first - 1) + 1, y + 1 + r * 2, 2, 1, tones[(tones.indexOf(tone) + 2) % tones.length])
  }
}

// Partido de fútbol visto desde arriba: césped a franjas, líneas, dos porterías, dos equipos de colores y un balón que
// recorre el campo con el fotograma.
export function footballScreen(g, x, y, w, h, frame) {
  for (let i = 0; i < w; i += 4) rect(g, x + i, y, Math.min(4, w - i), h, (i / 4) % 2 ? '#4f9d3f' : '#62b04a')
  rect(g, x, y, w, 1, INK.white)
  rect(g, x, y + h - 1, w, 1, INK.white)
  rect(g, x, y, 1, h, INK.white)
  rect(g, x + w - 1, y, 1, h, INK.white)
  rect(g, x + Math.floor(w / 2), y, 1, h, INK.white)
  const cx = x + Math.floor(w / 2)
  const cy = y + Math.floor(h / 2)
  rect(g, cx - 2, cy - 2, 5, 1, INK.white)
  rect(g, cx - 2, cy + 2, 5, 1, INK.white)
  rect(g, cx - 2, cy - 1, 1, 3, INK.white)
  rect(g, cx + 2, cy - 1, 1, 3, INK.white)
  rect(g, x, cy - 2, 2, 5, INK.whiteShade)
  rect(g, x + w - 2, cy - 2, 2, 5, INK.whiteShade)
  const shift = [0, 1, 2, 1][frame % 4]
  ;[[4, 3, INK.tile], [7, 8, INK.tile], [10, 5, INK.tile], [14 - shift, 4, INK.blue], [17 - shift, 8, INK.blue], [19, 6, INK.blue]].forEach(([px, py, color]) => {
    rect(g, x + px, y + py + (frame % 2 && px > 9 ? 1 : 0), 2, 2, color)
  })
  rect(g, x + 9 + shift * 2, y + 6 - (shift ? 1 : 0), 1, 1, '#ffffff')
}

// Directo de una plataforma de streaming: cabecera morada, vídeo con un streamer a la izquierda (el piloto de directo
// parpadea) y una columna de chat con mensajes de colores que suben.
export function streamScreen(g, x, y, w, h, frame) {
  const side = Math.max(6, Math.floor(w * 0.32))
  rect(g, x, y, w, h, '#2b2142')
  rect(g, x, y, w, 2, INK.twitch)
  rect(g, x + 1, y + 3, w - side - 2, h - 5, '#463a6e')
  rect(g, x + 4, y + h - 7, 7, 4, INK.lagoon)
  rect(g, x + 5, y + h - 11, 5, 4, '#e8b48a')
  rect(g, x + 5, y + h - 12, 5, 2, INK.night)
  rect(g, x + 6, y + h - 9, 1, 1, INK.night)
  rect(g, x + 8, y + h - 9, 1, 1, INK.night)
  rect(g, x + 2, y + 4, 4, 2, frame % 2 ? INK.tile : '#8a2d2d')
  for (let r = 0; r < Math.floor((h - 4) / 3); r++) {
    const line = r + frame
    const colors = [INK.rose, INK.lagoonLight, INK.saffronLight, INK.meadow]
    const length = 2 + Math.floor(hash2(line, 4, 33) * (side - 4))
    rect(g, x + w - side, y + 3 + r * 3, 1, 1, colors[Math.floor(hash2(line, 6, 33) * colors.length)])
    rect(g, x + w - side + 2, y + 3 + r * 3, length, 1, INK.steelLight)
  }
}

// Navegador con una web de bloques de colores: cabecera, tarjetas y un botón.
export function pageScreen(g, x, y, w, h, frame) {
  rect(g, x, y, w, h, INK.white)
  rect(g, x, y, w, 2, INK.lagoon)
  rect(g, x + w - 4, y, 2, 2, INK.saffronLight)
  rect(g, x + 1, y + 3, w - 2, 3, INK.rose)
  const cards = Math.max(2, Math.floor((w - 1) / 6))
  for (let i = 0; i < cards; i++) rect(g, x + 1 + i * 6, y + 7, 4, h - 10, i === frame % cards ? INK.saffronLight : INK.steelLight)
  rect(g, x + 1, y + h - 2, 5, 1, INK.tile)
}

// Monitor de frente: marco, pantalla y peana. (x, y) es la esquina superior izquierda del marco; el pie ocupa tres filas bajo
// él. `look` cambia la carcasa: por defecto oscura; la blanca (`WHITE_MONITOR`) es la del setup de Atreus.
export const WHITE_MONITOR = { bezel: INK.white, edge: '#ffffff', shade: INK.whiteShade, stand: INK.whiteShade }
const DARK_MONITOR = { bezel: INK.night, edge: INK.slateLight, shade: INK.night, stand: INK.slate }

export function monitor(g, x, y, w, h, paintScreen, look = DARK_MONITOR) {
  rect(g, x, y, w, h, look.bezel)
  rect(g, x, y, w, 1, look.edge)
  paintScreen(g, x + 1, y + 1, w - 2, h - 3)
  rect(g, x + 1, y + h - 2, w - 2, 1, look.shade)
  rect(g, x + Math.floor(w / 2) - 1, y + h, 2, 2, look.stand)
  rect(g, x + Math.floor(w / 2) - 4, y + h + 2, 8, 1, look.stand)
}

// Teclado visto desde delante: base oscura y filas de teclas claras; `keys` y `base` cambian el color.
export function keyboard(g, x, y, w, base, keys) {
  rect(g, x, y, w, 3, base)
  for (let i = 1; i < w - 1; i += 2) {
    rect(g, x + i, y, 1, 1, keys)
    rect(g, x + i, y + 1, 1, 1, i % 4 === 1 ? keys : INK.steelLight)
  }
  rect(g, x + 2, y + 2, w - 4, 1, keys)
}

// Ratón con un punto de luz.
export function mouse(g, x, y, body, light) {
  rect(g, x, y, 3, 3, body)
  rect(g, x + 1, y, 1, 1, light)
}
