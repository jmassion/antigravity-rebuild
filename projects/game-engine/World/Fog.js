/**
 * Fog — Atmospheric Depth
 *
 * Makes distant things fade into mist.
 * Adds depth and mood to any Space.
 */

import * as THREE from 'three'

export class Fog {

    constructor(options = {}) {
        const {
            color = 0x000000,
            near = 10,
            far = 50,
            type = 'linear',     // 'linear' or 'exponential'
            density = 0.02,
        } = options

        this.type = type
        if (type === 'exponential') {
            this.fog = new THREE.FogExp2(color, density)
        } else {
            this.fog = new THREE.Fog(color, near, far)
        }
    }

    applyTo(scene) {
        scene.fog = this.fog
    }

    remove(scene) {
        scene.fog = null
    }

    setColor(color) { this.fog.color.set(color) }

    static mist() { return new Fog({ color: 0xcccccc, near: 5, far: 30 }) }
    static darkness() { return new Fog({ color: 0x000000, near: 2, far: 20 }) }
    static dream() { return new Fog({ color: 0xeeddff, near: 3, far: 25 }) }
}
