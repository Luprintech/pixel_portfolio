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
import { prefersReducedMotion } from '../../lib/reducedMotion'
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
import { tone } from '../../lib/tone'
import { useScrollPadding } from './useScrollPadding'

const MUTED = tone('muted', '#cfc5e0')
const PAGE_BG = tone('lavender', PAL.ink2)

// Alto de las dos escenas: pequeñas y fijas arriba en móvil, y altas en pantalla ancha, donde hay
// sitio de sobra. Cada escena se amplía con un entero para llenar su caja (`useStageScene`).
const STAGE_HEIGHT = '[--stage-h:clamp(9rem,22svh,13rem)] md:[--stage-h:clamp(11rem,24svh,16rem)] lg:[--stage-h:clamp(12rem,32svh,34rem)]'

const sectionStyle = {
  background: tone('ivory', PAL.ink),
  color: tone('ink', PAL.bone),
  ['--px-ink']: tone('ink', '#0f0e22'),
  ['--px-ring']: tone('lavender-deep', PAL.saffron),
  ['--border-color']: RING,
}

// Cada apartado es una tarjeta igual y del mismo ancho: título y debajo sus campos. Con el mismo ancho,
// las opciones de todos los apartados miden lo mismo en cada tamaño de pantalla.
function Section({ id, title, children }) {
  return (
    <section
      aria-labelledby={`section-${id}`}
      className="px-frame px-frame--quiet px-card min-w-0 space-y-6 p-5 sm:p-6"
      style={sectionStyle}
    >
      <h2 id={`section-${id}`} className="px-title text-3xl" style={{ color: tone('ink', PAL.bone) }}>{title}</h2>
      {children}
    </section>
  )
}

