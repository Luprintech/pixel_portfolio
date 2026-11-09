import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { drawFlower, drawTuft, grassColor } from '../../game/ground'
import {
  COLOR_NAMES,
  LOOK_COLORS,
  LOOK_LABELS,
  LOOK_SECTIONS,
  LOOK_STYLES,
  SECTION_NAMES,
  STYLE_NAMES,
  switchBody,
} from '../../game/look'
import { PAL, seeded } from '../../game/palette'
import { NAME_MAX } from '../../game/save'
import { FRAME_W, avatarCanvas } from '../../game/avatar/index.js'
import { catCanvas, shadowSprite } from '../../game/sprites'
import { useValleCopy } from '../../lib/valleCopy'

// Orden en que gira la vista previa; hacia la izquierda se dibuja la de la derecha reflejada.
const TURNS = ['down', 'right', 'up', 'left']
const MUTED = '#cfc5e0'
const RING = '#4b4380'

// Prado con la viajera y Khalessi en el centro. La escena se pinta a la resolución del juego y se
// amplía un número entero de veces, sin suavizar. Su ancho en píxeles se ajusta al de la caja:
// si sobra espacio, se alarga el prado en lugar de dejar bordes vacíos.
const SCENE_H = 34
const SPRITES_W = 46

function paintMeadow(g, cols) {
  for (let y = 0; y < SCENE_H; y++) {
    for (let x = 0; x < cols; x++) {
      g.fillStyle = grassColor(x + 11, y + 23)
      g.fillRect(x, y, 1, 1)
    }
  }
  const rand = seeded(7)
  for (let i = 0; i < (cols * SCENE_H) / 70; i++) drawTuft(g, 2 + Math.floor(rand() * (cols - 4)), 4 + Math.floor(rand() * (SCENE_H - 5)))
  for (let i = 0; i < cols / 5; i++) drawFlower(g, 2 + Math.floor(rand() * (cols - 4)), 3 + Math.floor(rand() * (SCENE_H - 8)), i)
}

// Escala entera según el ancho disponible. Se limita por tamaño de pantalla para que la escena,
// que se queda fija, no se coma la lista de opciones: en móvil y tablet es pequeña y en
// pantallas bajas no pasa de ~40 % del alto.
function sceneScale(width) {
  const viewport = typeof window === 'undefined' ? { w: 1280, h: 900 } : { w: window.innerWidth, h: window.innerHeight }
  const byWidth = viewport.w < 768 ? 4 : viewport.w < 1024 ? 6 : 10
  const byHeight = Math.floor((viewport.h * 0.4) / SCENE_H)
  return Math.max(4, Math.min(byWidth, byHeight, Math.floor(width / 56)))
}

