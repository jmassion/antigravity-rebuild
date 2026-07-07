/**
 * Tools Layer — Panels, Widgets, Gizmos, Inspectors
 *
 * The creation toolkit. 3D panels that float in space.
 * Widgets inside panels. Gizmos on selected Things.
 */

import * as THREE from 'three'
import { Messenger } from '../Foundation/Messenger.js'

// ═══════════════════════════════════════
//  PANEL — Floating 2D Interface in 3D
// ═══════════════════════════════════════

export class Panel {
    constructor(title, options = {}) {
        this.title = title
        this.id = `panel_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
        this.position = options.position || { x: 0, y: 1.5, z: -2 }
        this.size = options.size || { width: 300, height: 400 }
        this.widgets = []
        this.visible = options.visible ?? true
        this.opacity = options.opacity ?? 0.92
        this.pinned = options.pinned || null     // Thing this panel follows
        this.layout = options.layout || 'vertical'
        this.draggable = options.draggable ?? true
        this.resizable = options.resizable ?? true

        // The 3D plane this panel renders to
        this.object3D = this._createPlane()
        this.canvas = this._createCanvas()
        this.ctx = this.canvas.getContext('2d')
    }

    addWidget(widget) {
        widget.panel = this
        this.widgets.push(widget)
        this._redraw()
        return this
    }

    removeWidget(id) {
        this.widgets = this.widgets.filter(w => w.id !== id)
        this._redraw()
    }

    show() { this.visible = true; this.object3D.visible = true }
    hide() { this.visible = false; this.object3D.visible = false }
    toggle() { this.visible ? this.hide() : this.show() }

    pinTo(thing, offset = { x: 1, y: 0.5, z: 0 }) {
        this.pinned = thing
        this._pinOffset = offset
    }

    update() {
        if (this.pinned) {
            const tp = this.pinned.placement.position
            this.object3D.position.set(
                tp.x + this._pinOffset.x,
                tp.y + this._pinOffset.y,
                tp.z + this._pinOffset.z
            )
        }
        this._redraw()
    }

    _createPlane() {
        const geo = new THREE.PlaneGeometry(1.5, 2)
        const mat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.9, side: THREE.DoubleSide })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(this.position.x, this.position.y, this.position.z)
        return mesh
    }

    _createCanvas() {
        const canvas = document.createElement('canvas')
        canvas.width = this.size.width * 2
        canvas.height = this.size.height * 2
        return canvas
    }

    _redraw() {
        const ctx = this.ctx
        const w = this.canvas.width
        const h = this.canvas.height

        // Background
        ctx.clearRect(0, 0, w, h)
        ctx.fillStyle = `rgba(20, 20, 30, ${this.opacity})`
        ctx.beginPath()
        ctx.roundRect(0, 0, w, h, 20)
        ctx.fill()

        // Title bar
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.fillRect(0, 0, w, 60)
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 24px system-ui'
        ctx.fillText(this.title, 20, 40)

        // Widgets
        let y = 80
        for (const widget of this.widgets) {
            widget.draw(ctx, 20, y, w - 40)
            y += widget.height + 10
        }

        // Apply canvas to 3D texture
        const texture = new THREE.CanvasTexture(this.canvas)
        this.object3D.material.map = texture
        this.object3D.material.needsUpdate = true
    }
}

// ═══════════════════════════════════════
//  WIDGET — UI Element Inside a Panel
// ═══════════════════════════════════════

export class Widget {
    constructor(type, label, options = {}) {
        this.type = type
        this.label = label
        this.id = `widget_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
        this.value = options.value ?? null
        this.height = options.height || 40
        this.panel = null
        this.binding = options.binds || null     // Property path to bind to
        this.onChange = options.onChange || null
    }

    draw(ctx, x, y, width) {
        // Override in subclasses
        ctx.fillStyle = '#888'
        ctx.font = '18px system-ui'
        ctx.fillText(this.label, x, y + 25)
    }

    setValue(val) {
        this.value = val
        if (this.onChange) this.onChange(val)
        if (this.binding) {
            Messenger.say('widget.changed', { widget: this.id, binding: this.binding, value: val })
        }
    }
}

export class ButtonWidget extends Widget {
    constructor(label, options = {}) {
        super('button', label, { height: 50, ...options })
        this.onClick = options.onClick || null
    }
    draw(ctx, x, y, width) {
        ctx.fillStyle = 'rgba(80, 120, 255, 0.8)'
        ctx.beginPath()
        ctx.roundRect(x, y, width, this.height, 8)
        ctx.fill()
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 18px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(this.label, x + width / 2, y + 28)
        ctx.textAlign = 'start'
    }
}

