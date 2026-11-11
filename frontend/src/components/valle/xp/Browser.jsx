import { useEffect, useRef, useState } from 'react'
import { useValleCopy } from '../../../lib/valleCopy'
import { AboutBlock, ProjectsBlock, StackBlock } from '../Content'
import PixelIcon from '../PixelIcon'
import { FAVORITES, HOME_URL, canGoBack, canGoForward, createHistory, currentUrl, goBack, goForward, isBlocked, parseAddress, search, searchUrl, visibleFavorites, visit } from './browserPages'

const LETTERS = [['G', '#4285f4'], ['o', '#ea4335'], ['o', '#fbbc05'], ['g', '#4285f4'], ['l', '#34a853'], ['e', '#ea4335']]
const BUTTON = { borderColor: '#7f9db9', background: 'linear-gradient(#ffffff, #dedbc8)' }

const PORTFOLIO_BODY = { projects: ProjectsBlock, about: AboutBlock, stack: StackBlock }

// Estilos de las secciones del portfolio dentro de la página (el contenido es el mismo del resto del juego).
const pageTokens = { ['--text-primary']: '#000', ['--text-secondary']: '#333', ['--bg-surface']: '#f5f4ea', ['--bg-elevated']: '#f5f4ea', ['--bg-secondary']: '#ece9d8', ['--border-color']: '#7f9db9', ['--px-ink']: '#0a246a', ['--px-ring']: '#7f9db9', ['--accent-primary']: '#0a246a', ['--accent-secondary']: '#0a246a' }

// La página de inicio: el nombre en letras de colores, una caja de búsqueda y dos botones, como los buscadores de los primeros.
function Home({ b, lang, onSearch, onLucky, onVisit }) {
  const [query, setQuery] = useState('')
  return (
    <div className="flex min-h-full flex-col items-center gap-3 px-4 py-4">
      <h1 aria-label="Google" className="text-5xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
        {LETTERS.map(([letter, color], i) => (
          <span key={i} aria-hidden="true" style={{ color }}>{letter}</span>
        ))}
      </h1>
      <form className="flex w-full max-w-md flex-col items-center gap-3" onSubmit={(event) => { event.preventDefault(); onSearch(query) }}>
        <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" aria-label={b.search} autoComplete="off" className="w-full border-2 px-2 py-1 text-base" style={{ borderColor: '#7f9db9' }} />
        <span className="flex flex-wrap justify-center gap-2">
          <button type="submit" className="rounded border px-3 py-1" style={BUTTON}>{b.go}</button>
          <button type="button" className="rounded border px-3 py-1" style={BUTTON} onClick={() => onLucky(query)}>{b.lucky}</button>
        </span>
      </form>
      <p className="text-xs" style={{ color: '#555' }}>{b.tip}</p>
      <section aria-label={b.featured} className="w-full max-w-xl space-y-3 border-t pt-4 text-sm" style={{ borderColor: '#ddd' }}>
        <p className="text-xs" style={{ color: '#555' }}>{b.featured}</p>
        <ResultList results={visibleFavorites().map((favorite) => ({ ...(favorite[lang] ?? favorite.es), url: favorite.url }))} onVisit={onVisit} />
      </section>
    </div>
  )
}

// Lista de resultados con el aspecto de los buscadores de los primeros: título azul subrayado, dirección en verde y un resumen.
function ResultList({ results, onVisit }) {
  return (
    <ul className="space-y-4">
      {results.map((result) => (
        <li key={result.url}>
          <button type="button" className="block text-left text-base font-semibold underline" style={{ color: '#1a0dab' }} onClick={() => onVisit(result.url)}>{result.title}</button>
          <span className="block text-xs" style={{ color: '#006621' }}>{result.url}</span>
          <span className="block">{result.snippet}</span>
        </li>
      ))}
    </ul>
  )
}

