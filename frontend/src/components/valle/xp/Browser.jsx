import { useState } from 'react'
import { useValleCopy } from '../../../lib/valleCopy'

const LETTERS = [['G', '#4285f4'], ['o', '#ea4335'], ['o', '#fbbc05'], ['g', '#4285f4'], ['l', '#34a853'], ['e', '#ea4335']]

// Navegador de la época (Internet Explorer) con la página de inicio de un buscador de los primeros: el nombre en letras de
// colores, una caja de búsqueda y dos botones. Es operativo: buscar abre los resultados reales del buscador en otra pestaña
// (un navegador dentro del juego no puede mostrar páginas ajenas). La barra de direcciones es de solo lectura.
export default function Browser() {
  const { copy } = useValleCopy()
  const b = copy.desktop.browser
  const [home, setHome] = useState(0)
  return (
    <div className="flex min-h-[18rem] flex-col text-[13px]" style={{ background: '#ece9d8', color: '#000', margin: '-1rem' }}>
      <div className="flex flex-wrap items-center gap-2 border-b px-2 py-1" style={{ borderColor: '#aca899' }}>
        <button type="button" className="rounded border px-2 py-0.5" style={{ borderColor: '#7f9db9', background: '#fff' }} onClick={() => setHome((n) => n + 1)}>{b.home}</button>
        <span className="text-xs">{b.address}</span>
        <input readOnly aria-label={b.address} value="http://www.google.com/" className="min-w-0 flex-1 border px-1 py-0.5" style={{ borderColor: '#7f9db9', background: '#fff' }} />
      </div>
      <div key={home} className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-8" style={{ background: '#fff' }}>
        <h1 aria-label="Google" className="text-6xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          {LETTERS.map(([letter, color], i) => (
            <span key={i} aria-hidden="true" style={{ color }}>{letter}</span>
          ))}
        </h1>
        <form action="https://www.google.com/search" method="get" target="_blank" className="flex w-full max-w-md flex-col items-center gap-3">
          <input name="q" type="search" aria-label={b.search} autoComplete="off" className="w-full border-2 px-2 py-1 text-base" style={{ borderColor: '#7f9db9' }} />
          <span className="flex flex-wrap justify-center gap-2">
            <button type="submit" className="rounded border px-3 py-1" style={{ borderColor: '#707070', background: 'linear-gradient(#f8f8f8, #dcdcdc)' }}>{b.go}</button>
            <button type="submit" name="btnI" value="1" className="rounded border px-3 py-1" style={{ borderColor: '#707070', background: 'linear-gradient(#f8f8f8, #dcdcdc)' }}>{b.lucky}</button>
          </span>
        </form>
        <p className="text-xs" style={{ color: '#555' }}>{b.note}</p>
      </div>
    </div>
  )
}
