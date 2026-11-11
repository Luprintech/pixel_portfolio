// Las páginas del Internet Explorer del escritorio: cómo se interpreta una dirección, el buscador interno y la lista de
// webs que se pueden visitar dentro del navegador. Todo es puro (sin React ni red), así se prueba sin navegador.
//
// Hay cuatro tipos de página: `home` (el buscador de los primeros), `results` (los resultados de una búsqueda), `page` (una
// sección del portfolio, con la dirección `luprintech://...`) y `external` (una web de fuera, que se intenta enseñar en un
// visor integrado y, si la web lo prohíbe, avisa y ofrece abrirla fuera sin redirigir sola).
export const HOME_URL = 'http://www.google.com/'
const SEARCH_BASE = 'http://www.google.com/search?q='

// Webs que no se dejan incrustar en un visor (cabeceras de seguridad que lo prohíben): se avisa en lugar de enseñar un
// recuadro vacío. Con el resto se intenta el visor.
export const BLOCKED_HOSTS = ['google.com', 'youtube.com', 'facebook.com', 'instagram.com', 'x.com', 'twitter.com', 'linkedin.com', 'github.com', 'netflix.com', 'tiktok.com', 'reddit.com', 'amazon.com']

// Secciones del portfolio que se pueden visitar. `keywords` alimenta al buscador; los textos van por idioma.
export const PORTFOLIO_PAGES = {
  projects: {
    keywords: ['proyectos', 'projects', 'portfolio', 'web', 'react', 'demo', 'codigo', 'code', 'trabajos', 'desarrollo'],
    es: { title: 'Mis proyectos — Luprintech', snippet: 'Los proyectos del portfolio, con su descripción, tecnologías y los enlaces disponibles.' },
    en: { title: 'My projects — Luprintech', snippet: 'The portfolio projects, with their description, technologies and the links available.' },
  },
  about: {
    keywords: ['sobre', 'about', 'lupe', 'guadalupe', 'cano', 'desarrolladora', 'developer', 'cv', 'curriculum', 'perfil', 'quien'],
    es: { title: 'Sobre Lupe — Desarrolladora web full stack', snippet: 'Quién es Guadalupe Cano, con qué trabaja y dónde encontrarla.' },
    en: { title: 'About Lupe — Full stack web developer', snippet: 'Who Guadalupe Cano is, what she works with and where to find her.' },
  },
  stack: {
    keywords: ['stack', 'tecnologias', 'technologies', 'react', 'node', 'php', 'laravel', 'docker', 'linux', 'css', 'herramientas', 'tools'],
    es: { title: 'Tecnologías y herramientas', snippet: 'Las herramientas que Lupe usa a diario.' },
    en: { title: 'Technologies and tools', snippet: 'The tools Lupe uses every day.' },
  },
}

// Webs externas que salen en los resultados (enlaces que ya existen en el portfolio).
export const EXTERNAL_RESULTS = [
  { url: 'https://www.youtube.com/@Luprintech', keywords: ['youtube', 'luprintech', 'videos', 'canal', 'channel', '3d', 'impresion', 'printing'], es: { title: 'Luprintech — YouTube', snippet: 'El canal de YouTube de Luprintech.' }, en: { title: 'Luprintech — YouTube', snippet: "Luprintech's YouTube channel." } },
  { url: 'https://www.linkedin.com/in/guadalupe-cano-moyano/', keywords: ['linkedin', 'guadalupe', 'cano', 'perfil', 'profile', 'cv'], es: { title: 'Guadalupe Cano Moyano — LinkedIn', snippet: 'Perfil profesional en LinkedIn.' }, en: { title: 'Guadalupe Cano Moyano — LinkedIn', snippet: 'Professional profile on LinkedIn.' } },
]

const normalise = (text) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
export const pageUrl = (page) => `luprintech://${page}`
export const searchUrl = (query) => `${SEARCH_BASE}${encodeURIComponent(query)}`

const HOST = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/\S*)?$/i

// Qué página corresponde a lo escrito en la barra de direcciones (o a una dirección de la historia).
export function parseAddress(input) {
  const text = input.trim()
  if (!text || /^(https?:\/\/)?(www\.)?google\.com\/?$/i.test(text)) return { kind: 'home', url: HOME_URL }
  const internal = text.match(/^luprintech:\/\/(\w+)\/?$/i)
  if (internal) return PORTFOLIO_PAGES[internal[1].toLowerCase()] ? { kind: 'page', page: internal[1].toLowerCase(), url: pageUrl(internal[1].toLowerCase()) } : { kind: 'notfound', url: text }
  const results = text.match(/^(https?:\/\/)?(www\.)?google\.com\/search\?q=(.*)$/i)
  if (results) {
    const query = decodeURIComponent(results[3].replace(/\+/g, ' '))
    return { kind: 'results', query, url: searchUrl(query) }
  }
  if (!/\s/.test(text) && HOST.test(text)) {
    const url = /^https?:\/\//i.test(text) ? text : `https://${text}`
    return { kind: 'external', url, host: new URL(url).hostname.replace(/^www\./, '') }
  }
  return { kind: 'results', query: text, url: searchUrl(text) }
}

export const isBlocked = (host) => BLOCKED_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))

// Resultados de una búsqueda: las páginas del portfolio y los enlaces conocidos cuyas palabras clave o texto coinciden con
// alguna palabra buscada, las más acertadas primero. Cada resultado es `{ title, snippet, url }`.
export function search(query, lang = 'es') {
  const words = normalise(query).split(/[^a-z0-9]+/).filter((word) => word.length > 1)
  if (!words.length) return []
  const entries = [
    ...Object.entries(PORTFOLIO_PAGES).map(([page, entry]) => ({ ...entry, url: pageUrl(page) })),
    ...EXTERNAL_RESULTS,
  ]
  return entries
    .map((entry) => {
      const text = entry[lang] ?? entry.es
      const haystack = normalise(`${text.title} ${text.snippet}`)
      const score = words.reduce((sum, word) => sum + (entry.keywords.some((keyword) => keyword === word || keyword.startsWith(word)) ? 3 : 0) + (haystack.includes(word) ? 1 : 0), 0)
      return { title: text.title, snippet: text.snippet, url: entry.url, score }
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ title, snippet, url }) => ({ title, snippet, url }))
}

// Historial de navegación: una lista de direcciones y la posición actual. Navegar a una nueva borra lo que había por delante.
export const createHistory = (url = HOME_URL) => ({ entries: [url], index: 0 })

export function visit(history, url) {
  if (history.entries[history.index] === url) return history
  const entries = [...history.entries.slice(0, history.index + 1), url]
  return { entries, index: entries.length - 1 }
}

export const goBack = (history) => ({ ...history, index: Math.max(0, history.index - 1) })
export const goForward = (history) => ({ ...history, index: Math.min(history.entries.length - 1, history.index + 1) })
export const currentUrl = (history) => history.entries[history.index]
export const canGoBack = (history) => history.index > 0
export const canGoForward = (history) => history.index < history.entries.length - 1
