/**
 * Space — A Holodeck Room
 *
 * A single environment / scene / room.
 * Contains Things, Lights, a Skybox, and rules for how
 * the space behaves. Every holodeck session lives inside a Space.
 */

import * as THREE from 'three'
import { Messenger } from '../Foundation/Messenger.js'

export class Space {

    constructor(name = 'Untitled Space') {
        this.name = name
        this.id = `space_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

        // Three.js scene graph
        this.scene = new THREE.Scene()

        // Everything in this Space
        this.things = new Map()       // id → Thing
        this.lights = []
        this.portals = []

        // Environment
        this.skybox = null
        this.fog = null
        this.gravity = { x: 0, y: -9.8, z: 0 }
        this.grid = null

        // Metadata
        this.tags = []
        this.created = new Date()
        this.modified = new Date()

        Messenger.say('space.created', { name, id: this.id })
    }

    /**
     * Add a Thing to this Space.
     */
    add(thing) {
        this.things.set(thing.id, thing)
        this.scene.add(thing.object3D)
        thing.space = this
        this.modified = new Date()
        Messenger.say('space.thing.added', { space: this.id, thing: thing.id })
        return thing
    }

    /**
     * Remove a Thing from this Space.
     */
    remove(thing) {
        this.things.delete(thing.id)
        this.scene.remove(thing.object3D)
        thing.space = null
        this.modified = new Date()
        Messenger.say('space.thing.removed', { space: this.id, thing: thing.id })
    }

    /**
     * Find Things by name, tag, or kind.
     */
    find(query) {
        const results = []
        for (const thing of this.things.values()) {
            if (thing.name === query) results.push(thing)
            else if (thing.kind === query) results.push(thing)
            else if (thing.tags.includes(query)) results.push(thing)
        }
        return results
    }

    /**
     * Find one Thing by its ID.
     */
    findById(id) {
        return this.things.get(id) || null
    }

    /**
     * Get all Things as an array.
     */
    everything() {
        return [...this.things.values()]
    }

    /**
     * Set the ambient environment.
     */
    setEnvironment({ skybox, fog, gravity }) {
        if (skybox !== undefined) this.skybox = skybox
        if (fog !== undefined) this.fog = fog
        if (gravity !== undefined) this.gravity = gravity
        Messenger.say('space.environment.changed', { space: this.id })
    }

    /**
     * Serialize to plain object (for saving).
     */
    toJSON() {
        return {
            name: this.name,
            id: this.id,
            things: [...this.things.values()].map(t => t.toJSON()),
            gravity: this.gravity,
            tags: this.tags,
            created: this.created.toISOString(),
            modified: this.modified.toISOString(),
        }
    }
}
