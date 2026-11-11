import { useEffect, useState } from 'react'
import { jukebox } from '../lib/jukebox'

// Estado del reproductor de música de la casa (suena, qué pista) y sus controles.
export function useJukebox() {
  const [state, setState] = useState(jukebox.snapshot)
  useEffect(() => jukebox.subscribe(setState), [])
  return { ...state, controls: jukebox }
}
