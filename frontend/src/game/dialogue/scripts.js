// Guiones de la casa de Lupe, tal como están en `docs/DIALOGOS.md` (sección 4 a 8). Aquí solo está la estructura
// (quién habla, orden, opciones y qué abre cada cosa); los textos están en `lib/dialogueCopy.js`, por idioma, con
// la clave que lleva cada página.
//
// Las repeticiones sustituyen el saludo, no la información: por eso `repeticion` ofrece las mismas opciones que la
// presentación. Una opción con `when` solo sale si esa función está activa (ver `FEATURES`).

const lines = (who, id, count) => Array.from({ length: count }, (_, i) => ({ who, text: `${id}.${i + 1}` }))
const option = (id, label, extra) => ({ id, label, ...extra })

const ATREUS_MENU = [
  option('setup', 'casa.opt.setup', { to: 'casa.atreus_setup' }),
  option('perifericos', 'casa.opt.perifericos', { to: 'casa.atreus_perifericos' }),
  option('seguir', 'casa.opt.seguir', { close: true }),
]

const MAKER_MENU = [
  option('piezas', 'maker.opt.piezas', { to: 'maker.piezas' }),
  option('figuras', 'maker.opt.figuras', { to: 'maker.figuras' }),
  // Solo con una galería aprobada y fotos reales (`FEATURES.gallery`); mientras no las haya, no se ofrece.
  option('trabajos', 'maker.opt.trabajos', { when: 'gallery', action: 'gallery' }),
  option('volver', 'maker.opt.volver', { close: true }),
]

const CONSOLE_MENU = [
  option('nintendo', 'consolas.opt.nintendo', { to: 'consolas.nintendo' }),
  option('playstation', 'consolas.opt.playstation', { to: 'consolas.playstation' }),
  option('otras', 'consolas.opt.otras', { to: 'consolas.otras' }),
  option('recuerdos', 'consolas.opt.recuerdos', { to: 'consolas.recuerdos' }),
  option('volver', 'consolas.opt.volver', { close: true }),
]

const HIFI_MENU = [
  option('musica', 'hifi.opt.musica', { action: 'music' }),
  option('favoritas', 'hifi.opt.favoritas', { to: 'hifi.favoritas' }),
  option('seguir', 'casa.opt.seguir', { close: true }),
]

// Conversaciones de Lupe al llegar al valle (`docs/DIALOGOS.md`, sección 3). Las opciones llevan `when` con lo que la
// historia permite (`story/story.js`, `storyFeatures`): una pregunta ya contestada no se vuelve a ofrecer.
const INTRO_MENU = [
  option('casa', 'inicio.opt.casa', { when: 'offerTour', to: 'inicio.casa' }),
  option('dedicas', 'inicio.opt.dedicas', { when: 'offerDedicas', to: 'inicio.dedicas' }),
  option('encontrar', 'inicio.opt.encontrar', { when: 'offerEncontrar', to: 'inicio.encontrar' }),
  option('ayuda', 'inicio.opt.ayuda', { when: 'offerAyuda', to: 'inicio.ayuda' }),
  option('seguir', 'inicio.opt.explorar_seguir', { close: true }),
]

// La bienvenida ofrece exactamente estas cuatro respuestas; «explorar por mi cuenta» rechaza la visita.
const WELCOME_MENU = [
  option('casa', 'inicio.opt.casa', { to: 'inicio.casa' }),
  option('dedicas', 'inicio.opt.dedicas', { to: 'inicio.dedicas' }),
  option('encontrar', 'inicio.opt.encontrar', { to: 'inicio.encontrar' }),
  option('explorar', 'inicio.opt.explorar', { to: 'inicio.explorar' }),
]

