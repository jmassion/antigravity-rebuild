/**
 * SwipeRate — Main App Entry
 * Wires together drag engine, rating resolver, card renderer, and reviewer panel
 */

import { DragEngine } from './core/drag-engine.js';
import { RatingResolver } from './core/rating-resolver.js';
import { FileAdapterRegistry } from './core/file-adapters.js';
import { HistoryManager } from './core/history.js';
import { SyncManager } from './core/sync.js';
import { CardRenderer } from './ui/card-renderer.js';
import { RatingOverlay } from './ui/rating-overlay.js';
import { ReviewerPanel } from './ui/reviewer-panel.js';

class SwipeRateApp {
    constructor() {
        this.arena = document.getElementById('sr-arena');
        this.sidebar = document.getElementById('sr-sidebar');
        this.railInner = document.getElementById('sr-rail-inner');

        // Demo items
        this.items = this._generateDemoItems();
        this.currentIndex = 0;

        // Core
        this.fileAdapters = new FileAdapterRegistry();
        this.ratingResolver = new RatingResolver({
            xLabel: 'Quality',
            yLabel: 'Relevance',
            zLabel: 'Urgency'
        });
        this.history = new HistoryManager();
        this.sync = new SyncManager();

        // UI
        this.cardRenderer = new CardRenderer(this.arena, this.fileAdapters);
        this.overlay = new RatingOverlay(this.arena, this.ratingResolver);
        this.reviewerPanel = new ReviewerPanel(this.sidebar);

        // Drag engine
        this.dragEngine = new DragEngine(this.arena, { zEnabled: true });

        this._bindEvents();
        this._setupKeyboard();
        this._initReviewers();
        this._loadCurrentItem();
        this._updateProgress();
    }

    _bindEvents() {
        // Drag events
        this.dragEngine.on('dragStart', () => {
            this.overlay.show();
            document.getElementById('sr-drop-hint').style.opacity = '0';
        });

        this.dragEngine.on('dragMove', (snap) => {
            this.cardRenderer.updatePosition(snap.x, snap.y, snap.z);
            this.overlay.highlightZone(snap.zone);
            this.overlay.updateScores(snap);

            // Update rating indicator on card
            const scores = {
                [this.ratingResolver.axes.x.label]: Math.round(snap.normalizedX * 100),
                [this.ratingResolver.axes.y.label]: Math.round((1 - snap.normalizedY) * 100),
                [this.ratingResolver.axes.z.label]: Math.round(snap.normalizedZ * 100)
            };
            this.cardRenderer.updateRatingDisplay(snap.zone, scores);
        });

        this.dragEngine.on('dragEnd', async (snap) => {
            this.overlay.hide();
            this.overlay.highlightZone(null);
            document.getElementById('sr-drop-hint').style.opacity = '0.5';

            const rating = this.ratingResolver.resolve(snap);

            if (rating.resolved) {
                // Record in history
                const item = this.items[this.currentIndex];
                this.history.push({
                    itemId: item.id,
                    reviewerId: this.reviewerPanel.getActive()?.id || 'default',
                    rating
                });
                this.reviewerPanel.recordRating({ ...rating, itemId: item.id });

                // Sync
                this.sync.propagateRating(item.id, rating);

                // Add to history rail
                this._addToRail(item, rating);

                // Animate exit
                const exitDir = snap.x > 0 ? 'right' : snap.x < 0 ? 'left' : snap.y < 0 ? 'up' : 'down';
                await this.cardRenderer.animateExit(exitDir);

                // Next item
                this.currentIndex++;
                this._loadCurrentItem();
                this._updateProgress();
            } else {
                // Snap back
                this.cardRenderer.snapBack();
            }
        });

        // Toolbar
        document.getElementById('btn-undo').addEventListener('click', () => this._undo());
        document.getElementById('btn-redo').addEventListener('click', () => this._redo());
        document.getElementById('btn-bookmark').addEventListener('click', () => this._bookmark());

        // Mode toggle
        document.getElementById('btn-mode-2d').addEventListener('click', () => this._setMode('2d'));
        document.getElementById('btn-mode-3d').addEventListener('click', () => this._setMode('3d'));
    }

