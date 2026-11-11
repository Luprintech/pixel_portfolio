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

// Paradas de la visita por dentro de la casa, en el orden en que Lupe las lleva. `stops` guarda las ya presentadas por completo (en este
// orden, pero sin exigir que sean seguidas: si la viajera se acerca por su cuenta a Atreus, Lupe lo presenta ya y la visita sigue por la
// primera que falte), así que abandonar, pausar o recargar no pierde el avance.
export const TOUR_STOPS = ['entrada', 'impresoras', 'atreus', 'pc', 'khalessi', 'cierre']

// Lo que se guarda son ids de conversaciones y de preguntas: se acota el tamaño por si el guardado viene manipulado.
const ID = /^[a-z0-9._-]{1,48}$/
const MAX_IDS = 200

export const initialStory = () => ({ welcome: 'pending', tour: 'none', stops: [], heard: [], explained: [] })

const cleanIds = (raw) => (Array.isArray(raw) ? [...new Set(raw.filter((id) => typeof id === 'string' && ID.test(id)))].slice(0, MAX_IDS) : [])

// Solo valen paradas que existen, sin repetir y en su orden. Una visita completada tiene todas (también las partidas guardadas antes
// de que existieran las paradas).
function cleanStops(raw, tour) {
  if (tour === 'completed') return [...TOUR_STOPS]
  const given = new Set(Array.isArray(raw) ? raw : [])
  return TOUR_STOPS.filter((id) => given.has(id))
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

// Siguiente parada por presentar, o null si ya se hicieron todas. Con `after` (la que se acaba de presentar) sigue por la que viene
// detrás en el recorrido y, si no queda ninguna, vuelve a la primera que falte. El cierre va siempre el último.
export function nextStop(story, after = null) {
  const pending = TOUR_STOPS.filter((id) => !story.stops.includes(id))
  const pool = pending.length > 1 ? pending.filter((id) => id !== 'cierre') : pending
  const from = after ? TOUR_STOPS.indexOf(after) : -1
  return pool.find((id) => TOUR_STOPS.indexOf(id) > from) ?? pool[0] ?? null
}

// Hay avance guardado de una visita que no se terminó: se ofrece retomarla en lugar de empezar otra.
export const tourStarted = (story) => story.stops.length > 0 && story.tour !== 'completed'

// Da por presentada una parada, sea la siguiente o una que la viajera pidió antes, y la última completa la visita.
export function completeStop(story, id) {
  if (!TOUR_STOPS.includes(id) || story.stops.includes(id)) return story
  const next = { ...story, stops: TOUR_STOPS.filter((stop) => stop === id || story.stops.includes(stop)) }
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
  // Una conversación escuchada hasta el final queda contestada: las opciones que llevan a ella dejan de ofrecerse (`answered`).
  // Las preguntas de la bienvenida ya se agotan por su propia regla (`ON_FINISH`).
  if (finished && ON_FINISH[id]) next = ON_FINISH[id](next)
  else if (finished) next = { ...next, explained: withId(next.explained, id) }
  return next
}

// Al entrar por la puerta de la azotea sin haber hecho ni rechazado la visita, Lupe sale a recibirla dentro igual que por la puerta
// de la calle. Quien la rechazó (`cancelled`) o ya la hizo (`completed`) entra sola.
export const tourOnRoofEntry = (story) => story.tour === 'none' || story.tour === 'pending'

// Se ofrece enseñar la casa mientras no se haya hecho ni esté en marcha.
export const tourOffered = (story) => ['none', 'pending', 'cancelled'].includes(story.tour)

// Lupe sale a presentar a Ylonem y a Grace ante la puerta del IES Gran Capitán una sola vez (`npc/GranNeighbours.js`). Mientras tenga a Lupe
// guiándola por la casa no toca: la visita en marcha manda.
export const GRAN_ARRIVAL = 'gran.llegada'
export const granArrivalDue = (story) => story.tour !== 'accepted' && !story.heard.includes(GRAN_ARRIVAL)

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
    // Ids de los nodos escuchados hasta el final: una opción que lleva a uno de ellos se oculta (ver `dialogue/engine.js`).
    answered: story.explained,
  }
}
