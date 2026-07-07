/**
 * Life Layer — Physics, Gravity, and Behaviours
 *
 * Makes Things feel real (or surreal).
 */

export { Trait } from './Trait.js'

// ── Built-in Traits ────────────────

import { Trait } from './Trait.js'

/** Thing hovers or bobs up and down. */
export class Floats extends Trait {
    constructor(options = {}) {
        super('floats', options)
        this.height = options.height || 0.3
        this.speed = options.speed || 1
        this._time = 0
        this._originY = 0
    }
    start() { this._originY = this.thing.placement.position.y }
    update(delta) {
        if (!this.active) return
        this._time += delta * this.speed
        this.thing.placement.position.y = this._originY + Math.sin(this._time) * this.height
        this.thing._syncPlacement()
    }
}

/** Thing rotates continuously. */
export class Spins extends Trait {
    constructor(options = {}) {
        super('spins', options)
        this.axis = options.axis || 'y'
        this.speed = options.speed || 1
    }
    update(delta) {
        if (!this.active) return
        this.thing.object3D.rotation[this.axis] += delta * this.speed
    }
}

/** Thing follows another Thing or the pointer. */
export class Follows extends Trait {
    constructor(options = {}) {
        super('follows', options)
        this.target = options.target || null      // Thing or { position }
        this.speed = options.speed || 2
        this.offset = options.offset || { x: 0, y: 0, z: 0 }
    }
    update(delta) {
        if (!this.active || !this.target) return
        const targetPos = this.target.placement?.position || this.target.position
        if (!targetPos) return
        const p = this.thing.placement.position
        p.x += (targetPos.x + this.offset.x - p.x) * this.speed * delta
        p.y += (targetPos.y + this.offset.y - p.y) * this.speed * delta
        p.z += (targetPos.z + this.offset.z - p.z) * this.speed * delta
        this.thing._syncPlacement()
    }
}

/** Thing gently pulses in size (organic feel). */
export class Breathes extends Trait {
    constructor(options = {}) {
        super('breathes', options)
        this.amount = options.amount || 0.05
        this.speed = options.speed === 'slow' ? 0.5 : options.speed === 'fast' ? 2 : (options.speed || 1)
        this._time = 0
    }
    update(delta) {
        if (!this.active) return
        this._time += delta * this.speed
        const s = 1 + Math.sin(this._time) * this.amount
        this.thing.object3D.scale.set(s, s, s)
    }
}

/** Thing emits light / glows. */
export class Glows extends Trait {
    constructor(options = {}) {
        super('glows', options)
        this.intensity = options.intensity || 0.5
        this.color = options.color || 0x00ffff
    }
    start() {
        if (this.thing.surface) {
            this.thing.surface.setGlow(this.intensity, this.color)
        }
    }
    stop() {
        if (this.thing.surface) {
            this.thing.surface.setGlow(0)
        }
    }
}

/** Thing responds to pointer proximity. */
export class Reacts extends Trait {
    constructor(options = {}) {
        super('reacts', options)
        this.on = options.on || 'pointer-near'
        this.do = options.do || 'glow-brighter'
    }
    // Implemented via Messenger events in the integration layer
}

/** Thing has AI-driven behaviour. */
export class Thinks extends Trait {
    constructor(options = {}) {
        super('thinks', options)
        this.prompt = options.prompt || ''
        this.personality = options.personality || 'friendly'
    }
}

// ── Global Physics ─────────────────

export class Gravity {
    constructor(options = {}) {
        this.direction = options.direction || { x: 0, y: -9.8, z: 0 }
        this.enabled = options.enabled ?? true
    }

    apply(thing, delta) {
        if (!this.enabled) return
        // Simple gravity — add velocity downward
        const p = thing.placement.position
        p.y += this.direction.y * delta * delta * 0.5
        thing._syncPlacement()
    }
}

export class Weather {
    constructor(type = 'clear') {
        this.type = type    // clear, rain, snow, wind, fog
        this.intensity = 0.5
        this.particles = []
    }

    static clear() { return new Weather('clear') }
    static rain() { return new Weather('rain') }
    static snow() { return new Weather('snow') }
    static wind() { return new Weather('wind') }
}
