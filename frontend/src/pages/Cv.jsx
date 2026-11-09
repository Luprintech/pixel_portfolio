import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import PdfPreview from '../components/shared/PdfPreview'
import { LINKS, useValleCopy } from '../lib/valleCopy'

// Alto que dejan la cabecera y los márgenes; el visor ocupa el resto de la pantalla.
const CHROME_HEIGHT = 120

function useViewerHeight() {
  const [height, setHeight] = useState(() => window.innerHeight - CHROME_HEIGHT)
  useEffect(() => {
    const update = () => setHeight(window.innerHeight - CHROME_HEIGHT)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return height
}

// El CV se ve dentro de la web y no abriendo el PDF suelto: en iPhone, y en la app instalada, un
// PDF abierto a pantalla completa no ofrece forma de volver atrás.
export default function Cv() {
  const { copy } = useValleCopy()
  const navigate = useNavigate()
  const location = useLocation()
  const height = useViewerHeight()

  // Sin historial previo (entrada directa por enlace) no hay atrás al que volver: se va al inicio
  const goBack = () => (location.key === 'default' ? navigate('/') : navigate(-1))

  return (
    <div className="flex min-h-dvh flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Helmet>
        <title>{copy.cvPage.title} | Guadalupe Cano</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <header className="flex items-center justify-between gap-3 px-4 py-3">
        <button type="button" className="px-btn px-btn--bone" onClick={goBack}>
          {copy.cvPage.back}
        </button>
        <h1 className="sr-only">{copy.cvPage.title}</h1>
        <a className="px-btn" href={LINKS.cv} download>
          {copy.cvPage.download}
        </a>
      </header>

      <main className="flex-1 px-4 pb-4">
        <PdfPreview src={LINKS.cv} title={copy.cvPage.title} height={height} compact />
        <p className="px-text mt-3 text-sm text-[var(--text-secondary)]">
          <Link className="px-link" to="/">{copy.cvPage.home}</Link>
        </p>
      </main>
    </div>
  )
}
