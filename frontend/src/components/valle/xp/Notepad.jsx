import { useState } from 'react'
import { useValleCopy } from '../../../lib/valleCopy'
import { isHelloWorld } from './secrets'

// Bloc de notas: un cuadro de texto para escribir, editar, seleccionar y borrar. Lo escrito se queda mientras el programa esté
// abierto o minimizado; no se guarda en ningún sitio.
export default function Notepad({ onUnlock }) {
  const { copy } = useValleCopy()
  const [text, setText] = useState('')
  const change = (event) => {
    setText(event.target.value)
    if (isHelloWorld(event.target.value)) onUnlock?.('hola')
  }
  return (
    <textarea
      value={text}
      onChange={change}
      aria-label={copy.desktop.notepad}
      spellCheck="false"
      className="block h-full w-full resize-none p-2 text-sm outline-none"
      style={{ background: '#fff', color: '#000', fontFamily: '"Lucida Console", "Courier New", monospace' }}
    />
  )
}