// Resultados de una búsqueda: las secciones del portfolio y los enlaces conocidos que coinciden, con su dirección. Al final, la
// opción (a elegir, nunca automática) de buscar lo mismo en el buscador de verdad, que se abre fuera.
function Results({ b, query, lang, onVisit }) {
  const results = search(query, lang)
  return (
    <div className="space-y-4 p-4 text-sm">
      <p style={{ color: '#555' }}>{b.resultsFor} «{query}»</p>
      {results.length === 0 && <p>{b.noResults}</p>}
      <ResultList results={results} onVisit={onVisit} />
      <p className="border-t pt-3 text-xs" style={{ borderColor: '#ddd' }}>
        {b.outside}{' '}
        <a href={`https://www.google.com/search?q=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: '#1a0dab' }}>{b.outsideLink}</a>
      </p>
    </div>
  )
}

// Web de fuera: se intenta enseñar en un visor integrado y, si es de las que lo prohíben, se avisa y se ofrece abrirla fuera
// (nunca se redirige sola). Como el navegador no avisa cuando una web se niega, la barra de arriba permite abrirla siempre.
function External({ b, url, host }) {
  const blocked = isBlocked(host)
  return (
    <div className="flex h-full flex-col">
      <p className="flex shrink-0 flex-wrap items-center gap-2 border-b px-2 py-1 text-xs" style={{ background: '#ffffe1', borderColor: '#aca899' }}>
        <span>{blocked ? b.blocked : b.maybeBlocked}</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="rounded border px-2 py-0.5" style={BUTTON}>{b.openOutside}</a>
      </p>
      {blocked ? (
        <div className="grid flex-1 place-items-center p-6 text-center text-sm">
          <p>{host}</p>
        </div>
      ) : (
        <iframe title={host} src={url} sandbox="allow-scripts allow-forms allow-popups" referrerPolicy="no-referrer" className="min-h-0 w-full flex-1 border-0" />
      )}
    </div>
  )
}

// Internet Explorer: barra de direcciones, Atrás, Adelante, Actualizar e Inicio, con historial. Navega por dentro (el buscador,
// los resultados, las secciones del portfolio y webs de fuera en un visor) sin abrir pestañas del navegador de verdad.
export default function Browser() {
  const { copy, lang } = useValleCopy()
  const b = copy.desktop.browser
  const [history, setHistory] = useState(createHistory)
  const [reload, setReload] = useState(0)
  const [typed, setTyped] = useState(null)
  const scrollRef = useRef(null)
  const url = currentUrl(history)
  const page = parseAddress(url)

  // Cada página nueva empieza arriba.
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [url, reload])

  const go = (address) => {
    setTyped(null)
    setHistory((h) => visit(h, parseAddress(address).url))
  }
  const lucky = (query) => {
    const [first] = search(query, lang)
    go(first ? first.url : searchUrl(query))
  }
  // Las redes sociales no se enseñan dentro del navegador: se abren en otra pestaña.
  const follow = (address) => {
    if (FAVORITES.find((favorite) => favorite.url === address)?.newTab) window.open(address, '_blank', 'noopener,noreferrer')
    else go(address)
  }
  const toolbar = 'rounded border px-2 py-0.5 text-xs disabled:opacity-40'

  let content
  if (page.kind === 'home') content = <Home key={reload} b={b} lang={lang} onSearch={(query) => go(query.trim() ? query : HOME_URL)} onLucky={lucky} onVisit={follow} />
  else if (page.kind === 'results') content = <Results b={b} query={page.query} lang={lang} onVisit={follow} />
  else if (page.kind === 'page') {
    const Body = PORTFOLIO_BODY[page.page]
    content = (
      <div className="p-4 text-sm" style={pageTokens}>
        <h1 className="mb-3 text-xl font-bold" style={{ color: '#003399' }}>{b.pages[page.page]}</h1>
        <Body />
      </div>
    )
  } else if (page.kind === 'external') content = <External b={b} url={page.url} host={page.host} />
  else content = <p className="p-6 text-sm">{b.notFound}</p>

  return (
    <div className="flex h-full min-h-[16rem] flex-col text-[13px]" style={{ background: '#ece9d8', color: '#000' }}>
      <div className="flex shrink-0 flex-wrap items-center gap-1 border-b px-2 py-1" style={{ borderColor: '#aca899' }}>
        <button type="button" className={toolbar} style={BUTTON} disabled={!canGoBack(history)} onClick={() => setHistory(goBack)}>◀ {b.back}</button>
        <button type="button" className={toolbar} style={BUTTON} disabled={!canGoForward(history)} onClick={() => setHistory(goForward)}>{b.forward} ▶</button>
        <button type="button" className={toolbar} style={BUTTON} onClick={() => setReload((n) => n + 1)}>⟳ {b.refresh}</button>
        <button type="button" className={toolbar} style={BUTTON} onClick={() => go(HOME_URL)}>⌂ {b.home}</button>
      </div>
      <form className="flex shrink-0 items-center gap-2 border-b px-2 py-1" style={{ borderColor: '#aca899' }} onSubmit={(event) => { event.preventDefault(); go(typed ?? url) }}>
        <label htmlFor="ie-address" className="text-xs">{b.address}</label>
        <input id="ie-address" value={typed ?? url} onChange={(event) => setTyped(event.target.value)} onFocus={(event) => event.target.select()} spellCheck="false" className="min-w-0 flex-1 border px-1 py-0.5" style={{ borderColor: '#7f9db9', background: '#fff' }} />
        <button type="submit" className={toolbar} style={BUTTON}>{b.goButton}</button>
      </form>
      <nav aria-label={b.favorites} className="flex shrink-0 items-center gap-1 overflow-x-auto border-b px-2 py-1" style={{ borderColor: '#aca899' }}>
        <span className="shrink-0 text-xs font-bold">★ {b.favorites}</span>
        {visibleFavorites().map((favorite) => (
          <button key={favorite.id} type="button" data-sound="select" title={favorite.url} className="flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 text-xs" style={{ ...BUTTON, outline: url === favorite.url ? '2px solid #316ac5' : undefined }} onClick={() => follow(favorite.url)}>
            <PixelIcon id={favorite.icon} size={14} />
            {favorite.label}
            {favorite.newTab && <span className="sr-only"> {copy.desktop.newTab}</span>}
          </button>
        ))}
      </nav>
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto" style={{ background: '#fff' }}>{content}</div>
      <p className="shrink-0 border-t px-2 py-0.5 text-xs" style={{ borderColor: '#aca899' }}>{page.kind === 'external' ? page.url : b.ready}</p>
    </div>
  )
}

