/**
 * Speaker — Spatial Audio Engine
 *
 * Sounds exist IN the space. Footsteps behind you
 * sound behind you. A waterfall to your left fills
 * your left ear.
 *
 * Uses the Web Audio API for 3D positional audio.
 */

import { Messenger } from './Messenger.js'

export class Speaker {

    constructor() {
        this.context = null      // AudioContext (created on first interaction)
        this.listener = null     // The "ear" — follows the camera
        this.sounds = new Map()  // name → sound source
        this.muted = false
        this.volume = 1.0
    }

    /**
     * Wake up the audio system.
     * Must be called after a user gesture (browser policy).
     */
    async wake() {
        if (this.context) return

        this.context = new AudioContext()
        this.listener = this.context.listener
        this.masterGain = this.context.createGain()
        this.masterGain.connect(this.context.destination)
        this.masterGain.gain.value = this.volume

        Messenger.say('speaker.ready')
    }

    /**
     * Play a sound at a position in the world.
     *
     * @param {string} name       — Identifier for this sound
     * @param {string|AudioBuffer} source — URL or pre-loaded buffer
     * @param {Object} options
     * @param {Object} options.position — {x, y, z} where in the world
     * @param {boolean} options.loop    — Whether to repeat
     * @param {number} options.volume   — 0 to 1
     */
    async play(name, source, options = {}) {
        if (!this.context) await this.wake()

        const { position, loop = false, volume = 1.0 } = options

        // Load the audio if it's a URL
        let buffer = source
        if (typeof source === 'string') {
            const response = await fetch(source)
            const data = await response.arrayBuffer()
            buffer = await this.context.decodeAudioData(data)
        }

        // Create the audio graph
        const sourceNode = this.context.createBufferSource()
        sourceNode.buffer = buffer
        sourceNode.loop = loop

        const gainNode = this.context.createGain()
        gainNode.gain.value = volume

        // If position is given, make it spatial
        if (position) {
            const panner = this.context.createPanner()
            panner.positionX.value = position.x || 0
            panner.positionY.value = position.y || 0
            panner.positionZ.value = position.z || 0
            panner.distanceModel = 'inverse'
            panner.refDistance = 1
            panner.maxDistance = 100

            sourceNode.connect(gainNode)
            gainNode.connect(panner)
            panner.connect(this.masterGain)
        } else {
            sourceNode.connect(gainNode)
            gainNode.connect(this.masterGain)
        }

        sourceNode.start()
        this.sounds.set(name, { sourceNode, gainNode })

        Messenger.say('speaker.playing', { name })
    }

    /**
     * Stop a named sound.
     */
    stop(name) {
        const sound = this.sounds.get(name)
        if (sound) {
            sound.sourceNode.stop()
            this.sounds.delete(name)
            Messenger.say('speaker.stopped', { name })
        }
    }

    /**
     * Mute / unmute all sounds.
     */
    toggleMute() {
        this.muted = !this.muted
        this.masterGain.gain.value = this.muted ? 0 : this.volume
    }

    /**
     * Update the listener position (follows the camera).
     */
    updateListenerPosition(position, forward, up) {
        if (!this.listener) return
        this.listener.positionX.value = position.x
        this.listener.positionY.value = position.y
        this.listener.positionZ.value = position.z
        this.listener.forwardX.value = forward.x
        this.listener.forwardY.value = forward.y
        this.listener.forwardZ.value = forward.z
        this.listener.upX.value = up.x
        this.listener.upY.value = up.y
        this.listener.upZ.value = up.z
    }
}
