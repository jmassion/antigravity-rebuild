/**
 * Portal — A Doorway Between Spaces
 *
 * Walk through and you're somewhere else.
 * Can show a live preview of the other side.
 */

import { Thing } from './Thing.js'
import { Messenger } from '../Foundation/Messenger.js'

export class Portal extends Thing {

    constructor(name = 'Portal', options = {}) {
        super(name)
        this.kind = 'portal'

        this.from = options.from || null       // Source Space
        this.to = options.to || null           // Destination Space
        this.preview = options.preview ?? true  // Show other side?
        this.transition = options.transition || 'walk-through'
        this.active = true

        // Visual frame style
        this.frameStyle = options.frame || 'archway'
    }

    /**
     * Connect this Portal to a destination Space.
     */
    connectTo(space) {
        this.to = space
        Messenger.say('portal.connected', {
            portal: this.id,
            from: this.from?.id,
            to: space.id,
        })
        return this
    }

    /**
     * Enter the portal — transition to the other Space.
     */
    enter() {
        if (!this.active || !this.to) return null
        Messenger.say('portal.entered', {
            portal: this.id,
            destination: this.to.id,
            transition: this.transition,
        })
        return this.to
    }

    /**
     * Toggle the portal on/off.
     */
    toggle() {
        this.active = !this.active
        Messenger.say('portal.toggled', { portal: this.id, active: this.active })
    }

    /**
     * Available transition styles.
     */
    static transitions = [
        'walk-through',    // Natural walking transition
        'fade',            // Fade to black, then in
        'zoom',            // Camera zooms into portal surface
        'dissolve',        // Current space dissolves away
        'snap',            // Instant — no transition
        'spiral',          // Spiral tunnel effect
    ]
}
