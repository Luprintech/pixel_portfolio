// Poses de Lupe para la portada: de pie, saludando con la mano en alto y acariciando a Khalessi.
// Parten del fotograma de frente del generador y le retocan el brazo derecho (el de la derecha del
// dibujo) sobre su matriz de letras; los colores siguen siendo los de su aspecto.
import { avatarCanvas, composeAvatar } from './avatar/index.js'
import { LUPE_LOOK } from './lupe.js'

// Coloca `art` con su esquina en (x, y). El punto es transparente: deja lo que había debajo.
function stamp(rows, x, y, art) {
  const next = [...rows]
  art.forEach((line, dy) => {
    let row = next[y + dy]
    ;[...line].forEach((letter, dx) => {
      if (letter !== '.') row = row.slice(0, x + dx) + letter + row.slice(x + dx + 1)
    })
    next[y + dy] = row
  })
  return next
}

// La mano que cuelga junto a la falda se tapa con el pelo y la falda, que es lo que hay debajo.
const withoutHand = (rows) => stamp(rows, 13, 22, ['HH', 'HH'])

// Brazo en alto junto a la cabeza, con la mano abierta; en el segundo paso la mano se inclina.
// La mano mide cuatro filas y el brazo, que sale del hombro, otras seis; se pintan por separado
// para poder mover solo la mano.
const WAVE_HAND = [
  ['.XXXX.', 'XSSSSX', 'XSsSsX', '.XSSX.'],
  ['..XXXX', '.XSSSX', '.XSsSX', '.XSSX.'],
]
const WAVE_ARM = ['.XSSX.', '.XSSX.', '.XSSX.', '.XDDX.', '.XDDX.', '.XDMX.']

// Brazo extendido hacia el suelo, donde espera la gata: la mano sube y baja una fila al acariciar.
const PET = [
  ['XXXXX', 'DDSSS', 'XXXXX'],
  ['.....', 'XXXXX', 'DDSSS', 'XXXXX'],
]

// El vestido de su lámina, que el generador no tiene: hombros descubiertos con un collar dorado y un
// rubí en el centro, y mangas abullonadas que acaban en un puño dorado. Va en las columnas 1 a 16 de las
// filas 18 a 21, simétrico, y se estampa antes que cualquier pose (la mano en alto lo tapa a su paso).
const GOWN = [
  '.XDLDSSSSSSDDMX.',
  'XDLDDTTJJTTDDMMX',
  'XDDDM......MDDMX',
  '.XTTX......XTTX.',
]
const withGown = (rows) => stamp(rows, 1, 18, GOWN)

const EDITS = {
  idle: (rows) => rows,
  wave: (rows, step) => stamp(stamp(stamp(withoutHand(rows), 14, 19, ['DD']), 12, 13, WAVE_ARM), 12, 9, WAVE_HAND[step]),
  pet: (rows, step) => stamp(withoutHand(rows), 13, 22, PET[step]),
}

// Con el brazo en alto la manga derecha nace del hombro: se quita la parte que colgaba bajo él.
const withoutHangingSleeve = (gowned, original) =>
  gowned.map((row, y) => (y === 20 || y === 21 ? row.slice(0, 12) + original[y].slice(12) : row))

const editFor = (pose, step) => (rows) => {
  const gowned = withGown(rows)
  return EDITS[pose](pose === 'wave' ? withoutHangingSleeve(gowned, rows) : gowned, step)
}

// La matriz de letras de una pose, sin pintar: es lo que se comprueba en las pruebas.
export const lupeRows = (pose, step = 0) => editFor(pose, step)(composeAvatar(LUPE_LOOK, 'down', 0).rows)

const frames = new Map()

// `pose`: 'idle', 'wave' o 'pet'. `step` (0 o 1) alterna los dos fotogramas de saludo y caricia.
// Acariciando cierra los ojos, como quien lo disfruta.
export function lupeFrame(pose, step = 0, closed = false) {
  const shut = closed || pose === 'pet'
  const key = `${pose}${step}${shut}`
  if (!frames.has(key)) frames.set(key, avatarCanvas(LUPE_LOOK, 'down', 0, shut, editFor(pose, step)))
  return frames.get(key)
}
