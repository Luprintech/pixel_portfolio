import { ACHIEVEMENT_IDS, ACHIEVEMENT_ICONS } from '../../game/achievements'
import { useValleCopy } from '../../lib/valleCopy'
import PixelIcon from './PixelIcon'

// Lista de logros, desbloqueados y por desbloquear. El título se ve siempre (es la pista); qué piden solo se cuenta al conseguirlos,
// para dar emoción al descubrirlos. `unlocked` es el
// conjunto de ids conseguidos (ver `game/achievements.js`).
export default function AchievementsList({ unlocked }) {
  const { copy } = useValleCopy()
  return (
    <ul className="space-y-2">
      {ACHIEVEMENT_IDS.map((id) => {
        const done = unlocked.has(id)
        const item = copy.achievements.items[id]
        return (
          <li key={id} className="flex items-start gap-2 text-sm" style={{ opacity: done ? 1 : 0.65 }}>
            {ACHIEVEMENT_ICONS[id] ? (
              <PixelIcon id={ACHIEVEMENT_ICONS[id]} size={28} className={`shrink-0 ${done ? '' : 'grayscale'}`} />
            ) : (
              <span aria-hidden="true">{done ? '★' : '☆'}</span>
            )}
            <span>
              <strong>{item.name}</strong>
              <span className="block text-xs">{done ? item.desc : copy.achievements.hint}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
