/**
 * Messenger — The Event Bus
 *
 * Anything can talk to anything. No direct dependencies.
 * One module says something, any module listening hears it.
 *
 *   Messenger.say("thing.moved", { thing, position })
 *   Messenger.hear("thing.moved", (data) => { ... })
 *
 * It's that simple.
 */

const listeners = new Map()

export const Messenger = {

    /**
     * Say something. Anyone listening will hear it.
     *
     * @param {string} topic — What happened ("thing.moved", "wish.granted")
     * @param {*} data       — Any data to pass along
     */
    say(topic, data = null) {
        const handlers = listeners.get(topic)
        if (!handlers) return

        for (const handler of handlers) {
            try {
                handler(data)
            } catch (error) {
                console.warn(`[Messenger] Error in handler for "${topic}":`, error)
            }
        }
    },

    /**
     * Listen for a topic. Returns an unsubscribe function.
     *
     * @param {string} topic      — What to listen for
     * @param {Function} handler  — What to do when it's heard
     * @returns {Function}        — Call this to stop listening
     */
    hear(topic, handler) {
        if (!listeners.has(topic)) {
            listeners.set(topic, new Set())
        }
        listeners.get(topic).add(handler)

        // Return an unsubscribe function
        return () => {
            const handlers = listeners.get(topic)
            if (handlers) {
                handlers.delete(handler)
                if (handlers.size === 0) listeners.delete(topic)
            }
        }
    },

    /**
     * Listen for a topic only once. Auto-unsubscribes after first call.
     */
    hearOnce(topic, handler) {
        const unsubscribe = this.hear(topic, (data) => {
            unsubscribe()
            handler(data)
        })
        return unsubscribe
    },

    /**
     * Stop all listeners for a topic.
     */
    silence(topic) {
        listeners.delete(topic)
    },

    /**
     * Stop ALL listeners. Nuclear option.
     */
    silenceAll() {
        listeners.clear()
    },

    /**
     * See what topics have listeners (for debugging).
     */
    topics() {
        return [...listeners.keys()]
    }
}
