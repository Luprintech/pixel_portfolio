// La historia viva de la partida vive en el registro del juego: así la ven a la vez las escenas (el valle y la casa) y la
// página, y cualquiera que la cambie avisa a los demás con el evento `changedata-story` de Phaser. Sin importar Phaser.
import { initialStory } from './story.js'

export const getStory = (game) => game.registry.get('story') ?? initialStory()

// Aplica un cambio (función de la historia actual a la nueva) y solo publica si algo cambió.
export function updateStory(game, change) {
  const current = getStory(game)
  const next = change(current)
  if (next !== current) game.registry.set('story', next)
  return next
}
