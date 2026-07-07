/**
 * Heartbeat — The Main Loop
 *
 * The eternal cycle that keeps the world alive:
 *   sense → think → act → paint
 *
 * Every frame, in that order. Always.
 */

import { Clock } from './Clock.js'
import { Messenger } from './Messenger.js'

export class Heartbeat {

    constructor() {
        this.running = false
        this.clock = new Clock()
        this.steps = []         // Functions to run each frame
        this.frameId = null
    }

    /**
     * Add a step to the loop.
     * Steps run in the order they are added.
     *
     * @param {string} name    — A human-readable label ("paint", "physics")
     * @param {Function} action — The function to call each frame (receives delta)
     */
    addStep(name, action) {
        this.steps.push({ name, action })
    }

    /**
     * Remove a step by name.
     */
    removeStep(name) {
        this.steps = this.steps.filter(s => s.name !== name)
    }

    /**
     * Start the heartbeat. The world comes alive.
     */
    start() {
        if (this.running) return
        this.running = true
        this.clock.start()
        Messenger.say('heartbeat.started')
        this._tick()
    }

    /**
     * Stop the heartbeat. The world freezes.
     */
    stop() {
        this.running = false
        if (this.frameId) {
            cancelAnimationFrame(this.frameId)
            this.frameId = null
        }
        Messenger.say('heartbeat.stopped')
    }

    /**
     * One single tick — runs all steps in order.
     */
    _tick() {
        if (!this.running) return

        const delta = this.clock.tick()

        for (const step of this.steps) {
            step.action(delta)
        }

        this.frameId = requestAnimationFrame(() => this._tick())
    }
}
