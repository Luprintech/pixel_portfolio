// Rostro: sombra del flequillo, ojos, mejillas y boca. Cada expresión es un pequeño cambio sobre la
// cara base. De perfil se ve un solo ojo; el guiño solo cierra el ojo izquierdo del personaje, que
// es el que enseña el perfil izquierdo (el derecho se dibuja con los dos ojos abiertos).
//
// Ojos de 2×3 de frente (blanco hacia fuera, pupila hacia dentro) y de 2×3 de perfil. La fila baja
// usa letras propias (v, f) para que al parpadear quede como una pestaña.

function frontEyes(p, closedRight) {
  ;[
    [4, 'w', 'e'],
    [10, 'e', 'w'],
  ].forEach(([x, a, b], i) => {
    if (closedRight && i === 1) {
      p.rect(x, 6, x + 1, 7, 'S')
      p.span(8, x, x + 1, 'O')
      return
    }
    p.span(6, x, x + 1, null, a, b)
    p.span(7, x, x + 1, null, a, b)
    p.put(x, 8, a === 'w' ? 'v' : 'f')
    p.put(x + 1, 8, b === 'w' ? 'v' : 'f')
  })
}

function paintFront(p, face) {
  p.span(5, 4, 11, 's')
  frontEyes(p, face === 'guino')
  p.put(4, 9, 'B')
  p.put(11, 9, 'B')
  if (face === 'timida') {
    p.put(5, 9, 'B')
    p.put(10, 9, 'B')
    p.span(11, 7, 8, 's')
    return
  }
  if (face === 'sorpresa') return p.rect(7, 10, 8, 11, 'O')
  if (face === 'sonrisa' || face === 'guino') {
    p.put(6, 10, 's')
    p.put(9, 10, 's')
  }
  p.span(11, 7, 8, 'm')
}

function paintSide(p, face, left) {
  p.put(13, 4, 's')
  if (face === 'guino' && left) {
    p.rect(11, 5, 12, 6, 'S')
    p.span(7, 11, 12, 'O')
  } else {
    p.span(5, 11, 12, null, 'w', 'e')
    p.span(6, 11, 12, null, 'w', 'e')
    p.put(11, 7, 'v')
    p.put(12, 7, 'f')
  }
  p.put(11, 8, 'B')
  if (face === 'timida') {
    p.put(12, 8, 'B')
    return p.put(12, 10, 's')
  }
  if (face === 'sorpresa') return p.rect(13, 10, 13, 11, 'O')
  p.put(12, 10, 'm')
  if (face === 'sonrisa' || face === 'guino') p.put(13, 10, 's')
}

export function paintFace(p, { look, view, left, male }) {
  if (view === 'up') return
  if (view === 'side') paintSide(p, look.face, left)
  else paintFront(p, look.face)
  // El hombre lleva las cejas marcadas, en el color de su pelo.
  if (male && view === 'down') [4, 5, 10, 11].forEach((x) => p.put(x, 5, 'd'))
}
