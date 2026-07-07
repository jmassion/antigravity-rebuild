/**
 * Trait — Base Class for Behaviours
 *
 * Traits are simple, stackable behaviour modules.
 * Attach them to Things to make them come alive.
 *
 *   thing.addTrait(new Glows({ color: 'warm-gold' }))
 *   thing.addTrait(new Breathes({ speed: 'slow' }))
 */

export class Trait {

    constructor(name, options = {}) {
        this.name = name
        this.options = options
        this.thing = null       // Set when attached to a Thing
        this.active = true
    }

    /** Called once when attached to a Thing. */
    start() { }

    /** Called every frame with delta time. */
    update(delta) { }

    /** Called when removed from a Thing. */
    stop() { }

    /** Pause this trait without removing it. */
    pause() { this.active = false }
    resume() { this.active = true }
}
