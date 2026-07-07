/**
 * Memory Layer — Time, History, and Branching
 *
 * Everything is remembered. Every action, every creation,
 * every change. And time can branch.
 */

import { Messenger } from '../Foundation/Messenger.js'

// ── Moment ────────────────────────────

/**
 * A single snapshot of state at a point in time.
 */
export class Moment {
    constructor(action, data, timestamp = Date.now()) {
        this.id = `moment_${timestamp}_${Math.random().toString(36).slice(2, 6)}`
        this.action = action        // What happened ("created", "moved", "deleted")
        this.data = data            // Relevant data for undo/redo
        this.timestamp = timestamp
        this.bookmark = null        // Named save point (null if not bookmarked)
    }

    describe() {
        const time = new Date(this.timestamp).toLocaleTimeString()
        return `${time}  ${this.action}: ${JSON.stringify(this.data).slice(0, 60)}`
    }
}

// ── Branch ────────────────────────────

/**
 * A fork in the timeline — an alternate reality.
 */
export class Branch {
    constructor(name, parentMomentId) {
        this.name = name
        this.id = `branch_${Date.now()}`
        this.parentMomentId = parentMomentId
        this.moments = []
    }

    add(moment) {
        this.moments.push(moment)
    }

    get latest() {
        return this.moments[this.moments.length - 1] || null
    }
}

// ── Timeline ──────────────────────────

/**
 * The full history of everything that happened.
 * Supports undo, redo, branching, bookmarks, replay.
 */
export class Timeline {

    constructor(options = {}) {
        this.maxMoments = options.maxMoments || 200
        this.main = new Branch('main', null)
        this.branches = new Map([['main', this.main]])
        this.activeBranch = this.main
        this.cursor = -1           // Current position in the timeline
        this.autoSaveInterval = options.autoSaveInterval || 60000
        this._autoSaveTimer = null
    }

    /**
     * Record a new moment (action).
     */
    record(action, data) {
        // If we've undone some steps, discard the future
        if (this.cursor < this.activeBranch.moments.length - 1) {
            this.activeBranch.moments = this.activeBranch.moments.slice(0, this.cursor + 1)
        }

        const moment = new Moment(action, data)
        this.activeBranch.add(moment)
        this.cursor = this.activeBranch.moments.length - 1

        // Cap history length
        if (this.activeBranch.moments.length > this.maxMoments) {
            this.activeBranch.moments.shift()
            this.cursor--
        }

        Messenger.say('memory.recorded', { moment: moment.id, action })
        return moment
    }

    /**
     * Undo — step back one moment.
     */
    undo() {
        if (this.cursor <= 0) return null
        this.cursor--
        const moment = this.activeBranch.moments[this.cursor]
        Messenger.say('memory.undo', { moment: moment.id, cursor: this.cursor })
        return moment
    }

    /**
     * Redo — step forward one moment.
     */
    redo() {
        if (this.cursor >= this.activeBranch.moments.length - 1) return null
        this.cursor++
        const moment = this.activeBranch.moments[this.cursor]
        Messenger.say('memory.redo', { moment: moment.id, cursor: this.cursor })
        return moment
    }

    /**
     * Bookmark the current moment with a name.
     */
    bookmark(name) {
        const moment = this.activeBranch.moments[this.cursor]
        if (moment) {
            moment.bookmark = name
            Messenger.say('memory.bookmarked', { moment: moment.id, name })
        }
    }

    /**
     * Jump to a bookmarked moment.
     */
    jumpToBookmark(name) {
        const index = this.activeBranch.moments.findIndex(m => m.bookmark === name)
        if (index >= 0) {
            this.cursor = index
            Messenger.say('memory.jumped', { name, cursor: this.cursor })
            return this.activeBranch.moments[index]
        }
        return null
    }

    /**
     * Create a branch from the current moment.
     */
    branch(name) {
        const currentMomentId = this.activeBranch.moments[this.cursor]?.id
        const newBranch = new Branch(name, currentMomentId)

        // Copy moments up to cursor into the new branch
        newBranch.moments = this.activeBranch.moments.slice(0, this.cursor + 1).map(m => {
            return new Moment(m.action, structuredClone(m.data), m.timestamp)
        })

        this.branches.set(name, newBranch)
        this.activeBranch = newBranch
        this.cursor = newBranch.moments.length - 1

        Messenger.say('memory.branched', { name, from: currentMomentId })
        return newBranch
    }

    /**
     * Switch to a named branch.
     */
    switchBranch(name) {
        const branch = this.branches.get(name)
        if (branch) {
            this.activeBranch = branch
            this.cursor = branch.moments.length - 1
            Messenger.say('memory.switched', { branch: name })
        }
    }

    /**
     * Compare two branches — returns moments unique to each.
     */
    compare(branchNameA, branchNameB) {
        const a = this.branches.get(branchNameA)
        const b = this.branches.get(branchNameB)
        if (!a || !b) return null

        const aIds = new Set(a.moments.map(m => m.id))
        const bIds = new Set(b.moments.map(m => m.id))

        return {
            onlyInA: a.moments.filter(m => !bIds.has(m.id)),
            onlyInB: b.moments.filter(m => !aIds.has(m.id)),
            shared: a.moments.filter(m => bIds.has(m.id)),
        }
    }

    /**
     * Get the Journal — human-readable log.
     */
    journal() {
        return this.activeBranch.moments.map(m => {
            const time = new Date(m.timestamp).toLocaleTimeString()
            const prefix = m.bookmark ? `★ [${m.bookmark}] ` : ''
            return `${time}  ${prefix}${m.action}`
        })
    }

    /**
     * Replay — get all moments in order for playback.
     */
    replay(fromIndex = 0, toIndex = undefined) {
        return this.activeBranch.moments.slice(fromIndex, toIndex)
    }

    /**
     * List all branches.
     */
    listBranches() {
        return [...this.branches.keys()]
    }

    /**
     * Start auto-save timer.
     */
    startAutoSave(callback) {
        this._autoSaveTimer = setInterval(() => {
            this.bookmark(`auto-${new Date().toLocaleTimeString()}`)
            if (callback) callback(this)
        }, this.autoSaveInterval)
    }

    stopAutoSave() {
        clearInterval(this._autoSaveTimer)
    }
}
