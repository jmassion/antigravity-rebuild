/**
 * Grid — Construction Guides
 *
 * Visible grid lines for alignment and spatial reference.
 * Snap targets for precise placement.
 */

import * as THREE from 'three'
import { Messenger } from '../Foundation/Messenger.js'

export class Grid {

    constructor(options = {}) {
        const {
            size = 20,
            divisions = 20,
            color1 = 0x444444,
            color2 = 0x222222,
            visible = true,
        } = options

        this.size = size
        this.divisions = divisions
        this.cellSize = size / divisions
        this.visible = visible

        // Three.js grid helper
        this.helper = new THREE.GridHelper(size, divisions, color1, color2)
        this.helper.visible = visible
    }

    /**
     * Snap a position to the nearest grid intersection.
     */
    snap(position) {
        return {
            x: Math.round(position.x / this.cellSize) * this.cellSize,
            y: Math.round(position.y / this.cellSize) * this.cellSize,
            z: Math.round(position.z / this.cellSize) * this.cellSize,
        }
    }

    /**
     * Show / hide the grid.
     */
    toggle() {
        this.visible = !this.visible
        this.helper.visible = this.visible
        Messenger.say('grid.toggled', { visible: this.visible })
    }

    /**
     * Change grid density.
     */
    setDivisions(n) {
        this.divisions = n
        this.cellSize = this.size / n
        // Rebuild the helper
        const parent = this.helper.parent
        if (parent) parent.remove(this.helper)
        this.helper.dispose()
        this.helper = new THREE.GridHelper(this.size, n)
        this.helper.visible = this.visible
        if (parent) parent.add(this.helper)
    }

    /**
     * Add the grid to a Three.js scene.
     */
    addTo(scene) {
        scene.add(this.helper)
    }
}
