// Memoria de la historia de una partida: si Lupe ya dio la bienvenida, cómo va la visita guiada, qué conversaciones
// se han escuchado y qué preguntas ya se han contestado. Es un objeto plano y serializable, sin Phaser ni React: lo
// guarda la partida (`save.js`), lo lee la escena para decidir qué hace Lupe y lo lee la página para decidir qué opciones
// ofrece. Cada función devuelve un objeto nuevo; nada se modifica en su sitio.

// Estados de la visita guiada a la casa:
//  none      nunca se ha ofrecido o decidido
//  pending   aceptada pero sin terminar (se interrumpió o se pospuso ante la puerta): se puede pedir otra vez
//  accepted  en curso: es el único estado en el que Lupe acompaña a la viajera
//  completed la viajera ya entró con ella
//  cancelled la viajera la rechazó o la dejó
export const TOURS = ['none', 'pending', 'accepted', 'completed', 'cancelled']
export const WELCOMES = ['pending', 'done']

// Paradas de la visita por dentro de la casa, en orden. `stops` guarda las ya presentadas por completo (siempre un prefijo de
// esta lista), así que abandonar, pausar o recargar no pierde el avance: la visita se retoma por la siguiente.
export const TOUR_STOPS = ['entrada', 'impresoras', 'atreus', 'pc', 'khalessi', 'cierre']

// Lo que se guarda son ids de conversaciones y de preguntas: se acota el tamaño por si el guardado viene manipulado.
const ID = /^[a-z0-9._-]{1,48}$/
const MAX_IDS = 200

export const initialStory = () => ({ welcome: 'pending', tour: 'none', stops: [], heard: [], explained: [] })

const cleanIds = (raw) => (Array.isArray(raw) ? [...new Set(raw.filter((id) => typeof id === 'string' && ID.test(id)))].slice(0, MAX_IDS) : [])

// Solo vale el tramo inicial de paradas sin saltos: una lista con huecos o desordenada se recorta hasta donde es coherente. Una
// visita completada tiene todas (también las partidas guardadas antes de que existieran las paradas).
function cleanStops(raw, tour) {
  if (tour === 'completed') return [...TOUR_STOPS]
  const given = new Set(Array.isArray(raw) ? raw : [])
  const prefix = []
  for (const id of TOUR_STOPS) {
    if (!given.has(id)) break
    prefix.push(id)
  }
  return prefix
}

// Lo guardado puede venir de otra versión o estar manipulado: solo se acepta lo que tiene forma de historia.
export function sanitizeStory(raw) {
  if (!raw || typeof raw !== 'object') return null
  const tour = TOURS.includes(raw.tour) ? raw.tour : 'none'
  return {
    welcome: WELCOMES.includes(raw.welcome) ? raw.welcome : 'pending',
    tour,
    stops: cleanStops(raw.stops, tour),
    heard: cleanIds(raw.heard),
    explained: cleanIds(raw.explained),
  }
}

// Al reanudar una partida no puede quedar una visita "en curso": no hay nadie a quien acompañar todavía. Pasa a
// pendiente, y Lupe vuelve a su sitio en lugar de quedarse esperando o perseguir a la viajera.
export function recoverStory(story) {
  return story.tour === 'accepted' ? { ...story, tour: 'pending' } : story
}

export const setTour = (story, tour) => (story.tour === tour ? story : { ...story, tour })

// Siguiente parada por presentar, o null si ya se hicieron todas.
export const nextStop = (story) => TOUR_STOPS.find((id) => !story.stops.includes(id)) ?? null

// Hay avance guardado de una visita que no se terminó: se ofrece retomarla en lugar de empezar otra.
export const tourStarted = (story) => story.stops.length > 0 && story.tour !== 'completed'

// Da por presentada una parada. Solo vale la siguiente en orden (no se salta ninguna) y la última completa la visita.
export function completeStop(story, id) {
  if (id !== nextStop(story)) return story
  const next = { ...story, stops: [...story.stops, id] }
  return nextStop(next) ? next : { ...next, tour: 'completed' }
}

const withId = (list, id) => (list.includes(id) ? list : [...list, id])

// Qué pasa al abrir un nodo de diálogo (`opened`) y al llegar a su última página (`finished`). Se separan porque quien
// cierra el diálogo a mitad no ha escuchado la explicación entera: no cuenta como explicada ni como bienvenida completada.
const ON_FINISH = {
  'inicio.bienvenida': (story) => ({ ...story, welcome: 'done' }),
  'inicio.dedicas': (story) => ({ ...story, explained: withId(story.explained, 'dedicas') }),
  'inicio.encontrar': (story) => ({ ...story, explained: withId(story.explained, 'encontrar') }),
  'inicio.ayuda': (story) => ({ ...story, explained: withId(story.explained, 'ayuda') }),
}

export function reachNode(story, id, finished = false) {
  let next = story.heard.includes(id) ? story : { ...story, heard: withId(story.heard, id) }
  if (finished && ON_FINISH[id]) next = ON_FINISH[id](next)
  return next
}

// Se ofrece enseñar la casa mientras no se haya hecho ni esté en marcha.
export const tourOffered = (story) => ['none', 'pending', 'cancelled'].includes(story.tour)

// Conversaciones nuevas de cada personaje, por orden: mientras haya una sin escuchar, el personaje lleva la exclamación.
// Por ahora solo Lupe tiene la bienvenida; los demás personajes añaden aquí sus entradas.
const NEWS = { lupe: ['inicio.bienvenida'] }

export function newTalkFor(npc, story) {
  return (NEWS[npc] ?? []).find((id) => !story.heard.includes(id)) ?? null
}

// Lo que las opciones de los guiones comprueban con `when` (ver `dialogue/scripts.js`).
export function storyFeatures(story) {
  return {
    offerTour: tourOffered(story) && !tourStarted(story),
    offerResume: tourOffered(story) && tourStarted(story),
    offerDedicas: !story.explained.includes('dedicas'),
    offerEncontrar: !story.explained.includes('encontrar'),
    offerAyuda: !story.explained.includes('ayuda'),
  }
}
