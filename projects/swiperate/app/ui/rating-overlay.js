/**
 * SwipeRate Rating Zone Overlay
 * Renders the 9-quadrant zone grid with live score display
 */

export class RatingOverlay {
    constructor(container, ratingResolver) {
        this.container = container;
        this.resolver = ratingResolver;
        this.overlay = null;
        this.zones = {};
        this._build();
    }

    _build() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'sr-zone-overlay';

        const labels = this.resolver.getAxisLabels();

        // Axis labels
        this.overlay.innerHTML = `
      <div class="sr-axis-label sr-axis-x-label">
        <span class="sr-axis-lo">Low ${labels.x}</span>
        <span class="sr-axis-hi">High ${labels.x}</span>
      </div>
      <div class="sr-axis-label sr-axis-y-label">
        <span class="sr-axis-hi">High ${labels.y}</span>
        <span class="sr-axis-lo">Low ${labels.y}</span>
      </div>
      <div class="sr-axis-label sr-axis-z-label" id="sr-z-label">
        <span>${labels.z}: <span id="sr-z-value">50</span></span>
      </div>
    `;

        // Zone grid
        const grid = document.createElement('div');
        grid.className = 'sr-zone-grid';
        const zoneNames = [
            'top-left', 'top-center', 'top-right',
            'middle-left', 'middle-center', 'middle-right',
            'bottom-left', 'bottom-center', 'bottom-right'
        ];
        zoneNames.forEach(name => {
            const zone = document.createElement('div');
            zone.className = `sr-zone sr-zone-${name}`;
            zone.dataset.zone = name;
            zone.innerHTML = `<span class="sr-zone-label">${this._zoneIcon(name)}</span>`;
            grid.appendChild(zone);
            this.zones[name] = zone;
        });
        this.overlay.appendChild(grid);

        // Live score display
        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'sr-live-scores';
        scoreDisplay.id = 'sr-live-scores';
        this.overlay.appendChild(scoreDisplay);

        this.container.appendChild(this.overlay);
    }

    _zoneIcon(name) {
        const icons = {
            'top-left': '↖', 'top-center': '↑', 'top-right': '↗',
            'middle-left': '←', 'middle-center': '●', 'middle-right': '→',
            'bottom-left': '↙', 'bottom-center': '↓', 'bottom-right': '↘'
        };
        return icons[name] || '';
    }

    /**
     * Highlight current zone
     */
    highlightZone(zoneName) {
        Object.values(this.zones).forEach(z => z.classList.remove('sr-zone-active'));
        if (zoneName && this.zones[zoneName]) {
            this.zones[zoneName].classList.add('sr-zone-active');
        }
    }

    /**
     * Update live scores display
     */
    updateScores(snapshot) {
        const labels = this.resolver.getAxisLabels();
        const xScore = Math.round(snapshot.normalizedX * 100);
        const yScore = Math.round((1 - snapshot.normalizedY) * 100);
        const zScore = Math.round(snapshot.normalizedZ * 100);

        const display = this.overlay.querySelector('#sr-live-scores');
        if (display) {
            display.innerHTML = `
        <div class="sr-score-item"><span class="sr-score-label">${labels.x}</span><span class="sr-score-value">${xScore}</span></div>
        <div class="sr-score-item"><span class="sr-score-label">${labels.y}</span><span class="sr-score-value">${yScore}</span></div>
        <div class="sr-score-item"><span class="sr-score-label">${labels.z}</span><span class="sr-score-value">${zScore}</span></div>
      `;
            display.style.opacity = snapshot.isDragging ? '1' : '0';
        }

        // Update Z label
        const zLabel = this.overlay.querySelector('#sr-z-value');
        if (zLabel) zLabel.textContent = zScore;
    }

    show() { this.overlay.style.opacity = '1'; this.overlay.style.pointerEvents = 'none'; }
    hide() { this.overlay.style.opacity = '0'; }

    destroy() { this.overlay?.remove(); }
}
