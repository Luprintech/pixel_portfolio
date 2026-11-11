// Motor de diálogos, reutilizable por cualquier NPC u objeto. Es una máquina de estados pura: sin React, sin Phaser
// y sin texto (cada página lleva la clave de su texto, que resuelve la interfaz según el idioma).
//
// Un guion es un mapa `id -> nodo`. Un nodo tiene páginas (`pages`, cada una con quien habla y la clave de su
// texto) y, al acabar, opciones (`options`) o, si no las tiene, termina y devuelve su `action`. Una opción lleva a
// otro nodo (`to`), cierra (`close`) o dispara una acción (`action`). `when` oculta la opción mientras la función
// que se pasa en `features` no la active: así lo que aún no tiene recursos (una galería sin fotos) queda preparado
// sin enseñar un botón que no hace nada.

// Páginas de un nodo que se leen ahora: una página con `when` solo sale si esa función está activa (la mascota de la viajera,
// por ejemplo). Se filtra al leer, no al escribir el guion, porque lo que hay activo se sabe al abrir la conversación.
const pagesOf = (node, features) => node.pages.filter((page) => !page.when || features[page.when])

// Estado de una conversación abierta: el nodo y la página que se lee.
export const openNode = (id) => ({ id, index: 0 })

export function nodeOf(scripts, id) {
  const node = scripts[id]
  if (!node) throw new Error(`Diálogo desconocido: ${id}`)
  return node
}

// Una opción se ve si su función está activa y, si lleva a otra conversación, esa aún no se ha escuchado entera (`features.answered`):
// así las preguntas se van agotando y el menú se acorta a medida que la viajera avanza. Las salidas (`close`, `action`) no se agotan.
const visibleOptions = (node, features) =>
  (node.options ?? []).filter((option) => (!option.when || features[option.when]) && !(option.to && features.answered?.includes(option.to)))

// Lo que se muestra ahora: la página actual, si es la última y las opciones que se pueden elegir (solo en la última).
export function view(scripts, state, features = {}) {
  const node = nodeOf(scripts, state.id)
  const pages = pagesOf(node, features)
  const last = state.index >= pages.length - 1
  return { page: pages[state.index], last, options: last ? visibleOptions(node, features) : [] }
}

// Pasa de página. En la última sin opciones la conversación acaba: devuelve `done` con la acción del nodo, si la tiene.
// Con opciones no hace nada: hay que elegir una.
export function advance(scripts, state, features = {}) {
  const node = nodeOf(scripts, state.id)
  if (state.index < pagesOf(node, features).length - 1) return { state: { ...state, index: state.index + 1 } }
  if (visibleOptions(node, features).length) return { state }
  return { state: null, done: true, action: node.action }
}

// Elige una opción de la última página. `id` es el de la opción; una desconocida o oculta se ignora.
export function choose(scripts, state, optionId, features = {}) {
  const node = nodeOf(scripts, state.id)
  const option = visibleOptions(node, features).find((candidate) => candidate.id === optionId)
  if (!option || state.index < pagesOf(node, features).length - 1) return { state }
  if (option.to) return { state: openNode(option.to) }
  return { state: null, done: true, action: option.action }
}

// Cuántos caracteres del texto se ven pasado `elapsed` ms a `cps` caracteres por segundo. Con `cps` 0 se ve todo.
export function revealCount(text, elapsed, cps) {
  if (!cps) return text.length
  return Math.min(text.length, Math.floor((Math.max(0, elapsed) / 1000) * cps))
}