// Creador de viajera. En pantalla ancha, las dos escenas, el nombre y las acciones quedan fijos a la
// izquierda y las opciones ocupan el resto, repartidas en pestañas; en móvil las escenas se quedan
// arriba al desplazar y las acciones abajo.
export default function Editor({ look, pet, name, petName, replacing, returning, onChange, onBody, onPet, onName, onPetName, onRandom, onReset, onDone }) {
  const { copy, lang } = useValleCopy()
  const [tab, setTab] = useState(LOOK_TABS[0])
  // La vista previa camina salvo que el sistema o el visitante pidan quietud; la casilla la para.
  const [walking, setWalking] = useState(() => !prefersReducedMotion())
  const labels = LOOK_LABELS[lang]
  const styleNames = STYLE_NAMES[lang]
  const { stageRef, tabsRef, barRef, columnRef } = useScrollPadding()

  // "Al azar" y "Restablecer" cambian muchas cosas a la vez: un aviso para quien no ve la pantalla.
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

  // "Sin mascota" en la escena lleva a la pestaña de mascotas: el foco va a la pestaña (teclado y lector
  // de pantalla) y el panel se acerca; la página tiene scroll-padding para no quedar bajo las escenas fijas.
  const choosePet = () => {
    setTab('pet')
    requestAnimationFrame(() => {
      document.getElementById('tab-pet')?.focus({ preventScroll: true })
      document.getElementById('editor-panel')?.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    })
  }

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

  // La casilla de la marcha va en dos sitios según el ancho (junto a la música en pantalla ancha, junto
  // al selector de cuerpo en móvil); solo se ve uno, así que el lector de pantalla tampoco lo repite.
  const walkToggle = (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-3 px-text">
      <input type="checkbox" className="px-check" checked={walking} onChange={(event) => setWalking(event.target.checked)} />
      <span className="text-base">{copy.editor.walk}</span>
    </label>
  )

  return (
    <div className={`min-h-dvh overflow-x-clip ${STAGE_HEIGHT}`} style={{ background: PAGE_BG }}>
      <div className="mx-auto grid w-full max-w-[2200px] gap-x-10 gap-y-5 px-4 pb-44 pt-4 lg:grid-cols-[minmax(24rem,34vw)_minmax(0,1fr)] lg:px-8 lg:pb-4 lg:pt-4">
        {/* En pantalla ancha la columna ocupa el alto de la ventana y no se desplaza: las escenas se estiran
            (flex-1) para absorber lo que sobra o falta, con un tope para que en pantallas altas no queden como
            torres de hierba, y la barra de acciones sigue al último bloque.
            Solo la barra de la derecha, la de la página, recorre las opciones. En móvil la columna se disuelve
            (contents) y cada bloque es hijo de la rejilla, que les da a todos el mismo espacio (gap-y). */}
        <div ref={columnRef} className="contents lg:sticky lg:top-4 lg:flex lg:h-[calc(100dvh-2rem)] lg:flex-col lg:gap-4 lg:self-start lg:overflow-y-auto lg:overflow-x-hidden lg:px-2 lg:py-1">
          {/* En pantalla ancha el botón de volver comparte fila con el título; solo salta debajo si no cabe.
              El texto de ayuda baja 16 px: la sombra dura del botón (9 px) no puede tocarlo. */}
          <header>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <h1 className="px-title text-5xl lg:text-4xl xl:text-5xl" style={{ color: tone('ink', PAL.bone) }}>{copy.editor.title}</h1>
              {/* En móvil "Volver al inicio" vive en la barra fija de abajo, que siempre se ve. */}
              <div className="hidden lg:block">
                <Link className="px-btn px-btn--bone !min-h-[44px] !px-3 shrink-0" to="/">{copy.editor.back}</Link>
              </div>
            </div>
            <p className="px-text mt-4" style={{ color: MUTED }}>{copy.editor.hint}</p>
          </header>

          {/* La música de la portada sigue sonando aquí: se puede silenciar o bajar. En pantalla ancha va
              con su barra, junto a la casilla de la marcha; en móvil y tablet es solo el botón, en la
              cabecera de las escenas (fijas al desplazar) para tenerlo siempre a mano. */}
          <div className="hidden items-center justify-between gap-3 lg:flex">
            <MusicControl />
            {walkToggle}
          </div>

          {/* Lo primero que se lee al entrar: entrar al valle sustituye la aventura guardada. */}
          {replacing && (
            <p className="px-text px-3 py-2 text-sm" role="note" style={{ background: tone('powder', PAL.ink), color: tone('berry-deep', PAL.saffronLight) }}>
              {copy.editor.replace}
            </p>
          )}

          {/* Escenas fijas: cada cambio se ve sin tener que volver a subir. */}
          <div ref={stageRef} className="sticky top-0 z-10 -mx-4 px-4 py-3 lg:static lg:mx-0 lg:min-h-0 lg:max-h-[26rem] lg:flex-1 lg:p-0" style={{ background: PAGE_BG }} role="group" aria-label={copy.editor.preview}>
            <div className="grid grid-cols-2 gap-5 lg:h-full lg:grid-rows-[minmax(0,1fr)]">
              <AvatarStage look={look} walking={walking} />
              <PetStage
                pet={pet}
                walking={walking}
                onChoose={choosePet}
                headerEnd={
                  <div className="lg:hidden">
                    <MusicControl compact />
                  </div>
                }
              />
            </div>
          </div>

          {/* Los dos nombres, uno junto al otro desde pantalla ancha; la ayuda ocupa el ancho entero. Bajo cada
              etiqueta hay 16 px: la sombra dura del botón de sonido (9 px) no puede tocar el campo. */}
          <div className="px-text grid items-end gap-x-4 gap-y-3 lg:grid-cols-2">
            <div>
              <label htmlFor="traveller-name" className="mb-4 flex min-h-9 items-center text-base" style={{ color: MUTED }}>{copy.editor.name}</label>
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
              <div>
                <div className="mb-4 flex min-h-9 items-center justify-between gap-3">
                  <label htmlFor="pet-name" className="text-base" style={{ color: MUTED }}>{copy.editor.petName}</label>
                  <button type="button" className="px-btn px-btn--bone !min-h-9 shrink-0 !px-3 !py-1 text-sm" onClick={() => playPetSound(pet.kind, pet.breed)}>
                    {copy.editor.petSound[pet.kind]}
                  </button>
                </div>
                <input
                  id="pet-name"
                  className="px-input"
                  type="text"
                  maxLength={NAME_MAX}
                  autoComplete="off"
                  spellCheck="false"
                  value={petName}
                  placeholder={copy.editor.petNamePlaceholder}
                  aria-describedby="traveller-name-hint"
                  onChange={(event) => onPetName(event.target.value)}
                />
              </div>
            )}
            <p id="traveller-name-hint" className="text-sm leading-4 lg:col-span-2" style={{ color: MUTED }}>{copy.editor.nameHint}</p>
          </div>

          <div className="px-text">
            <div className="mb-2 flex min-h-[44px] items-center justify-between gap-3 lg:min-h-0">
              <span className="text-base" style={{ color: MUTED }}>{labels.body}</span>
              <div className="lg:hidden">{walkToggle}</div>
            </div>
            <BodyChoice look={look} label={labels.body} names={styleNames} onPick={onBody} />
          </div>

          <div
            ref={barRef}
            className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-2 gap-3 p-3 lg:static lg:flex lg:flex-wrap lg:p-0 lg:pb-1"
            style={{ background: PAGE_BG, boxShadow: `0 -3px 0 ${RING}` }}
          >
            <button type="button" className="px-btn whitespace-nowrap !px-2 lg:flex-[1.6]" onClick={onDone}>{returning ? copy.editor.resume : copy.editor.go}</button>
            <button type="button" className="px-btn px-btn--bone whitespace-nowrap !px-2 lg:grow" onClick={announce(onRandom, copy.editor.randomDone)}>{copy.editor.random}</button>
            <button type="button" className="px-btn px-btn--bone whitespace-nowrap !px-2 lg:grow" onClick={announce(onReset, copy.editor.resetDone)}>{copy.editor.reset}</button>
            {/* Cuarto hueco de la rejilla de 2×2 en móvil: la barra no crece y el botón queda siempre a mano. */}
            <div className="grid lg:hidden">
              <Link className="px-btn px-btn--bone !px-2 text-center" to="/">{copy.editor.back}</Link>
            </div>
          </div>
          <p role="status" className="sr-only">{status}</p>
        </div>

        <div className="min-w-0">
          <div ref={tabsRef} className="px-1 py-3 lg:sticky lg:top-0 lg:z-10" style={{ background: PAGE_BG }}>
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
