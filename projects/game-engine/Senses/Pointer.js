/**
 * Pointer — The 3D Cursor
 *
 * A pointer that exists IN 3D SPACE, not just on a 2D screen.
 * It can hover, grab, snap to grids, slide along surfaces,
 * and be influenced by gravity.
 *
 * This is the star of the input system.
 */

import * as THREE from 'three'
import { Messenger } from '../Foundation/Messenger.js'

export class Pointer {

    constructor(camera, scene) {
        this.camera = camera        // The Camera module
        this.scene = scene          // The Three.js scene

        // 3D state
        this.position = new THREE.Vector3()
        this.ray = new THREE.Raycaster()
        this.screenPosition = { x: 0, y: 0 }

        // Interaction state
        this.hovering = null        // Thing currently under pointer
        this.grabbed = null         // Thing currently being held
        this.selected = []          // Things currently selected

        // Mode: how the pointer moves through space
        this.mode = 'free'          // free, snap, surface, gravity

        // Gravity simulation
        this.gravity = {
            attractedTo: 'surfaces',
            friction: 0.3,
            bounce: 0.1,
            magnetism: 0.5,
            orbitMode: false,
        }

        // Velocity for gravity mode
        this._velocity = new THREE.Vector3()

        // Visual representation of the pointer in 3D
        this.visual = this._createVisual()

        // Normalize device coordinates
        this._ndc = new THREE.Vector2()
    }

    /**
     * Update the pointer from a screen position.
     * Called when mouse moves or touch moves.
     */
    updateFromScreen(screenX, screenY, width, height) {
        this.screenPosition = { x: screenX, y: screenY }

        // Convert to normalized device coordinates (-1 to +1)
        this._ndc.x = (screenX / width) * 2 - 1
        this._ndc.y = -(screenY / height) * 2 + 1

        // Cast ray from camera through pointer
        this.ray.setFromCamera(this._ndc, this.camera.camera)

        // Find what the ray hits
        const hits = this.ray.intersectObjects(this.scene.children, true)
        const oldHovering = this.hovering

        if (hits.length > 0) {
            const hit = hits[0]
            this.position.copy(hit.point)

            // Find the Thing this mesh belongs to
            let obj = hit.object
            while (obj && !obj.userData.thing) obj = obj.parent
            this.hovering = obj?.userData.thing || null

            // Apply mode modifications
            if (this.mode === 'snap') {
                this._applySnap()
            } else if (this.mode === 'surface') {
                // Already on surface — position is the hit point
            } else if (this.mode === 'gravity') {
                this._applyGravity()
            }
        } else {
            this.hovering = null
            // In free mode, project pointer onto a plane at a default depth
            const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
            this.ray.ray.intersectPlane(plane, this.position)
        }

        // Hover change events
        if (this.hovering !== oldHovering) {
            if (oldHovering) Messenger.say('pointer.unhover', { thing: oldHovering.id })
            if (this.hovering) Messenger.say('pointer.hover', { thing: this.hovering.id })
        }

        // Update visual
        this.visual.position.copy(this.position)
    }

    /**
     * Grab the Thing under the pointer.
     */
    grab() {
        if (this.hovering) {
            this.grabbed = this.hovering
            Messenger.say('pointer.grab', { thing: this.grabbed.id })
        }
    }

    /**
     * Release the grabbed Thing.
     */
    release() {
        if (this.grabbed) {
            Messenger.say('pointer.release', { thing: this.grabbed.id })
            this.grabbed = null
        }
    }

    /**
     * Select / deselect Things.
     */
    select(thing, addToSelection = false) {
        if (!addToSelection) this.selected = []
        if (thing && !this.selected.includes(thing)) {
            this.selected.push(thing)
            Messenger.say('pointer.selected', { thing: thing.id })
        }
    }

    clearSelection() {
        this.selected = []
        Messenger.say('pointer.selection.cleared')
    }

    /**
     * Move the grabbed Thing to follow the pointer.
     */
    dragGrabbed() {
        if (!this.grabbed || this.grabbed.locked) return
        this.grabbed.moveTo(this.position.x, this.position.y, this.position.z)
    }

    /**
     * Set the pointer mode.
     */
    setMode(mode) {
        this.mode = mode
        Messenger.say('pointer.mode', { mode })
    }

    /**
     * Adjust pointer depth (forward/backward along ray).
     * Used with scroll wheel.
     */
    adjustDepth(delta) {
        const direction = this.ray.ray.direction.clone().normalize()
        this.position.addScaledVector(direction, delta * 0.1)
        this.visual.position.copy(this.position)
    }

    // ── Internal ───────────────────────

    _applySnap() {
        const gridSize = 0.25
        this.position.x = Math.round(this.position.x / gridSize) * gridSize
        this.position.y = Math.round(this.position.y / gridSize) * gridSize
        this.position.z = Math.round(this.position.z / gridSize) * gridSize
    }

    _applyGravity() {
        // Light gravitational pull toward nearest surface
        // This makes the pointer feel "alive"
        const dampening = 1 - this.gravity.friction
        this._velocity.multiplyScalar(dampening)
        this.position.add(this._velocity)
    }

    _createVisual() {
        // A small glowing sphere that represents the pointer in 3D
        const geometry = new THREE.SphereGeometry(0.03, 16, 16)
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8,
        })
        const mesh = new THREE.Mesh(geometry, material)
        mesh.renderOrder = 9999
        return mesh
    }
}
