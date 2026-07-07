/**
 * SwipeRate Rating Resolver
 * Converts spatial drop coordinates into structured ratings/tags
 */

export class RatingResolver {
    constructor(config = {}) {
        this.axes = {
            x: { label: config.xLabel || 'Property A', min: 0, max: 100, invert: false },
            y: { label: config.yLabel || 'Property B', min: 0, max: 100, invert: config.invertY ?? true },
            z: { label: config.zLabel || 'Property C', min: 0, max: 100, invert: false }
        };

        // Zone-based tag overrides: map zone names to custom tags
        this.zoneTags = config.zoneTags || {
            'top-left': { tags: ['low-x', 'high-y'] },
            'top-center': { tags: ['mid-x', 'high-y'] },
            'top-right': { tags: ['high-x', 'high-y'] },
            'middle-left': { tags: ['low-x', 'mid-y'] },
            'middle-center': { tags: ['neutral'] },
            'middle-right': { tags: ['high-x', 'mid-y'] },
            'bottom-left': { tags: ['low-x', 'low-y'] },
            'bottom-center': { tags: ['mid-x', 'low-y'] },
            'bottom-right': { tags: ['high-x', 'low-y'] }
        };

        // Depth tags
        this.depthTags = config.depthTags || {
            deep: { range: [-1, -0.33], tags: ['low-z'] },
            neutral: { range: [-0.33, 0.33], tags: ['mid-z'] },
            shallow: { range: [0.33, 1], tags: ['high-z'] }
        };
    }

    /**
     * Resolve a drag-end snapshot to a full rating object
     * @param {Object} snapshot - { x, y, z, normalizedX, normalizedY, normalizedZ, zone, committed }
     * @returns {Object} rating result
     */
    resolve(snapshot) {
        if (!snapshot.committed) {
            return { resolved: false, reason: 'cancelled' };
        }

        const scores = {
            [this.axes.x.label]: this._normalizeScore(snapshot.normalizedX, this.axes.x),
            [this.axes.y.label]: this._normalizeScore(
                this.axes.y.invert ? 1 - snapshot.normalizedY : snapshot.normalizedY,
                this.axes.y
            ),
            [this.axes.z.label]: this._normalizeScore(snapshot.normalizedZ, this.axes.z)
        };

        const tags = this._resolveTags(snapshot.zone, snapshot.z);

        const tier = this._resolveTier(scores);

        return {
            resolved: true,
            scores,
            tags,
            tier,
            zone: snapshot.zone,
            raw: { x: snapshot.x, y: snapshot.y, z: snapshot.z },
            timestamp: Date.now()
        };
    }

    _normalizeScore(normalized, axis) {
        return Math.round(axis.min + normalized * (axis.max - axis.min));
    }

    _resolveTags(zone, zValue) {
        const tags = [];

        // XY zone tags
        if (zone && this.zoneTags[zone]) {
            tags.push(...this.zoneTags[zone].tags);
        }

        // Z depth tags
        for (const [, config] of Object.entries(this.depthTags)) {
            if (zValue >= config.range[0] && zValue < config.range[1]) {
                tags.push(...config.tags);
                break;
            }
        }

        return [...new Set(tags)];
    }

    _resolveTier(scores) {
        const values = Object.values(scores);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        if (avg >= 80) return 'S';
        if (avg >= 60) return 'A';
        if (avg >= 40) return 'B';
        if (avg >= 20) return 'C';
        return 'D';
    }

    /**
     * Update axis configuration
     */
    setAxis(axis, config) {
        if (this.axes[axis]) {
            Object.assign(this.axes[axis], config);
        }
    }

    /**
     * Set custom zone tags
     */
    setZoneTags(zoneTags) {
        Object.assign(this.zoneTags, zoneTags);
    }

    /**
     * Get current axis labels for UI display
     */
    getAxisLabels() {
        return {
            x: this.axes.x.label,
            y: this.axes.y.label,
            z: this.axes.z.label
        };
    }
}
