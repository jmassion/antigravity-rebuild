/**
 * Placement — Where a Thing Is
 *
 * Position, rotation, and scale in 3D space.
 * The simplest possible wrapper around a transform.
 */

import * as THREE from 'three'

export class Placement {

    constructor(options = {}) {
        this.position = new THREE.Vector3(
            options.x || 0,
            options.y || 0,
            options.z || 0
        )
        this.rotation = new THREE.Euler(
            options.rx || 0,
            options.ry || 0,
            options.rz || 0
        )
        this.scale = new THREE.Vector3(
            options.sx || 1,
            options.sy || 1,
            options.sz || 1
        )
    }

    /**
     * Copy values from another Placement.
     */
    copyFrom(other) {
        this.position.copy(other.position)
        this.rotation.copy(other.rotation)
        this.scale.copy(other.scale)
        return this
    }

    /**
     * Get the straight-line distance to another Placement.
     */
    distanceTo(other) {
        return this.position.distanceTo(other.position)
    }

    /**
     * Smoothly interpolate toward another Placement.
     * t = 0 means stay, t = 1 means arrive fully.
     */
    lerpTo(other, t) {
        this.position.lerp(other.position, t)
        // Euler lerp is approximate but works for small steps
        this.rotation.x += (other.rotation.x - this.rotation.x) * t
        this.rotation.y += (other.rotation.y - this.rotation.y) * t
        this.rotation.z += (other.rotation.z - this.rotation.z) * t
        this.scale.lerp(other.scale, t)
        return this
    }

    /**
     * Serialize.
     */
    toJSON() {
        return {
            position: { x: this.position.x, y: this.position.y, z: this.position.z },
            rotation: { x: this.rotation.x, y: this.rotation.y, z: this.rotation.z },
            scale: { x: this.scale.x, y: this.scale.y, z: this.scale.z },
        }
    }

    /**
     * Create from plain object.
     */
    static fromJSON(data) {
        return new Placement({
            x: data.position?.x, y: data.position?.y, z: data.position?.z,
            rx: data.rotation?.x, ry: data.rotation?.y, rz: data.rotation?.z,
            sx: data.scale?.x, sy: data.scale?.y, sz: data.scale?.z,
        })
    }
}
