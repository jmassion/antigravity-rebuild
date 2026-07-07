/**
 * Annotation Studio — Main App Entry
 */

import { AnnotationEngine } from './core/annotation-engine.js';
import { ThreadManager } from './core/thread-manager.js';

class AnnotationApp {
    constructor() {
        this.engine = new AnnotationEngine();
        this.threads = new ThreadManager();
        this.activeTool = 'pin';
        this.pinCounter = 0;
        this.selectedAnnotation = null;

        this._bindTools();
        this._bindCanvas();
        this._bindSidebar();
    }

    _bindTools() {
        document.querySelectorAll('.an-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.an-tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeTool = btn.dataset.tool;
            });
        });
    }

    _bindCanvas() {
        const overlay = document.getElementById('an-overlay');
        let regionStart = null;

        overlay.addEventListener('click', (e) => {
            if (this.activeTool === 'pin') {
                const rect = overlay.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                const content = prompt('Annotation:') || '';
                if (content) {
                    const ann = this.engine.addSpatial('demo', { x, y, subtype: 'pin', content, reviewerId: 'user' });
                    this.threads.addMessage(ann.id, { content, reviewerId: 'user', reviewerName: 'You' });
                    this._renderPin(ann);
                    this._renderThreads();
                }
            } else if (this.activeTool === 'note') {
                const content = prompt('Note:') || '';
                if (content) {
                    const ann = this.engine.addNote('demo', { content, reviewerId: 'user' });
                    this.threads.addMessage(ann.id, { content, reviewerId: 'user', reviewerName: 'You' });
                    this._renderThreads();
                }
            }
        });

        overlay.addEventListener('mousedown', (e) => {
            if (this.activeTool !== 'region') return;
            const rect = overlay.getBoundingClientRect();
            regionStart = {
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100
            };
        });

        overlay.addEventListener('mouseup', (e) => {
            if (this.activeTool !== 'region' || !regionStart) return;
            const rect = overlay.getBoundingClientRect();
            const endX = ((e.clientX - rect.left) / rect.width) * 100;
            const endY = ((e.clientY - rect.top) / rect.height) * 100;
            const width = Math.abs(endX - regionStart.x);
            const height = Math.abs(endY - regionStart.y);
            if (width > 2 && height > 2) {
                const content = prompt('Region annotation:') || '';
                if (content) {
                    const ann = this.engine.addSpatial('demo', {
                        x: Math.min(regionStart.x, endX),
                        y: Math.min(regionStart.y, endY),
                        width, height, subtype: 'region', content, reviewerId: 'user'
                    });
                    this.threads.addMessage(ann.id, { content, reviewerId: 'user', reviewerName: 'You' });
                    this._renderRegion(ann);
                    this._renderThreads();
                }
            }
            regionStart = null;
        });
    }

    _bindSidebar() {
        document.getElementById('an-add-note-btn').addEventListener('click', () => {
            const input = document.getElementById('an-note-input');
            const content = input.value.trim();
            if (content) {
                const ann = this.engine.addNote('demo', { content, reviewerId: 'user' });
                this.threads.addMessage(ann.id, { content, reviewerId: 'user', reviewerName: 'You' });
                input.value = '';
                this._renderThreads();
            }
        });

        document.getElementById('an-filter').addEventListener('change', () => this._renderThreads());
    }

    _renderPin(ann) {
        this.pinCounter++;
        const overlay = document.getElementById('an-overlay');
        const pin = document.createElement('div');
        pin.className = `an-pin ${ann.status === 'resolved' ? 'resolved' : ''}`;
        pin.style.left = `${ann.x}%`;
        pin.style.top = `${ann.y}%`;
        pin.textContent = this.pinCounter;
        pin.dataset.annId = ann.id;
        pin.addEventListener('click', (e) => {
            e.stopPropagation();
            this._selectAnnotation(ann.id);
        });
        overlay.appendChild(pin);
        this._updateCount();
    }

    _renderRegion(ann) {
        const overlay = document.getElementById('an-overlay');
        const region = document.createElement('div');
        region.className = 'an-region';
        region.style.left = `${ann.x}%`;
        region.style.top = `${ann.y}%`;
        region.style.width = `${ann.width}%`;
        region.style.height = `${ann.height}%`;
        region.dataset.annId = ann.id;
        region.addEventListener('click', (e) => {
            e.stopPropagation();
            this._selectAnnotation(ann.id);
        });
        overlay.appendChild(region);
        this._updateCount();
    }

    _renderThreads() {
        const container = document.getElementById('an-threads');
        const filter = document.getElementById('an-filter').value;
        const annotations = this.engine.getForItem('demo', filter !== 'all' ? { status: filter } : {});

        container.innerHTML = annotations.map(ann => {
            const thread = this.threads.getThread(ann.id);
            const lastMsg = thread.messages[thread.messages.length - 1];
            const timeAgo = this._timeAgo(ann.createdAt);
            return `
        <div class="an-thread ${ann.status === 'resolved' ? 'resolved' : ''}" data-ann-id="${ann.id}">
          <div class="an-thread-header">
            <span class="an-thread-author">${lastMsg?.reviewerName || 'Unknown'}</span>
            <span class="an-thread-time">${timeAgo}</span>
          </div>
          <div class="an-thread-content">${ann.content}</div>
          <div class="an-thread-meta">
            <span class="an-thread-badge">${ann.type}</span>
            <span class="an-thread-badge">${ann.status}</span>
            ${thread.messages.length > 1 ? `<span class="an-thread-badge">${thread.messages.length} replies</span>` : ''}
          </div>
        </div>
      `;
        }).join('');

        container.querySelectorAll('.an-thread').forEach(el => {
            el.addEventListener('click', () => this._selectAnnotation(el.dataset.annId));
        });
    }

    _selectAnnotation(id) {
        this.selectedAnnotation = id;
        // Highlight pin/region
        document.querySelectorAll('.an-pin, .an-region').forEach(el => el.style.outline = 'none');
        const el = document.querySelector(`[data-ann-id="${id}"]`);
        if (el && (el.classList.contains('an-pin') || el.classList.contains('an-region'))) {
            el.style.outline = '3px solid var(--an-accent)';
        }
    }

    _updateCount() {
        const count = this.engine.getForItem('demo').length;
        document.getElementById('an-count').textContent = `${count} annotation${count !== 1 ? 's' : ''}`;
    }

    _timeAgo(ts) {
        const diff = Date.now() - ts;
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        return `${Math.floor(diff / 3600000)}h ago`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.annotationApp = new AnnotationApp();
});
