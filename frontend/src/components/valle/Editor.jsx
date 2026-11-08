import { useEffect, useRef } from 'react'
import { LOOK_LABELS, LOOK_OPTIONS } from '../../game/look'
import { PAL } from '../../game/palette'
import { catCanvas, princessCanvas } from '../../game/sprites'
import { useValleCopy } from '../../lib/valleCopy'

function Preview({ look }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const g = canvas.getContext('2d')
    g.clearRect(0, 0, canvas.width, canvas.height)
    g.drawImage(princessCanvas(look, 'down', 0), 3, 2)
    g.drawImage(catCanvas(0), 14, 6)
  }, [look])
  return <canvas ref={ref} width={26} height={15} className="px-canvas h-[150px] w-[260px]" role="img" aria-label="Vista previa de tu viajera y Khalessi" />
}

export default function Editor({ look, onChange, onRandom, onDone }) {
  const { copy, lang } = useValleCopy()
  const labels = LOOK_LABELS[lang]

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-8" style={{ background: PAL.ink2 }}>
      <section
        aria-labelledby="editor-title"
        className="px-frame w-full max-w-xl p-5"
        style={{ background: PAL.ink, color: PAL.bone, ['--px-ink']: '#0f0e22', ['--px-ring']: PAL.saffron }}
      >
        <h1 id="editor-title" className="px-title text-5xl" style={{ color: PAL.bone }}>{copy.editor.title}</h1>
        <p className="px-text mt-1" style={{ color: '#cfc5e0' }}>{copy.editor.hint}</p>

        <div className="my-5 flex justify-center py-3" style={{ background: PAL.moss, boxShadow: `inset 0 -6px 0 ${PAL.mossDark}` }}>
          <Preview look={look} />
        </div>

        <div className="space-y-4">
          {Object.keys(LOOK_OPTIONS).map((key) => (
            <fieldset key={key} className="px-text">
              <legend className="mb-2 text-sm" style={{ color: '#cfc5e0' }}>{labels[key]}</legend>
              <div className="flex flex-wrap gap-3">
                {LOOK_OPTIONS[key].map((color) => {
                  const active = look[key] === color
                  return (
                    <button
                      key={color}
                      type="button"
                      aria-pressed={active}
                      aria-label={`${labels[key]} ${color}`}
                      onClick={() => onChange({ ...look, [key]: color })}
                      className="px-chip h-9 w-9 !p-0"
                      style={{
                        background: color,
                        boxShadow: active ? `0 0 0 3px ${PAL.ink}, 0 0 0 6px ${PAL.saffron}` : `0 0 0 3px ${PAL.ink}, 0 0 0 5px #4b4380`,
                        margin: 2,
                      }}
                    />
                  )
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <button type="button" className="px-btn" onClick={onDone}>{copy.editor.go}</button>
          <button type="button" className="px-btn px-btn--bone" style={{ color: PAL.ink }} onClick={onRandom}>{copy.editor.random}</button>
        </div>
      </section>
    </div>
  )
}
