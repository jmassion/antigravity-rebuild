/**
 * Swipe — Directional Swipe Detection
 */

import { Messenger } from '../../Foundation/Messenger.js'

export class Swipe {
    constructor(options = {}) {
        this.threshold = options.threshold || 50   // Min distance in px
        this.timeout = options.timeout || 300      // Max time in ms
        this._start = null
        this._startTime = 0
    }

    onTouchStart(x, y) {
        this._start = { x, y }
        this._startTime = Date.now()
    }

    onTouchEnd(x, y) {
        if (!this._start) return
        const dx = x - this._start.x
        const dy = y - this._start.y
        const elapsed = Date.now() - this._startTime

        if (elapsed > this.timeout) return

        const absDx = Math.abs(dx)
        const absDy = Math.abs(dy)

        if (absDx < this.threshold && absDy < this.threshold) return

        let direction
        if (absDx > absDy) direction = dx > 0 ? 'right' : 'left'
        else direction = dy > 0 ? 'down' : 'up'

        Messenger.say('gesture.swipe', { direction, dx, dy, speed: Math.max(absDx, absDy) / elapsed })
        this._start = null
    }
}
