// Rostro: sombra del flequillo, ojos, cejas, mejillas y boca. Cada expresión es una ficha
// (`EXPRESSIONS`) que combina un tipo de ojos, de cejas y de boca sobre la cara base; las funciones
// de abajo dibujan cada pieza por separado, para frente y para perfil. De perfil se ve un solo ojo;
// el guiño solo cierra el ojo izquierdo del personaje, que es el que enseña el perfil izquierdo (el
// derecho se dibuja con los dos ojos abiertos).
//
// Ojos de 2×3 de frente (blanco hacia fuera, pupila hacia dentro) y de 2×3 de perfil. La fila baja
// usa letras propias (v, f) para que al parpadear quede como una pestaña. Las cejas y los párpados
// llevan la letra Z, las lágrimas q.

export const EXPRESSIONS = {
  serena: { eyes: 'open', mouth: 'flat' },
  sonrisa: { eyes: 'open', mouth: 'smile' },
  risa: { eyes: 'arc', mouth: 'laugh' },
  guino: { eyes: 'wink', mouth: 'smile' },
  sorpresa: { eyes: 'open', mouth: 'gasp' },
  enfado: { eyes: 'open', brows: 'angry', mouth: 'flat' },
  tristeza: { eyes: 'open', brows: 'sad', mouth: 'frown' },
  llanto: { eyes: 'open', brows: 'sad', mouth: 'wail', tears: true },
  concentracion: { eyes: 'lid', mouth: 'dot' },
  duda: { eyes: 'open', brows: 'doubt', mouth: 'slant' },
  sueno: { eyes: 'sleepy', mouth: 'yawn' },
  verguenza: { eyes: 'aside', mouth: 'smile', blush: true },
  picardia: { eyes: 'lid', mouth: 'smirk' },
  miedo: { eyes: 'open', brows: 'sad', mouth: 'gasp' },
  aburrimiento: { eyes: 'lid', mouth: 'flat' },
  ternura: { eyes: 'arc', mouth: 'smile', blush: true },
}

// Posición de cada ojo de frente: columna, y qué letra va en cada una (blanco o pupila).
const FRONT_EYES = [
  { x: 4, left: 'w', right: 'e' },
  { x: 10, left: 'e', right: 'w' },
]

function frontEye(p, { x, left, right }, kind) {
  if (kind === 'arc') {
    const rising = x === 4
    p.put(x, rising ? 7 : 6, 'Z')
    p.put(x + 1, rising ? 6 : 7, 'Z')
    return
  }
  if (kind === 'sleepy') return p.span(7, x, x + 1, 'Z')
  if (kind === 'lid') p.span(6, x, x + 1, 'Z')
  else p.span(6, x, x + 1, null, left, right)
  p.span(7, x, x + 1, null, left, right)
  p.put(x, 8, left === 'w' ? 'v' : 'f')
  p.put(x + 1, 8, right === 'w' ? 'v' : 'f')
}

// Con `aside` las dos pupilas miran hacia el mismo lado: el ojo derecho invierte su orden.
function frontEyes(p, kind) {
  FRONT_EYES.forEach((eye, i) => {
    if (kind === 'wink' && i === 1) {
      p.rect(eye.x, 6, eye.x + 1, 7, 'S')
      return p.span(8, eye.x, eye.x + 1, 'O')
    }
    const looking = kind === 'aside' && i === 1 ? { ...eye, left: 'w', right: 'e' } : eye
    frontEye(p, looking, kind)
  })
}

const FRONT_BROWS = {
  angry: [[4, 5], [5, 6], [10, 6], [11, 5]],
  sad: [[4, 6], [5, 5], [10, 5], [11, 6]],
  doubt: [[4, 5], [5, 5], [10, 6], [11, 6]],
}

