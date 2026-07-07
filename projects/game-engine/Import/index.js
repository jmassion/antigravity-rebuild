/**
 * Import Layer — Bringing Old Content to Life
 *
 * Load spreadsheets, 3D models, images, videos, audio,
 * documents, and web pages into the 3D world.
 */

import { Messenger } from '../Foundation/Messenger.js'
import { Thing } from '../World/Thing.js'
import { Shape } from '../World/Shape.js'
import { Surface } from '../World/Surface.js'

// ── Loader ────────────────────────────

/**
 * Central import orchestrator.
 */
export class Loader {

    constructor(space, library) {
        this.space = space
        this.library = library
        this.formats = new Map()

        // Register default format handlers
        this.register('csv', SpreadsheetFormat)
        this.register('xlsx', SpreadsheetFormat)
        this.register('json', JSONFormat)
        this.register('obj', Model3DFormat)
        this.register('gltf', Model3DFormat)
        this.register('glb', Model3DFormat)
        this.register('fbx', Model3DFormat)
        this.register('png', ImageFormat)
        this.register('jpg', ImageFormat)
        this.register('jpeg', ImageFormat)
        this.register('svg', ImageFormat)
        this.register('mp4', VideoFormat)
        this.register('webm', VideoFormat)
        this.register('mp3', AudioFormat)
        this.register('wav', AudioFormat)
        this.register('ogg', AudioFormat)
    }

    /**
     * Register a format handler.
     */
    register(extension, handler) {
        this.formats.set(extension, handler)
    }

    /**
     * Import a file by URL or path.
     */
    async load(url, options = {}) {
        const ext = url.split('.').pop().toLowerCase()
        const Handler = this.formats.get(ext)

        if (!Handler) {
            Messenger.say('import.error', { url, error: `Unknown format: .${ext}` })
            return null
        }

        Messenger.say('import.started', { url, format: ext })

        try {
            const handler = new Handler()
            const result = await handler.load(url, options)
            Messenger.say('import.complete', { url, format: ext })
            return result
        } catch (error) {
            Messenger.say('import.error', { url, error: error.message })
            return null
        }
    }

    /**
     * Preview a file before importing.
     */
    async preview(url) {
        const ext = url.split('.').pop().toLowerCase()
        return { url, format: ext, supported: this.formats.has(ext) }
    }
}

// ── Format Handlers ───────────────────

class FormatHandler {
    async load(url, options) { throw new Error('Not implemented') }
}

/**
 * Spreadsheet — CSV, XLSX → data objects
 */
class SpreadsheetFormat extends FormatHandler {
    async load(url, options = {}) {
        const response = await fetch(url)
        const text = await response.text()

        // Parse CSV
        const lines = text.split('\n').filter(l => l.trim())
        const headers = lines[0].split(',').map(h => h.trim())
        const rows = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim())
            const row = {}
            headers.forEach((h, i) => { row[h] = values[i] })
            return row
        })

        Messenger.say('import.spreadsheet.parsed', { headers, rowCount: rows.length })
        return { type: 'spreadsheet', headers, rows }
    }
}

/**
 * Model3D — OBJ, GLTF, FBX → 3D geometry
 */
class Model3DFormat extends FormatHandler {
    async load(url, options = {}) {
        // Three.js loaders would be used here
        // GLTFLoader, OBJLoader, FBXLoader
        Messenger.say('import.model.loading', { url })
        return { type: 'model', url, loaded: false, note: 'Requires Three.js loader integration' }
    }
}

/**
 * Image — PNG, JPG, SVG → texture or flat plane
 */
class ImageFormat extends FormatHandler {
    async load(url, options = {}) {
        return new Promise((resolve) => {
            const img = new Image()
            img.onload = () => {
                const thing = new Thing(url.split('/').pop())
                const aspect = img.width / img.height
                thing.setShape(Shape.plane(aspect, 1))
                thing.setSurface(new Surface({ texture: url }))
                resolve({ type: 'image', thing, width: img.width, height: img.height })
            }
            img.src = url
        })
    }
}

/**
 * Video — MP4, WebM → video texture
 */
class VideoFormat extends FormatHandler {
    async load(url, options = {}) {
        const video = document.createElement('video')
        video.src = url
        video.loop = options.loop ?? true
        video.muted = options.muted ?? true
        return { type: 'video', url, element: video }
    }
}

/**
 * Audio — MP3, WAV → sound source
 */
class AudioFormat extends FormatHandler {
    async load(url, options = {}) {
        const response = await fetch(url)
        const buffer = await response.arrayBuffer()
        return { type: 'audio', url, buffer }
    }
}

/**
 * JSON — structured data
 */
class JSONFormat extends FormatHandler {
    async load(url, options = {}) {
        const response = await fetch(url)
        const data = await response.json()
        return { type: 'json', url, data }
    }
}

// ── Mapper ────────────────────────────

/**
 * Maps data fields to Thing properties.
 * Turns spreadsheet data into living 3D interfaces.
 */
export class Mapper {

    constructor(space) {
        this.space = space
    }

    /**
     * Map spreadsheet data to Things.
     *
     * @param {Object} spreadsheet   — { headers, rows }
     * @param {Object} mapping       — { columnName: 'thing.property.path' }
     * @param {Object} layout        — How to arrange the Things
     */
    mapToThings(spreadsheet, mapping, layout = {}) {
        const things = []
        const { rows } = spreadsheet
        const spacing = layout.spacing || 2

        rows.forEach((row, index) => {
            const thing = new Thing(row[mapping.name] || `Row ${index}`)

            // Apply mappings
            for (const [column, target] of Object.entries(mapping)) {
                const value = row[column]
                if (!value) continue

                switch (target) {
                    case 'name':
                        thing.name = value
                        break
                    case 'height':
                        thing.setShape(Shape.box(0.8, parseFloat(value) / 1000 || 1, 0.8))
                        break
                    case 'color':
                        thing.setSurface(new Surface({ color: this._parseColor(value) }))
                        break
                    case 'data':
                    default:
                        thing.bindData(column, value)
                }
            }

            // Default shape if none set
            if (!thing.shape) {
                thing.setShape(Shape.box())
                thing.setSurface(new Surface({ color: 0x5078ff }))
            }

            // Layout
            const col = index % (layout.columns || 5)
            const row_ = Math.floor(index / (layout.columns || 5))
            thing.moveTo(col * spacing, 0, row_ * spacing)

            this.space.add(thing)
            things.push(thing)
        })

        Messenger.say('import.mapped', { count: things.length })
        return things
    }

    _parseColor(value) {
        const colorNames = { red: 0xff4444, blue: 0x4488ff, green: 0x44ff44, yellow: 0xffff44 }
        return colorNames[value.toLowerCase()] || parseInt(value.replace('#', '0x')) || 0xcccccc
    }
}
