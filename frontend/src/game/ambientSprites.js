// Dibujo de los adornos vivos del valle (ver `ambient.js`): pájaros pequeños (posado y con las alas arriba y abajo, de tres especies) y mariposas
// (alas abiertas o cerradas, de tres colores). Todo mira a la derecha: la escena los refleja al volar a la izquierda.
import { dot, makeCanvas, outline, rect } from './pixelKit.js'

const BIRD_COLORS = [
  { back: '#8a6a4a', belly: '#d8c4a0', wing: '#6a4e34' },
  { back: '#7a6a62', belly: '#d9553a', wing: '#5a4c46' },
  { back: '#5a8fc4', belly: '#f2d04a', wing: '#3c6a9a' },
]

// `frame`: 'perch' (posado), 'up' (alas arriba) o 'down' (alas abajo). Mide 11×9.
export function birdCanvas(species, frame) {
  const canvas = makeCanvas(11, 9)
  const g = canvas.getContext('2d')
  const c = BIRD_COLORS[species % BIRD_COLORS.length]
  // Cuerpo, vientre, cabeza con pico y cola.
  rect(g, 3, 4, 5, 3, c.back)
  rect(g, 3, 6, 5, 1, c.belly)
  rect(g, 7, 3, 3, 3, c.back)
  dot(g, 10, 4, '#e8a838')
  dot(g, 8, 4, '#1f1a22')
  rect(g, 0, 5, 3, 1, c.wing)
  if (frame === 'perch') {
    rect(g, 4, 5, 3, 1, c.wing)
    dot(g, 4, 7, '#5a4630')
    dot(g, 6, 7, '#5a4630')
  } else if (frame === 'up') {
    rect(g, 3, 1, 1, 3, c.wing)
    rect(g, 4, 0, 2, 4, c.wing)
  } else {
    rect(g, 3, 6, 5, 2, c.wing)
    rect(g, 4, 7, 3, 1, c.wing)
  }
  return outline(canvas, 0.4)
}

const BUTTERFLY_COLORS = [['#f6c6d2', '#e07a9c'], ['#f8d77a', '#e29c34'], ['#9fd6e0', '#4a8fc4']]

// Mariposa de 7×5: con las alas abiertas, dos pares; cerradas, un solo ala vertical.
export function butterflyCanvas(kind, open) {
  const canvas = makeCanvas(7, 5)
  const g = canvas.getContext('2d')
  const [light, dark] = BUTTERFLY_COLORS[kind % BUTTERFLY_COLORS.length]
  if (open) {
    rect(g, 0, 0, 3, 3, light)
    rect(g, 4, 0, 3, 3, light)
    rect(g, 1, 3, 2, 2, dark)
    rect(g, 4, 3, 2, 2, dark)
    dot(g, 0, 0, dark)
    dot(g, 6, 0, dark)
  } else {
    rect(g, 2, 0, 3, 4, light)
    dot(g, 2, 3, dark)
    dot(g, 4, 3, dark)
  }
  rect(g, 3, 1, 1, 3, '#3a2a30')
  return canvas
}
