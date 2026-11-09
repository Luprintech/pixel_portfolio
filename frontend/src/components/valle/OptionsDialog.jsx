import { useEffect, useRef, useState } from 'react'
import { PAL } from '../../game/palette'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import { useSoundPrefs } from '../../hooks/useSoundPrefs'
import { useValleCopy } from '../../lib/valleCopy'
import VolumeSlider from './VolumeSlider'

// Ventana de opciones de la portada. Usa <dialog> nativo: el navegador atrapa el foco,
// cierra con Escape y devuelve el foco al botón que la abrió.
export default function OptionsDialog({ open, onClose, options, onChange, saved, onErase }) {
  const { copy } = useValleCopy()
  const sound = useSoundPrefs()
  const install = useInstallPrompt()
  const ref = useRef(null)
  const [asking, setAsking] = useState(false)
  const [erased, setErased] = useState(false)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      setAsking(false)
      setErased(false)
      dialog.showModal ? dialog.showModal() : dialog.setAttribute('open', '')
    } else if (!open && dialog.open) {
      dialog.close ? dialog.close() : dialog.removeAttribute('open')
    }
  }, [open])

  const erase = () => {
    onErase()
    setAsking(false)
    setErased(true)
  }

  // El cartel con pasos (iPhone) queda por debajo del diálogo modal: se cierra Opciones primero
  const installApp = () => {
    onClose()
    install.request()
  }

  return (
    <dialog ref={ref} className="px-dialog" aria-labelledby="options-title" onClose={onClose}>
      <div
        className="px-frame p-5"
        style={{ background: PAL.ink, color: PAL.bone, ['--px-ink']: '#0f0e22', ['--px-ring']: PAL.saffron }}
      >
        <h2 id="options-title" className="px-title text-4xl" style={{ color: PAL.bone }}>{copy.options.title}</h2>

        <label className="px-text mt-5 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="px-check mt-0.5"
            checked={options.reduceMotion}
            onChange={(event) => onChange({ ...options, reduceMotion: event.target.checked })}
          />
          <span>
            {copy.options.motion}
            <span className="block text-sm" style={{ color: '#cfc5e0' }}>{copy.options.motionHint}</span>
          </span>
        </label>

        <div className="px-text mt-6">
          <h3 className="text-sm" style={{ color: '#cfc5e0' }}>{copy.options.soundTitle}</h3>
          <VolumeSlider id="volume-master" label={copy.options.master} value={sound.master} onChange={sound.setMaster} />
          <VolumeSlider id="volume-music" label={copy.options.music} value={sound.music} onChange={sound.setMusic} />
          <VolumeSlider
            id="volume-fx"
            label={copy.options.fx}
            hint={copy.options.fxHint}
            value={sound.fx}
            onChange={sound.setFx}
            onCommit={sound.previewFx}
          />
        </div>

        <div className="px-text mt-6">
          <h3 className="text-sm" style={{ color: '#cfc5e0' }}>{copy.options.saveTitle}</h3>
          {saved && !asking && (
            <button type="button" className="px-btn px-btn--bone mt-3" onClick={() => setAsking(true)}>{copy.options.erase}</button>
          )}
          {saved && asking && (
            <div role="alert" className="mt-3">
              <p>{copy.options.eraseAsk}</p>
              <div className="mt-3 flex flex-wrap gap-4">
                <button type="button" className="px-btn" onClick={erase}>{copy.options.eraseYes}</button>
                <button type="button" className="px-btn px-btn--bone" onClick={() => setAsking(false)}>{copy.options.eraseNo}</button>
              </div>
            </div>
          )}
          {!saved && <p className="mt-2" role="status">{erased ? copy.options.erased : copy.options.noSave}</p>}
        </div>

        {install.available && (
          <div className="px-text mt-6">
            <h3 className="text-sm" style={{ color: '#cfc5e0' }}>{copy.options.installTitle}</h3>
            <p className="mt-2 text-sm">{copy.options.installHint}</p>
            <button type="button" className="px-btn mt-3" onClick={installApp}>{copy.options.install}</button>
          </div>
        )}

        <div className="mt-6">
          {/* Con la confirmación abierta el botón principal es "Sí, borrar"; cerrar pasa a secundario. */}
          <button type="button" className={asking ? 'px-btn px-btn--bone' : 'px-btn'} onClick={onClose}>{copy.options.close}</button>
        </div>
      </div>
    </dialog>
  )
}
