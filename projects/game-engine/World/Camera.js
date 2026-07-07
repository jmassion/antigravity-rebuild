/**
 * Camera — The Viewer's Eye
 *
 * How you see the Space. Perspective or orthographic.
 * Can orbit, fly, follow, or be fixed.
 */

import * as THREE from 'three'
import { Messenger } from '../Foundation/Messenger.js'

export class Camera {

    constructor(options = {}) {
        const {
            type = 'perspective',
            fov = 60,
            near = 0.1,
            far = 1000,
        } = options

        if (type === 'orthographic') {
            const aspect = window.innerWidth / window.innerHeight
            const size = 10
            this.camera = new THREE.OrthographicCamera(
                -size * aspect, size * aspect, size, -size, near, far
            )
        } else {
            this.camera = new THREE.PerspectiveCamera(
                fov, window.innerWidth / window.innerHeight, near, far
            )
        }

        this.mode = 'orbit'   // orbit, fly, follow, fixed
        this.target = new THREE.Vector3(0, 0, 0)
        this.distance = 10
        this.theta = Math.PI / 4    // horizontal angle
        this.phi = Math.PI / 4      // vertical angle
        this.minDistance = 1
        this.maxDistance = 100

        this._updatePosition()
    }

    /**
     * Orbit around the target point.
     */
    orbit(deltaTheta, deltaPhi) {
        this.theta += deltaTheta
        this.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.phi + deltaPhi))
        this._updatePosition()
    }

    /**
     * Zoom in or out.
     */
    zoom(delta) {
        this.distance = Math.max(
            this.minDistance,
            Math.min(this.maxDistance, this.distance + delta)
        )
        this._updatePosition()
    }

    /**
     * Pan the target point.
     */
    pan(deltaX, deltaY) {
        const right = new THREE.Vector3()
        const up = new THREE.Vector3()
        right.setFromMatrixColumn(this.camera.matrixWorld, 0)
        up.setFromMatrixColumn(this.camera.matrixWorld, 1)

        this.target.addScaledVector(right, -deltaX)
        this.target.addScaledVector(up, deltaY)
        this._updatePosition()
    }

    /**
     * Look at a specific point.
     */
    lookAt(x, y, z) {
        this.target.set(x, y, z)
        this._updatePosition()
    }

    /**
     * Follow a Thing.
     */
    follow(thing, offset = { x: 0, y: 3, z: 5 }) {
        this.mode = 'follow'
        this._followTarget = thing
        this._followOffset = offset
    }

    /**
     * Update camera on each frame.
     */
    update(delta) {
        if (this.mode === 'follow' && this._followTarget) {
            const pos = this._followTarget.placement.position
            this.target.copy(pos)
            this.camera.position.set(
                pos.x + this._followOffset.x,
                pos.y + this._followOffset.y,
                pos.z + this._followOffset.z
            )
            this.camera.lookAt(this.target)
        }
    }

    /**
     * Handle window resize.
     */
    resize(width, height) {
        if (this.camera.isPerspectiveCamera) {
            this.camera.aspect = width / height
        }
        this.camera.updateProjectionMatrix()
    }

    _updatePosition() {
        this.camera.position.set(
            this.target.x + this.distance * Math.sin(this.phi) * Math.cos(this.theta),
            this.target.y + this.distance * Math.cos(this.phi),
            this.target.z + this.distance * Math.sin(this.phi) * Math.sin(this.theta)
        )
        this.camera.lookAt(this.target)
    }
}
