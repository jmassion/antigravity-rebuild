/**
 * Shape — The Geometry of a Thing
 *
 * What something IS physically: a box, a sphere, a loaded model.
 * Pure geometry — no color, no texture (that's Surface's job).
 */

import * as THREE from 'three'

export class Shape {

    constructor(geometry) {
        this.geometry = geometry
    }

    // ──────────────────────────────────────
    //  Built-in Primitives
    // ──────────────────────────────────────

    static box(width = 1, height = 1, depth = 1) {
        return new Shape(new THREE.BoxGeometry(width, height, depth))
    }

    static sphere(radius = 0.5, detail = 32) {
        return new Shape(new THREE.SphereGeometry(radius, detail, detail))
    }

    static cylinder(radiusTop = 0.5, radiusBottom = 0.5, height = 1, segments = 32) {
        return new Shape(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments))
    }

    static cone(radius = 0.5, height = 1, segments = 32) {
        return new Shape(new THREE.ConeGeometry(radius, height, segments))
    }

    static plane(width = 1, height = 1) {
        return new Shape(new THREE.PlaneGeometry(width, height))
    }

    static torus(radius = 0.5, tube = 0.15, segments = 32, tubeSegments = 16) {
        return new Shape(new THREE.TorusGeometry(radius, tube, tubeSegments, segments))
    }

    static capsule(radius = 0.25, length = 1, capSegments = 10, radialSegments = 20) {
        return new Shape(new THREE.CapsuleGeometry(radius, length, capSegments, radialSegments))
    }

    static wedge(width = 1, height = 1, depth = 1) {
        // A triangular prism — custom buffer geometry
        const geometry = new THREE.BufferGeometry()
        const vertices = new Float32Array([
            // Front face (triangle)
            0, 0, depth / 2,
            width, 0, depth / 2,
            0, height, depth / 2,
            // Back face (triangle)
            0, 0, -depth / 2,
            0, height, -depth / 2,
            width, 0, -depth / 2,
            // Bottom face
            0, 0, -depth / 2,
            width, 0, -depth / 2,
            width, 0, depth / 2,
            0, 0, -depth / 2,
            width, 0, depth / 2,
            0, 0, depth / 2,
            // Left face
            0, 0, -depth / 2,
            0, 0, depth / 2,
            0, height, depth / 2,
            0, 0, -depth / 2,
            0, height, depth / 2,
            0, height, -depth / 2,
            // Hypotenuse face
            width, 0, depth / 2,
            width, 0, -depth / 2,
            0, height, -depth / 2,
            width, 0, depth / 2,
            0, height, -depth / 2,
            0, height, depth / 2,
        ])
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
        geometry.computeVertexNormals()
        return new Shape(geometry)
    }

    static tube(path, radius = 0.1, segments = 64, radialSegments = 8) {
        // Path should be a THREE.Curve
        return new Shape(new THREE.TubeGeometry(path, segments, radius, radialSegments, false))
    }

    static text3D(text, options = {}) {
        // Placeholder — requires font loading
        // Returns a plane with the text for now
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = 512
        canvas.height = 128
        ctx.fillStyle = '#ffffff'
        ctx.font = `${options.size || 48}px ${options.font || 'sans-serif'}`
        ctx.fillText(text, 10, 80)
        const texture = new THREE.CanvasTexture(canvas)
        const geometry = new THREE.PlaneGeometry(
            (text.length * 0.3) || 2,
            0.5
        )
        const shape = new Shape(geometry)
        shape._textTexture = texture
        return shape
    }

    /**
     * Compute bounding box for sizing calculations.
     */
    getBounds() {
        this.geometry.computeBoundingBox()
        return this.geometry.boundingBox
    }

    /**
     * Clean up GPU memory.
     */
    dispose() {
        this.geometry.dispose()
    }
}
