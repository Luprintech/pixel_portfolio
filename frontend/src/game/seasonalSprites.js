// Dibujo de la fauna y la flora de cada estación (ver `seasonalFauna.js` y `seasonDecor.js`): pato, libélula, luciérnaga, ardilla y petirrojo,
// más las flores de primavera y las hojas caídas de otoño. Mismo pixel art pequeño y con contorno que los pájaros y las mariposas (`ambientSprites.js`).
// Todo mira a la derecha: la escena lo refleja al ir a la izquierda.
import { dot, makeCanvas, outline, rect } from './pixelKit.js'

// Pato de río (ánade azulón), 13×9. `frame` 0 y 1 lo hacen subir y bajar un píxel, como al flotar.
export function duckCanvas(frame) {
  const canvas = makeCanvas(13, 9)
  const g = canvas.getContext('2d')
  const dy = frame % 2
  rect(g, 8, 1 + dy, 3, 3, '#2f7a52')
  dot(g, 9, 2 + dy, '#14181a')
  rect(g, 11, 3 + dy, 2, 1, '#e8b838')
  dot(g, 8, 4 + dy, '#f4f4f0')
  rect(g, 2, 4 + dy, 8, 3, '#8a6a4a')
  rect(g, 3, 6 + dy, 7, 1, '#d8c4a0')
  rect(g, 4, 4 + dy, 4, 1, '#6a4e34')
  rect(g, 0, 3 + dy, 3, 2, '#4e3a28')
  // La estela: una línea clara en el agua, a los lados.
  g.fillStyle = 'rgba(255,255,255,0.55)'
  g.fillRect(1, 7 + dy, 11, 1)
  g.fillRect(frame % 2 ? 0 : 2, 8, frame % 2 ? 4 : 3, 1)
  return outline(canvas, 0.4)
}

// Libélula de 9×6: cuerpo turquesa alargado y dos alas; con `up` están arriba y con `down`, abiertas hacia abajo.
export function dragonflyCanvas(up) {
  const canvas = makeCanvas(9, 6)
  const g = canvas.getContext('2d')
  rect(g, 1, 3, 7, 1, '#2aa7b8')
  rect(g, 7, 2, 2, 2, '#1a6a78')
  dot(g, 8, 2, '#f8e060')
  dot(g, 0, 3, '#1a6a78')
  g.fillStyle = 'rgba(223,244,250,0.85)'
  if (up) {
    g.fillRect(3, 0, 3, 3)
    g.fillRect(2, 1, 1, 2)
  } else {
    g.fillRect(3, 4, 3, 2)
    g.fillRect(2, 4, 1, 1)
  }
  return canvas
}

// Resplandor de una luciérnaga, 7×7: un punto vivo en el centro y un halo que se apaga hacia fuera. Se pinta con mezcla aditiva.
export function fireflyCanvas() {
  const canvas = makeCanvas(7, 7)
  const g = canvas.getContext('2d')
  g.fillStyle = 'rgba(240,208,64,0.22)'
  g.fillRect(1, 2, 5, 3)
  g.fillRect(2, 1, 3, 5)
  g.fillStyle = 'rgba(246,224,96,0.65)'
  g.fillRect(2, 3, 3, 1)
  g.fillRect(3, 2, 1, 3)
  g.fillStyle = '#fff6a0'
  g.fillRect(3, 3, 1, 1)
  return canvas
}

