/**
 * Settings — Global Configuration
 *
 * Preferences and configuration for the entire engine.
 * Saved to localStorage so they persist between sessions.
 */

import { Messenger } from './Messenger.js'

const STORAGE_KEY = 'antigravity-settings'

const DEFAULTS = {
    // Visual
    quality: 'high',           // 'low', 'medium', 'high', 'ultra'
    shadows: true,
    antialiasing: true,
    pixelRatio: null,          // null = use device default

    // Audio
    masterVolume: 1.0,
    musicVolume: 0.7,
    soundVolume: 1.0,

    // Controls
    mouseSensitivity: 1.0,
    touchSensitivity: 1.0,
    invertY: false,
    snapToGrid: true,
    gridSize: 0.25,

    // Interface
    theme: 'dark',
    panelOpacity: 0.9,
    showGrid: true,
    showGizmos: true,

    // Memory
    autoSaveInterval: 60,     // seconds
    maxUndoSteps: 200,

    // Accessibility
    reducedMotion: false,
    highContrast: false,
    screenReader: false,
}

export class Settings {

    constructor() {
        this.values = { ...DEFAULTS }
        this._load()
    }

    /**
     * Get a setting value.
     */
    get(key) {
        return this.values[key]
    }

    /**
     * Set a setting value. Auto-saves and notifies.
     */
    set(key, value) {
        const oldValue = this.values[key]
        this.values[key] = value
        this._save()
        Messenger.say('settings.changed', { key, value, oldValue })
    }

    /**
     * Reset all settings to defaults.
     */
    reset() {
        this.values = { ...DEFAULTS }
        this._save()
        Messenger.say('settings.reset')
    }

    /**
     * Get all settings as a plain object.
     */
    getAll() {
        return { ...this.values }
    }

    _save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.values))
        } catch (e) {
            // localStorage not available (e.g. incognito)
        }
    }

    _load() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                this.values = { ...DEFAULTS, ...JSON.parse(stored) }
            }
        } catch (e) {
            // Fallback to defaults
        }
    }
}
