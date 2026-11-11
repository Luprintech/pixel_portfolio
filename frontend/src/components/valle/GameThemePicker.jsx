import { useState } from 'react'
import { useGameTheme } from '../../context/GameThemeContext'
import { GAME_THEMES } from '../../lib/gameTheme'
import { tone } from '../../lib/tone'
import { useValleCopy } from '../../lib/valleCopy'

// Muestra de cada tema: fondo y acento. Son fijas a propósito (cada botón enseña SU tema, no el activo), por eso
// no salen de los tokens, que solo describen el tema vigente.
const SWATCH = {
  aventura: ['#1c1b3a', '#f2b134'],
  cozy: ['#dccbf0', '#a30f4c'],
}

// Selector de tema del juego. Son dos radios nativos (flechas para moverse, Tab para entrar y salir) con su
// etiqueta como botón grande, y el estado se anuncia por `role="status"`. Cambiar el tema no toca la partida.
export default function GameThemePicker() {
  const { copy } = useValleCopy()
  const { gameTheme, setGameTheme } = useGameTheme()
  // El aviso solo aparece tras un cambio hecho aquí: al abrir el diálogo no hay nada que anunciar.
  const [announced, setAnnounced] = useState('')

  const choose = (theme) => {
    if (theme === gameTheme) return
    setGameTheme(theme)
    setAnnounced(theme === 'cozy' ? copy.options.themeChangedCozy : copy.options.themeChangedAventura)
  }

  const label = { aventura: copy.options.themeAventura, cozy: copy.options.themeCozy }
  const hint = { aventura: copy.options.themeAventuraHint, cozy: copy.options.themeCozyHint }

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="p-0 text-sm" style={{ color: tone('muted', '#cfc5e0') }}>{copy.options.themeTitle}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {GAME_THEMES.map((theme) => {
          const selected = theme === gameTheme
          return (
            <label
              key={theme}
              data-sound="select"
              className={`px-btn ${selected ? '' : 'px-btn--bone'} flex min-h-[var(--ctl)] cursor-pointer flex-col items-start justify-center gap-0.5 !px-2 !py-1 text-left has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2`}
              style={{ outlineColor: 'var(--px-ring)' }}
            >
              <input
                type="radio"
                name="game-theme"
                value={theme}
                checked={selected}
                onChange={() => choose(theme)}
                className="sr-only"
                aria-describedby={`game-theme-${theme}-hint`}
              />
              <span className="flex items-center gap-1.5 text-sm leading-none">
                <span aria-hidden="true" className="flex">
                  {SWATCH[theme].map((color) => (
                    <span key={color} className="h-3 w-3 border border-[var(--px-ink)]" style={{ background: color }} />
                  ))}
                </span>
                {label[theme]}
                {selected && <span aria-hidden="true"> ✓</span>}
              </span>
              <span id={`game-theme-${theme}-hint`} className="text-xs leading-tight opacity-90 [@media(max-height:600px)]:hidden">{hint[theme]}</span>
            </label>
          )
        })}
      </div>
      <p className="sr-only" role="status">{announced}</p>
    </fieldset>
  )
}
