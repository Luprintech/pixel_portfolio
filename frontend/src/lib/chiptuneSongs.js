// Canciones retro de las actividades de la casa de Lupe. Son datos: cada voz es una lista de `[nota, pulsos]` y todas las
// voces de una canción suman los mismos pulsos (`loopBeats`), así el bucle cierra sin saltos. `nota` es un número MIDI (60 =
// do central) o `null` para un silencio; en la voz de ruido (`type: 'noise'`) es la frecuencia de corte en Hz del golpe.
// Las melodías son originales de este proyecto, sin parecido con ningún tema conocido. Cuántas canciones hay y a qué actividad toca cada una se decide en `THEMES`.

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

// Selector de la recreativa: un tema de «insert coin», alegre y saltarín, en do mayor. Ocho compases con melodía en onda
// cuadrada, bajo que camina y platillos suaves de ruido. Suena mientras se elige juego y al volver a él.
const ARCADE_ROOTS = [48, 43, 45, 41, 48, 43, 41, 43]

export const ARCADE_SONG = {
  bpm: 112,
  loopBeats: 32,
  voices: [
    {
      type: 'square',
      volume: 0.06,
      notes: [
        ...bar([72, 1], [76, 1], [79, 1], [76, 1]),
        ...bar([74, 1], [79, 1], [83, 1], [79, 1]),
        ...bar([72, 1], [76, 1], [81, 1], [76, 1]),
        ...bar([72, 1], [77, 1], [81, 1], [77, 1]),
        ...bar([79, 1.5], [76, 0.5], [72, 2]),
        ...bar([74, 1.5], [79, 0.5], [83, 2]),
        ...bar([81, 1], [77, 1], [72, 1], [77, 1]),
        ...bar([79, 2], [74, 1], [null, 1]),
      ],
    },
    {
      type: 'triangle',
      volume: 0.12,
      notes: ARCADE_ROOTS.flatMap((root) => [[root, 1], [root + 7, 1], [root + 12, 1], [root + 7, 1]]),
    },
    {
      type: 'noise',
      volume: 0.03,
      notes: repeat(8, [[9000, 1], [3000, 1], [9000, 1], [3000, 1]]),
    },
  ],
}

// Invasión Galáctica: persecución espacial en mi menor, con bajo en corcheas que no para, arpegios veloces y batería de ruido.
// Ocho compases: mi menor, do, re y si.
const GALACTIC_ROOTS = [40, 40, 36, 38, 40, 36, 38, 35]

export const GALACTIC_SONG = {
  bpm: 150,
  loopBeats: 32,
  voices: [
    {
      type: 'square',
      volume: 0.062,
      notes: [
        ...bar([76, 0.5], [79, 0.5], [83, 0.5], [79, 0.5], [76, 1], [79, 1]),
        ...bar([83, 1], [81, 0.5], [79, 0.5], [76, 2]),
        ...bar([72, 0.5], [76, 0.5], [79, 0.5], [76, 0.5], [72, 1], [76, 1]),
        ...bar([74, 0.5], [78, 0.5], [81, 0.5], [78, 0.5], [74, 2]),
        ...bar([76, 0.5], [79, 0.5], [83, 0.5], [88, 0.5], [86, 1], [83, 1]),
        ...bar([84, 1], [83, 0.5], [79, 0.5], [76, 2]),
        ...bar([81, 0.5], [78, 0.5], [74, 0.5], [78, 0.5], [81, 1], [86, 1]),
        ...bar([83, 2], [null, 1], [78, 0.5], [79, 0.5]),
      ],
    },
    {
      type: 'triangle',
      volume: 0.13,
      notes: GALACTIC_ROOTS.flatMap((root) => repeat(2, [[root, 0.5], [root, 0.5], [root + 12, 0.5], [root, 0.5]])),
    },
    {
      type: 'noise',
      volume: 0.05,
      notes: repeat(8, [[7000, 0.5], [7000, 0.5], [2400, 0.5], [7000, 0.5], [7000, 0.5], [7000, 0.5], [2400, 0.5], [7000, 0.5]]),
    },
  ],
}

// Río en Peligro: vuelo a ras de agua en la mayor, con bajo que camina a negras (como un motor), melodía que sube y baja
// y acordes a contratiempo. Ocho compases: la, la, re, mi, la, fa sostenido menor, re y mi.
const RIVER_ROOTS = [45, 45, 50, 52, 45, 42, 50, 52]
const RIVER_STABS = [64, 64, 66, 68, 64, 61, 66, 68]

export const RIVER_SONG = {
  bpm: 144,
  loopBeats: 32,
  voices: [
    {
      type: 'square',
      volume: 0.062,
      notes: [
        ...bar([69, 1], [73, 0.5], [76, 0.5], [81, 1], [76, 1]),
        ...bar([80, 1.5], [76, 0.5], [73, 2]),
        ...bar([74, 1], [78, 0.5], [81, 0.5], [86, 1], [81, 1]),
        ...bar([83, 1.5], [80, 0.5], [76, 2]),
        ...bar([81, 0.5], [80, 0.5], [81, 0.5], [83, 0.5], [85, 2]),
        ...bar([81, 1], [78, 1], [73, 1], [78, 1]),
        ...bar([74, 0.5], [76, 0.5], [78, 0.5], [81, 0.5], [86, 2]),
        ...bar([83, 1], [80, 1], [76, 1], [null, 1]),
      ],
    },
    {
      type: 'triangle',
      volume: 0.13,
      notes: RIVER_ROOTS.flatMap((root) => [[root, 1], [root + 7, 1], [root + 12, 1], [root + 7, 1]]),
    },
    {
      type: 'square',
      volume: 0.03,
      notes: RIVER_STABS.flatMap((note) => repeat(4, [[null, 0.5], [note, 0.5]])),
    },
    {
      type: 'noise',
      volume: 0.045,
      notes: repeat(8, [[7000, 0.5], [2400, 0.5], [7000, 0.5], [2400, 0.5], [7000, 0.5], [7000, 0.5], [2400, 0.5], [7000, 0.5]]),
    },
  ],
}

// Actividad de la casa -> canción. La recreativa tiene la suya en el selector (`arcade`) y una por juego: la aventura de
// mazmorras (`adventure`), el shooter espacial (`galactic`) y el vuelo sobre el río (`river`); ver `game/arcade/games.js`.
export const THEMES = { pc: PC_SONG, arcade: ARCADE_SONG, adventure: ADVENTURE_SONG, galactic: GALACTIC_SONG, river: RIVER_SONG }
