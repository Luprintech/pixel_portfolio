// ¿Hay que dejar quieto lo que se mueve solo? Solo si el sistema del visitante lo pide
// (`prefers-reduced-motion`): el juego no tiene un interruptor propio.
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
}
