/**
 * Bridge — Network Connections
 *
 * Connects to other devices, servers, and APIs.
 * Handles multiplayer presence, data sync, and
 * latency hiding so everything feels instant.
 */

import { Messenger } from './Messenger.js'

export class Bridge {

    constructor() {
        this.connections = new Map()   // id → connection
        this.peers = new Map()         // peerId → peer info
        this.syncing = false
    }

    /**
     * Connect to a server or peer.
     *
     * @param {string} url  — WebSocket URL or peer address
     * @param {Object} options
     */
    async connect(url, options = {}) {
        const ws = new WebSocket(url)

        return new Promise((resolve, reject) => {
            ws.onopen = () => {
                this.connections.set(url, ws)
                Messenger.say('bridge.connected', { url })
                resolve(ws)
            }

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data)
                Messenger.say(`bridge.message.${message.type}`, message.data)
            }

            ws.onclose = () => {
                this.connections.delete(url)
                Messenger.say('bridge.disconnected', { url })
            }

            ws.onerror = (error) => {
                Messenger.say('bridge.error', { url, error })
                reject(error)
            }
        })
    }

    /**
     * Send data to a specific connection.
     */
    send(url, type, data) {
        const ws = this.connections.get(url)
        if (!ws || ws.readyState !== WebSocket.OPEN) return false

        ws.send(JSON.stringify({ type, data }))
        return true
    }

    /**
     * Broadcast data to all connections.
     */
    broadcast(type, data) {
        for (const [url, ws] of this.connections) {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type, data }))
            }
        }
    }

    /**
     * Disconnect from everything.
     */
    disconnectAll() {
        for (const [url, ws] of this.connections) {
            ws.close()
        }
        this.connections.clear()
        this.peers.clear()
    }

    /**
     * Sync a piece of data across all connections.
     * Uses last-write-wins for simplicity; CRDT support planned.
     */
    sync(key, value) {
        this.broadcast('sync', { key, value, timestamp: Date.now() })
    }
}
