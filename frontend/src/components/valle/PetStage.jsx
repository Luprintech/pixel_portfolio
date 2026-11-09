import { useCallback, useState } from 'react'
import { PAL } from '../../game/palette'
import { petCanvas } from '../../game/pets'
import { shadowSprite } from '../../game/sprites'
import { useValleCopy } from '../../lib/valleCopy'
import StageFrame from './stage/StageFrame'
import { useWalkStep } from './stage/useWalkStep'

// La raza más grande mide 32 columnas por 20 filas; el resto de píxeles es aire alrededor.
const MIN_COLS = 38
const MIN_ROWS = 28
const GROUND = 5

// Escena de la mascota, aparte de la de la viajera. Solo tiene perfil: girar la pone a mirar a la
// derecha o a la izquierda. Anda en el sitio, alternando las patas como en el valle, y mueve la cola.
export default function PetStage({ pet, walking }) {
  const { copy } = useValleCopy()
  const [facing, setFacing] = useState('right')
  const step = useWalkStep(walking)
  const hasPet = pet.kind !== 'ninguna'

  const paint = useCallback(
    (g, { cols, rows }) => {
      const sprite = petCanvas(pet, step % 2, step >> 1)
      if (!sprite) return
      const { width, height } = sprite
      const x = Math.floor((cols - width) / 2)
      const shadowW = Math.round(width * 0.62)
      g.drawImage(shadowSprite(shadowW, 4), x + (facing === 'left' ? width - 2 - shadowW : 2), rows - GROUND - 3)
      g.save()
      if (facing === 'left') {
        g.translate(x + width, 0)
        g.scale(-1, 1)
        g.drawImage(sprite, 0, rows - GROUND - height)
      } else {
        g.drawImage(sprite, x, rows - GROUND - height)
      }
      g.restore()
    },
    [pet, facing, step],
  )

  return (
    <StageFrame
      title={copy.editor.petTitle}
      turnLabel={copy.editor.rotate}
      onTurn={hasPet ? () => setFacing((value) => (value === 'right' ? 'left' : 'right')) : undefined}
      minCols={MIN_COLS}
      minRows={MIN_ROWS}
      paint={paint}
      label={copy.editor.petPreview}
      overlay={
        !hasPet && (
          <p className="px-text absolute left-1/2 top-1/3 -translate-x-1/2 whitespace-nowrap px-3 py-1 text-base" style={{ color: PAL.bone, background: PAL.ink }}>
            {copy.editor.noPet}
          </p>
        )
      }
    />
  )
}
