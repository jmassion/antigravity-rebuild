/**
 * Library — Asset Storage and Retrieval
 *
 * Where all reusable assets live: models, textures,
 * sounds, templates. Load once, use everywhere.
 */

import * as THREE from 'three'
import { Messenger } from '../Foundation/Messenger.js'

export class Library {

    constructor() {
        this.assets = new Map()      // key → asset
        this.loading = new Map()     // key → Promise
        this.textureLoader = new THREE.TextureLoader()
    }

    /**
     * Store an asset for later use.
     */
    store(key, asset) {
        this.assets.set(key, asset)
        Messenger.say('library.stored', { key })
    }

    /**
     * Retrieve a stored asset.
     */
    get(key) {
        return this.assets.get(key) || null
    }

    /**
     * Check if an asset exists.
     */
    has(key) {
        return this.assets.has(key)
    }

    /**
     * Load a texture and store it.
     */
    async loadTexture(key, url) {
        if (this.assets.has(key)) return this.assets.get(key)
        if (this.loading.has(key)) return this.loading.get(key)

        const promise = new Promise((resolve, reject) => {
            this.textureLoader.load(url, (texture) => {
                this.assets.set(key, texture)
                this.loading.delete(key)
                Messenger.say('library.loaded', { key, type: 'texture' })
                resolve(texture)
            }, undefined, reject)
        })

        this.loading.set(key, promise)
        return promise
    }

    /**
     * Load a 3D model (GLTF).
     * Requires GLTFLoader to be imported separately.
     */
    async loadModel(key, url) {
        if (this.assets.has(key)) return this.assets.get(key)

        Messenger.say('library.loading', { key, type: 'model', url })
        // GLTFLoader integration point — implemented in Import layer
        return null
    }

    /**
     * Load audio and store the buffer.
     */
    async loadAudio(key, url) {
        if (this.assets.has(key)) return this.assets.get(key)

        const response = await fetch(url)
        const buffer = await response.arrayBuffer()
        this.assets.set(key, buffer)
        Messenger.say('library.loaded', { key, type: 'audio' })
        return buffer
    }

    /**
     * List all stored asset keys.
     */
    list() {
        return [...this.assets.keys()]
    }

    /**
     * Remove an asset and free its memory.
     */
    remove(key) {
        const asset = this.assets.get(key)
        if (asset?.dispose) asset.dispose()
        this.assets.delete(key)
    }

    /**
     * Clear everything.
     */
    clear() {
        for (const [key, asset] of this.assets) {
            if (asset?.dispose) asset.dispose()
        }
        this.assets.clear()
    }
}
