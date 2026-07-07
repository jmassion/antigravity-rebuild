/**
 * Group — A Collection of Things
 *
 * Things that belong together and move together.
 * Like a folder for 3D objects.
 */

import { Thing } from './Thing.js'
import { Messenger } from '../Foundation/Messenger.js'

export class Group extends Thing {

    constructor(name = 'Group') {
        super(name)
        this.kind = 'group'
    }

    /**
     * Add a Thing to this Group.
     * Alias for addChild that reads more naturally.
     */
    include(thing) {
        return this.addChild(thing)
    }

    /**
     * Remove a Thing from this Group.
     */
    exclude(thing) {
        return this.removeChild(thing)
    }

    /**
     * Get the count of things in this group.
     */
    get count() {
        return this.children.length
    }

    /**
     * Apply a function to every Thing in the Group.
     */
    forEach(fn) {
        this.children.forEach(fn)
    }

    /**
     * Find a child by name.
     */
    findByName(name) {
        return this.children.find(c => c.name === name) || null
    }

    /**
     * Compute the bounding box that encompasses all children.
     */
    getBounds() {
        const box = new THREE.Box3()
        for (const child of this.children) {
            box.expandByObject(child.object3D)
        }
        return box
    }
}
