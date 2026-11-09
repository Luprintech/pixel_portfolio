import { useEffect, useRef } from 'react'
import { PET_BREEDS, PET_COLORS, PET_KINDS, PET_NAMES, petOfBreed, petOfKind } from '../../game/pet'
import { PAL } from '../../game/palette'
import { tone } from '../../lib/tone'
import { petCanvas } from '../../game/pets'
import ColorRow from './ColorRow'
import FieldGroup from './FieldGroup'
import { useThemeContext } from '../../context/ThemeContext'
import { CROSS, TILE_BACKGROUND, crossColor, pickShadow } from './pickStyle'

// Caja común de las tarjetas: cabe la raza más grande, y cada animal se apoya abajo y centrado,
// así se ve de un vistazo que unos son más grandes que otros. La celda es cuadrada y el dibujo se
// amplía para llenarla.
const BOX_W = 32
const BOX_H = 20

function PetTile({ pet, active, label, name, onPick }) {
  const { theme } = useThemeContext()
  const ref = useRef(null)
  useEffect(() => {
    const g = ref.current.getContext('2d')
    g.clearRect(0, 0, BOX_W, BOX_H)
    const sprite = petCanvas(pet)
    if (sprite) {
      g.drawImage(sprite, Math.floor((BOX_W - sprite.width) / 2), BOX_H - sprite.height)
    } else {
      g.fillStyle = crossColor(theme)
      CROSS.forEach(([x, y]) => g.fillRect(BOX_W / 2 - 2 + x, BOX_H / 2 - 2 + y, 1, 1))
    }
  }, [pet, theme])
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={onPick}
      className="px-pick flex w-full cursor-pointer flex-col p-0"
      style={{ background: tone('ivory', PAL.ink), boxShadow: pickShadow(active) }}
    >
      <span className="px-tile flex aspect-square w-full items-center justify-center" style={{ background: TILE_BACKGROUND }}>
        <canvas ref={ref} width={BOX_W} height={BOX_H} className="px-canvas px-sprite block" style={{ '--sw': BOX_W, '--sh': BOX_H }} aria-hidden="true" />
      </span>
      <span className="px-caption" style={{ color: active ? tone('berry-deep', PAL.saffronLight) : tone('ink', PAL.bone) }}>{name}</span>
    </button>
  )
}

// Elegir mascota en pasos: la especie y la raza (con sus colores de siempre) y, debajo de las razas,
// los dos colores del pelaje. Los animales solo se tiñen con los tonos de su paleta: un pelaje
// natural, sin selector de cualquier color.
export default function PetPicker({ pet, lang, labels, onPick }) {
  const names = PET_NAMES[lang]
  const hasPet = pet.kind !== 'ninguna'
  return (
    <>
      <FieldGroup legend={labels.kind}>
        <div className="px-grid">
          {PET_KINDS.map((kind) => (
            <PetTile
              key={kind}
              pet={petOfKind(kind)}
              active={pet.kind === kind}
              label={`${labels.kind}: ${names.kinds[kind]}`}
              name={names.kinds[kind]}
              onPick={() => pet.kind !== kind && onPick(petOfKind(kind))}
            />
          ))}
        </div>
      </FieldGroup>
      {hasPet && (
        <FieldGroup legend={labels.breed}>
          <div className="px-grid">
            {PET_BREEDS[pet.kind].map((breed) => {
              const active = pet.breed === breed
              return (
                <PetTile
                  key={breed}
                  pet={active ? pet : petOfBreed(pet.kind, breed)}
                  active={active}
                  label={`${labels.breed}: ${names[pet.kind][breed]}`}
                  name={names[pet.kind][breed]}
                  onPick={() => !active && onPick(petOfBreed(pet.kind, breed))}
                />
              )
            })}
          </div>
          {[
            ['coat', labels.coat],
            ['marks', labels.marks],
          ].map(([key, title]) => (
            <ColorRow
              key={key}
              nested
              title={title}
              name={names[key][pet[key]]}
              colors={PET_COLORS[key]}
              value={pet[key]}
              label={title}
              names={names[key]}
              onPick={(color) => onPick({ ...pet, [key]: color })}
            />
          ))}
        </FieldGroup>
      )}
    </>
  )
}
