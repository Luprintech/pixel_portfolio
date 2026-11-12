// Los tres juegos de la recreativa, solo como datos: su id, el logro que da completarlos y la canción que suena mientras se
// juega (ver `lib/chiptuneSongs.js`). Los módulos de cada juego están en `modules.js`, aparte, para que guardar puntuaciones o
// leer logros no arrastre el dibujo de nadie. Para añadir un juego: su carpeta, su entrada aquí y en `modules.js`, su logro en
// `achievements.js`, sus textos en `lib/arcadeCopy.js` y su canción en `chiptuneSongs.js`.

// `pad` es la cruceta táctil que necesita: 'full' (cuatro direcciones) u 'horizontal' (solo izquierda y derecha). `guard` añade el
// botón B (mantener) para levantar el escudo; los demás juegos solo tienen el A.
export const GAMES = [
  { id: 'dungeon', achievement: 'retro', theme: 'adventure', pad: 'full', guard: true },
  { id: 'galactic', achievement: 'galactic', theme: 'galactic', pad: 'horizontal' },
  { id: 'river', achievement: 'river', theme: 'river', pad: 'full' },
]

export const GAME_IDS = GAMES.map((game) => game.id)

// Canción del selector: suena mientras se elige juego y al volver a él.
export const MENU_THEME = 'arcade'

export const gameById = (id) => GAMES.find((game) => game.id === id) ?? null
