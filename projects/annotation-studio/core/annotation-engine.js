/**
 * Annotation Engine
 * Handles spatial (pin, region) and temporal (timestamp) annotations
 */

export class AnnotationEngine {
    constructor() {
        this.annotations = new Map();
        this.listeners = { add: [], update: [], remove: [], select: [] };
    }

    /**
     * Create a spatial annotation (for images/3D)
     */
    addSpatial(itemId, data) {
        const annotation = {
            id: this._uid(),
            itemId,
            type: 'spatial',
            subtype: data.subtype || 'pin', // pin, region, polygon
            x: data.x, y: data.y,
            width: data.width || 0, height: data.height || 0,
            points: data.points || [], // for polygon
            content: data.content || '',
            reviewerId: data.reviewerId || 'default',
            status: 'open', // open, resolved, archived
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this._store(annotation);
        return annotation;
    }

    /**
     * Create a temporal annotation (for video/audio)
     */
    addTemporal(itemId, data) {
        const annotation = {
            id: this._uid(),
            itemId,
            type: 'temporal',
            startTime: data.startTime || 0,
            endTime: data.endTime || data.startTime || 0,
            content: data.content || '',
            reviewerId: data.reviewerId || 'default',
            status: 'open',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this._store(annotation);
        return annotation;
    }

    /**
     * Add a text-only annotation
     */
    addNote(itemId, data) {
        const annotation = {
            id: this._uid(),
            itemId,
            type: 'note',
            content: data.content || '',
            reviewerId: data.reviewerId || 'default',
            priority: data.priority || 'normal', // low, normal, high, critical
            status: 'open',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        this._store(annotation);
        return annotation;
    }

    update(annotationId, updates) {
        for (const [, annotations] of this.annotations) {
            const ann = annotations.find(a => a.id === annotationId);
            if (ann) {
                Object.assign(ann, updates, { updatedAt: Date.now() });
                this._emit('update', ann);
                return ann;
            }
        }
        return null;
    }

    remove(annotationId) {
        for (const [itemId, annotations] of this.annotations) {
            const idx = annotations.findIndex(a => a.id === annotationId);
            if (idx !== -1) {
                const [removed] = annotations.splice(idx, 1);
                this._emit('remove', removed);
                return removed;
            }
        }
        return null;
    }

    getForItem(itemId, filters = {}) {
        const all = this.annotations.get(itemId) || [];
        return all.filter(a => {
            if (filters.type && a.type !== filters.type) return false;
            if (filters.reviewerId && a.reviewerId !== filters.reviewerId) return false;
            if (filters.status && a.status !== filters.status) return false;
            return true;
        });
    }

    getByReviewer(reviewerId) {
        const results = [];
        for (const annotations of this.annotations.values()) {
            results.push(...annotations.filter(a => a.reviewerId === reviewerId));
        }
        return results;
    }

    resolveAnnotation(annotationId) {
        return this.update(annotationId, { status: 'resolved' });
    }

    _store(annotation) {
        if (!this.annotations.has(annotation.itemId)) {
            this.annotations.set(annotation.itemId, []);
        }
        this.annotations.get(annotation.itemId).push(annotation);
        this._emit('add', annotation);
    }

    export() {
        const data = {};
        for (const [itemId, annotations] of this.annotations) {
            data[itemId] = annotations;
        }
        return data;
    }

    import(data) {
        for (const [itemId, annotations] of Object.entries(data)) {
            this.annotations.set(itemId, annotations);
        }
    }

    on(event, cb) { (this.listeners[event] ||= []).push(cb); return this; }
    _emit(event, data) { (this.listeners[event] || []).forEach(cb => cb(data)); }
    _uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
}
