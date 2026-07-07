/**
 * SwipeRate Card Renderer
 * Renders file cards with glassmorphism styling and adaptive media preview
 */

export class CardRenderer {
    constructor(container, fileAdapters) {
        this.container = container;
        this.adapters = fileAdapters;
        this.currentCard = null;
        this.currentHandle = null;
    }

    /**
     * Render a card for the given item
     */
    renderCard(item) {
        this.clear();

        const card = document.createElement('div');
        card.className = 'sr-card';
        card.dataset.itemId = item.id;

        // Media preview
        const mediaWrap = document.createElement('div');
        mediaWrap.className = 'sr-card-media';
        const fileType = this.adapters.detectType(item.file || item);
        const adapter = this.adapters.getAdapter(fileType);
        this.currentHandle = adapter.render(item.file || item, mediaWrap);
        card.appendChild(mediaWrap);

        // Info overlay
        const info = document.createElement('div');
        info.className = 'sr-card-info';
        info.innerHTML = `
      <h3 class="sr-card-title">${item.title || item.name || 'Untitled'}</h3>
      ${item.subtitle ? `<p class="sr-card-subtitle">${item.subtitle}</p>` : ''}
      ${item.tags ? `<div class="sr-card-tags">${item.tags.map(t => `<span class="sr-tag">${t}</span>`).join('')}</div>` : ''}
    `;
        card.appendChild(info);

        // Rating indicator (updates during drag)
        const ratingIndicator = document.createElement('div');
        ratingIndicator.className = 'sr-card-rating-indicator';
        ratingIndicator.id = 'sr-rating-indicator';
        card.appendChild(ratingIndicator);

        // Depth indicator bar (Z-axis)
        const depthBar = document.createElement('div');
        depthBar.className = 'sr-card-depth-bar';
        depthBar.innerHTML = '<div class="sr-depth-fill" id="sr-depth-fill"></div>';
        card.appendChild(depthBar);

        this.container.appendChild(card);
        this.currentCard = card;
        return card;
    }

    /**
     * Update card position during drag
     */
    updatePosition(x, y, z) {
        if (!this.currentCard) return;
        const px = x * 150; // pixels offset from center
        const py = y * 150;
        const scale = 1 + z * 0.15;
        const rotation = x * 15;
        this.currentCard.style.transform = `translate(${px}px, ${py}px) rotate(${rotation}deg) scale(${scale})`;
        this.currentCard.style.opacity = Math.max(0.6, 1 - Math.abs(x) * 0.3);

        // Update depth bar
        const depthFill = this.currentCard.querySelector('#sr-depth-fill');
        if (depthFill) {
            depthFill.style.height = `${((z + 1) / 2) * 100}%`;
        }
    }

    /**
     * Update the rating indicator label
     */
    updateRatingDisplay(zone, scores) {
        const indicator = this.currentCard?.querySelector('#sr-rating-indicator');
        if (!indicator) return;

        if (!zone) {
            indicator.style.opacity = '0';
            return;
        }

        const scoreEntries = Object.entries(scores || {});
        indicator.innerHTML = scoreEntries.map(([label, val]) =>
            `<div class="sr-ri-row"><span class="sr-ri-label">${label}</span><span class="sr-ri-value">${val}</span></div>`
        ).join('');
        indicator.style.opacity = '1';
        indicator.dataset.zone = zone;
    }

    /**
     * Animate card exit (committed rating)
     */
    animateExit(direction = 'right') {
        if (!this.currentCard) return Promise.resolve();
        return new Promise(resolve => {
            const card = this.currentCard;
            card.style.transition = 'transform 0.4s ease-out, opacity 0.3s ease-out';
            const dx = direction === 'right' ? 600 : direction === 'left' ? -600 : 0;
            const dy = direction === 'up' ? -600 : direction === 'down' ? 600 : 0;
            card.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx > 0 ? 30 : -30}deg) scale(0.8)`;
            card.style.opacity = '0';
            setTimeout(() => {
                this.clear();
                resolve();
            }, 400);
        });
    }

    /**
     * Snap card back to center (cancelled)
     */
    snapBack() {
        if (!this.currentCard) return Promise.resolve();
        return new Promise(resolve => {
            const card = this.currentCard;
            card.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            card.style.transform = 'translate(0, 0) rotate(0deg) scale(1)';
            card.style.opacity = '1';
            setTimeout(resolve, 300);
        });
    }

    clear() {
        if (this.currentHandle?.cleanup) this.currentHandle.cleanup();
        if (this.currentCard) {
            this.currentCard.remove();
            this.currentCard = null;
            this.currentHandle = null;
        }
    }
}
