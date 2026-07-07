/**
 * Listener — Central Input Router
 *
 * The grand switchboard. Every input device talks to the Listener,
 * and the Listener translates everything into a common language
 * that the rest of the engine understands.
 *
 * Mouse drags, finger swipes, voice commands, gamepad sticks —
 * they all become the same set of actions:
 *   point, grab, move, zoom, orbit, pan, select, activate
 */

import { Messenger } from '../Foundation/Messenger.js'

export class Listener {

    constructor(canvas) {
        this.canvas = canvas
        this.active = true
        this.handlers = new Map()

        // Which input sources are connected
        this.sources = {
            mouse: false,
            touch: false,
            keyboard: false,
            gamepad: false,
            voice: false,
            streamDeck: false,
        }

        // Bind core DOM events
        this._bindMouse()
        this._bindTouch()
        this._bindKeyboard()
        this._bindGamepad()

        Messenger.say('listener.ready')
    }

    /**
     * Register a handler for an action.
     * Actions: 'point', 'grab', 'release', 'move', 'zoom', 'orbit', 'pan',
     *          'select', 'activate', 'key', 'shortcut'
     */
    on(action, handler) {
        if (!this.handlers.has(action)) this.handlers.set(action, [])
        this.handlers.get(action).push(handler)
    }

    /**
     * Fire an action with data.
     */
    _fire(action, data) {
        if (!this.active) return
        const handlers = this.handlers.get(action) || []
        for (const h of handlers) h(data)
        Messenger.say(`input.${action}`, data)
    }

    // ── Mouse ──────────────────────────

    _bindMouse() {
        const c = this.canvas

        c.addEventListener('mousemove', (e) => {
            this.sources.mouse = true
            this._fire('point', {
                x: e.clientX, y: e.clientY,
                dx: e.movementX, dy: e.movementY,
                source: 'mouse',
            })
        })

        c.addEventListener('mousedown', (e) => {
            this._fire('grab', {
                x: e.clientX, y: e.clientY,
                button: e.button,
                source: 'mouse',
            })
        })

        c.addEventListener('mouseup', (e) => {
            this._fire('release', {
                x: e.clientX, y: e.clientY,
                button: e.button,
                source: 'mouse',
            })
        })

        c.addEventListener('wheel', (e) => {
            e.preventDefault()
            this._fire('zoom', {
                delta: e.deltaY,
                source: 'mouse',
            })
        }, { passive: false })

        c.addEventListener('contextmenu', (e) => e.preventDefault())
    }

    // ── Touch ──────────────────────────

    _bindTouch() {
        const c = this.canvas
        let lastTouchCount = 0
        let lastTouchDistance = 0

        c.addEventListener('touchstart', (e) => {
            this.sources.touch = true
            const t = e.touches[0]
            lastTouchCount = e.touches.length

            if (e.touches.length === 1) {
                this._fire('grab', { x: t.clientX, y: t.clientY, source: 'touch' })
            } else if (e.touches.length === 2) {
                lastTouchDistance = this._touchDistance(e.touches[0], e.touches[1])
            }
        })

        c.addEventListener('touchmove', (e) => {
            e.preventDefault()
            const t = e.touches[0]

            if (e.touches.length === 1) {
                this._fire('point', { x: t.clientX, y: t.clientY, source: 'touch' })
            } else if (e.touches.length === 2) {
                const dist = this._touchDistance(e.touches[0], e.touches[1])
                this._fire('zoom', { delta: (lastTouchDistance - dist) * 2, source: 'touch' })
                lastTouchDistance = dist
            } else if (e.touches.length === 3) {
                this._fire('pan', { dx: t.clientX, dy: t.clientY, source: 'touch' })
            }
        }, { passive: false })

        c.addEventListener('touchend', (e) => {
            this._fire('release', { source: 'touch' })
        })
    }

    _touchDistance(a, b) {
        const dx = a.clientX - b.clientX
        const dy = a.clientY - b.clientY
        return Math.sqrt(dx * dx + dy * dy)
    }

    // ── Keyboard ───────────────────────

    _bindKeyboard() {
        window.addEventListener('keydown', (e) => {
            this.sources.keyboard = true
            this._fire('key', { key: e.key, code: e.code, down: true, source: 'keyboard' })

            // Shortcut detection
            if (e.metaKey || e.ctrlKey) {
                this._fire('shortcut', {
                    combo: `${e.ctrlKey ? 'ctrl+' : ''}${e.metaKey ? 'cmd+' : ''}${e.shiftKey ? 'shift+' : ''}${e.key}`,
                    source: 'keyboard',
                })
            }
        })

        window.addEventListener('keyup', (e) => {
            this._fire('key', { key: e.key, code: e.code, down: false, source: 'keyboard' })
        })
    }

    // ── Gamepad ────────────────────────

    _bindGamepad() {
        window.addEventListener('gamepadconnected', (e) => {
            this.sources.gamepad = true
            Messenger.say('listener.gamepad.connected', { index: e.gamepad.index })
        })
    }

    /**
     * Poll gamepad state (call each frame).
     */
    pollGamepad() {
        const gamepads = navigator.getGamepads()
        for (const gp of gamepads) {
            if (!gp) continue

            // Left stick → point
            const lx = gp.axes[0], ly = gp.axes[1]
            if (Math.abs(lx) > 0.1 || Math.abs(ly) > 0.1) {
                this._fire('point', { dx: lx * 5, dy: ly * 5, source: 'gamepad' })
            }

            // Right stick → orbit
            const rx = gp.axes[2], ry = gp.axes[3]
            if (Math.abs(rx) > 0.1 || Math.abs(ry) > 0.1) {
                this._fire('orbit', { dx: rx * 3, dy: ry * 3, source: 'gamepad' })
            }

            // Triggers → zoom
            const lt = gp.buttons[6]?.value || 0
            const rt = gp.buttons[7]?.value || 0
            if (lt > 0.1 || rt > 0.1) {
                this._fire('zoom', { delta: (lt - rt) * 10, source: 'gamepad' })
            }
        }
    }

    /**
     * Disable all input processing.
     */
    disable() { this.active = false }

    /**
     * Enable input processing.
     */
    enable() { this.active = true }
}
