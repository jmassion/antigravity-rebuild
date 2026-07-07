/**
 * Thread Manager
 * Multi-reviewer threaded conversations on annotations
 */

export class ThreadManager {
    constructor() {
        this.threads = new Map(); // annotationId → thread
    }

    /**
     * Create or get thread for an annotation
     */
    getThread(annotationId) {
        if (!this.threads.has(annotationId)) {
            this.threads.set(annotationId, {
                annotationId,
                messages: [],
                participants: new Set(),
                resolved: false,
                createdAt: Date.now()
            });
        }
        return this.threads.get(annotationId);
    }

    /**
     * Add a message to a thread
     */
    addMessage(annotationId, message) {
        const thread = this.getThread(annotationId);
        const msg = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            content: message.content,
            reviewerId: message.reviewerId || 'default',
            reviewerName: message.reviewerName || 'Anonymous',
            mentions: this._extractMentions(message.content),
            timestamp: Date.now(),
            edited: false
        };
        thread.messages.push(msg);
        thread.participants.add(msg.reviewerId);
        return msg;
    }

    /**
     * Edit a message
     */
    editMessage(annotationId, messageId, newContent) {
        const thread = this.getThread(annotationId);
        const msg = thread.messages.find(m => m.id === messageId);
        if (msg) {
            msg.content = newContent;
            msg.edited = true;
            msg.editedAt = Date.now();
            msg.mentions = this._extractMentions(newContent);
        }
        return msg;
    }

    /**
     * Resolve/unresolve thread
     */
    toggleResolved(annotationId) {
        const thread = this.getThread(annotationId);
        thread.resolved = !thread.resolved;
        thread.resolvedAt = thread.resolved ? Date.now() : null;
        return thread;
    }

    /**
     * Delete a message
     */
    deleteMessage(annotationId, messageId) {
        const thread = this.getThread(annotationId);
        thread.messages = thread.messages.filter(m => m.id !== messageId);
    }

    /**
     * Get threads by participant
     */
    getThreadsByParticipant(reviewerId) {
        const results = [];
        for (const thread of this.threads.values()) {
            if (thread.participants.has(reviewerId)) results.push(thread);
        }
        return results;
    }

    /**
     * Get unresolved thread count
     */
    getUnresolvedCount() {
        let count = 0;
        for (const thread of this.threads.values()) {
            if (!thread.resolved && thread.messages.length > 0) count++;
        }
        return count;
    }

    _extractMentions(content) {
        const matches = content.match(/@(\w+)/g) || [];
        return matches.map(m => m.slice(1));
    }

    export() {
        const data = {};
        for (const [id, thread] of this.threads) {
            data[id] = { ...thread, participants: [...thread.participants] };
        }
        return data;
    }

    import(data) {
        for (const [id, thread] of Object.entries(data)) {
            this.threads.set(id, { ...thread, participants: new Set(thread.participants) });
        }
    }
}
