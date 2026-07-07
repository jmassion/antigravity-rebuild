/**
 * Voice/Intent — Natural Language → Action
 *
 * Translates spoken sentences into engine actions.
 * "Create a red chair" → { action: 'create', thing: 'chair', color: 'red' }
 */

import { Messenger } from '../../Foundation/Messenger.js'

export class Intent {

    constructor() {
        this.patterns = []
        this._registerDefaults()

        // Listen for voice input
        Messenger.hear('voice.heard', ({ text, isFinal }) => {
            if (isFinal) this.parse(text)
        })
    }

    /**
     * Parse a sentence into an intent + parameters.
     */
    parse(sentence) {
        const lower = sentence.toLowerCase().trim()

        for (const pattern of this.patterns) {
            const match = lower.match(pattern.regex)
            if (match) {
                const intent = { action: pattern.action, params: pattern.extract(match), raw: sentence }
                Messenger.say('intent.recognized', intent)
                return intent
            }
        }

        // No pattern matched — send as raw wish
        const intent = { action: 'wish', params: { text: sentence }, raw: sentence }
        Messenger.say('intent.recognized', intent)
        return intent
    }

    /**
     * Register a new pattern.
     */
    addPattern(regex, action, extract) {
        this.patterns.push({ regex, action, extract })
    }

    _registerDefaults() {
        this.addPattern(
            /^(?:create|make|add|spawn)\s+(?:a\s+)?(.+)/,
            'create', (m) => ({ description: m[1] })
        )

        this.addPattern(
            /^(?:delete|remove|destroy|erase)\s+(?:the\s+)?(.+)/,
            'delete', (m) => ({ target: m[1] })
        )

        this.addPattern(
            /^(?:move|put|place)\s+(?:the\s+)?(.+?)\s+(?:to|on|at|near)\s+(.+)/,
            'move', (m) => ({ target: m[1], destination: m[2] })
        )

        this.addPattern(
            /^(?:go|travel|teleport)\s+(?:to\s+)?(.+)/,
            'go', (m) => ({ destination: m[1] })
        )

        this.addPattern(
            /^(?:undo|go back|reverse)/,
            'undo', () => ({})
        )

        this.addPattern(
            /^(?:redo|go forward)/,
            'redo', () => ({})
        )

        this.addPattern(
            /^(?:save|bookmark)\s*(?:as\s+)?(.+)?/,
            'bookmark', (m) => ({ name: m[1] || 'unnamed' })
        )

        this.addPattern(
            /^(?:select|pick)\s+(?:the\s+)?(.+)/,
            'select', (m) => ({ target: m[1] })
        )

        this.addPattern(
            /^(?:color|paint)\s+(?:it\s+)?(.+)/,
            'paint', (m) => ({ color: m[1] })
        )

        this.addPattern(
            /^(?:scale|resize|make)\s+(?:it\s+)?(?:(.+?)\s+)?(?:bigger|larger|smaller|tiny|huge)/,
            'scale', (m) => ({ direction: m[0] })
        )
    }
}
