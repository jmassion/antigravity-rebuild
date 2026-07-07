/**
 * SwipeRate Sync & Link Manager
 * Handles backlinking, forward-linking, multi-location references, and sync modes
 */

export class SyncManager {
    constructor(options = {}) {
        this.mode = options.mode || 'local'; // 'local', 'sync', 'broadcast'
        this.links = new Map();  // itemId → Set of linked locations
        this.backlinks = new Map(); // location → Set of items that reference it
        this.revisionLog = []; // full revision history
        this.listeners = { sync: [], link: [], conflict: [] };
    }

    /**
     * Register a file's location(s)
     */
    registerLocation(itemId, location) {
        if (!this.links.has(itemId)) this.links.set(itemId, new Set());
        this.links.get(itemId).add(location);

        if (!this.backlinks.has(location)) this.backlinks.set(location, new Set());
        this.backlinks.get(location).add(itemId);

        this._logRevision(itemId, 'link-added', { location });
        this._emit('link', { itemId, location, action: 'added' });
    }

    /**
     * Remove a location reference
     */
    removeLocation(itemId, location) {
        if (this.links.has(itemId)) {
            this.links.get(itemId).delete(location);
        }
        if (this.backlinks.has(location)) {
            this.backlinks.get(location).delete(itemId);
        }
        this._logRevision(itemId, 'link-removed', { location });
        this._emit('link', { itemId, location, action: 'removed' });
    }

    /**
     * Get all locations for an item
     */
    getLocations(itemId) {
        return [...(this.links.get(itemId) || [])];
    }

    /**
     * Get all items at a location (backlink query)
     */
    getItemsAtLocation(location) {
        return [...(this.backlinks.get(location) || [])];
    }

    /**
     * Forward links: what does this item link TO
     */
    getForwardLinks(itemId) {
        return this.getLocations(itemId);
    }

    /**
     * Backlinks: what links TO this item/location
     */
    getBacklinks(location) {
        return this.getItemsAtLocation(location);
    }

    /**
     * Propagate a rating update to all synced locations
     */
    propagateRating(itemId, rating) {
        const locations = this.getLocations(itemId);
        if (this.mode === 'sync') {
            // In sync mode, push to all locations
            locations.forEach(loc => {
                this._emit('sync', { itemId, location: loc, rating, mode: 'push' });
            });
            this._logRevision(itemId, 'rating-synced', { rating, locations });
        } else if (this.mode === 'broadcast') {
            // Broadcast to listeners without enforcing
            this._emit('sync', { itemId, rating, mode: 'broadcast', locations });
        }
        // In local mode, do nothing — ratings stay local
    }

    /**
     * Set sync mode
     */
    setMode(mode) {
        this.mode = mode;
    }

    /**
     * Detect and report conflicts (same item rated differently at different locations)
     */
    checkConflicts(itemId, ratings) {
        const conflicts = [];
        const locations = this.getLocations(itemId);
        const uniqueScores = new Set(ratings.map(r => JSON.stringify(r.scores)));
        if (uniqueScores.size > 1) {
            conflicts.push({
                itemId,
                locations,
                ratings,
                detectedAt: Date.now()
            });
            this._emit('conflict', conflicts[0]);
        }
        return conflicts;
    }

    /**
     * Get full revision log for an item
     */
    getRevisionLog(itemId) {
        return this.revisionLog.filter(r => r.itemId === itemId);
    }

    /**
     * Export state
     */
    export() {
        return {
            mode: this.mode,
            links: Object.fromEntries([...this.links].map(([k, v]) => [k, [...v]])),
            revisionLog: this.revisionLog
        };
    }

    /**
     * Import state
     */
    import(data) {
        this.mode = data.mode || 'local';
        this.links = new Map(Object.entries(data.links || {}).map(([k, v]) => [k, new Set(v)]));
        this.revisionLog = data.revisionLog || [];
        // Rebuild backlinks
        this.backlinks = new Map();
        for (const [itemId, locs] of this.links) {
            for (const loc of locs) {
                if (!this.backlinks.has(loc)) this.backlinks.set(loc, new Set());
                this.backlinks.get(loc).add(itemId);
            }
        }
    }

    _logRevision(itemId, action, data) {
        this.revisionLog.push({
            itemId,
            action,
            data,
            timestamp: Date.now()
        });
    }

    on(event, cb) {
        if (this.listeners[event]) this.listeners[event].push(cb);
        return this;
    }

    _emit(event, data) {
        (this.listeners[event] || []).forEach(cb => cb(data));
    }
}
