/**
 * Stories Layer — The Wish System
 *
 * Say what you want, and it appears.
 * AI-powered creation from natural language.
 */

import { Messenger } from '../Foundation/Messenger.js'
import { Thing } from '../World/Thing.js'
import { Shape } from '../World/Shape.js'
import { Surface } from '../World/Surface.js'

// ── Wish ──────────────────────────────

/**
 * Parse a wish into concrete actions.
 */
export class Wish {

    constructor(space) {
        this.space = space

        // Listen for intents from the voice system
        Messenger.hear('intent.recognized', (intent) => {
            this.fulfill(intent)
        })
    }

    /**
     * Fulfill a wish / intent.
     */
    fulfill(intent) {
        switch (intent.action) {

            case 'create':
                return this._create(intent.params)

            case 'delete':
                return this._delete(intent.params)

            case 'move':
                return this._move(intent.params)

            case 'paint':
                return this._paint(intent.params)

            case 'wish':
                // Freeform — try to interpret with Imagine
                return this._imagine(intent.params.text)

            default:
                Messenger.say('wish.unknown', { intent })
                return null
        }
    }

    _create(params) {
        const description = params.description || 'thing'
        const parts = description.toLowerCase().split(' ')

        // Extract color if mentioned
        const colors = {
            red: 0xff4444, blue: 0x4488ff, green: 0x44ff44, yellow: 0xffff44,
            white: 0xffffff, black: 0x222222, orange: 0xff8844, purple: 0xaa44ff,
            pink: 0xff44aa, gold: 0xffd700, silver: 0xc0c0c0
        }
        let color = 0xcccccc
        for (const [name, hex] of Object.entries(colors)) {
            if (parts.includes(name)) { color = hex; break }
        }

        // Extract shape
        const shapeMap = {
            box: Shape.box, cube: Shape.box, sphere: Shape.sphere, ball: Shape.sphere,
            cylinder: Shape.cylinder, cone: Shape.cone, plane: Shape.plane,
            torus: Shape.torus, donut: Shape.torus, capsule: Shape.capsule,
        }
        let shape = Shape.box()
        for (const [name, factory] of Object.entries(shapeMap)) {
            if (parts.includes(name)) { shape = factory(); break }
        }

        // Create the Thing
        const thing = new Thing(description)
        thing.setShape(shape)
        thing.setSurface(new Surface({ color }))

        // Add to space
        this.space.add(thing)

        Messenger.say('wish.granted', { action: 'create', thing: thing.id, description })
        return thing
    }

    _delete(params) {
        const results = this.space.find(params.target)
        for (const thing of results) {
            this.space.remove(thing)
        }
        Messenger.say('wish.granted', { action: 'delete', count: results.length })
    }

    _move(params) {
        const things = this.space.find(params.target)
        // Simple natural language position parsing
        const positions = {
            center: { x: 0, y: 0, z: 0 },
            left: { x: -2, y: 0, z: 0 },
            right: { x: 2, y: 0, z: 0 },
            up: { x: 0, y: 2, z: 0 },
            down: { x: 0, y: 0, z: 0 },
            front: { x: 0, y: 0, z: 2 },
            back: { x: 0, y: 0, z: -2 },
        }
        const dest = positions[params.destination] || { x: 0, y: 0, z: 0 }
        for (const thing of things) {
            thing.moveTo(dest.x, dest.y, dest.z)
        }
        Messenger.say('wish.granted', { action: 'move', count: things.length })
    }

    _paint(params) {
        // TODO: Apply color/material to selected things
        Messenger.say('wish.granted', { action: 'paint', color: params.color })
    }

    _imagine(text) {
        // Freeform wish — AI would process this
        // For now, log it as a wish to be fulfilled
        Messenger.say('wish.imagining', { text })
        return null
    }
}

// ── Style ─────────────────────────────

/**
 * Preset visual styles that can be applied to anything.
 */
export class Style {
    constructor(name, config) {
        this.name = name
        this.config = config
    }

    applyTo(thing) {
        if (this.config.surface) thing.setSurface(new Surface(this.config.surface))
        if (this.config.traits) {
            for (const trait of this.config.traits) {
                thing.addTrait(trait)
            }
        }
    }

    static realistic = new Style('realistic', { surface: { roughness: 0.7, metalness: 0.1 } })
    static cartoon = new Style('cartoon', { surface: { roughness: 1.0, metalness: 0.0 } })
    static wireframe = new Style('wireframe', { surface: { wireframe: true, color: 0x00ff00 } })
    static glass = new Style('glass', { surface: { opacity: 0.3, roughness: 0.1, metalness: 0.1 } })
    static neon = new Style('neon', { surface: { glow: 1.0, roughness: 0.0, color: 0x00ffff } })
}

// ── Mood ──────────────────────────────

/**
 * Set the emotional tone of a Space.
 */
export class Mood {
    constructor(name, config) {
        this.name = name
        this.config = config
    }

    applyTo(space) {
        Messenger.say('mood.applied', { name: this.name, space: space.id })
    }

    static cozy = new Mood('cozy', { lighting: 'warm', ambiance: 'soft', music: 'gentle' })
    static epic = new Mood('epic', { lighting: 'dramatic', ambiance: 'booming', music: 'orchestral' })
    static calm = new Mood('calm', { lighting: 'cool', ambiance: 'minimal', music: 'ambient' })
    static dark = new Mood('dark', { lighting: 'low', ambiance: 'eerie', music: 'tension' })
    static party = new Mood('party', { lighting: 'colorful', ambiance: 'loud', music: 'upbeat' })
}

// ── Templates ─────────────────────────

export class Template {
    constructor(name, builder) {
        this.name = name
        this.builder = builder   // Function that populates a Space
    }

    applyTo(space) {
        this.builder(space)
        Messenger.say('template.applied', { name: this.name, space: space.id })
    }

    static emptyHolodeck = new Template('empty-holodeck', (space) => {
        space.setEnvironment({ gravity: { x: 0, y: -9.8, z: 0 } })
    })
}