// Ardilla de 12×10. `frame`: 'run0' y 'run1' (corriendo, con el cuerpo estirado y recogido), 'sit' (sentada con una bellota entre las patas).
export function squirrelCanvas(frame) {
  const canvas = makeCanvas(12, 10)
  const g = canvas.getContext('2d')
  const fur = '#a8641e'
  const light = '#e8d0a0'
  if (frame === 'sit') {
    rect(g, 4, 3, 4, 6, fur)
    rect(g, 5, 4, 2, 4, light)
    rect(g, 5, 0, 4, 3, fur)
    dot(g, 6, 0, '#7a4614')
    dot(g, 8, 1, '#14181a')
    dot(g, 9, 2, '#3a2418')
    rect(g, 1, 1, 3, 7, '#b8742e')
    rect(g, 0, 2, 1, 4, '#d8a060')
    rect(g, 7, 6, 2, 1, '#c49a4a')
    rect(g, 4, 9, 4, 1, '#7a4614')
    return outline(canvas, 0.4)
  }
  const stretch = frame === 'run1'
  rect(g, 3, 4 + (stretch ? 1 : 0), 6, 3, fur)
  rect(g, 4, 6 + (stretch ? 0 : 0), 4, 1, light)
  rect(g, 8, 3, 3, 3, fur)
  dot(g, 9, 2, '#7a4614')
  dot(g, 10, 4, '#14181a')
  dot(g, 11, 5, '#3a2418')
  // Cola grande y alzada.
  rect(g, 0, 0, 3, 6, '#b8742e')
  rect(g, 1, 0, 1, 2, '#d8a060')
  // Patas: recogidas o estiradas según el fotograma.
  if (stretch) {
    rect(g, 1, 8, 2, 1, '#7a4614')
    rect(g, 9, 7, 2, 1, '#7a4614')
  } else {
    rect(g, 4, 7, 1, 2, '#7a4614')
    rect(g, 8, 7, 1, 2, '#7a4614')
  }
  return outline(canvas, 0.4)
}

// Petirrojo de 9×8. `frame`: 'perch' (posado), 'fly0' y 'fly1' (alas arriba y abajo).
export function robinCanvas(frame) {
  const canvas = makeCanvas(9, 8)
  const g = canvas.getContext('2d')
  rect(g, 3, 3, 4, 3, '#7a5a42')
  rect(g, 5, 1, 3, 3, '#7a5a42')
  rect(g, 5, 3, 3, 3, '#e2682a')
  rect(g, 6, 2, 2, 1, '#e2682a')
  dot(g, 7, 2, '#14181a')
  dot(g, 8, 3, '#3a2a20')
  rect(g, 0, 4, 3, 1, '#5a4230')
  if (frame === 'perch') {
    dot(g, 4, 6, '#5a4630')
    dot(g, 6, 6, '#5a4630')
    rect(g, 3, 4, 3, 1, '#5a4230')
  } else if (frame === 'fly0') {
    rect(g, 3, 0, 2, 3, '#5a4230')
    rect(g, 4, 0, 2, 1, '#5a4230')
  } else {
    rect(g, 3, 5, 4, 2, '#5a4230')
  }
  return outline(canvas, 0.4)
}

// Flores de primavera de 5×6: margarita blanca, rosa, amarilla y violeta, cada una con su tallo.
const FLOWERS = [['#fffafa', '#f8d77a'], ['#f2a0bc', '#fff0a0'], ['#f8d040', '#c47a20'], ['#a888e0', '#f8e8a0']]
export const FLOWER_KINDS = FLOWERS.length

export function flowerCanvas(kind) {
  const canvas = makeCanvas(5, 6)
  const g = canvas.getContext('2d')
  const [petal, center] = FLOWERS[kind % FLOWERS.length]
  rect(g, 2, 3, 1, 3, '#4f8a38')
  dot(g, 1, 5, '#6aa84a')
  rect(g, 1, 1, 3, 1, petal)
  rect(g, 2, 0, 1, 3, petal)
  dot(g, 2, 1, center)
  return canvas
}

// Hojas caídas de otoño de 4×3: cuatro tonos y dos formas.
const LEAVES = ['#e0803a', '#c4572a', '#e8b04a', '#a8481f']
export const LEAF_KINDS = LEAVES.length

export function leafCanvas(kind) {
  const canvas = makeCanvas(4, 3)
  const g = canvas.getContext('2d')
  const color = LEAVES[kind % LEAVES.length]
  if (kind % 2) {
    rect(g, 0, 1, 3, 1, color)
    dot(g, 1, 0, color)
    dot(g, 3, 2, '#7a3a1a')
  } else {
    rect(g, 1, 0, 2, 1, color)
    rect(g, 0, 1, 4, 1, color)
    dot(g, 2, 2, '#7a3a1a')
  }
  return canvas
}
