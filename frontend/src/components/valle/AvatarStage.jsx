import { useCallback, useState } from 'react'
import { FRAME_H, FRAME_W, WALK_CYCLE, avatarCanvas } from '../../game/avatar/index.js'
import { shadowSprite } from '../../game/sprites'
import { useValleCopy } from '../../lib/valleCopy'
import StageFrame from './stage/StageFrame'
import { useWalkStep } from './stage/useWalkStep'

// Orden en que gira la viajera; el perfil izquierdo ya viene dibujado desde ese lado, no se refleja.
const TURNS = ['down', 'right', 'up', 'left']
// Píxeles de juego que deben caber: la figura con aire a los lados y por encima (hay sombreros
// altos y peinados anchos) y el hueco del suelo bajo los pies.
const MIN_COLS = FRAME_W + 10
const MIN_ROWS = FRAME_H + 8
const GROUND = 5

// La viajera camina en el sitio con el ciclo del juego (reposo, paso, reposo, paso contrario), así que
// de perfil se ve andar y la figura nunca se sale de la caja.
export default function AvatarStage({ look, walking }) {
  const { copy } = useValleCopy()
  const [turn, setTurn] = useState(0)
  const dir = TURNS[turn]
  const pose = WALK_CYCLE[useWalkStep(walking)]

  const paint = useCallback(
    (g, { cols, rows }) => {
      const x = Math.floor((cols - FRAME_W) / 2)
      g.drawImage(shadowSprite(14, 5), x + 2, rows - GROUND - 3)
      g.drawImage(avatarCanvas(look, dir, pose), x, rows - GROUND - FRAME_H)
    },
    [look, dir, pose],
  )

  return (
    <StageFrame
      title={copy.editor.avatarTitle}
      turnLabel={copy.editor.rotate}
      onTurn={() => setTurn((value) => (value + 1) % TURNS.length)}
      minCols={MIN_COLS}
      minRows={MIN_ROWS}
      paint={paint}
      label={copy.editor.avatarPreview}
    />
  )
}
