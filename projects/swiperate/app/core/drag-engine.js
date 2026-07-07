/**
 * SwipeRate Drag Engine
 * Handles XY pointer tracking + XYZ depth mapping with momentum physics
 */

export class DragEngine {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            friction: 0.92,
            snapBackDuration: 300,
            depthSensitivity: 0.5,
            deadZone: 20,
            zEnabled: options.zEnabled ?? true,
            ...options
        };

        this.state = {
            isDragging: false,
            startX: 0, startY: 0,
            currentX: 0, currentY: 0,
            velocityX: 0, velocityY: 0,
            depth: 0, // Z-axis: 0 = neutral, -1 to 1 range
            lastTimestamp: 0,
            trail: [] // position trail for momentum calculation
        };

        this.zones = this._buildZoneMap();
        this.listeners = { dragStart: [], dragMove: [], dragEnd: [], zoneEnter: [], zoneLeave: [] };
        this._currentZone = null;
        this._boundHandlers = {};
        this._init();
    }

    _init() {
        const el = this.container;
        this._boundHandlers = {
            pointerDown: this._onPointerDown.bind(this),
            pointerMove: this._onPointerMove.bind(this),
            pointerUp: this._onPointerUp.bind(this),
            wheel: this._onWheel.bind(this),
            touchMove: this._onTouchMove.bind(this)
        };
        el.addEventListener('pointerdown', this._boundHandlers.pointerDown);
        window.addEventListener('pointermove', this._boundHandlers.pointerMove);
        window.addEventListener('pointerup', this._boundHandlers.pointerUp);
        if (this.options.zEnabled) {
            el.addEventListener('wheel', this._boundHandlers.wheel, { passive: false });
            el.addEventListener('touchmove', this._boundHandlers.touchMove, { passive: false });
        }
    }

    _buildZoneMap() {
        // 9 XY quadrants + depth layers
        return {
            'top-left': { x: [-1, -0.33], y: [-1, -0.33], label: 'Top Left' },
            'top-center': { x: [-0.33, 0.33], y: [-1, -0.33], label: 'Top Center' },
            'top-right': { x: [0.33, 1], y: [-1, -0.33], label: 'Top Right' },
            'middle-left': { x: [-1, -0.33], y: [-0.33, 0.33], label: 'Middle Left' },
            'middle-center': { x: [-0.33, 0.33], y: [-0.33, 0.33], label: 'Center' },
            'middle-right': { x: [0.33, 1], y: [-0.33, 0.33], label: 'Middle Right' },
            'bottom-left': { x: [-1, -0.33], y: [0.33, 1], label: 'Bottom Left' },
            'bottom-center': { x: [-0.33, 0.33], y: [0.33, 1], label: 'Bottom Center' },
            'bottom-right': { x: [0.33, 1], y: [0.33, 1], label: 'Bottom Right' }
        };
    }

    _onPointerDown(e) {
        if (e.button !== 0) return;
        this.state.isDragging = true;
        this.state.startX = e.clientX;
        this.state.startY = e.clientY;
        this.state.currentX = 0;
        this.state.currentY = 0;
        this.state.depth = 0;
        this.state.lastTimestamp = performance.now();
        this.state.trail = [{ x: 0, y: 0, t: this.state.lastTimestamp }];
        this._currentZone = null;
        this.container.setPointerCapture(e.pointerId);
        this._emit('dragStart', this._snapshot());
    }

    _onPointerMove(e) {
        if (!this.state.isDragging) return;
        const rect = this.container.getBoundingClientRect();
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;

        const rawX = e.clientX - this.state.startX;
        const rawY = e.clientY - this.state.startY;

        // Normalize to -1..1 relative to container
        this.state.currentX = Math.max(-1, Math.min(1, rawX / halfW));
        this.state.currentY = Math.max(-1, Math.min(1, rawY / halfH));

        const now = performance.now();
        const dt = now - this.state.lastTimestamp;
        if (dt > 0) {
            const last = this.state.trail[this.state.trail.length - 1];
            this.state.velocityX = (this.state.currentX - last.x) / dt * 1000;
            this.state.velocityY = (this.state.currentY - last.y) / dt * 1000;
        }
        this.state.lastTimestamp = now;
        this.state.trail.push({ x: this.state.currentX, y: this.state.currentY, t: now });
        if (this.state.trail.length > 10) this.state.trail.shift();

        // Zone detection
        const zone = this._detectZone(this.state.currentX, this.state.currentY);
        if (zone !== this._currentZone) {
            if (this._currentZone) this._emit('zoneLeave', { zone: this._currentZone, ...this._snapshot() });
            this._currentZone = zone;
            if (zone) this._emit('zoneEnter', { zone, ...this._snapshot() });
        }

        this._emit('dragMove', this._snapshot());
    }

    _onPointerUp(e) {
        if (!this.state.isDragging) return;
        this.state.isDragging = false;

        const distance = Math.sqrt(this.state.currentX ** 2 + this.state.currentY ** 2);
        const inDeadZone = distance * Math.max(
            this.container.getBoundingClientRect().width,
            this.container.getBoundingClientRect().height
        ) / 2 < this.options.deadZone;

        this._emit('dragEnd', {
            ...this._snapshot(),
            zone: this._currentZone,
            committed: !inDeadZone,
            velocity: { x: this.state.velocityX, y: this.state.velocityY }
        });

        this._currentZone = null;
    }

    _onWheel(e) {
        if (!this.state.isDragging) return;
        e.preventDefault();
        this.state.depth = Math.max(-1, Math.min(1,
            this.state.depth + (e.deltaY > 0 ? -0.05 : 0.05) * this.options.depthSensitivity
        ));
        this._emit('dragMove', this._snapshot());
    }

    _onTouchMove(e) {
        if (!this.state.isDragging || e.touches.length < 2) return;
        e.preventDefault();
        // Pinch-to-depth: distance between two fingers
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.sqrt((t2.clientX - t1.clientX) ** 2 + (t2.clientY - t1.clientY) ** 2);
        const maxDist = Math.max(this.container.offsetWidth, this.container.offsetHeight);
        this.state.depth = Math.max(-1, Math.min(1, (dist / maxDist - 0.5) * 2));
        this._emit('dragMove', this._snapshot());
    }

    _detectZone(nx, ny) {
        for (const [name, bounds] of Object.entries(this.zones)) {
            if (nx >= bounds.x[0] && nx < bounds.x[1] && ny >= bounds.y[0] && ny < bounds.y[1]) {
                return name;
            }
        }
        return null;
    }

    _snapshot() {
        return {
            x: this.state.currentX,
            y: this.state.currentY,
            z: this.state.depth,
            normalizedX: (this.state.currentX + 1) / 2, // 0..1
            normalizedY: (this.state.currentY + 1) / 2,
            normalizedZ: (this.state.depth + 1) / 2,
            isDragging: this.state.isDragging,
            zone: this._currentZone
        };
    }

    on(event, callback) {
        if (this.listeners[event]) this.listeners[event].push(callback);
        return this;
    }

    off(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
        return this;
    }

    _emit(event, data) {
        (this.listeners[event] || []).forEach(cb => cb(data));
    }

    setZEnabled(enabled) {
        this.options.zEnabled = enabled;
    }

    destroy() {
        const el = this.container;
        el.removeEventListener('pointerdown', this._boundHandlers.pointerDown);
        window.removeEventListener('pointermove', this._boundHandlers.pointerMove);
        window.removeEventListener('pointerup', this._boundHandlers.pointerUp);
        el.removeEventListener('wheel', this._boundHandlers.wheel);
        el.removeEventListener('touchmove', this._boundHandlers.touchMove);
    }
}
