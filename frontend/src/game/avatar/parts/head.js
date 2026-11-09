// Cabeza sin pelo: cráneo y cuello corto, solo piel. El pelo, el rostro y el vello van en capas
// aparte, así que cambiar de peinado o de expresión no toca esta forma. De frente y de espalda es el
// mismo óvalo de 10 columnas; de perfil mira a la derecha y la nariz sobresale una columna.
// Las filas empiezan en la 3 de la figura (las tres de arriba son pelo).
const FRONT = [
  '....SSSSSSSS....',
  ...Array(7).fill('...SSSSSSSSSS...'),
  '....SSSSSSSS....',
  '.....sSSSSs.....',
]

const SIDE = [
  '....SSSSSSSSS...',
  ...Array(5).fill('...SSSSSSSSSSS..'),
  '...SSSSSSSSSSSS.',
  '...SSSSSSSSSSS..',
  '....SSSSSSSSSS..',
  '......SSSSsss...',
]

const HEAD_TOP = 3

export function paintHead(p, { view, male }) {
  if (view === 'side') return p.rows(HEAD_TOP, SIDE)
  p.rows(HEAD_TOP, FRONT)
  // La mandíbula del avatar de hombre es más ancha: la barbilla no se estrecha.
  if (male) p.span(12, 4, 11, 'S')
}