function Preview({ look, dir, label, onTurn, turnLabel }) {
  const boxRef = useRef(null)
  const canvasRef = useRef(null)
  const [size, setSize] = useState({ scale: 4, cols: SPRITES_W })

  useEffect(() => {
    const box = boxRef.current
    const measure = () => {
      const scale = sceneScale(box.clientWidth)
      setSize({ scale, cols: Math.max(SPRITES_W, Math.ceil(box.clientWidth / scale)) })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(box)
    // El observador solo avisa de cambios de ancho; el alto de la ventana también cuenta.
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const { cols } = size
    canvas.width = cols
    const g = canvas.getContext('2d')
    paintMeadow(g, cols)
    // Al mirar a la izquierda se refleja la escena (la viajera pasa a la derecha y Khalessi a la
    // izquierda), pero la viajera no: su perfil izquierdo ya viene dibujado desde ese lado.
    const faceLeft = dir === 'left'
    g.save()
    if (faceLeft) {
      g.translate(cols, 0)
      g.scale(-1, 1)
    }
    const origin = Math.floor((cols - SPRITES_W) / 2)
    const princessX = origin + (faceLeft ? 25 : 3)
    const catX = origin + (faceLeft ? 2 : 19)
    g.drawImage(shadowSprite(14, 5), princessX + 2, 28)
    g.drawImage(shadowSprite(16, 4), catX + 2, 29)
    g.drawImage(catCanvas(0), catX, 16)
    g.restore()
    g.drawImage(avatarCanvas(look, dir, 0), faceLeft ? cols - princessX - FRAME_W : princessX, -2)
  }, [look, dir, size])

  return (
    <div ref={boxRef} className="relative overflow-hidden" style={{ background: PAL.moss, boxShadow: `0 0 0 3px ${PAL.ink}, 0 0 0 6px ${RING}` }}>
      <canvas
        ref={canvasRef}
        height={SCENE_H}
        className="px-canvas mx-auto block max-w-none"
        style={{ width: size.cols * size.scale, height: SCENE_H * size.scale }}
        role="img"
        aria-label={label}
      />
      <button type="button" className="px-btn px-btn--bone absolute right-3 top-3 !min-h-[40px] !px-3" onClick={onTurn}>
        {turnLabel}
      </button>
    </div>
  )
}

// Recortes del sprite (18×34) para enseñar cada opción dibujada: qué parte del cuerpo y a qué escala.
const VIEWS = {
  full: { sy: 0, sh: 34, scale: 4 },
  head: { sy: 1, sh: 18, scale: 4 },
  hair: { sy: 1, sh: 27, scale: 4 },
  torso: { sy: 17, sh: 14, scale: 4 },
  legs: { sy: 24, sh: 10, scale: 5 },
  feet: { sy: 29, sh: 5, scale: 6 },
}
const SPRITE_W = 18
// Las opciones «sin nada» se marcan con una cruz de píxeles en la esquina de la tarjeta.
const NONE_VALUES = ['ninguna', 'ninguno']
const CROSS = [[0, 0], [4, 0], [1, 1], [3, 1], [2, 2], [1, 3], [3, 3], [0, 4], [4, 4]]

// Cada opción se dibuja con el aspecto actual y solo cambia lo que representa, así se ve
// exactamente cómo quedaría. El nombre va como etiqueta accesible y al pasar el ratón.
function PixelTile({ look, field, value, view, active, label, onPick }) {
  const ref = useRef(null)
  const { sy, sh, scale } = VIEWS[view]
  useEffect(() => {
    const canvas = ref.current
    const g = canvas.getContext('2d')
    g.clearRect(0, 0, canvas.width, canvas.height)
    const shown = field === 'body' ? switchBody(look, value) : { ...look, [field]: value }
    g.drawImage(avatarCanvas(shown, 'down', 0), 0, sy, SPRITE_W, sh, 0, 0, SPRITE_W, sh)
    if (NONE_VALUES.includes(value)) {
      g.fillStyle = PAL.tile
      CROSS.forEach(([x, y]) => g.fillRect(SPRITE_W - 7 + x, 1 + y, 1, 1))
    }
  }, [look, field, value, sy, sh])
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      title={label}
      onClick={onPick}
      className="px-pick flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center p-1"
      style={{
        background: PAL.moss,
        boxShadow: active ? `0 0 0 3px ${PAL.ink}, 0 0 0 6px ${PAL.saffron}` : `0 0 0 3px ${PAL.ink}, 0 0 0 5px ${RING}`,
        margin: 5,
      }}
    >
      <canvas ref={ref} width={SPRITE_W} height={sh} className="px-canvas block" style={{ width: SPRITE_W * scale, height: sh * scale }} aria-hidden="true" />
    </button>
  )
}

function PixelChoices({ field, view, look, label, names, onPick }) {
  return (
    <div className="flex flex-wrap gap-2">
      {LOOK_STYLES[field].map((value) => (
        <PixelTile
          key={value}
          look={look}
          field={field}
          value={value}
          view={view}
          active={look[field] === value}
          label={`${label}: ${names[value]}`}
          onPick={() => onPick(value)}
        />
      ))}
    </div>
  )
}

function Swatches({ field, look, label, names, onPick }) {
  return (
    <div className="flex flex-wrap gap-3">
      {LOOK_COLORS[field].map((color) => {
        const active = look[field] === color
        return (
          <button
            key={color}
            type="button"
            aria-pressed={active}
            aria-label={`${label}: ${names[color]}`}
            title={names[color]}
            onClick={() => onPick(color)}
            className="px-pick h-10 w-10 cursor-pointer p-0"
            style={{
              background: color,
              boxShadow: active ? `0 0 0 3px ${PAL.ink}, 0 0 0 6px ${PAL.saffron}` : `0 0 0 3px ${PAL.ink}, 0 0 0 5px ${RING}`,
              margin: 3,
            }}
          />
        )
      })}
    </div>
  )
}

const sectionStyle = { background: PAL.ink, color: PAL.bone, ['--px-ink']: '#0f0e22', ['--px-ring']: PAL.saffron, ['--border-color']: RING }

