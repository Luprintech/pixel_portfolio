// Poses de Lupe para la portada: de pie, saludando con la mano en alto y acariciando a Khalessi.
// Parten del fotograma de frente del generador y le retocan el brazo derecho (el de la derecha del
// dibujo) sobre su matriz de letras; los colores siguen siendo los de su aspecto.
import { avatarCanvas } from './avatar/index.js'
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

const EDITS = {
  idle: (rows) => rows,
  wave: (rows, step) => stamp(stamp(stamp(withoutHand(rows), 14, 19, ['DD']), 12, 13, WAVE_ARM), 12, 9, WAVE_HAND[step]),
  pet: (rows, step) => stamp(withoutHand(rows), 13, 22, PET[step]),
}

const frames = new Map()

// `pose`: 'idle', 'wave' o 'pet'. `step` (0 o 1) alterna los dos fotogramas de saludo y caricia.
// Acariciando cierra los ojos, como quien lo disfruta.
export function lupeFrame(pose, step = 0, closed = false) {
  const shut = closed || pose === 'pet'
  const key = `${pose}${step}${shut}`
  if (!frames.has(key)) frames.set(key, avatarCanvas(LUPE_LOOK, 'down', 0, shut, (rows) => EDITS[pose](rows, step)))
  return frames.get(key)
}
