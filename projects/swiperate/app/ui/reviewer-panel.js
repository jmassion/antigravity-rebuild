/**
 * SwipeRate Reviewer Panel
 * Multi-reviewer avatar carousel, per-reviewer history, and comparison view
 */

export class ReviewerPanel {
    constructor(container, options = {}) {
        this.container = container;
        this.reviewers = new Map();
        this.activeReviewerId = null;
        this.listeners = { switch: [], add: [], remove: [] };
        this.panel = null;
        this._build();
    }

    _build() {
        this.panel = document.createElement('div');
        this.panel.className = 'sr-reviewer-panel';
        this.panel.innerHTML = `
      <div class="sr-reviewer-header">
        <h3>Reviewers</h3>
        <button class="sr-btn sr-btn-sm sr-add-reviewer" id="sr-add-reviewer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
      <div class="sr-reviewer-carousel" id="sr-reviewer-carousel"></div>
      <div class="sr-reviewer-stats" id="sr-reviewer-stats"></div>
    `;
        this.container.appendChild(this.panel);

        this.panel.querySelector('#sr-add-reviewer').addEventListener('click', () => this._showAddDialog());
    }

    /**
     * Add a reviewer
     */
    addReviewer(reviewer) {
        const r = {
            id: reviewer.id || Date.now().toString(36),
            name: reviewer.name || 'Reviewer',
            avatar: reviewer.avatar || this._generateAvatar(reviewer.name),
            color: reviewer.color || this._randomColor(),
            ratings: [],
            createdAt: Date.now()
        };
        this.reviewers.set(r.id, r);
        this._renderCarousel();
        if (!this.activeReviewerId) this.setActive(r.id);
        this._emit('add', r);
        return r;
    }

    /**
     * Remove a reviewer
     */
    removeReviewer(id) {
        this.reviewers.delete(id);
        if (this.activeReviewerId === id) {
            const first = this.reviewers.keys().next().value;
            this.setActive(first || null);
        }
        this._renderCarousel();
        this._emit('remove', { id });
    }

    /**
     * Switch active reviewer
     */
    setActive(id) {
        this.activeReviewerId = id;
        this._renderCarousel();
        this._updateStats();
        this._emit('switch', { reviewerId: id, reviewer: this.reviewers.get(id) });
    }

    /**
     * Record a rating for the active reviewer
     */
    recordRating(rating) {
        const reviewer = this.reviewers.get(this.activeReviewerId);
        if (reviewer) {
            reviewer.ratings.push({ ...rating, reviewerId: this.activeReviewerId });
            this._updateStats();
        }
    }

    /**
     * Get the active reviewer
     */
    getActive() {
        return this.reviewers.get(this.activeReviewerId);
    }

    /**
     * Get comparison data across reviewers for an item
     */
    getComparison(itemId) {
        const result = {};
        for (const [id, reviewer] of this.reviewers) {
            const itemRatings = reviewer.ratings.filter(r => r.itemId === itemId);
            if (itemRatings.length > 0) {
                result[id] = {
                    reviewer: { name: reviewer.name, avatar: reviewer.avatar, color: reviewer.color },
                    latestRating: itemRatings[itemRatings.length - 1],
                    ratingCount: itemRatings.length
                };
            }
        }
        return result;
    }

    _renderCarousel() {
        const carousel = this.panel.querySelector('#sr-reviewer-carousel');
        carousel.innerHTML = '';
        for (const [id, r] of this.reviewers) {
            const el = document.createElement('button');
            el.className = `sr-reviewer-avatar ${id === this.activeReviewerId ? 'active' : ''}`;
            el.style.borderColor = r.color;
            el.innerHTML = `<span class="sr-avatar-img">${r.avatar}</span><span class="sr-avatar-name">${r.name}</span>`;
            el.addEventListener('click', () => this.setActive(id));
            carousel.appendChild(el);
        }
    }

    _updateStats() {
        const stats = this.panel.querySelector('#sr-reviewer-stats');
        const reviewer = this.reviewers.get(this.activeReviewerId);
        if (!reviewer) { stats.innerHTML = ''; return; }
        stats.innerHTML = `
      <div class="sr-stat"><span class="sr-stat-value">${reviewer.ratings.length}</span><span class="sr-stat-label">Ratings</span></div>
      <div class="sr-stat"><span class="sr-stat-value">${[...new Set(reviewer.ratings.map(r => r.itemId))].length}</span><span class="sr-stat-label">Items</span></div>
    `;
    }

    _generateAvatar(name) {
        const initials = (name || 'R').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        return initials;
    }

    _randomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 60%)`;
    }

    _showAddDialog() {
        const name = prompt('Reviewer name:');
        if (name) this.addReviewer({ name });
    }

    on(event, cb) {
        if (this.listeners[event]) this.listeners[event].push(cb);
        return this;
    }

    _emit(event, data) {
        (this.listeners[event] || []).forEach(cb => cb(data));
    }

    destroy() { this.panel?.remove(); }
}