export const SCRIPTS = {
  'inicio.bienvenida': {
    pages: [
      { who: 'lupe', text: 'inicio.bienvenida.1' },
      { who: 'lupe', text: 'inicio.bienvenida.2' },
      { who: 'lupe', text: 'inicio.bienvenida.3' },
      { who: 'khalessi', text: 'inicio.bienvenida.4', sfx: 'meow' },
      { who: 'lupe', text: 'inicio.bienvenida.5' },
      { who: 'lupe', text: 'inicio.bienvenida.6' },
    ],
    options: WELCOME_MENU,
  },
  'inicio.casa': { pages: lines('lupe', 'inicio.casa', 2), action: 'tour-start' },
  'inicio.dedicas': { pages: lines('lupe', 'inicio.dedicas', 3), options: INTRO_MENU },
  'inicio.encontrar': { pages: lines('lupe', 'inicio.encontrar', 3), options: INTRO_MENU },
  'inicio.ayuda': { pages: lines('lupe', 'inicio.ayuda', 2), options: INTRO_MENU },
  'inicio.explorar': { pages: lines('lupe', 'inicio.explorar', 1), action: 'tour-decline' },
  'inicio.regreso': { pages: lines('lupe', 'inicio.regreso', 2), options: INTRO_MENU },
  // Durante la visita, hablar con Lupe permite seguir o dejarla.
  'inicio.guia_pausa': {
    pages: lines('lupe', 'inicio.guia_pausa', 1),
    options: [option('seguir', 'inicio.opt.seguir_visita', { close: true }), option('cancelar', 'inicio.opt.explorar', { action: 'tour-cancel' })],
  },
  // Al llegar a la puerta: entrar o seguir explorando (la visita queda pendiente).
  'inicio.puerta': {
    pages: lines('lupe', 'inicio.puerta', 2),
    options: [option('entrar', 'inicio.opt.entrar', { action: 'tour-enter' }), option('luego', 'inicio.opt.luego', { action: 'tour-pause' })],
  },


  'casa.entrada': { pages: lines('atreus', 'casa.entrada', 3), options: ATREUS_MENU },
  'casa.atreus_setup': {
    pages: [{ who: 'atreus', text: 'casa.atreus_setup.1' }, { who: 'atreus', text: 'casa.atreus_setup.2' }, { who: 'lupe', text: 'casa.atreus_setup.3' }],
    options: ATREUS_MENU,
  },
  'casa.atreus_perifericos': {
    pages: [{ who: 'atreus', text: 'casa.atreus_perifericos.1' }, { who: 'lupe', text: 'casa.atreus_perifericos.2' }, { who: 'atreus', text: 'casa.atreus_perifericos.3' }],
    options: ATREUS_MENU,
  },
  'casa.atreus_repeticion': { pages: lines('atreus', 'casa.atreus_repeticion', 1), options: ATREUS_MENU },

  'casa.khalessi': { pages: [{ who: 'khalessi', text: 'casa.khalessi.1', sfx: 'meow' }] },
  'casa.khalessi_reposo': { pages: lines('lupe', 'casa.khalessi_reposo', 1) },

  'casa.television': { pages: lines('lupe', 'casa.television', 2), options: [option('encender', 'casa.opt.tv_on', { action: 'tv' }), option('seguir', 'casa.opt.explorar', { close: true })] },

  'maker.presentacion': { pages: lines('lupe', 'maker.presentacion', 3), options: MAKER_MENU },
  'maker.piezas': { pages: lines('lupe', 'maker.piezas', 3), options: MAKER_MENU },
  'maker.figuras': { pages: lines('lupe', 'maker.figuras', 2), options: MAKER_MENU },
  'maker.repeticion': { pages: lines('lupe', 'maker.repeticion', 2), options: MAKER_MENU },

  'consolas.presentacion': { pages: lines('lupe', 'consolas.presentacion', 2), options: CONSOLE_MENU },
  'consolas.nintendo': { pages: lines('lupe', 'consolas.nintendo', 2), options: CONSOLE_MENU },
  'consolas.playstation': { pages: lines('lupe', 'consolas.playstation', 1), options: CONSOLE_MENU },
  'consolas.otras': { pages: lines('lupe', 'consolas.otras', 1), options: CONSOLE_MENU },
  'consolas.recuerdos': { pages: lines('lupe', 'consolas.recuerdos', 2), options: CONSOLE_MENU },
  'consolas.repeticion': { pages: lines('lupe', 'consolas.repeticion', 1), options: CONSOLE_MENU },

  'hifi.presentacion': { pages: lines('lupe', 'hifi.presentacion', 2), options: HIFI_MENU },
  'hifi.favoritas': { pages: lines('lupe', 'hifi.favoritas', 2), options: HIFI_MENU },
  'hifi.repeticion': { pages: lines('lupe', 'hifi.repeticion', 1), options: HIFI_MENU },

  // Tras la presentación del ordenador se abre el escritorio retro (ver `components/valle/RetroDesktop.jsx`).
  'pc.abrir': { pages: lines('lupe', 'pc.abrir', 2), action: 'desktop' },
}

// Lo que aún no está disponible. Se activa aquí cuando haya fotos aprobadas, y las opciones con `when: 'gallery'` aparecen.
export const FEATURES = { gallery: false }

// Qué conversación abre cada interacción de la casa. `first` es la primera vez; `again`, las siguientes (una
// repetición que no quita opciones); `rest` se alterna con `first` para que Khalessi no repita siempre lo mismo.
export const TALKS = {
  atreus: { first: 'casa.entrada', again: 'casa.atreus_repeticion' },
  television: { first: 'casa.television' },
  pc: { first: 'pc.abrir' },
  printer: { first: 'maker.presentacion', again: 'maker.repeticion' },
  shelf: { first: 'consolas.presentacion', again: 'consolas.repeticion' },
  hifi: { first: 'hifi.presentacion', again: 'hifi.repeticion' },
  khalessi: { first: 'casa.khalessi', rest: 'casa.khalessi_reposo' },
}

// Conversación de una interacción según lo ya visto: `seen` es el conjunto de ids de conversaciones abiertas
// alguna vez y `visits` cuántas veces se ha hablado con ella en esta visita (para alternar a Khalessi).
export function talkFor(interaction, seen, visits = 0) {
  const talk = TALKS[interaction]
  if (!talk) return null
  if (talk.rest) return visits % 2 === 0 ? talk.first : talk.rest
  return talk.again && seen.has(talk.first) ? talk.again : talk.first
}
