/**
 * Timeline Manager
 * Visual timeline for temporal annotations on video/audio
 */

export class Timeline {
    constructor(container, options = {}) {
        this.container = container;
        this.duration = options.duration || 0;
        this.markers = [];
        this.currentTime = 0;
        this.listeners = { seek: [], markerClick: [] };
        this.el = null;
        this._build();
    }

    _build() {
        this.el = document.createElement('div');
        this.el.className = 'an-timeline';
        this.el.innerHTML = `
      <div class="an-timeline-track" id="an-timeline-track">
        <div class="an-timeline-progress" id="an-timeline-progress"></div>
        <div class="an-timeline-markers" id="an-timeline-markers"></div>
        <div class="an-timeline-scrubber" id="an-timeline-scrubber"></div>
      </div>
      <div class="an-timeline-time">
        <span id="an-time-current">0:00</span> / <span id="an-time-total">0:00</span>
      </div>
    `;
        this.container.appendChild(this.el);

        // Click to seek
        const track = this.el.querySelector('#an-timeline-track');
        track.addEventListener('click', (e) => {
            const rect = track.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            const time = ratio * this.duration;
            this.setCurrentTime(time);
            this._emit('seek', { time });
        });
    }

    setDuration(seconds) {
        this.duration = seconds;
        this.el.querySelector('#an-time-total').textContent = this._formatTime(seconds);
        this._renderMarkers();
    }

    setCurrentTime(time) {
        this.currentTime = time;
        const pct = this.duration > 0 ? (time / this.duration) * 100 : 0;
        this.el.querySelector('#an-timeline-progress').style.width = `${pct}%`;
        this.el.querySelector('#an-timeline-scrubber').style.left = `${pct}%`;
        this.el.querySelector('#an-time-current').textContent = this._formatTime(time);
    }

    addMarker(annotation) {
        this.markers.push(annotation);
        this._renderMarkers();
    }

    removeMarker(annotationId) {
        this.markers = this.markers.filter(m => m.id !== annotationId);
        this._renderMarkers();
    }

    _renderMarkers() {
        const container = this.el.querySelector('#an-timeline-markers');
        container.innerHTML = '';
        this.markers.forEach(m => {
            if (this.duration <= 0) return;
            const pct = (m.startTime / this.duration) * 100;
            const marker = document.createElement('div');
            marker.className = 'an-timeline-marker';
            marker.style.left = `${pct}%`;
            marker.title = m.content || 'Annotation';
            marker.addEventListener('click', (e) => {
                e.stopPropagation();
                this._emit('markerClick', m);
            });
            if (m.endTime > m.startTime) {
                const widthPct = ((m.endTime - m.startTime) / this.duration) * 100;
                marker.style.width = `${widthPct}%`;
                marker.classList.add('an-timeline-range');
            }
            container.appendChild(marker);
        });
    }

    _formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    on(event, cb) { (this.listeners[event] ||= []).push(cb); return this; }
    _emit(event, data) { (this.listeners[event] || []).forEach(cb => cb(data)); }
    destroy() { this.el?.remove(); }
}
