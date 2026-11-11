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

// Menú del monitor de la recreativa: tres portadas para elegir y, debajo, la ficha del juego elegido (descripción, controles y
// récord) con su botón «Jugar». Las flechas (o WASD) cambian de juego y E, Espacio o Enter juegan; con el ratón o el dedo se toca
// una portada y «Jugar». Los tamaños de letra salen del ancho del monitor (`cqw`), así el menú cabe igual en el escritorio y en un
// móvil; si aun así no cupiera, solo este menú se desplaza por dentro, nunca la página.
export default function GameSelect({ ui, games, scores, unlocked, selected, touch, onSelect, onPlay }) {
  const play = useRef(null)
  useEffect(() => {
    play.current?.focus({ preventScroll: true })
  }, [selected])

  const game = GAMES[selected]
  const copy = games[game.id]
  const record = scores[game.id]

  return (
    <div data-scroll className="absolute inset-0 flex touch-pan-y flex-col gap-[1.6cqw] overflow-y-auto overscroll-contain p-[2.4cqw]" style={{ background: PAL.ink, color: PAL.bone, fontSize: 'max(12px, 2.5cqw)' }}>
      <h3 className={`px-text text-center font-semibold uppercase tracking-widest ${touch ? 'sr-only' : ''}`} style={{ color: PAL.saffronLight, fontSize: '1.15em' }}>
        {ui.pick}
      </h3>
      <ul className="grid shrink-0 grid-cols-3 gap-[2cqw]">
        {GAMES.map((item, index) => {
          const active = index === selected
          return (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={active}
                aria-label={games[item.id].title}
                data-sound="select"
                className="block w-full cursor-pointer p-[0.6cqw]"
                style={{ background: PAL.ink2, boxShadow: `0 0 0 ${active ? 3 : 2}px ${active ? PAL.saffron : PAL.stone}`, opacity: active ? 1 : 0.7 }}
                onClick={() => onSelect(index)}
                onFocus={() => onSelect(index)}
              >
                <Cover id={item.id} label={`${ui.cover} ${games[item.id].title}`} />
              </button>
            </li>
          )
        })}
      </ul>
      <article className="flex min-h-0 flex-1 flex-col gap-[0.8cqw]">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="px-text font-semibold leading-tight" style={{ fontSize: '1.2em' }}>{copy.title}</h3>
          {(record.cleared || unlocked?.has(game.achievement)) && (
            <span className="px-text shrink-0" style={{ color: PAL.meadow, fontSize: '0.85em' }}>★ {ui.cleared}</span>
          )}
        </div>
        <p className="px-text uppercase tracking-wide" style={{ color: PAL.lagoonLight, fontSize: '0.8em' }}>{copy.tag}</p>
        {touch ? (
          <>
            <p className="px-text line-clamp-3 leading-snug">{copy.desc}</p>
            <details className="px-text leading-snug" style={{ fontSize: '0.85em' }}>
              <summary className="cursor-pointer py-1" style={{ color: PAL.lagoonLight }}>{ui.controls}</summary>
              <p style={{ opacity: 0.8 }}>{copy.controls}</p>
            </details>
          </>
        ) : (
          <>
            <p className="px-text leading-snug">{copy.desc}</p>
            <p className="px-text leading-snug" style={{ opacity: 0.8, fontSize: '0.85em' }}>
              <strong>{ui.controls}:</strong> {copy.controls}
            </p>
          </>
        )}
      </article>
      <div className="flex shrink-0 items-center justify-between gap-2">
        <p className="px-text" style={{ color: PAL.saffronLight }}>
          {ui.best}: {record.best > 0 ? record.best : ui.noBest}
        </p>
        <button type="button" ref={play} data-arcade data-sound="confirm" className={`px-btn !px-4 !text-sm ${touch ? '!min-h-12 !px-6' : '!min-h-10'}`} onClick={() => onPlay(game.id)}>
          {ui.play}
        </button>
      </div>
    </div>
  )
}
