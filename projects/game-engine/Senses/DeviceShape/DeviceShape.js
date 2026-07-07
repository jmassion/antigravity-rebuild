/**
 * DeviceShape — Fold, MultiScreen, ScreenSize
 *
 * Detects device form factors: foldables, multi-screen setups,
 * and responsive sizing for layout adaptation.
 */

import { Messenger } from '../../Foundation/Messenger.js'

export class DeviceShape {

    constructor() {
        this.type = this._detect()
        this.foldAngle = 180         // Flat = 180, closed = 0
        this.screens = 1

        this._bindFoldable()
        this._bindMultiScreen()
    }

    _detect() {
        const w = window.innerWidth
        const h = window.innerHeight

        if (w < 480) return 'phone'
        if (w < 768) return 'phone-large'
        if (w < 1024) return 'tablet'
        if (w < 1440) return 'desktop'
        return 'desktop-large'
    }

    _bindFoldable() {
        if ('DevicePosture' in window || 'screen' in window && 'fold' in screen) {
            // Experimental API for foldable devices
            try {
                const mql = window.matchMedia('(horizontal-viewport-segments: 2)')
                mql.addEventListener('change', (e) => {
                    this.screens = e.matches ? 2 : 1
                    Messenger.say('device.fold', { screens: this.screens })
                })
            } catch (e) { /* Not supported */ }
        }
    }

    _bindMultiScreen() {
        if ('getScreenDetails' in window) {
            // Multi-screen Window Placement API
            window.getScreenDetails?.().then(details => {
                this.screens = details.screens.length
                Messenger.say('device.screens', { count: this.screens })
            }).catch(() => { })
        }
    }

    get isPhone() { return this.type.startsWith('phone') }
    get isTablet() { return this.type === 'tablet' }
    get isDesktop() { return this.type.startsWith('desktop') }
    get isFoldable() { return this.screens > 1 }
}
