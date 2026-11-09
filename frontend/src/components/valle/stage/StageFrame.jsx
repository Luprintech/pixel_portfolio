import { PAL } from '../../../game/palette'
import { RING } from '../pickStyle'
import { useStageScene } from './useStageScene'

// Caja con una escena del creador: título, botón de girar y el prado con el sprite. Cada
// escena (viajera, mascota) tiene su propia caja, del mismo alto (`--stage-h`), para que ninguna
// quede pequeña ni se corte al girar. Entre el botón y la caja hay 20 px: la sombra dura del botón
// (9 px) y el anillo de la caja (6 px) no se pisan.
export default function StageFrame({ title, turnLabel, onTurn, minCols, minRows, paint, label, overlay }) {
  const { boxRef, canvasRef, size } = useStageScene({ minCols, minRows, paint })
  return (
    <section className="flex min-w-0 flex-col gap-5">
      <header className="flex min-h-[44px] items-center justify-between gap-2">
        <h2 className="px-title text-2xl" style={{ color: PAL.bone }}>{title}</h2>
        {onTurn && (
          <button type="button" aria-label={`${turnLabel}: ${title}`} className="px-btn px-btn--bone !min-h-[44px] !px-3" onClick={onTurn}>
            {turnLabel}
          </button>
        )}
      </header>
      <div
        ref={boxRef}
        className="relative mx-[6px] flex items-end justify-center overflow-hidden"
        style={{ height: 'var(--stage-h)', background: PAL.moss, boxShadow: `0 0 0 3px ${PAL.ink}, 0 0 0 6px ${RING}` }}
      >
        <canvas
          ref={canvasRef}
          className="px-canvas block max-w-none shrink-0"
          style={{ width: size.cols * size.scale, height: size.rows * size.scale }}
          role="img"
          aria-label={label}
        />
        {overlay}
      </div>
    </section>
  )
}
