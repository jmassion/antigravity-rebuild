/**
 * Light — A Light Source
 *
 * Sun, lamp, glow, ambient — anything that illuminates.
 */

import * as THREE from 'three'
import { Thing } from './Thing.js'

export class Light extends Thing {

    constructor(name = 'Light', options = {}) {
        super(name)
        this.kind = 'light'

        const {
            type = 'point',
            color = 0xffffff,
            intensity = 1,
            castShadow = true,
        } = options

        this.lightType = type

        switch (type) {
            case 'sun':
            case 'directional':
                this.light = new THREE.DirectionalLight(color, intensity)
                break
            case 'point':
                this.light = new THREE.PointLight(color, intensity, 50)
                break
            case 'spot':
                this.light = new THREE.SpotLight(color, intensity)
                break
            case 'ambient':
                this.light = new THREE.AmbientLight(color, intensity)
                break
            case 'hemisphere':
                this.light = new THREE.HemisphereLight(color, 0x444444, intensity)
                break
            default:
                this.light = new THREE.PointLight(color, intensity)
        }

        if (this.light.castShadow !== undefined) {
            this.light.castShadow = castShadow
        }

        this.object3D.add(this.light)
    }

    setColor(color) { this.light.color.set(color); return this }
    setIntensity(value) { this.light.intensity = value; return this }

    static sun(intensity = 1) { return new Light('Sun', { type: 'sun', intensity }) }
    static lamp(intensity = 1) { return new Light('Lamp', { type: 'point', intensity }) }
    static spot(intensity = 1) { return new Light('Spot', { type: 'spot', intensity }) }
    static ambient(intensity = 0.4) { return new Light('Ambient', { type: 'ambient', intensity }) }
    static sky() { return new Light('Sky', { type: 'hemisphere', intensity: 0.6 }) }
}
