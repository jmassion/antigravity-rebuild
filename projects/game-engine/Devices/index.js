/**
 * Devices Layer — One Engine, Every Screen
 *
 * Detects device capabilities and adapts the experience.
 */

import { Messenger } from '../Foundation/Messenger.js'

export class Adapter {
    constructor() {
        this.profile = this._detect()
        this.capabilities = this._getCaps()
        Messenger.say('device.detected', { profile: this.profile })
    }

    _detect() {
        const w = window.innerWidth
        if (w < 480) return 'phone'
        if (w < 768) return 'phone-large'
        if (w < 1024) return 'tablet'
        if (w < 1440) return 'desktop'
        return 'desktop-large'
    }

    _getCaps() {
        return {
            touch: 'ontouchstart' in window,
            mouse: window.matchMedia('(pointer: fine)').matches,
            keyboard: true,
            speech: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
            gyroscope: 'DeviceOrientationEvent' in window,
            webgpu: !!navigator.gpu,
        }
    }

    recommendedQuality() {
        const map = {
            phone: { quality: 'low', shadows: false, pixelRatio: 1 },
            tablet: { quality: 'medium', shadows: true, pixelRatio: 1.5 },
            desktop: { quality: 'high', shadows: true, pixelRatio: 2 },
        }
        return map[this.profile] || map.desktop
    }

    recommendedLayout() {
        const map = {
            phone: { panels: 'bottom-sheet', tools: 'bottom-bar' },
            tablet: { panels: 'side-slide', tools: 'side-bar' },
            desktop: { panels: 'docked', tools: 'top-bar' },
        }
        return map[this.profile] || map.desktop
    }
}

export class DeviceSync {
    constructor() {
        this.sessionId = null
        this.role = 'primary'
    }
    createSession() {
        this.sessionId = `session_${Date.now()}`
        Messenger.say('device.sync.created', { sessionId: this.sessionId })
        return this.sessionId
    }
    joinSession(id, role = 'companion') {
        this.sessionId = id
        this.role = role
        Messenger.say('device.sync.joined', { sessionId: id, role })
    }
}

export class Accessibility {
    constructor() {
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        this.highContrast = window.matchMedia('(prefers-contrast: high)').matches
        this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
}
