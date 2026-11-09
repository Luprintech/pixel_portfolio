import { afterEach, describe, expect, it } from 'vitest'
import { installPlatform, iosBrowser, rememberDismissal, wasRecentlyDismissed } from './pwaInstall'

const IPHONE_SAFARI =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
const IPHONE_CHROME =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.88 Mobile/15E148 Safari/604.1'
const IPHONE_FIREFOX =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/125.0 Mobile/15E148 Safari/605.1.15'
const ANDROID_CHROME =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36'
const DESKTOP_CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

describe('installPlatform', () => {
  it('reconoce iPhone y Android', () => {
    expect(installPlatform({ userAgent: IPHONE_SAFARI })).toBe('ios')
    expect(installPlatform({ userAgent: ANDROID_CHROME })).toBe('android')
  })

  it('reconoce el iPad que se hace pasar por Mac', () => {
    expect(installPlatform({ userAgent: DESKTOP_CHROME, platform: 'MacIntel', maxTouchPoints: 5 })).toBe('ios')
    expect(installPlatform({ userAgent: DESKTOP_CHROME, platform: 'MacIntel', maxTouchPoints: 0 })).toBeNull()
  })

  it('no ofrece nada en escritorio', () => {
    expect(installPlatform({ userAgent: DESKTOP_CHROME, platform: 'Win32' })).toBeNull()
  })
})

describe('iosBrowser', () => {
  it('distingue Safari, Chrome y el resto', () => {
    expect(iosBrowser(IPHONE_SAFARI)).toBe('safari')
    expect(iosBrowser(IPHONE_CHROME)).toBe('chrome')
    expect(iosBrowser(IPHONE_FIREFOX)).toBe('other')
  })
})

describe('descarte del aviso', () => {
  afterEach(() => localStorage.clear())

  it('no hay descarte hasta que se guarda uno', () => {
    expect(wasRecentlyDismissed()).toBe(false)
  })

  it('un descarte reciente silencia el aviso y caduca a las dos semanas', () => {
    const now = Date.now()
    rememberDismissal(now)
    expect(wasRecentlyDismissed(now + 60_000)).toBe(true)
    expect(wasRecentlyDismissed(now + 15 * 24 * 60 * 60 * 1000)).toBe(false)
  })
})
