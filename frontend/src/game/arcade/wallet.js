// Monedas de la recreativa: el saldo de la viajera, los créditos cargados en la máquina y qué recompensas ya se han entregado.
// Es de la partida (se guarda en el navegador junto a las puntuaciones y «Borrar partida» lo restablece, ver `save.js`) y lo
// comparten los tres juegos. Las funciones de cambio son puras: reciben el monedero y devuelven uno nuevo, y solo `saveWallet`
// escribe en el almacenamiento. Sin dependencias de Phaser ni de React.
const KEY = 'valle-del-bucle:arcade-wallet'

// Monedas con las que empieza la viajera, el techo del saldo y de los créditos, y cuántas recompensas se recuerdan.
export const START_COINS = 6
export const MAX_COINS = 99
export const MAX_CREDITS = 9
const MAX_REWARDS = 60
const REWARD_ID = /^[a-z]+\.[a-z0-9-]{1,32}$/

const fresh = () => ({ coins: START_COINS, credits: 0, rewards: [] })

const whole = (value, max, fallback) => (Number.isFinite(value) && value >= 0 ? Math.min(max, Math.floor(value)) : fallback)

// Lo guardado puede venir dañado o manipulado: solo se acepta lo que tiene forma de monedero.
function clean(raw) {
  if (!raw || typeof raw !== 'object') return fresh()
  const rewards = Array.isArray(raw.rewards) ? [...new Set(raw.rewards.filter((id) => typeof id === 'string' && REWARD_ID.test(id)))].slice(0, MAX_REWARDS) : []
  return { coins: whole(raw.coins, MAX_COINS, START_COINS), credits: whole(raw.credits, MAX_CREDITS, 0), rewards }
}

export function loadWallet() {
  try {
    return clean(JSON.parse(localStorage.getItem(KEY) ?? 'null'))
  } catch {
    return fresh()
  }
}

// Devuelve si se pudo guardar; sin almacenamiento el saldo dura solo esta visita.
export function saveWallet(wallet) {
  try {
    localStorage.setItem(KEY, JSON.stringify(wallet))
    return true
  } catch {
    return false
  }
}

export function clearWallet() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nada que borrar si el almacenamiento no está disponible.
  }
}

// Mete una moneda del saldo en la máquina: -1 moneda, +1 crédito. `reason` dice por qué no pudo ser ('empty' o 'full').
export function insertCoin(wallet) {
  if (wallet.coins < 1) return { wallet, ok: false, reason: 'empty' }
  if (wallet.credits >= MAX_CREDITS) return { wallet, ok: false, reason: 'full' }
  return { wallet: { ...wallet, coins: wallet.coins - 1, credits: wallet.credits + 1 }, ok: true }
}

// Empezar una partida cuesta un crédito.
export function spendCredit(wallet) {
  if (wallet.credits < 1) return { wallet, ok: false }
  return { wallet: { ...wallet, credits: wallet.credits - 1 }, ok: true }
}

// Entrega una recompensa una sola vez: si ya se dio (o el identificador no es válido) no cambia nada y `gained` es 0.
export function grantReward(wallet, id, coins) {
  if (!REWARD_ID.test(id) || wallet.rewards.includes(id) || wallet.rewards.length >= MAX_REWARDS) return { wallet, gained: 0 }
  const gained = Math.max(0, Math.min(coins, MAX_COINS - wallet.coins))
  return { wallet: { ...wallet, coins: wallet.coins + gained, rewards: [...wallet.rewards, id] }, gained }
}