const FRONT_MOUTHS = {
  flat: (p) => p.span(11, 7, 8, 'm'),
  smile: (p) => {
    p.put(6, 10, 's')
    p.put(9, 10, 's')
    p.span(11, 7, 8, 'm')
  },
  laugh: (p) => {
    p.span(10, 6, 9, 'O')
    p.span(11, 7, 8, 'm')
  },
  gasp: (p) => p.rect(7, 10, 8, 11, 'O'),
  frown: (p) => {
    p.span(10, 7, 8, 'm')
    p.put(6, 11, 'm')
    p.put(9, 11, 'm')
  },
  wail: (p) => {
    p.span(10, 6, 9, 'O')
    p.span(11, 7, 8, 'O')
  },
  dot: (p) => {
    p.put(8, 10, 'm')
    p.put(8, 11, 'm')
  },
  slant: (p) => {
    p.span(11, 6, 7, 'm')
    p.span(10, 8, 9, 'm')
  },
  yawn: (p) => p.span(10, 7, 8, 'O'),
  // Media sonrisa: solo sube la comisura derecha.
  smirk: (p) => {
    p.span(11, 6, 8, 'm')
    p.span(10, 9, 10, 'm')
  },
}

function paintFront(p, expression, male) {
  const { eyes, brows, mouth, tears, blush } = expression
  p.span(5, 4, 11, 's')
  // El hombre lleva las cejas marcadas, en el color de su pelo; las cejas de la expresión van encima.
  if (male) [4, 5, 10, 11].forEach((x) => p.put(x, 5, 'd'))
  frontEyes(p, eyes)
  if (brows) FRONT_BROWS[brows].forEach(([x, y]) => p.put(x, y, 'Z'))
  p.put(4, 9, 'B')
  p.put(11, 9, 'B')
  if (blush) {
    p.rect(4, 9, 5, 10, 'B')
    p.rect(10, 9, 11, 10, 'B')
  }
  FRONT_MOUTHS[mouth](p)
  if (tears) {
    p.rect(4, 9, 4, 11, 'q')
    p.rect(11, 9, 11, 11, 'q')
  }
}

// De perfil el ojo está en las columnas 11 y 12. Solo el guiño distingue el perfil izquierdo.
function sideEye(p, kind, left) {
  if (kind === 'wink' && left) {
    p.rect(11, 5, 12, 6, 'S')
    return p.span(7, 11, 12, 'O')
  }
  if (kind === 'arc') {
    p.put(11, 6, 'Z')
    return p.put(12, 5, 'Z')
  }
  if (kind === 'sleepy') return p.span(6, 11, 12, 'Z')
  if (kind === 'lid') p.span(5, 11, 12, 'Z')
  else p.span(5, 11, 12, null, 'w', 'e')
  p.span(6, 11, 12, null, 'w', 'e')
  p.put(11, 7, 'v')
  p.put(12, 7, 'f')
}

const SIDE_BROWS = {
  angry: [[11, 4], [12, 5]],
  sad: [[11, 5], [12, 4]],
  doubt: [[11, 4], [12, 4]],
}

const SIDE_MOUTHS = {
  flat: (p) => p.put(12, 10, 'm'),
  smile: (p) => {
    p.put(12, 10, 'm')
    p.put(13, 10, 's')
  },
  laugh: (p) => {
    p.span(10, 12, 13, 'O')
    p.put(12, 11, 'm')
  },
  gasp: (p) => p.rect(13, 10, 13, 11, 'O'),
  frown: (p) => {
    p.put(12, 10, 'm')
    p.put(13, 11, 'm')
  },
  wail: (p) => {
    p.span(10, 12, 13, 'O')
    p.put(12, 11, 'O')
  },
  dot: (p) => p.put(12, 11, 'm'),
  slant: (p) => {
    p.put(12, 11, 'm')
    p.put(13, 10, 'm')
  },
  yawn: (p) => p.span(10, 12, 13, 'O'),
  smirk: (p) => {
    p.put(12, 11, 'm')
    p.put(13, 10, 'm')
  },
}

function paintSide(p, expression, left) {
  const { eyes, brows, mouth, tears, blush } = expression
  p.put(13, 4, 's')
  sideEye(p, eyes, left)
  if (brows) SIDE_BROWS[brows].forEach(([x, y]) => p.put(x, y, 'Z'))
  p.put(11, 8, 'B')
  if (blush) {
    p.put(12, 8, 'B')
    p.put(12, 9, 'B')
  }
  SIDE_MOUTHS[mouth](p)
  if (tears) p.rect(11, 8, 11, 10, 'q')
}

export function paintFace(p, { look, view, left, male }) {
  if (view === 'up') return
  const expression = EXPRESSIONS[look.face]
  if (view === 'side') return paintSide(p, expression, left)
  paintFront(p, expression, male)
}