    _setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.metaKey && e.key === 'z') {
                e.preventDefault();
                e.shiftKey ? this._redo() : this._undo();
            }
            if (e.key === 'b' || e.key === 'B') this._bookmark();
        });
    }

    _initReviewers() {
        this.reviewerPanel.addReviewer({ name: 'You', color: '#7c3aed' });
    }

    _loadCurrentItem() {
        if (this.currentIndex >= this.items.length) {
            this.arena.querySelector('.sr-card')?.remove();
            document.getElementById('sr-drop-hint').innerHTML = `
        <p>All done! 🎉</p>
        <p class="sr-hint-sub">${this.items.length} items rated</p>
      `;
            document.getElementById('sr-drop-hint').style.opacity = '1';
            return;
        }

        const item = this.items[this.currentIndex];
        this.cardRenderer.renderCard(item);
    }

    _updateProgress() {
        document.getElementById('sr-progress').textContent = Math.min(this.currentIndex, this.items.length);
        document.getElementById('sr-total').textContent = this.items.length;
    }

    _addToRail(item, rating) {
        const el = document.createElement('div');
        el.className = 'sr-rail-item';
        el.title = `${item.title} — Tier ${rating.tier}`;
        el.innerHTML = `
      ${item.file?.url ? `<img src="${item.file.url}" alt="${item.title}">` : `<div style="width:100%;height:100%;background:linear-gradient(135deg,#7c3aed,#06b6d4);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">${item.title[0]}</div>`}
      <span class="sr-rail-tier">${rating.tier}</span>
    `;
        this.railInner.appendChild(el);
        this.railInner.scrollLeft = this.railInner.scrollWidth;
    }

    _undo() {
        const entry = this.history.undo();
        if (entry) {
            this.currentIndex = Math.max(0, this.currentIndex - 1);
            this._loadCurrentItem();
            this._updateProgress();
            // Remove last rail item
            this.railInner.lastChild?.remove();
        }
    }

    _redo() {
        const entry = this.history.redo();
        if (entry) {
            this._addToRail(
                this.items.find(i => i.id === entry.itemId) || { title: '?', file: {} },
                entry.rating
            );
            this.currentIndex++;
            this._loadCurrentItem();
            this._updateProgress();
        }
    }

    _bookmark() {
        if (this.currentIndex < this.items.length) {
            const item = this.items[this.currentIndex];
            this.history.bookmark(item.id, 'Need more time');
        }
    }

    _setMode(mode) {
        document.querySelectorAll('.sr-mode-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.mode === mode));
        this.dragEngine.setZEnabled(mode === '3d');
        const zLabel = document.getElementById('sr-z-label');
        if (zLabel) zLabel.style.display = mode === '3d' ? 'block' : 'none';
    }

    _generateDemoItems() {
        const names = [
            'Cosmic Nebula', 'Ocean Depths', 'Mountain Peak', 'City Lights',
            'Forest Mist', 'Desert Dawn', 'Arctic Aurora', 'Tropical Storm',
            'Volcanic Fire', 'Crystal Cave', 'Starfield', 'Quantum Bloom'
        ];
        const colors = ['#7c3aed', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#ec4899'];

        return names.map((name, i) => ({
            id: `item-${i}`,
            title: name,
            subtitle: `Demo item ${i + 1} of ${names.length}`,
            tags: ['demo', i % 2 === 0 ? 'featured' : 'standard'],
            file: {
                name: `${name.toLowerCase().replace(/\s/g, '-')}.png`,
                url: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${colors[i % colors.length]}"/><stop offset="100%" style="stop-color:${colors[(i + 2) % colors.length]}"/></linearGradient></defs><rect fill="url(#g)" width="400" height="300" rx="0"/><text x="200" y="160" text-anchor="middle" fill="white" font-family="Inter,sans-serif" font-size="28" font-weight="700">${name}</text></svg>`)}`,
                type: 'image/svg+xml'
            }
        }));
    }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
    window.swipeRateApp = new SwipeRateApp();
});
