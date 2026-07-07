/**
 * Clock — Time Keeper
 *
 * Knows what time it is in the world.
 * Tracks frame timing, delta time, elapsed time.
 * Can be slowed, paused, or rewound.
 */

export class Clock {

    constructor() {
        this.startTime = 0
        this.lastTime = 0
        this.elapsed = 0        // Total seconds since start
        this.delta = 0           // Seconds since last tick
        this.frame = 0           // Frame counter
        this.speed = 1.0         // Time multiplier (0.5 = slow-mo, 2 = fast)
        this.paused = false
    }

    /**
     * Start the clock.
     */
    start() {
        this.startTime = performance.now() / 1000
        this.lastTime = this.startTime
        this.elapsed = 0
        this.frame = 0
    }

    /**
     * Tick the clock. Returns delta time (in seconds).
     * Called once per frame by Heartbeat.
     */
    tick() {
        if (this.paused) {
            this.delta = 0
            return 0
        }

        const now = performance.now() / 1000
        const rawDelta = now - this.lastTime
        this.lastTime = now

        // Apply speed multiplier
        this.delta = rawDelta * this.speed

        // Cap delta to prevent spiral of death
        if (this.delta > 0.1) this.delta = 0.1

        this.elapsed += this.delta
        this.frame++

        return this.delta
    }

    /**
     * Pause time. Everything freezes.
     */
    pause() {
        this.paused = true
    }

    /**
     * Resume time.
     */
    resume() {
        this.paused = false
        this.lastTime = performance.now() / 1000
    }

    /**
     * Set the speed of time.
     * 1.0 = normal, 0.5 = half speed, 2.0 = double speed
     */
    setSpeed(multiplier) {
        this.speed = Math.max(0, multiplier)
    }

    /**
     * Get frames per second (averaged over recent frames).
     */
    get fps() {
        return this.delta > 0 ? Math.round(1 / this.delta) : 0
    }
}
