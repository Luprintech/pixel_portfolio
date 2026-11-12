import { beforeEach, describe, expect, it } from 'vitest'
import { clearSave } from '../save.js'
import { GAME_IDS } from './games.js'
import { REWARDS, rewardCoins, rewardFor } from './rewards.js'
import { MAX_COINS, MAX_CREDITS, START_COINS, clearWallet, grantReward, insertCoin, loadWallet, saveWallet, spendCredit } from './wallet.js'

beforeEach(() => localStorage.clear())

describe('monedero de la recreativa', () => {
  it('empieza con seis monedas, sin créditos ni recompensas', () => {
    expect(START_COINS).toBe(6)
    expect(loadWallet()).toEqual({ coins: 6, credits: 0, rewards: [] })
  })

  it('insertar una moneda resta una del saldo y suma un crédito; sin saldo no pasa nada', () => {
    let { wallet, ok } = insertCoin(loadWallet())
    expect(ok).toBe(true)
    expect(wallet).toMatchObject({ coins: 5, credits: 1 })
    wallet = { ...wallet, coins: 0 }
    const empty = insertCoin(wallet)
    expect(empty).toMatchObject({ ok: false, reason: 'empty' })
    expect(empty.wallet).toBe(wallet)
  })

  it('la máquina no admite más créditos que el tope y no se pierde la moneda', () => {
    const full = { coins: 5, credits: MAX_CREDITS, rewards: [] }
    expect(insertCoin(full)).toMatchObject({ ok: false, reason: 'full' })
  })

  it('empezar una partida cuesta un crédito y sin él no se empieza', () => {
    const paid = spendCredit({ coins: 3, credits: 1, rewards: [] })
    expect(paid.ok).toBe(true)
    expect(paid.wallet.credits).toBe(0)
    expect(spendCredit(paid.wallet).ok).toBe(false)
  })

  it('una recompensa se entrega una sola vez y se recuerda', () => {
    const first = grantReward(loadWallet(), 'dungeon.jefe', 2)
    expect(first.gained).toBe(2)
    expect(first.wallet.coins).toBe(8)
    const again = grantReward(first.wallet, 'dungeon.jefe', 2)
    expect(again.gained).toBe(0)
    expect(again.wallet).toBe(first.wallet)
  })

  it('el saldo tiene techo y los identificadores raros se descartan', () => {
    const rich = grantReward({ coins: MAX_COINS - 1, credits: 0, rewards: [] }, 'river.aterrizaje', 5)
    expect(rich.wallet.coins).toBe(MAX_COINS)
    expect(grantReward(loadWallet(), 'DROP TABLE', 1).gained).toBe(0)
  })

  it('se guarda, se recupera y lo dañado vuelve a empezar', () => {
    const { wallet } = grantReward(insertCoin(loadWallet()).wallet, 'galactic.nodo', 2)
    saveWallet(wallet)
    expect(loadWallet()).toEqual(wallet)
    localStorage.setItem('valle-del-bucle:arcade-wallet', '{no es json')
    expect(loadWallet().coins).toBe(START_COINS)
    localStorage.setItem('valle-del-bucle:arcade-wallet', JSON.stringify({ coins: -4, credits: 'x', rewards: ['a.b', 'a.b', 7, '!!'] }))
    expect(loadWallet()).toEqual({ coins: 6, credits: 0, rewards: ['a.b'] })
  })

  it('borrar la partida restablece las monedas', () => {
    saveWallet({ coins: 0, credits: 2, rewards: ['dungeon.jefe'] })
    clearSave()
    expect(loadWallet()).toEqual({ coins: 6, credits: 0, rewards: [] })
    clearWallet()
  })
})

describe('recompensas de los juegos', () => {
  it('todas tienen monedas y pertenecen a un juego conocido', () => {
    Object.entries(REWARDS).forEach(([id, coins]) => {
      expect(coins, id).toBeGreaterThan(0)
      expect(GAME_IDS, id).toContain(id.split('.')[0])
    })
  })

  it('los hitos de cada juego dan su recompensa y lo demás no da nada', () => {
    expect(rewardFor('dungeon', { type: 'door' })).toBe('dungeon.puerta')
    expect(rewardFor('dungeon', { type: 'gate' })).toBe('dungeon.acertijo')
    expect(rewardFor('dungeon', { type: 'win' })).toBe('dungeon.jefe')
    expect(rewardFor('dungeon', { type: 'swing' })).toBeNull()
    expect(rewardFor('galactic', { type: 'wave', wave: 2 })).toBeNull()
    expect(rewardFor('galactic', { type: 'wave', wave: 3 })).toBe('galactic.oleada3')
    expect(rewardFor('galactic', { type: 'wave', wave: 5 })).toBe('galactic.oleada5')
    expect(rewardFor('galactic', { type: 'win' })).toBe('galactic.nodo')
    expect(rewardFor('river', { type: 'checkpoint', bridges: 2 })).toBeNull()
    expect(rewardFor('river', { type: 'checkpoint', bridges: 3 })).toBe('river.puentes')
    expect(rewardFor('river', { type: 'checkpoint', bridges: 5 })).toBe('river.puentes-todos')
    expect(rewardFor('river', { type: 'win' })).toBe('river.aterrizaje')
    // Un suceso de un juego no paga en otro.
    expect(rewardFor('river', { type: 'door' })).toBeNull()
    expect(rewardCoins('dungeon.jefe')).toBe(2)
  })

  it('repetir un juego no vuelve a dar lo ya entregado', () => {
    let wallet = loadWallet()
    const events = [{ type: 'door' }, { type: 'gate' }, { type: 'win' }]
    for (let run = 0; run < 3; run++) {
      events.forEach((event) => {
        const id = rewardFor('dungeon', event)
        wallet = grantReward(wallet, id, rewardCoins(id)).wallet
      })
    }
    expect(wallet.coins).toBe(START_COINS + 1 + 1 + 2)
  })
})
