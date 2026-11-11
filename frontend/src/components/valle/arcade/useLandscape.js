import { useEffect, useState } from 'react'

const QUERY = '(orientation: landscape)'

// ¿Está la pantalla apaisada? Se actualiza al girar el móvil. La recreativa táctil reparte los mandos a los lados del monitor en
// horizontal y debajo en vertical.
export function useLandscape() {
  const [landscape, setLandscape] = useState(() => window.matchMedia?.(QUERY).matches ?? false)
  useEffect(() => {
    const query = window.matchMedia?.(QUERY)
    if (!query) return undefined
    const update = () => setLandscape(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return landscape
}
