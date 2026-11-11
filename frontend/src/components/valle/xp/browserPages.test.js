import { describe, expect, it } from 'vitest'
import { FAVORITES, HOME_URL, canGoBack, canGoForward, createHistory, currentUrl, goBack, goForward, isBlocked, pageUrl, parseAddress, search, searchUrl, visibleFavorites, visit } from './browserPages.js'

describe('direcciones', () => {
  it('reconoce la página de inicio con o sin protocolo', () => {
    ;['', 'google.com', 'http://www.google.com', 'https://google.com/', HOME_URL].forEach((text) => expect(parseAddress(text).kind, text).toBe('home'))
  })

  it('una dirección interna del portfolio lleva a su sección y una desconocida a «no encontrada»', () => {
    expect(parseAddress('luprintech://projects')).toMatchObject({ kind: 'page', page: 'projects' })
    expect(parseAddress('LUPRINTECH://About/')).toMatchObject({ kind: 'page', page: 'about' })
    expect(parseAddress('luprintech://nada').kind).toBe('notfound')
  })

  it('lo que no es una dirección es una búsqueda, y la dirección de resultados se entiende', () => {
    expect(parseAddress('proyectos de lupe')).toMatchObject({ kind: 'results', query: 'proyectos de lupe' })
    expect(parseAddress('react')).toMatchObject({ kind: 'results', query: 'react' })
    expect(parseAddress(searchUrl('impresión 3d'))).toMatchObject({ kind: 'results', query: 'impresión 3d' })
  })

  it('una web de fuera se normaliza a https y se reconoce su sitio', () => {
    expect(parseAddress('example.com/ruta')).toMatchObject({ kind: 'external', url: 'https://example.com/ruta', host: 'example.com' })
    expect(parseAddress('http://www.wikipedia.org')).toMatchObject({ kind: 'external', host: 'wikipedia.org' })
  })

  it('avisa de las webs que no se dejan incrustar, subdominios incluidos', () => {
    expect(isBlocked('youtube.com')).toBe(true)
    expect(isBlocked('m.youtube.com')).toBe(true)
    expect(isBlocked('wikipedia.org')).toBe(false)
    expect(isBlocked('notyoutube.com')).toBe(false)
  })
})

describe('buscador interno', () => {
  it('encuentra las secciones del portfolio por sus palabras', () => {
    expect(search('proyectos')[0].url).toBe(pageUrl('projects'))
    expect(search('quién es lupe')[0].url).toBe(pageUrl('about'))
    expect(search('docker react').some((result) => result.url === pageUrl('stack'))).toBe(true)
  })

  it('incluye los enlaces externos que ya existen y no inventa nada', () => {
    expect(search('youtube').map((result) => result.url)).toContain('https://www.youtube.com/@Luprintech')
    expect(search('xyzzy plugh')).toEqual([])
    expect(search('   ')).toEqual([])
  })

  it('ordena por acierto y responde en el idioma pedido', () => {
    const es = search('proyectos react', 'es')
    const en = search('projects', 'en')
    expect(es[0].url).toBe(pageUrl('projects'))
    expect(en[0].title).toMatch(/My projects/)
  })

  it('no hace caso de mayúsculas ni de tildes', () => {
    expect(search('TECNOLOGÍAS')[0].url).toBe(pageUrl('stack'))
  })
})

describe('historial', () => {
  it('navega hacia atrás y hacia delante, y una visita nueva borra lo de delante', () => {
    let h = createHistory()
    h = visit(h, pageUrl('projects'))
    h = visit(h, pageUrl('about'))
    expect(currentUrl(h)).toBe(pageUrl('about'))
    expect(canGoBack(h)).toBe(true)
    expect(canGoForward(h)).toBe(false)
    h = goBack(h)
    expect(currentUrl(h)).toBe(pageUrl('projects'))
    expect(canGoForward(h)).toBe(true)
    h = visit(h, pageUrl('stack'))
    expect(canGoForward(h)).toBe(false)
    expect(h.entries).toEqual([HOME_URL, pageUrl('projects'), pageUrl('stack')])
    expect(currentUrl(goForward(h))).toBe(pageUrl('stack'))
  })

  it('no crece al visitar la misma página ni se sale por los extremos', () => {
    let h = visit(createHistory(), HOME_URL)
    expect(h.entries).toHaveLength(1)
    h = goBack(h)
    expect(h.index).toBe(0)
    expect(goForward(h).index).toBe(0)
  })
})

describe('favoritos', () => {
  const urls = visibleFavorites().map((favorite) => favorite.url)

  it('incluyen las páginas y redes reales con su enlace exacto', () => {
    expect(urls).toEqual(expect.arrayContaining([
      'https://guadalupecano.es',
      'https://github.com/Luprintech',
      'https://www.linkedin.com/in/guadalupe-cano-moyano/',
      'https://www.youtube.com/@Luprintech',
      'https://ahiestalapelicula.com',
      'https://filamentos.luprintech.com/',
      'https://github.com/Luprintech/filamentOS',
    ]))
  })

  it('no enseñan luprintech.com y todos son https', () => {
    urls.forEach((url) => {
      expect(url.startsWith('https://'), url).toBe(true)
      expect(new URL(url).hostname.replace(/^www\./, ''), url).not.toBe('luprintech.com')
    })
    expect(search('luprintech', 'es').some((result) => new URL(result.url, 'https://x.test').hostname === 'luprintech.com')).toBe(false)
  })

  it('Instagram y TikTok llevan a los perfiles de Luprintech', () => {
    expect(FAVORITES.find((favorite) => favorite.id === 'instagram').url).toBe('https://www.instagram.com/luprintech/')
    expect(FAVORITES.find((favorite) => favorite.id === 'tiktok').url).toBe('https://www.tiktok.com/@luprintech')
  })

  it('un favorito sin enlace queda oculto', () => {
    expect(visibleFavorites([{ id: 'x', url: null }, { id: 'y', url: 'https://example.com' }]).map((favorite) => favorite.id)).toEqual(['y'])
  })

  it('las webs que prohíben incrustarse se avisan para abrirse fuera', () => {
    ;['guadalupecano.es', 'ahiestalapelicula.com', 'github.com', 'linkedin.com', 'youtube.com'].forEach((host) => expect(isBlocked(host), host).toBe(true))
  })

  it('se encuentran con el buscador', () => {
    expect(search('filamentos').some((result) => result.url === 'https://filamentos.luprintech.com/')).toBe(true)
    expect(search('github').some((result) => result.url === 'https://github.com/Luprintech')).toBe(true)
  })
})

describe('favoritos de redes sociales', () => {
  it('se abren en otra pestaña', () => {
    ;['github', 'linkedin', 'youtube', 'instagram', 'tiktok'].forEach((id) => expect(FAVORITES.find((favorite) => favorite.id === id).newTab, id).toBe(true))
  })
})
