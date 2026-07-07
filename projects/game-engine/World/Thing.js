/**
 * Thing — The Universal Object
 *
 * Everything in the world is a Thing.
 * A chair. A character. A data dashboard. A portal.
 * A particle cloud. A sound emitter. All Things.
 *
 * Things have:
 *   - A Placement (where they are)
 *   - A Shape (their geometry)
 *   - A Surface (how they look)
 *   - Traits (behaviours)
 *   - Children (Things inside them)
 *   - Data (arbitrary key-value bindings)
 */

import * as THREE from 'three'
import { Placement } from './Placement.js'
import { Messenger } from '../Foundation/Messenger.js'

export class Thing {

    constructor(name = 'Unnamed Thing') {
        this.name = name
        this.id = `thing_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        this.kind = 'generic'        // Semantic type: "furniture", "character", "data"

        // Core components
        this.placement = new Placement()
        this.shape = null             // Set via setShape()
        this.surface = null           // Set via setSurface()

        // Hierarchy
        this.children = []
        this.parent = null
        this.space = null             // Which Space this Thing lives in

        // Behaviour
        this.traits = []

        // Metadata
        this.tags = []
        this.data = {}                // Arbitrary data binding (spreadsheet → here)
        this.visible = true
        this.locked = false

        // Three.js backing object
        this.object3D = new THREE.Group()
        this.object3D.userData.thing = this
        this._syncPlacement()
    }

    /**
     * Set the geometry of this Thing.
     */
    setShape(shape) {
        // Remove old mesh if exists
        if (this._mesh) {
            this.object3D.remove(this._mesh)
        }

        this.shape = shape

        if (shape && shape.geometry) {
            const material = this.surface?.material || new THREE.MeshStandardMaterial({ color: 0xcccccc })
            this._mesh = new THREE.Mesh(shape.geometry, material)
            this._mesh.castShadow = true
            this._mesh.receiveShadow = true
            this.object3D.add(this._mesh)
        }

        Messenger.say('thing.shape.changed', { thing: this.id })
        return this
    }

    /**
     * Set the visual appearance of this Thing.
     */
    setSurface(surface) {
        this.surface = surface

        if (this._mesh && surface?.material) {
            this._mesh.material = surface.material
        }

        Messenger.say('thing.surface.changed', { thing: this.id })
        return this
    }

    /**
     * Move this Thing to a position.
     */
    moveTo(x, y, z) {
        this.placement.position.set(x, y, z)
        this._syncPlacement()
        Messenger.say('thing.moved', { thing: this.id, position: { x, y, z } })
        return this
    }

    /**
     * Rotate this Thing (in degrees for readability).
     */
    rotateTo(x, y, z) {
        const deg = Math.PI / 180
        this.placement.rotation.set(x * deg, y * deg, z * deg)
        this._syncPlacement()
        Messenger.say('thing.rotated', { thing: this.id })
        return this
    }

    /**
     * Scale this Thing.
     */
    scaleTo(x, y, z) {
        if (y === undefined) { y = x; z = x }
        this.placement.scale.set(x, y, z)
        this._syncPlacement()
        Messenger.say('thing.scaled', { thing: this.id })
        return this
    }

    /**
     * Add a Trait (behaviour) to this Thing.
     */
    addTrait(trait) {
        trait.thing = this
        this.traits.push(trait)
        if (trait.start) trait.start()
        Messenger.say('thing.trait.added', { thing: this.id, trait: trait.name })
        return this
    }

    /**
     * Remove a Trait by name.
     */
    removeTrait(name) {
        const index = this.traits.findIndex(t => t.name === name)
        if (index >= 0) {
            const trait = this.traits[index]
            if (trait.stop) trait.stop()
            this.traits.splice(index, 1)
            Messenger.say('thing.trait.removed', { thing: this.id, trait: name })
        }
        return this
    }

    /**
     * Add a child Thing.
     */
    addChild(child) {
        child.parent = this
        this.children.push(child)
        this.object3D.add(child.object3D)
        return this
    }

    /**
     * Remove a child Thing.
     */
    removeChild(child) {
        child.parent = null
        this.children = this.children.filter(c => c !== child)
        this.object3D.remove(child.object3D)
        return this
    }

    /**
     * Bind data to this Thing (e.g. from a spreadsheet).
     */
    bindData(key, value) {
        this.data[key] = value
        Messenger.say('thing.data.changed', { thing: this.id, key, value })
        return this
    }

    /**
     * Update all Traits for this frame.
     * Called by the Life layer each tick.
     */
    update(delta) {
        for (const trait of this.traits) {
            if (trait.update) trait.update(delta)
        }
        for (const child of this.children) {
            child.update(delta)
        }
    }

    /**
     * Sync Placement to Three.js transform.
     */
    _syncPlacement() {
        this.object3D.position.copy(this.placement.position)
        this.object3D.rotation.copy(this.placement.rotation)
        this.object3D.scale.copy(this.placement.scale)
    }

    /**
     * Serialize to plain object.
     */
    toJSON() {
        return {
            name: this.name,
            id: this.id,
            kind: this.kind,
            placement: this.placement.toJSON(),
            tags: this.tags,
            data: this.data,
            visible: this.visible,
            locked: this.locked,
            children: this.children.map(c => c.toJSON()),
        }
    }
}
