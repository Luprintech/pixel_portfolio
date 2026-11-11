import { useState } from 'react'
import { useValleCopy } from '../../../lib/valleCopy'

// Bloc de notas: un cuadro de texto en blanco. Lo escrito se queda mientras el programa esté abierto; no se guarda en ningún sitio.
export default function Notepad() {
  const { copy } = useValleCopy()
  const [text, setText] = useState('')
  return (
    <textarea
      value={text}
      onChange={(event) => setText(event.target.value)}
      aria-label={copy.desktop.notepad}
      spellCheck="false"
      className="block h-64 w-full resize-none p-2 text-sm outline-none"
      style={{ margin: '-1rem', width: 'calc(100% + 2rem)', height: 'calc(16rem + 2rem)', background: '#fff', color: '#000', fontFamily: '"Lucida Console", "Courier New", monospace' }}
    />
  )
}