// Creador de viajera. En pantalla ancha, la escena queda fija a la izquierda y los apartados
// ocupan el resto; en móvil la escena se queda arriba al desplazar y las acciones abajo.
export default function Editor({ look, name, replacing, onChange, onName, onRandom, onReset, onDone }) {
  const { copy, lang } = useValleCopy()
  const labels = LOOK_LABELS[lang]
  const styleNames = STYLE_NAMES[lang]
  const [turn, setTurn] = useState(0)

  const pick = (field, value) => onChange(field === 'body' ? switchBody(look, value) : { ...look, [field]: value })

  const renderField = ({ key, view }) => (
    <fieldset key={key} className="px-text">
      <legend className="mb-2 text-sm" style={{ color: MUTED }}>{labels[key]}</legend>
      {LOOK_COLORS[key] ? (
        <Swatches field={key} look={look} label={labels[key]} names={COLOR_NAMES[lang][key]} onPick={(value) => pick(key, value)} />
      ) : (
        <PixelChoices field={key} view={view} look={look} label={labels[key]} names={styleNames} onPick={(value) => pick(key, value)} />
      )}
    </fieldset>
  )

  return (
    <div className="min-h-dvh overflow-x-clip" style={{ background: PAL.ink2 }}>
      <div className="mx-auto grid w-full max-w-[1760px] gap-x-8 gap-y-6 px-4 pb-32 pt-4 lg:grid-cols-[minmax(24rem,2fr)_3fr] lg:px-8 lg:pb-8 lg:pt-8">
        <aside className="contents lg:sticky lg:top-8 lg:block lg:max-h-[calc(100dvh-4rem)] lg:self-start lg:overflow-y-auto lg:overflow-x-hidden lg:p-2">
          <header className="flex items-start justify-between gap-4 lg:mb-5">
            <div>
              <h1 className="px-title text-5xl" style={{ color: PAL.bone }}>{copy.editor.title}</h1>
              <p className="px-text mt-1" style={{ color: MUTED }}>{copy.editor.hint}</p>
            </div>
            <Link className="px-btn px-btn--bone !min-h-[40px] !px-3 shrink-0" to="/">{copy.editor.back}</Link>
          </header>

          {/* Escena fija: cada cambio se ve sin tener que volver a subir. */}
          <div className="sticky top-0 z-10 -mx-4 px-4 py-3 lg:static lg:mx-0 lg:p-0" style={{ background: PAL.ink2 }}>
            <Preview
              look={look}
              dir={TURNS[turn]}
              label={copy.editor.preview}
              turnLabel={copy.editor.rotate}
              onTurn={() => setTurn((value) => (value + 1) % TURNS.length)}
            />
          </div>

          <div className="px-text mt-6">
            <label htmlFor="traveller-name" className="mb-2 block text-sm" style={{ color: MUTED }}>{copy.editor.name}</label>
            <input
              id="traveller-name"
              className="px-input"
              type="text"
              maxLength={NAME_MAX}
              autoComplete="off"
              spellCheck="false"
              value={name}
              placeholder={copy.editor.namePlaceholder}
              aria-describedby="traveller-name-hint"
              onChange={(event) => onName(event.target.value)}
            />
            <p id="traveller-name-hint" className="mt-2 text-sm" style={{ color: MUTED }}>{copy.editor.nameHint}</p>
          </div>

          {replacing && (
            <p className="px-text mt-5 px-3 py-2 text-sm" role="note" style={{ background: PAL.ink, color: PAL.saffronLight }}>
              {copy.editor.replace}
            </p>
          )}

          <div
            className="fixed inset-x-0 bottom-0 z-20 flex gap-3 p-3 lg:static lg:mt-6 lg:p-0"
            style={{ background: PAL.ink2, boxShadow: `0 -3px 0 ${RING}` }}
          >
            <button type="button" className="px-btn flex-[1.6] whitespace-nowrap !px-2" onClick={onDone}>{copy.editor.go}</button>
            <button type="button" className="px-btn px-btn--bone whitespace-nowrap !px-2" onClick={onRandom}>{copy.editor.random}</button>
            <button type="button" className="px-btn px-btn--bone whitespace-nowrap !px-2" onClick={onReset}>{copy.editor.reset}</button>
          </div>
        </aside>

        <main className="grid content-start gap-8 md:grid-cols-2 lg:gap-6">
          {LOOK_SECTIONS.map((section) => (
            <section
              key={section.id}
              aria-labelledby={`section-${section.id}`}
              className={`px-frame px-frame--quiet space-y-5 p-5 ${section.wide ? 'md:col-span-2' : ''}`}
              style={sectionStyle}
            >
              <h2 id={`section-${section.id}`} className="px-title text-3xl" style={{ color: PAL.bone }}>
                {SECTION_NAMES[lang][section.id]}
              </h2>
              {section.fields.filter((field) => !field.when || field.when(look)).map(renderField)}
            </section>
          ))}
        </main>
      </div>
    </div>
  )
}
