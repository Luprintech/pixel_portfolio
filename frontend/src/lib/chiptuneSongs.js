// Canciones retro de las actividades de la casa de Lupe. Son datos: cada voz es una lista de `[nota, pulsos]` y todas las
// voces de una canción suman los mismos pulsos (`loopBeats`), así el bucle cierra sin saltos. `nota` es un número MIDI (60 =
// do central) o `null` para un silencio; en la voz de ruido (`type: 'noise'`) es la frecuencia de corte en Hz del golpe.
// Las dos melodías son originales de este proyecto (progresiones en la menor y do mayor), sin parecido con ningún tema
// conocido. Cuántas canciones hay y a qué actividad toca cada una se decide en `THEMES`.

const bar = (...notes) => notes
const repeat = (times, notes) => Array.from({ length: times }, () => notes).flat()

// Escritorio de Lupe: un tema tranquilo de oficina a las tantas, con arpegio suave y bajo redondo. Cuatro acordes de ocho
// pulsos: la menor, fa, do y sol.
const PC_ROOTS = [45, 41, 48, 43]
const PC_ARP = [[57, 60, 64, 67], [53, 57, 60, 65], [55, 60, 64, 67], [55, 59, 62, 67]]
const PC_ARP_ORDER = [0, 1, 2, 3, 2, 1, 2, 1]

export const PC_SONG = {
  bpm: 92,
  loopBeats: 32,
  voices: [
    {
      type: 'triangle',
      volume: 0.09,
      notes: [
        ...bar([76, 1.5], [72, 0.5], [69, 1], [72, 1], [74, 2], [72, 1], [null, 1]),
        ...bar([72, 1.5], [69, 0.5], [65, 1], [69, 1], [72, 2], [69, 1], [null, 1]),
        ...bar([67, 1.5], [72, 0.5], [76, 1], [72, 1], [79, 2], [76, 1], [null, 1]),
        ...bar([74, 1.5], [71, 0.5], [67, 1], [71, 1], [74, 3], [null, 1]),
      ],
    },
    {
      type: 'square',
      volume: 0.03,
      notes: PC_ARP.flatMap((chord) => repeat(2, PC_ARP_ORDER.map((i) => [chord[i % 4], 0.5]))),
    },
    {
      type: 'triangle',
      volume: 0.12,
      notes: PC_ROOTS.flatMap((root) => [[root, 2], [root, 1], [null, 1], [root, 2], [root + 7, 1], [null, 1]]),
    },
  ],
}

// Aventura retro de la recreativa: una marcha heroica a paso ligero, con bajo en corcheas, acordes a contratiempo y batería
// de ruido. Ocho compases en la menor que acaban en mi, para volver a empezar con ganas.
const ADVENTURE_ROOTS = [45, 45, 41, 43, 45, 48, 43, 40]
const ADVENTURE_STABS = [72, 72, 69, 71, 72, 76, 71, 68]

export const ADVENTURE_SONG = {
  bpm: 132,
  loopBeats: 32,
  voices: [
    {
      type: 'square',
      volume: 0.07,
      notes: [
        ...bar([69, 1], [72, 1], [76, 1], [72, 0.5], [74, 0.5]),
        ...bar([76, 2], [74, 1], [72, 1]),
        ...bar([65, 1], [69, 1], [72, 1], [69, 0.5], [72, 0.5]),
        ...bar([74, 2], [71, 1], [67, 1]),
        ...bar([69, 1], [72, 1], [76, 1], [81, 1]),
        ...bar([79, 1.5], [76, 0.5], [79, 1], [76, 1]),
        ...bar([74, 1], [71, 1], [74, 1], [79, 1]),
        ...bar([76, 2], [null, 1], [71, 0.5], [72, 0.5]),
      ],
    },
    {
      type: 'triangle',
      volume: 0.13,
      notes: ADVENTURE_ROOTS.flatMap((root) => repeat(2, [[root, 0.5], [root, 0.5], [root + 12, 0.5], [root, 0.5]])),
    },
    {
      type: 'square',
      volume: 0.032,
      notes: ADVENTURE_STABS.flatMap((note) => [[null, 1], [note, 0.5], [null, 0.5], [note, 0.5], [null, 0.5], [note, 0.5], [null, 0.5]]),
    },
    {
      type: 'noise',
      volume: 0.05,
      notes: repeat(8, [[7000, 0.5], [7000, 0.5], [2400, 0.5], [7000, 0.5], [7000, 0.5], [7000, 0.5], [2400, 0.5], [7000, 0.5]]),
    },
  ],
}

// Actividad de la casa -> canción. Hoy hay un solo minijuego en la recreativa; cuando haya un selector, cada juego añade
// aquí su id con su propia melodía.
export const THEMES = { pc: PC_SONG, adventure: ADVENTURE_SONG }
