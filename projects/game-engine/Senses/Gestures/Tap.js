/**
 * Tap — Single, Double, Long Press Detection
 */

import { Messenger } from '../../Foundation/Messenger.js'

export class Tap {
    constructor(options = {}) {
        this.doubleTapDelay = options.doubleTapDelay || 300  // ms
        this.longPressDelay = options.longPressDelay || 600  // ms
        this._lastTap = 0
        this._pressTimer = null
    }

    onTouchStart(x, y) {
        this._pressTimer = setTimeout(() => {
            Messenger.say('gesture.longpress', { x, y })
        }, this.longPressDelay)
    }

    onTouchEnd(x, y) {
        clearTimeout(this._pressTimer)
        const now = Date.now()
        if (now - this._lastTap < this.doubleTapDelay) {
            Messenger.say('gesture.doubletap', { x, y })
        } else {
            Messenger.say('gesture.tap', { x, y })
        }
        this._lastTap = now
    }
}
