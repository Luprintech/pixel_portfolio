import { PAL } from '../../../game/palette'
import { tone } from '../../../lib/tone'
import { RING } from '../pickStyle'
import TurnButton from './TurnButton'
import { useStageScene } from './useStageScene'

// Caja con una escena del creador: título y el prado con el sprite. Cada escena (viajera, mascota)
// tiene su propia caja, del mismo alto (`--stage-h`), para que ninguna quede pequeña ni se corte al
// girar. En pantalla ancha la caja se estira hasta llenar el alto que deja la columna. Girar es un botón pequeño dentro de la caja, no uno de texto aparte.
// `headerEnd` es el hueco a la derecha del título (el silencio en móvil). Entre la cabecera y la caja
// hay 20 px: la sombra dura de los botones (9 px) y el anillo de la caja (6 px) no se pisan.
export default function StageFrame({ title, turnLabel, onTurn, headerEnd, minCols, minRows, paint, label, overlay }) {
  const { boxRef, canvasRef, size } = useStageScene({ minCols, minRows, paint })
  return (
    <section className="flex min-h-0 min-w-0 flex-col gap-5 lg:gap-4">
      <header className="flex min-h-[44px] items-center justify-between gap-2">
        <h2 className="px-title text-2xl" style={{ color: tone('ink', PAL.bone) }}>{title}</h2>
        {headerEnd}
      </header>
      <div
        ref={boxRef}
        className="relative mx-[6px] flex h-[var(--stage-h)] items-end justify-center overflow-hidden lg:h-auto lg:min-h-[8rem] lg:flex-1"
        style={{ background: PAL.moss, boxShadow: `0 0 0 3px ${tone('ink', PAL.ink)}, 0 0 0 6px ${RING}` }}
      >
        <canvas
          ref={canvasRef}
          className="px-canvas block max-w-none shrink-0"
          style={{ width: size.cols * size.scale, height: size.rows * size.scale }}
          role="img"
          aria-label={label}
        />
        {overlay}
        {onTurn && <TurnButton label={`${turnLabel}: ${title}`} onClick={onTurn} />}
      </div>
    </section>
  )
}
