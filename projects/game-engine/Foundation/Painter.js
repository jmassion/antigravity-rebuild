/**
 * Painter — The Rendering Engine
 *
 * Draws everything you see. Abstracts WebGL2 and WebGPU
 * behind one clear API so the rest of the engine never
 * thinks about GPU details.
 *
 * Handles: cameras, lights, shadows, reflections,
 * transparency, post-processing effects.
 */

import * as THREE from 'three'
import { Messenger } from './Messenger.js'

export class Painter {

    constructor(canvas) {
        this.canvas = canvas

        // Create the Three.js renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
        })
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping
        this.renderer.toneMappingExposure = 1.0

        // Post-processing layers (added later)
        this.effects = []

        // Track what needs painting
        this.scene = null
        this.camera = null

        Messenger.say('painter.ready')
    }

    /**
     * Set the scene and camera to paint.
     */
    setView(scene, camera) {
        this.scene = scene
        this.camera = camera
    }

    /**
     * Resize the canvas to fit the screen.
     */
    resize(width, height) {
        this.renderer.setSize(width, height)
        Messenger.say('painter.resized', { width, height })
    }

    /**
     * Paint one frame.
     * Called by Heartbeat every tick.
     */
    paint() {
        if (!this.scene || !this.camera) return
        this.renderer.render(this.scene, this.camera)
    }

    /**
     * Add a post-processing effect.
     */
    addEffect(name, effect) {
        this.effects.push({ name, effect })
    }

    /**
     * Remove a post-processing effect.
     */
    removeEffect(name) {
        this.effects = this.effects.filter(e => e.name !== name)
    }

    /**
     * Clean up GPU resources.
     */
    destroy() {
        this.renderer.dispose()
        Messenger.say('painter.destroyed')
    }
}