export class SliderWidget extends Widget {
    constructor(label, options = {}) {
        super('slider', label, { height: 50, ...options })
        this.min = options.min ?? 0
        this.max = options.max ?? 1
        this.step = options.step ?? 0.01
        this.value = options.value ?? this.min
    }
    draw(ctx, x, y, width) {
        ctx.fillStyle = '#aaa'
        ctx.font = '16px system-ui'
        ctx.fillText(this.label, x, y + 16)
        ctx.fillText(this.value.toFixed(2), x + width - 50, y + 16)
        // Track
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.fillRect(x, y + 28, width, 6)
        // Fill
        const ratio = (this.value - this.min) / (this.max - this.min)
        ctx.fillStyle = '#5078ff'
        ctx.fillRect(x, y + 28, width * ratio, 6)
        // Thumb
        ctx.beginPath()
        ctx.arc(x + width * ratio, y + 31, 8, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()
    }
}

export class ToggleWidget extends Widget {
    constructor(label, options = {}) {
        super('toggle', label, { height: 40, ...options })
        this.value = options.value ?? false
    }
    draw(ctx, x, y, width) {
        ctx.fillStyle = '#aaa'
        ctx.font = '16px system-ui'
        ctx.fillText(this.label, x, y + 25)
        // Toggle track
        const tx = x + width - 60
        ctx.fillStyle = this.value ? '#5078ff' : 'rgba(255,255,255,0.2)'
        ctx.beginPath()
        ctx.roundRect(tx, y + 10, 50, 24, 12)
        ctx.fill()
        // Toggle thumb
        ctx.beginPath()
        ctx.arc(this.value ? tx + 38 : tx + 12, y + 22, 10, 0, Math.PI * 2)
        ctx.fillStyle = '#fff'
        ctx.fill()
    }
}

export class ColorWheelWidget extends Widget {
    constructor(label, options = {}) {
        super('color-wheel', label, { height: 100, ...options })
        this.value = options.value || '#ffffff'
    }
    draw(ctx, x, y, width) {
        ctx.fillStyle = '#aaa'
        ctx.font = '16px system-ui'
        ctx.fillText(this.label, x, y + 16)
        // Color preview swatch
        ctx.fillStyle = this.value
        ctx.beginPath()
        ctx.roundRect(x + width - 40, y, 30, 30, 6)
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.stroke()
    }
}

// ═══════════════════════════════════════
//  GIZMOS — 3D Handle System
// ═══════════════════════════════════════

export class Gizmo {
    constructor(type) {
        this.type = type   // 'move', 'rotate', 'scale', 'bounds'
        this.target = null
        this.visible = false
        this.object3D = new THREE.Group()
    }

    attachTo(thing) {
        this.target = thing
        this.visible = true
        this.object3D.visible = true
        this._build()
        Messenger.say('gizmo.attached', { type: this.type, thing: thing.id })
    }

    detach() {
        this.target = null
        this.visible = false
        this.object3D.visible = false
    }

    update() {
        if (!this.target) return
        this.object3D.position.copy(this.target.placement.position)
    }

    _build() { /* Override in subclasses */ }
}

export class MoveGizmo extends Gizmo {
    constructor() { super('move') }
    _build() {
        // X axis (red)
        this._addArrow(new THREE.Vector3(1, 0, 0), 0xff4444)
        // Y axis (green)
        this._addArrow(new THREE.Vector3(0, 1, 0), 0x44ff44)
        // Z axis (blue)
        this._addArrow(new THREE.Vector3(0, 0, 1), 0x4444ff)
    }
    _addArrow(dir, color) {
        const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(), 1, color, 0.2, 0.1)
        this.object3D.add(arrow)
    }
}

export class RotateGizmo extends Gizmo {
    constructor() { super('rotate') }
    _build() {
        const colors = [0xff4444, 0x44ff44, 0x4444ff]
        const normals = [
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(0, 0, 1),
        ]
        normals.forEach((n, i) => {
            const geo = new THREE.TorusGeometry(1.2, 0.02, 8, 64)
            const mat = new THREE.MeshBasicMaterial({ color: colors[i] })
            const ring = new THREE.Mesh(geo, mat)
            if (i === 0) ring.rotation.y = Math.PI / 2
            if (i === 2) ring.rotation.x = Math.PI / 2
            this.object3D.add(ring)
        })
    }
}

