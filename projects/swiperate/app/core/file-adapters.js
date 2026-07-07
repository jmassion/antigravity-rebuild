/**
 * SwipeRate File Adapters
 * Renders previews for different file types: image, video, audio, 3D, document
 */

export class FileAdapterRegistry {
    constructor() {
        this.adapters = new Map();
        this._registerDefaults();
    }

    _registerDefaults() {
        this.register('image', new ImageAdapter());
        this.register('video', new VideoAdapter());
        this.register('audio', new AudioAdapter());
        this.register('3d', new ThreeDAdapter());
        this.register('document', new DocumentAdapter());
    }

    register(type, adapter) {
        this.adapters.set(type, adapter);
    }

    getAdapter(fileType) {
        return this.adapters.get(fileType) || this.adapters.get('document');
    }

    detectType(file) {
        if (!file) return 'document';
        const ext = (file.name || file.url || '').split('.').pop().toLowerCase();
        const mimeType = file.type || '';

        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext) || mimeType.startsWith('image/'))
            return 'image';
        if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext) || mimeType.startsWith('video/'))
            return 'video';
        if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext) || mimeType.startsWith('audio/'))
            return 'audio';
        if (['glb', 'gltf', 'obj', 'fbx', 'stl', 'usdz'].includes(ext))
            return '3d';
        return 'document';
    }
}

class ImageAdapter {
    render(file, container) {
        const img = document.createElement('img');
        img.src = file.url || file.src || URL.createObjectURL(file);
        img.alt = file.name || 'Image';
        img.className = 'sr-media-preview sr-image-preview';
        img.draggable = false;
        container.appendChild(img);
        return { type: 'image', el: img, cleanup: () => img.remove() };
    }

    thumbnail(file) {
        return file.url || file.src || (file instanceof Blob ? URL.createObjectURL(file) : '');
    }
}

class VideoAdapter {
    render(file, container) {
        const video = document.createElement('video');
        video.src = file.url || file.src || URL.createObjectURL(file);
        video.className = 'sr-media-preview sr-video-preview';
        video.controls = false;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.autoplay = true;
        container.appendChild(video);
        return {
            type: 'video',
            el: video,
            play: () => video.play(),
            pause: () => video.pause(),
            seek: (t) => { video.currentTime = t; },
            duration: () => video.duration,
            cleanup: () => { video.pause(); video.remove(); }
        };
    }

    thumbnail(file) {
        return file.thumbnail || file.url || '';
    }
}

class AudioAdapter {
    render(file, container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'sr-media-preview sr-audio-preview';

        // Waveform visualization
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 120;
        canvas.className = 'sr-audio-waveform';
        wrapper.appendChild(canvas);

        const audio = document.createElement('audio');
        audio.src = file.url || file.src || URL.createObjectURL(file);
        audio.controls = true;
        audio.className = 'sr-audio-player';
        wrapper.appendChild(audio);

        // Title
        const title = document.createElement('div');
        title.className = 'sr-audio-title';
        title.textContent = file.name || 'Audio Track';
        wrapper.appendChild(title);

        container.appendChild(wrapper);

        this._drawWaveform(canvas);

        return {
            type: 'audio',
            el: wrapper,
            play: () => audio.play(),
            pause: () => audio.pause(),
            seek: (t) => { audio.currentTime = t; },
            duration: () => audio.duration,
            cleanup: () => { audio.pause(); wrapper.remove(); }
        };
    }

    _drawWaveform(canvas) {
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        const bars = 60;
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, '#7c3aed');
        gradient.addColorStop(1, '#06b6d4');
        ctx.fillStyle = gradient;
        for (let i = 0; i < bars; i++) {
            const barH = Math.random() * h * 0.8 + h * 0.1;
            const x = (i / bars) * w;
            const barW = (w / bars) * 0.7;
            ctx.fillRect(x, (h - barH) / 2, barW, barH);
        }
    }

    thumbnail() {
        return '';
    }
}

class ThreeDAdapter {
    render(file, container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'sr-media-preview sr-3d-preview';
        wrapper.innerHTML = `
      <div class="sr-3d-placeholder">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <span>${file.name || '3D Model'}</span>
      </div>
    `;
        container.appendChild(wrapper);
        return { type: '3d', el: wrapper, cleanup: () => wrapper.remove() };
    }

    thumbnail() {
        return '';
    }
}

class DocumentAdapter {
    render(file, container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'sr-media-preview sr-doc-preview';
        wrapper.innerHTML = `
      <div class="sr-doc-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14,2 14,8 20,8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10,9 9,9 8,9"/>
        </svg>
      </div>
      <div class="sr-doc-name">${file.name || 'Document'}</div>
      <div class="sr-doc-meta">${file.size ? (file.size / 1024).toFixed(1) + ' KB' : ''}</div>
    `;
        container.appendChild(wrapper);
        return { type: 'document', el: wrapper, cleanup: () => wrapper.remove() };
    }

    thumbnail() {
        return '';
    }
}
