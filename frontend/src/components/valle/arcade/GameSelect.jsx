import { useEffect, useRef } from 'react'
import { COVER, coverCanvas } from '../../../game/arcade/covers'
import { GAMES } from '../../../game/arcade/games'
import { PAL } from '../../../game/palette'

// Portada de un juego: el lienzo de 120×80 que dibuja `game/arcade/covers.js`, ampliado sin suavizar.
function Cover({ id, label }) {
  const ref = useRef(null)
  useEffect(() => {
    const g = ref.current.getContext('2d')
    g.imageSmoothingEnabled = false
    g.drawImage(coverCanvas(id), 0, 0)
  }, [id])
  return <canvas ref={ref} width={COVER.width} height={COVER.height} role="img" aria-label={label} className="block w-full [image-rendering:pixelated]" style={{ aspectRatio: `${COVER.width} / ${COVER.height}` }} />
}

// Selector de juegos de la recreativa: tres tarjetas con su portada, su descripción breve, los controles, el récord y el botón
// «Jugar». Las flechas (o WASD) cambian de tarjeta y E o Espacio juegan; con el ratón o el dedo basta con tocar «Jugar». La
// tarjeta elegida es la que tiene el foco, así se puede recorrer también con Tab.
export default function GameSelect({ ui, games, scores, unlocked, selected, onSelect, onPlay }) {
  const buttons = useRef([])
  useEffect(() => {
    buttons.current[selected]?.focus({ preventScroll: false })
  }, [selected])

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-3 pb-4">
      <h2 className="px-text mb-3 mt-1 text-center text-2xl font-semibold" style={{ color: PAL.saffronLight }}>
        {ui.pick}
      </h2>
      <ul className="grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
        {GAMES.map((game, index) => {
          const copy = games[game.id]
          const record = scores[game.id]
          const active = index === selected
          return (
            <li key={game.id} className="flex">
              <article
                className="flex w-full flex-col gap-2 p-2"
                style={{ background: PAL.ink2, color: PAL.bone, boxShadow: `0 0 0 3px ${active ? PAL.saffron : PAL.stone}, 0 0 0 6px ${PAL.ink}` }}
                onPointerEnter={() => onSelect(index)}
              >
                <Cover id={game.id} label={`${ui.cover} ${copy.title}`} />
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="px-text text-lg font-semibold leading-tight">{copy.title}</h3>
                  {(record.cleared || unlocked?.has(game.achievement)) && (
                    <span className="px-text shrink-0 text-xs" style={{ color: PAL.meadow }}>
                      ★ {ui.cleared}
                    </span>
                  )}
                </div>
                <p className="px-text text-xs uppercase tracking-wide" style={{ color: PAL.lagoonLight }}>
                  {copy.tag}
                </p>
                <p className="px-text text-sm leading-snug">{copy.desc}</p>
                <p className="px-text text-xs leading-snug" style={{ opacity: 0.8 }}>
                  <strong>{ui.controls}:</strong> {copy.controls}
                </p>
                <p className="px-text text-sm" style={{ color: PAL.saffronLight }}>
                  {ui.best}: {record.best > 0 ? record.best : ui.noBest}
                </p>
                <button
                  type="button"
                  ref={(node) => {
                    buttons.current[index] = node
                  }}
                  data-arcade
                  data-sound="confirm"
                  className="px-btn mt-auto w-full"
                  onFocus={() => onSelect(index)}
                  onClick={() => onPlay(game.id)}
                >
                  {ui.play}
                </button>
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
