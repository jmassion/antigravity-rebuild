/**
 * Skybox — The Sky Around You
 *
 * What wraps the world: a sky, a void, stars, a nebula,
 * a room, or anything else. Sets the ambient mood.
 */

import * as THREE from 'three'
import { Messenger } from '../Foundation/Messenger.js'

export class Skybox {

    constructor(type = 'void') {
        this.type = type
        this.scene = null
    }

    /**
     * Apply this Skybox to a Three.js scene.
     */
    applyTo(scene) {
        this.scene = scene

        switch (this.type) {
            case 'void':
                scene.background = new THREE.Color(0x111111)
                break
            case 'white-void':
                scene.background = new THREE.Color(0xf5f5f5)
                break
            case 'warm-sunset':
                scene.background = this._gradient(0xff7b54, 0x282040)
                break
            case 'night-sky':
                scene.background = new THREE.Color(0x0a0a2e)
                break
            case 'deep-space':
                scene.background = new THREE.Color(0x000005)
                break
            case 'overcast':
                scene.background = new THREE.Color(0xb0b0b0)
                break
            default:
                // If it's a hex color, use it directly
                if (typeof this.type === 'number' || this.type.startsWith('#')) {
                    scene.background = new THREE.Color(this.type)
                }
        }

        Messenger.say('skybox.applied', { type: this.type })
    }

    /**
     * Load a cubemap skybox from 6 image URLs.
     */
    static fromImages(urls) {
        const loader = new THREE.CubeTextureLoader()
        const skybox = new Skybox('custom')
        skybox._cubeTexture = loader.load(urls)
        skybox.applyTo = (scene) => {
            scene.background = skybox._cubeTexture
        }
        return skybox
    }

    /**
     * Load an HDR environment map.
     */
    static fromHDR(url) {
        const skybox = new Skybox('hdr')
        skybox._hdrUrl = url
        // HDR loading requires RGBELoader — set up when applied
        return skybox
    }

    /**
     * Create a simple gradient background.
     */
    _gradient(topColor, bottomColor) {
        // Simple fallback — use top color
        // Full gradient requires a shader material on a sphere
        return new THREE.Color(topColor)
    }

    /**
     * Preset skybox types.
     */
    static presets = [
        'void', 'white-void', 'warm-sunset', 'night-sky',
        'deep-space', 'overcast',
    ]
}
