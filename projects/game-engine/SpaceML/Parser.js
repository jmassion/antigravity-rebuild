/**
 * SpaceML — 3D Markup Language Parser
 *
 * Reads .space files (indentation-based, plain English)
 * and creates a fully populated Space with Things.
 *
 * Example:
 *   space "My Room"
 *     sky: warm-sunset
 *     thing "Chair"
 *       shape: box
 *       surface: oak-wood
 */

import { Messenger } from '../Foundation/Messenger.js'
import { Space } from '../World/Space.js'
import { Thing } from '../World/Thing.js'
import { Shape } from '../World/Shape.js'
import { Surface } from '../World/Surface.js'
import { Light } from '../World/Light.js'
import { Portal } from '../World/Portal.js'
import { Skybox } from '../World/Skybox.js'

export class Parser {

    /**
     * Parse a SpaceML string into a Space.
     */
    parse(source) {
        const lines = source.split('\n')
        const tokens = this._tokenize(lines)
        return this._buildSpace(tokens)
    }

    /**
     * Load and parse a .space file.
     */
    async loadFile(url) {
        const response = await fetch(url)
        const text = await response.text()
        return this.parse(text)
    }

    _tokenize(lines) {
        const tokens = []
        for (let i = 0; i < lines.length; i++) {
            const raw = lines[i]
            if (!raw.trim() || raw.trim().startsWith('//')) continue

            const indent = raw.length - raw.trimStart().length
            const content = raw.trim()
            tokens.push({ line: i + 1, indent, content })
        }
        return tokens
    }

    _buildSpace(tokens) {
        if (tokens.length === 0) return new Space()

        const first = tokens[0]
        const spaceMatch = first.content.match(/^space\s+"(.+)"/)
        const spaceName = spaceMatch ? spaceMatch[1] : 'Untitled'
        const space = new Space(spaceName)

        const rootIndent = first.indent
        let i = 1

        while (i < tokens.length) {
            const token = tokens[i]

            // Property of the space
            if (token.content.includes(':') && !token.content.startsWith('thing') && !token.content.startsWith('light') && !token.content.startsWith('portal')) {
                this._applyProperty(space, token.content)
                i++
                continue
            }

            // Thing definition
            if (token.content.startsWith('thing ')) {
                const result = this._parseThing(tokens, i)
                space.add(result.thing)
                i = result.nextIndex
                continue
            }

            // Light definition
            if (token.content.startsWith('light ')) {
                const result = this._parseLight(tokens, i)
                space.add(result.light)
                i = result.nextIndex
                continue
            }

            // Portal definition
            if (token.content.startsWith('portal ')) {
                const result = this._parsePortal(tokens, i)
                space.add(result.portal)
                i = result.nextIndex
                continue
            }

            i++
        }

        Messenger.say('spaceml.parsed', { name: spaceName, things: space.things.size })
        return space
    }

    _parseThing(tokens, startIndex) {
        const token = tokens[startIndex]
        const nameMatch = token.content.match(/thing\s+"(.+)"/)
        const name = nameMatch ? nameMatch[1] : 'Unnamed'
        const thing = new Thing(name)
        const baseIndent = token.indent

        let i = startIndex + 1
        while (i < tokens.length && tokens[i].indent > baseIndent) {
            const t = tokens[i]

            // Nested thing
            if (t.content.startsWith('thing ')) {
                const result = this._parseThing(tokens, i)
                thing.addChild(result.thing)
                i = result.nextIndex
                continue
            }

            // Property
            if (t.content.includes(':')) {
                this._applyThingProperty(thing, t.content)
            }

            i++
        }

        return { thing, nextIndex: i }
    }

    _parseLight(tokens, startIndex) {
        const token = tokens[startIndex]
        const nameMatch = token.content.match(/light\s+"(.+)"/)
        const name = nameMatch ? nameMatch[1] : 'Light'
        const options = {}
        const baseIndent = token.indent

        let i = startIndex + 1
        while (i < tokens.length && tokens[i].indent > baseIndent) {
            const [key, val] = tokens[i].content.split(':').map(s => s.trim())
            if (key === 'kind') options.type = val
            if (key === 'color') options.color = val
            if (key === 'brightness') options.intensity = parseFloat(val)
            i++
        }

        return { light: new Light(name, options), nextIndex: i }
    }

    _parsePortal(tokens, startIndex) {
        const token = tokens[startIndex]
        const nameMatch = token.content.match(/portal\s+"(.+)"/)
        const name = nameMatch ? nameMatch[1] : 'Portal'
        const options = {}
        const baseIndent = token.indent

        let i = startIndex + 1
        while (i < tokens.length && tokens[i].indent > baseIndent) {
            const [key, val] = tokens[i].content.split(':').map(s => s.trim())
            if (key === 'leads-to') options.to = val
            if (key === 'frame') options.frame = val
            if (key === 'preview') options.preview = val === 'on'
            i++
        }

        return { portal: new Portal(name, options), nextIndex: i }
    }

    _applyProperty(space, line) {
        const [key, val] = line.split(':').map(s => s.trim())
        if (key === 'sky') {
            const skybox = new Skybox(val)
            skybox.applyTo(space.scene)
        }
        if (key === 'gravity') {
            const presets = { earth: { x: 0, y: -9.8, z: 0 }, moon: { x: 0, y: -1.6, z: 0 }, zero: { x: 0, y: 0, z: 0 } }
            space.gravity = presets[val] || space.gravity
        }
    }

    _applyThingProperty(thing, line) {
        const [key, val] = line.split(':').map(s => s.trim())
        const shapes = { box: Shape.box, sphere: Shape.sphere, cylinder: Shape.cylinder, cone: Shape.cone, plane: Shape.plane, torus: Shape.torus, capsule: Shape.capsule }

        switch (key) {
            case 'shape':
                if (shapes[val]) thing.setShape(shapes[val]())
                break
            case 'surface':
                const presets = { 'oak-wood': Surface.wood, metal: Surface.metal, glass: Surface.glass }
                thing.setSurface(presets[val] ? presets[val]() : new Surface({ color: val }))
                break
            case 'position':
                const parts = val.split(',').map(s => parseFloat(s.trim()))
                if (parts.length === 3) thing.moveTo(parts[0], parts[1], parts[2])
                break
            case 'tags':
                thing.tags = val.split(',').map(s => s.trim())
                break
        }
    }
}

/**
 * Writer — Serialize a Space back to SpaceML.
 */
export class Writer {
    write(space) {
        let out = `space "${space.name}"\n`

        for (const thing of space.things.values()) {
            out += this._writeThing(thing, 2)
        }

        return out
    }

    _writeThing(thing, indent) {
        const pad = ' '.repeat(indent)
        let out = `${pad}thing "${thing.name}"\n`

        const p = thing.placement.position
        if (p.x || p.y || p.z) {
            out += `${pad}  position: ${p.x}, ${p.y}, ${p.z}\n`
        }

        if (thing.tags.length) {
            out += `${pad}  tags: ${thing.tags.join(', ')}\n`
        }

        for (const child of thing.children) {
            out += this._writeThing(child, indent + 2)
        }

        return out
    }
}
