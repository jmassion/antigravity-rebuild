/**
 * Pinch — Two-finger Pinch for Zoom
 */

import { Messenger } from '../../Foundation/Messenger.js'

export class Pinch {
    constructor() {
        this._initialDistance = 0
    }

    onTouchStart(touch1, touch2) {
        this._initialDistance = this._distance(touch1, touch2)
    }

    onTouchMove(touch1, touch2) {
        const dist = this._distance(touch1, touch2)
        const scale = dist / this._initialDistance
        Messenger.say('gesture.pinch', { scale, distance: dist })
    }

    _distance(a, b) {
        const dx = a.clientX - b.clientX
        const dy = a.clientY - b.clientY
        return Math.sqrt(dx * dx + dy * dy)
    }
}
