import { ACHIEVEMENT_IDS, SECRET_IDS } from '../../game/achievements'
import { useValleCopy } from '../../lib/valleCopy'

// Lista de logros, desbloqueados y por desbloquear. Los secretos no enseñan qué piden hasta conseguirlos. `unlocked` es el
// conjunto de ids conseguidos (ver `game/achievements.js`).
export default function AchievementsList({ unlocked }) {
  const { copy } = useValleCopy()
  return (
    <ul className="space-y-2">
      {ACHIEVEMENT_IDS.map((id) => {
        const done = unlocked.has(id)
        const item = copy.achievements.items[id]
        const hidden = !done && SECRET_IDS.includes(id)
        return (
          <li key={id} className="flex items-start gap-2 text-sm" style={{ opacity: done ? 1 : 0.65 }}>
            <span aria-hidden="true">{done ? '★' : '☆'}</span>
            <span>
              <strong>{hidden ? '???' : item.name}</strong>
              <span className="block text-xs">{hidden ? copy.achievements.secret : done ? item.desc : `${copy.achievements.locked}: ${item.desc}`}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