export class ScaleGizmo extends Gizmo {
    constructor() { super('scale') }
    _build() {
        const dirs = [[1, 0, 0, 0xff4444], [0, 1, 0, 0x44ff44], [0, 0, 1, 0x4444ff]]
        dirs.forEach(([x, y, z, color]) => {
            const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1)
            const mat = new THREE.MeshBasicMaterial({ color })
            const cube = new THREE.Mesh(geo, mat)
            cube.position.set(x, y, z)
            this.object3D.add(cube)
            // Line from center to cube
            const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), cube.position])
            const lineMat = new THREE.LineBasicMaterial({ color })
            this.object3D.add(new THREE.Line(lineGeo, lineMat))
        })
    }
}

export class SnapGuides {
    constructor() {
        this.guides = []
        this.active = true
    }

    /**
     * Find alignment guides between a moving Thing and nearby Things.
     */
    findGuides(movingThing, allThings, threshold = 0.1) {
        const guides = []
        const mp = movingThing.placement.position

        for (const thing of allThings) {
            if (thing === movingThing) continue
            const tp = thing.placement.position

            if (Math.abs(mp.x - tp.x) < threshold) guides.push({ axis: 'x', value: tp.x, thing })
            if (Math.abs(mp.y - tp.y) < threshold) guides.push({ axis: 'y', value: tp.y, thing })
            if (Math.abs(mp.z - tp.z) < threshold) guides.push({ axis: 'z', value: tp.z, thing })
        }

        this.guides = guides
        return guides
    }
}

export class SmartSnap {
    /**
     * AI-suggested snapping: surface, edge, center, equidistant.
     */
    suggest(thing, nearbyThings) {
        const suggestions = []

        for (const near of nearbyThings) {
            const dist = thing.placement.distanceTo(near.placement)
            if (dist < 3) {
                suggestions.push({
                    type: 'align',
                    target: near,
                    axis: this._closestAxis(thing, near),
                    distance: dist,
                })
            }
        }

        return suggestions
    }

    _closestAxis(a, b) {
        const d = {
            x: Math.abs(a.placement.position.x - b.placement.position.x),
            y: Math.abs(a.placement.position.y - b.placement.position.y),
            z: Math.abs(a.placement.position.z - b.placement.position.z),
        }
        if (d.x <= d.y && d.x <= d.z) return 'x'
        if (d.y <= d.x && d.y <= d.z) return 'y'
        return 'z'
    }
}

// ═══════════════════════════════════════
//  TOOL BELT — Creation Tools
// ═══════════════════════════════════════

export class Tool {
    constructor(name, icon) {
        this.name = name
        this.icon = icon
        this.active = false
    }
    activate() { this.active = true; Messenger.say('tool.activated', { name: this.name }) }
    deactivate() { this.active = false; Messenger.say('tool.deactivated', { name: this.name }) }
}

export class Selector extends Tool { constructor() { super('selector', '↖') } }
export class Mover extends Tool { constructor() { super('mover', '✥') } }
export class Scaler extends Tool { constructor() { super('scaler', '⤡') } }
export class Rotator extends Tool { constructor() { super('rotator', '↻') } }
export class Painter extends Tool { constructor() { super('painter', '🎨') } }
export class Eraser extends Tool { constructor() { super('eraser', '✕') } }
export class Ruler extends Tool { constructor() { super('ruler', '📏') } }
export class Connector extends Tool { constructor() { super('connector', '⟜') } }
export class Cloner extends Tool { constructor() { super('cloner', '⧉') } }
export class Grouper extends Tool { constructor() { super('grouper', '⊞') } }
export class WishWand extends Tool { constructor() { super('wish-wand', '✨') } }

export class ToolBelt {
    constructor() {
        this.tools = [
            new Selector(), new Mover(), new Scaler(), new Rotator(),
            new Painter(), new Eraser(), new Ruler(), new Connector(),
            new Cloner(), new Grouper(), new WishWand(),
        ]
        this.activeTool = null
    }

    select(name) {
        if (this.activeTool) this.activeTool.deactivate()
        this.activeTool = this.tools.find(t => t.name === name) || null
        if (this.activeTool) this.activeTool.activate()
    }

    list() { return this.tools.map(t => ({ name: t.name, icon: t.icon, active: t.active })) }
}

// ═══════════════════════════════════════
//  PIN — Anchors Panels to Things
// ═══════════════════════════════════════

export class Pin {
    constructor(panel, target, offset = { x: 1, y: 0.5, z: 0 }) {
        this.panel = panel
        this.target = target
        this.offset = offset
        this.showLine = true
        this.alwaysFaceCamera = true
    }

    update(cameraPosition) {
        if (!this.target) return
        const tp = this.target.placement.position
        this.panel.object3D.position.set(
            tp.x + this.offset.x,
            tp.y + this.offset.y,
            tp.z + this.offset.z
        )
        if (this.alwaysFaceCamera && cameraPosition) {
            this.panel.object3D.lookAt(cameraPosition)
        }
    }
}
