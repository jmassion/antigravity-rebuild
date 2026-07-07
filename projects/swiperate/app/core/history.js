/**
 * SwipeRate History Manager
 * Full undo/redo, revision tracking, bookmarks, and reviewer attribution
 */

export class HistoryManager {
    constructor(options = {}) {
        this.maxHistory = options.maxHistory || 500;
        this.entries = [];
        this.pointer = -1;
        this.bookmarks = new Set();
        this.listeners = { change: [], bookmark: [] };
    }

    /**
     * Record a rating action
     */
    push(entry) {
        // Trim any future entries when branching
        if (this.pointer < this.entries.length - 1) {
            this.entries = this.entries.slice(0, this.pointer + 1);
        }

        const record = {
            id: this._uid(),
            itemId: entry.itemId,
            reviewerId: entry.reviewerId || 'default',
            rating: entry.rating,
            timestamp: Date.now(),
            meta: entry.meta || {},
            version: this.entries.filter(e => e.itemId === entry.itemId).length + 1
        };

        this.entries.push(record);
        if (this.entries.length > this.maxHistory) {
            this.entries.shift();
        } else {
            this.pointer++;
        }

        this._emit('change', { action: 'push', entry: record, pointer: this.pointer });
        return record;
    }

    /**
     * Undo last action
     */
    undo() {
        if (this.pointer < 0) return null;
        const entry = this.entries[this.pointer];
        this.pointer--;
        this._emit('change', { action: 'undo', entry, pointer: this.pointer });
        return entry;
    }

    /**
     * Redo previously undone action
     */
    redo() {
        if (this.pointer >= this.entries.length - 1) return null;
        this.pointer++;
        const entry = this.entries[this.pointer];
        this._emit('change', { action: 'redo', entry, pointer: this.pointer });
        return entry;
    }

    /**
     * Bookmark current position — "need more time" feature
     */
    bookmark(itemId, note = '') {
        const bm = {
            id: this._uid(),
            itemId,
            pointer: this.pointer,
            timestamp: Date.now(),
            note
        };
        this.bookmarks.add(bm);
        this._emit('bookmark', bm);
        return bm;
    }

    /**
     * Get full revision history for an item
     */
    getRevisions(itemId) {
        return this.entries.filter(e => e.itemId === itemId).sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Get revision history for a specific reviewer
     */
    getReviewerHistory(reviewerId) {
        return this.entries.filter(e => e.reviewerId === reviewerId);
    }

    /**
     * Get active entries (up to current pointer)
     */
    getActive() {
        return this.entries.slice(0, this.pointer + 1);
    }

    /**
     * Can undo?
     */
    get canUndo() {
        return this.pointer >= 0;
    }

    /**
     * Can redo?
     */
    get canRedo() {
        return this.pointer < this.entries.length - 1;
    }

    /**
     * Get stats
     */
    getStats() {
        const active = this.getActive();
        const reviewers = [...new Set(active.map(e => e.reviewerId))];
        const items = [...new Set(active.map(e => e.itemId))];
        return {
            totalActions: active.length,
            uniqueItems: items.length,
            uniqueReviewers: reviewers.length,
            bookmarkCount: this.bookmarks.size,
            canUndo: this.canUndo,
            canRedo: this.canRedo
        };
    }

    /**
     * Export full history for persistence
     */
    export() {
        return {
            entries: [...this.entries],
            pointer: this.pointer,
            bookmarks: [...this.bookmarks],
            exportedAt: Date.now()
        };
    }

    /**
     * Import previously exported history
     */
    import(data) {
        this.entries = data.entries || [];
        this.pointer = data.pointer ?? this.entries.length - 1;
        this.bookmarks = new Set(data.bookmarks || []);
        this._emit('change', { action: 'import', pointer: this.pointer });
    }

    on(event, cb) {
        if (this.listeners[event]) this.listeners[event].push(cb);
        return this;
    }

    _emit(event, data) {
        (this.listeners[event] || []).forEach(cb => cb(data));
    }

    _uid() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }
}
