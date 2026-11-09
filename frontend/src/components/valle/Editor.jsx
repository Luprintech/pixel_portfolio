import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  COLOR_NAMES,
  LOOK_COLORS,
  LOOK_LABELS,
  LOOK_SECTIONS,
  LOOK_TABS,
  SECTION_NAMES,
  STYLE_NAMES,
  TAB_NAMES,
  colorName,
  visibleBlocks,
} from '../../game/look'
import { PAL } from '../../game/palette'
import { NAME_MAX } from '../../game/save'
import { prefersReducedMotion } from '../../lib/gameOptions'
import { playPetSound } from '../../lib/petSounds'
import { useValleCopy } from '../../lib/valleCopy'
import AvatarStage from './AvatarStage'
import BodyChoice from './BodyChoice'
import ColorRow from './ColorRow'
import EditorTabs from './EditorTabs'
import FieldGroup from './FieldGroup'
import MusicControl from './MusicControl'
import PetPicker from './PetPicker'
import PetStage from './PetStage'
import StyleGrid from './StyleGrid'
import { RING } from './pickStyle'
import { useScrollPadding } from './useScrollPadding'

const MUTED = '#cfc5e0'

// Alto de las dos escenas: pequeñas y fijas arriba en móvil, y altas en pantalla ancha, donde hay
// sitio de sobra. Cada escena se amplía con un entero para llenar su caja (`useStageScene`).
const STAGE_HEIGHT = '[--stage-h:clamp(9rem,22svh,13rem)] md:[--stage-h:clamp(11rem,24svh,16rem)] lg:[--stage-h:clamp(12rem,32svh,34rem)]'

const sectionStyle = { background: PAL.ink, color: PAL.bone, ['--px-ink']: '#0f0e22', ['--px-ring']: PAL.saffron, ['--border-color']: RING }

// Cada apartado es una tarjeta igual y del mismo ancho: título y debajo sus campos. Con el mismo ancho,
// las opciones de todos los apartados miden lo mismo en cada tamaño de pantalla.
function Section({ id, title, children }) {
  return (
    <section
      aria-labelledby={`section-${id}`}
      className="px-frame px-frame--quiet px-card min-w-0 space-y-6 p-5 sm:p-6"
      style={sectionStyle}
    >
      <h2 id={`section-${id}`} className="px-title text-3xl" style={{ color: PAL.bone }}>{title}</h2>
      {children}
    </section>
  )
}

