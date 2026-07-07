/**
 * Screen — Display Management
 *
 * Knows about the display: resolution, DPI, fullscreen,
 * window size, orientation. Tells the Painter when to resize.
 */

import { Messenger } from './Messenger.js'

export class Screen {

    constructor(canvas) {
        this.canvas = canvas
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = window.devicePixelRatio || 1
        this.isFullscreen = false
        this.orientation = this._detectOrientation()

        // Listen for changes
        window.addEventListener('resize', () => this._onResize())

        if (screen.orientation) {
            screen.orientation.addEventListener('change', () => {
                this.orientation = this._detectOrientation()
                Messenger.say('screen.orientation', { orientation: this.orientation })
            })
        }
    }

    /**
     * Get the current display info.
     */
    get info() {
        return {
            width: this.width,
            height: this.height,
            pixelRatio: this.pixelRatio,
            orientation: this.orientation,
            isFullscreen: this.isFullscreen,
            aspect: this.width / this.height,
        }
    }

    /**
     * Enter fullscreen mode.
     */
    async goFullscreen() {
        try {
            await this.canvas.requestFullscreen()
            this.isFullscreen = true
            Messenger.say('screen.fullscreen', { on: true })
        } catch (e) {
            console.warn('[Screen] Fullscreen not available:', e)
        }
    }

    /**
     * Exit fullscreen mode.
     */
    async exitFullscreen() {
        if (document.fullscreenElement) {
            await document.exitFullscreen()
            this.isFullscreen = false
            Messenger.say('screen.fullscreen', { on: false })
        }
    }

    _onResize() {
        this.width = window.innerWidth
        this.height = window.innerHeight
        Messenger.say('screen.resized', { width: this.width, height: this.height })
    }

    _detectOrientation() {
        if (this.width > this.height) return 'landscape'
        if (this.height > this.width) return 'portrait'
        return 'square'
    }
}
