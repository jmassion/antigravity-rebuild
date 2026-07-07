/**
 * Voice/Ear — Speech Recognition
 *
 * Listens to the user's voice and converts it to text.
 * Works with browser SpeechRecognition API.
 */

import { Messenger } from '../../Foundation/Messenger.js'

export class Ear {

    constructor() {
        this.listening = false
        this.recognition = null
        this.language = 'en-US'

        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition
            this.recognition = new SR()
            this.recognition.continuous = true
            this.recognition.interimResults = true
            this.recognition.lang = this.language

            this.recognition.onresult = (event) => {
                const result = event.results[event.results.length - 1]
                const text = result[0].transcript.trim()
                const isFinal = result.isFinal

                Messenger.say('voice.heard', { text, isFinal, confidence: result[0].confidence })
            }

            this.recognition.onerror = (event) => {
                Messenger.say('voice.error', { error: event.error })
            }
        }
    }

    start() {
        if (!this.recognition) return false
        this.recognition.start()
        this.listening = true
        Messenger.say('voice.listening', { on: true })
        return true
    }

    stop() {
        if (!this.recognition) return
        this.recognition.stop()
        this.listening = false
        Messenger.say('voice.listening', { on: false })
    }

    get available() { return !!this.recognition }
}
