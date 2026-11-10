// Rasgos de la cara que se pintan sobre ella: barba, bigote, perilla, patillas, pecas, lunares,
// cejas y cicatrices. Cada rasgo es una lista de tramos `[letra, fila, columnas]`, uno para la vista
// de frente y otro para el perfil derecho (de perfil se dibujan sobre las columnas 10 a 13).
// De espaldas no se ve ninguno. K es el vello (color propio), F peca o lunar, C cicatriz.

const FULL_BEARD = [
  ['K', 8, [3, 12]],
  ['K', 9, [3, 12]],
  ['K', 10, [3, 4, 5, 6, 9, 10, 11, 12]],
  ['K', 11, [4, 5, 6, 7, 8, 9, 10, 11]],
  ['K', 12, [6, 7, 8, 9]],
]

const FULL_BEARD_SIDE = [
  ['K', 8, [10]],
  ['K', 9, [10, 12, 13]],
  ['K', 10, [10, 11, 13]],
  ['K', 11, [10, 11, 12, 13]],
  ['K', 12, [10, 11, 12]],
]

const FRECKLES = [
  ['F', 9, [5, 6, 9, 10]],
  ['F', 10, [4, 11]],
]

export const TRAITS = {
  ninguno: { front: [], side: [] },
  incipiente: {
    front: [
      ['K', 9, [3, 12]],
      ['K', 10, [4, 6, 9, 11]],
      ['K', 11, [5, 10]],
      ['K', 12, [6, 9]],
    ],
    side: [
      ['K', 9, [10]],
      ['K', 10, [10, 12]],
      ['K', 11, [11, 12]],
      ['K', 12, [10, 12]],
    ],
  },
  barbaCorta: {
    front: [
      ['K', 9, [3, 12]],
      ['K', 10, [3, 4, 5, 10, 11, 12]],
      ['K', 11, [4, 5, 6, 9, 10, 11]],
      ['K', 12, [6, 7, 8, 9]],
    ],
    side: [
      ['K', 9, [10]],
      ['K', 10, [10, 11, 13]],
      ['K', 11, [10, 11, 12, 13]],
      ['K', 12, [10, 11]],
    ],
  },
  barba: { front: FULL_BEARD, side: FULL_BEARD_SIDE },
  bigoteFino: { front: [['K', 9, [6, 7, 8, 9]]], side: [['K', 9, [12, 13]]] },
  bigote: {
    front: [
      ['K', 9, [5, 6, 7, 8, 9, 10]],
      ['K', 10, [5, 10]],
    ],
    side: [
      ['K', 9, [11, 12, 13]],
      ['K', 10, [13]],
    ],
  },
  perilla: {
    front: [
      ['K', 11, [7, 8]],
      ['K', 12, [6, 7, 8, 9]],
    ],
    side: [
      ['K', 11, [12, 13]],
      ['K', 12, [11, 12]],
    ],
  },
  // Bigote que baja por las comisuras y perilla en la barbilla. Solo lo lleva Atreus. Todo va dentro
  // de la cara: en la fila 12, que es el cuello, la perilla parecía salir por detrás de la camiseta.
  // Para hacerle sitio, de frente la boca sube a la fila 10, entre el bigote y la perilla. De perfil
  // el bigote va bajo la nariz y baja por delante de la boca hasta la barbilla.
  candado: {
    front: [
      ['K', 9, [6, 7, 8, 9]],
      ['K', 10, [6, 9]],
      ['m', 10, [7, 8]],
      ['S', 11, [6, 9]],
      ['K', 11, [7, 8]],
    ],
    side: [
      ['K', 9, [12, 13]],
      ['K', 10, [12]],
      ['K', 11, [12]],
    ],
  },
  patillas: {
    front: [7, 8, 9, 10].map((y) => ['K', y, [3, 12]]),
    side: [7, 8, 9].map((y) => ['K', y, [10]]),
  },
  pecas: { front: FRECKLES, side: [['F', 8, [12]], ['F', 9, [11]]] },
  pecasMuchas: {
    front: [...FRECKLES, ['F', 9, [7, 8]], ['F', 10, [5, 10]]],
    side: [['F', 8, [12, 13]], ['F', 9, [11, 12]], ['F', 10, [11]]],
  },
  lunarMejilla: { front: [['F', 10, [10]]], side: [['F', 9, [12]]] },
  lunarLabio: { front: [['F', 11, [10]]], side: [['F', 11, [12]]] },
  cejas: {
    front: [['K', 5, [3, 4, 5, 6, 9, 10, 11, 12]]],
    side: [['K', 4, [10, 11, 12]]],
  },
  cejaPartida: {
    front: [
      ['K', 5, [3, 4, 5, 10, 12]],
      ['C', 4, [11]],
    ],
    side: [
      ['K', 4, [10, 12]],
      ['C', 4, [11]],
    ],
  },
  cicatrizCeja: {
    front: [
      ['K', 5, [10, 11, 12]],
      ['C', 4, [12]],
      ['C', 5, [11]],
      ['C', 6, [10]],
    ],
    side: [
      ['K', 4, [11, 12]],
      ['C', 5, [12]],
    ],
  },
  cicatrizMejilla: {
    front: [
      ['C', 9, [12]],
      ['C', 10, [11]],
      ['C', 11, [10]],
    ],
    side: [
      ['C', 9, [11]],
      ['C', 10, [12]],
    ],
  },
}

export function paintTraits(p, { look, view }) {
  if (view === 'up') return
  const parts = TRAITS[look.trait][view === 'side' ? 'side' : 'front']
  parts.forEach(([ch, y, xs]) => xs.forEach((x) => p.put(x, y, ch)))
}