// Creador de viajera. En pantalla ancha, las dos escenas, el nombre y las acciones quedan fijos a la
// izquierda y las opciones ocupan el resto, repartidas en pestañas; en móvil las escenas se quedan
// arriba al desplazar y las acciones abajo.
export default function Editor({ look, pet, name, petName, replacing, onChange, onBody, onPet, onName, onPetName, onRandom, onReset, onDone }) {
  const { copy, lang } = useValleCopy()
  const [tab, setTab] = useState(LOOK_TABS[0])
  // La vista previa camina salvo que el sistema o el visitante pidan quietud; la casilla la para.
  const [walking, setWalking] = useState(() => !prefersReducedMotion())
  const labels = LOOK_LABELS[lang]
  const styleNames = STYLE_NAMES[lang]
  const { stageRef, tabsRef, barRef, columnRef } = useScrollPadding()

  // "Aleatoria" y "Restablecer" cambian muchas cosas a la vez: un aviso para quien no ve la pantalla.
  // Se borra al rato para que repetir la acción vuelva a anunciarse.
  const [status, setStatus] = useState('')
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])
  const announce = (action, message) => () => {
    action()
    setStatus(message)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus(''), 2000)
  }

  const pick = (field, value) => onChange({ ...look, [field]: value })

  // Una fila de colores de la viajera: las muestras de su paleta y el selector de cualquier otro color.
  const colorRow = (key, title, nested) => (
    <ColorRow
      key={key}
      nested={nested}
      title={title}
      name={colorName(lang, key, look[key])}
      colors={LOOK_COLORS[key]}
      value={look[key]}
      label={labels[key]}
      names={COLOR_NAMES[lang][key]}
      customHint={copy.editor.colorCustom}
      onPick={(value) => pick(key, value)}
    />
  )

  // Todos los bloques siguen el mismo orden: el nombre del campo, sus opciones dibujadas y debajo sus
  // colores. Un campo solo de color (piel, ojos, ribetes) lleva su fila como único contenido.
  const renderBlock = ({ key, view, colors }) =>
    view ? (
      <FieldGroup key={key} legend={labels[key]}>
        <StyleGrid field={key} view={view} look={look} label={labels[key]} names={styleNames} onPick={(value) => pick(key, value)} />
        {colors.map((colorKey) => colorRow(colorKey, copy.editor.color, true))}
      </FieldGroup>
    ) : (
      colorRow(key, labels[key], false)
    )

  return (
    <div className={`min-h-dvh overflow-x-clip ${STAGE_HEIGHT}`} style={{ background: PAL.ink2 }}>
      <div className="mx-auto grid w-full max-w-[2200px] gap-x-10 gap-y-6 px-4 pb-44 pt-4 lg:grid-cols-[minmax(24rem,34vw)_minmax(0,1fr)] lg:px-8 lg:pb-8 lg:pt-8">
        <div ref={columnRef} className="contents lg:sticky lg:top-8 lg:block lg:max-h-[calc(100dvh-4rem)] lg:self-start lg:overflow-y-auto lg:overflow-x-hidden lg:px-2 lg:pb-0 lg:pt-2">
          <header className="flex items-start justify-between gap-4 lg:mb-5">
            <div>
              <h1 className="px-title text-5xl" style={{ color: PAL.bone }}>{copy.editor.title}</h1>
              <p className="px-text mt-1" style={{ color: MUTED }}>{copy.editor.hint}</p>
            </div>
            <Link className="px-btn px-btn--bone !min-h-[44px] !px-3 shrink-0" to="/">{copy.editor.back}</Link>
          </header>

          {/* La música de la portada sigue sonando aquí: se puede silenciar o bajar. */}
          <div className="w-fit lg:mb-5">
            <MusicControl />
          </div>

          {/* Lo primero que se lee al entrar: entrar al valle sustituye la aventura guardada. */}
          {replacing && (
            <p className="px-text px-3 py-2 text-sm lg:mb-5" role="note" style={{ background: PAL.ink, color: PAL.saffronLight }}>
              {copy.editor.replace}
            </p>
          )}

          {/* Escenas fijas: cada cambio se ve sin tener que volver a subir. */}
          <div ref={stageRef} className="sticky top-0 z-10 -mx-4 px-4 py-3 lg:static lg:mx-0 lg:p-0" style={{ background: PAL.ink2 }} role="group" aria-label={copy.editor.preview}>
            <div className="grid grid-cols-2 gap-5">
              <AvatarStage look={look} walking={walking} />
              <PetStage pet={pet} walking={walking} />
            </div>
          </div>

          <div className="px-text mt-6">
            <label htmlFor="traveller-name" className="mb-2 block text-base" style={{ color: MUTED }}>{copy.editor.name}</label>
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
          </div>

          {/* Con mascota elegida aparece su nombre, y un botón para oír cómo suena. */}
          {pet.kind !== 'ninguna' && (
            <div className="px-text mt-4">
              <label htmlFor="pet-name" className="mb-2 block text-base" style={{ color: MUTED }}>{copy.editor.petName}</label>
              <div className="flex items-center gap-5">
                <input
                  id="pet-name"
                  className="px-input min-w-0 flex-1"
                  type="text"
                  maxLength={NAME_MAX}
                  autoComplete="off"
                  spellCheck="false"
                  value={petName}
                  placeholder={copy.editor.petNamePlaceholder}
                  aria-describedby="traveller-name-hint"
                  onChange={(event) => onPetName(event.target.value)}
                />
                <button type="button" className="px-btn px-btn--bone shrink-0 !px-3" onClick={() => playPetSound(pet.kind, pet.breed)}>
                  {copy.editor.petSound[pet.kind]}
                </button>
              </div>
            </div>
          )}
          <p id="traveller-name-hint" className="px-text mt-2 text-sm leading-4" style={{ color: MUTED }}>{copy.editor.nameHint}</p>

          <div className="px-text mt-6">
            <div className="mb-3 flex min-h-[44px] items-center justify-between gap-3">
              <span className="text-base" style={{ color: MUTED }}>{labels.body}</span>
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
                <input type="checkbox" className="px-check" checked={walking} onChange={(event) => setWalking(event.target.checked)} />
                <span className="text-base">{copy.editor.walk}</span>
              </label>
            </div>
            <BodyChoice look={look} label={labels.body} names={styleNames} onPick={onBody} />
          </div>

          <div
            ref={barRef}
            className="fixed inset-x-0 bottom-0 z-20 flex flex-wrap gap-3 p-3 lg:sticky lg:inset-x-auto lg:mt-4 lg:px-1 lg:py-3"
            style={{ background: PAL.ink2, boxShadow: `0 -3px 0 ${RING}` }}
          >
            <button type="button" className="px-btn flex-[1.6] whitespace-nowrap !px-2" onClick={onDone}>{copy.editor.go}</button>
            <button type="button" className="px-btn px-btn--bone grow whitespace-nowrap !px-2" onClick={announce(onRandom, copy.editor.randomDone)}>{copy.editor.random}</button>
            <button type="button" className="px-btn px-btn--bone grow whitespace-nowrap !px-2" onClick={announce(onReset, copy.editor.resetDone)}>{copy.editor.reset}</button>
          </div>
          <p role="status" className="sr-only">{status}</p>
        </div>

        <div className="min-w-0">
          <div ref={tabsRef} className="px-1 py-3 lg:sticky lg:top-0 lg:z-10" style={{ background: PAL.ink2 }}>
            <EditorTabs tabs={LOOK_TABS} names={TAB_NAMES[lang]} value={tab} label={copy.editor.tabs} onChange={setTab} />
          </div>
          <div role="tabpanel" id="editor-panel" aria-labelledby={`tab-${tab}`} className="mt-3 grid content-start gap-8">
            {LOOK_SECTIONS.filter((section) => section.tab === tab).map((section) => (
              <Section key={section.id} id={section.id} title={SECTION_NAMES[lang][section.id]}>
                {visibleBlocks(section, look).map(renderBlock)}
              </Section>
            ))}
            {tab === 'pet' && (
              <Section id="pet" title={copy.editor.petTitle}>
                <PetPicker pet={pet} lang={lang} labels={{ kind: copy.editor.petKind, breed: copy.editor.petBreed, coat: copy.editor.petCoat, marks: copy.editor.petMarks }} onPick={onPet} />
              </Section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
