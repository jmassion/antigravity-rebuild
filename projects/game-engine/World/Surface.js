/**
 * Surface — How a Thing Looks
 *
 * Color, texture, shininess, transparency, glow.
 * Everything visual about a Thing's appearance.
 */

import * as THREE from 'three'
import { Messenger } from '../Foundation/Messenger.js'

export class Surface {

    /**
     * @param {Object} options
     * @param {string|number} options.color     — Hex color ("#ff5500" or 0xff5500)
     * @param {number} options.roughness        — 0 (mirror) to 1 (matte)
     * @param {number} options.metalness        — 0 (plastic) to 1 (metal)
     * @param {number} options.opacity          — 0 (invisible) to 1 (solid)
     * @param {boolean} options.transparent     — Allow see-through
     * @param {string} options.texture          — URL to a texture image
     * @param {number} options.glow             — Emissive intensity
     * @param {string|number} options.glowColor — Emissive color
     * @param {boolean} options.wireframe       — Show wireframe only
     */
    constructor(options = {}) {
        const {
            color = 0xcccccc,
            roughness = 0.5,
            metalness = 0.0,
            opacity = 1.0,
            transparent = false,
            texture = null,
            glow = 0,
            glowColor = 0xffffff,
            wireframe = false,
        } = options

        this.material = new THREE.MeshStandardMaterial({
            color,
            roughness,
            metalness,
            opacity,
            transparent: transparent || opacity < 1,
            wireframe,
            emissive: glowColor,
            emissiveIntensity: glow,
        })

        this._textureUrl = texture
        if (texture) this._loadTexture(texture)
    }

    /**
     * Change the color.
     */
    setColor(color) {
        this.material.color.set(color)
        return this
    }

    /**
     * Change roughness (0 = mirror, 1 = matte).
     */
    setRoughness(value) {
        this.material.roughness = value
        return this
    }

    /**
     * Change metalness (0 = plastic, 1 = chrome).
     */
    setMetalness(value) {
        this.material.metalness = value
        return this
    }

    /**
     * Set opacity (0 = invisible, 1 = solid).
     */
    setOpacity(value) {
        this.material.opacity = value
        this.material.transparent = value < 1
        return this
    }

    /**
     * Toggle wireframe mode.
     */
    setWireframe(on) {
        this.material.wireframe = on
        return this
    }

    /**
     * Set glow (emissive light).
     */
    setGlow(intensity, color) {
        this.material.emissiveIntensity = intensity
        if (color) this.material.emissive.set(color)
        return this
    }

    /**
     * Load and apply a texture image.
     */
    _loadTexture(url) {
        const loader = new THREE.TextureLoader()
        loader.load(url, (texture) => {
            this.material.map = texture
            this.material.needsUpdate = true
            Messenger.say('surface.texture.loaded', { url })
        })
    }

    /**
     * Create common preset surfaces.
     */
    static wood() { return new Surface({ color: 0x8B6914, roughness: 0.8 }) }
    static metal() { return new Surface({ color: 0xaaaaaa, metalness: 0.9, roughness: 0.2 }) }
    static glass() { return new Surface({ color: 0xffffff, opacity: 0.3, transparent: true, roughness: 0.1 }) }
    static glow(color = 0x00ffff) { return new Surface({ color, glow: 1, glowColor: color }) }
    static wireframe(color = 0x00ff00) { return new Surface({ color, wireframe: true }) }
    static plastic(color = 0xff4444) { return new Surface({ color, roughness: 0.6, metalness: 0.0 }) }
}
