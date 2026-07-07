/**
 * Dating App Demo — SwipeRate in action
 * X = Attractiveness, Y = Personality, Z = Compatibility
 */

import { DragEngine } from '../../app/core/drag-engine.js';
import { RatingResolver } from '../../app/core/rating-resolver.js';
import { HistoryManager } from '../../app/core/history.js';

const PROFILES = [
    { id: 'p1', name: 'Luna', age: 28, bio: 'Stargazer, book lover, coffee addict ☕', tags: ['Travel', 'Art', 'Coffee'], image: 'https://randomuser.me/api/portraits/women/12.jpg' },
    { id: 'p2', name: 'Atlas', age: 31, bio: 'Rock climber, tech nerd, amateur chef 🍳', tags: ['Adventure', 'Tech', 'Cooking'], image: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 'p3', name: 'Nova', age: 25, bio: 'DJ by night, designer by day 🎨', tags: ['Music', 'Design', 'Nightlife'], image: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 'p4', name: 'River', age: 29, bio: 'Yoga instructor, nature photographer 🌿', tags: ['Yoga', 'Nature', 'Photography'], image: 'https://randomuser.me/api/portraits/men/46.jpg' },
    { id: 'p5', name: 'Sage', age: 27, bio: 'Poet, philosopher, tea enthusiast 🍵', tags: ['Writing', 'Philosophy', 'Tea'], image: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { id: 'p6', name: 'Ember', age: 30, bio: 'Firefighter, adrenaline junkie, dog parent 🐕', tags: ['Sports', 'Animals', 'Fitness'], image: 'https://randomuser.me/api/portraits/men/62.jpg' },
    { id: 'p7', name: 'Sky', age: 26, bio: 'Pilot, world traveler, foodie 🌍', tags: ['Travel', 'Aviation', 'Food'], image: 'https://randomuser.me/api/portraits/women/26.jpg' },
    { id: 'p8', name: 'Willow', age: 24, bio: 'Artist, meditation guide, plant mom 🌱', tags: ['Art', 'Wellness', 'Plants'], image: 'https://randomuser.me/api/portraits/women/8.jpg' },
];

class DatingDemo {
    constructor() {
        this.arena = document.getElementById('dating-arena');
        this.stack = document.getElementById('dating-stack');
        this.currentIndex = 0;
        this.matches = [];

        this.resolver = new RatingResolver({
            xLabel: 'Attractiveness',
            yLabel: 'Personality',
            zLabel: 'Compatibility',
            invertY: true
        });

        this.history = new HistoryManager();
        this.dragEngine = new DragEngine(this.arena, { zEnabled: true });

        this._bindEvents();
        this._loadProfile();
    }

    _bindEvents() {
        this.dragEngine.on('dragStart', () => {
            document.getElementById('dating-hint').style.opacity = '0';
        });

        this.dragEngine.on('dragMove', (snap) => {
            const card = this.stack.querySelector('.dating-card');
            if (!card) return;

            const px = snap.x * 160;
            const py = snap.y * 160;
            const rot = snap.x * 18;
            const scale = 1 + snap.z * 0.12;
            card.style.transform = `translate(${px}px, ${py}px) rotate(${rot}deg) scale(${scale})`;

            // Update rating badge
            const badge = card.querySelector('.dating-rating-badge');
            if (badge) {
                badge.style.opacity = '1';
                const attract = Math.round(snap.normalizedX * 100);
                const personality = Math.round((1 - snap.normalizedY) * 100);
                const compat = Math.round(snap.normalizedZ * 100);
                badge.innerHTML = `
          <div class="dating-rating-row"><span class="dating-rating-label">Attract.</span><span class="dating-rating-val">${attract}</span></div>
          <div class="dating-rating-row"><span class="dating-rating-label">Person.</span><span class="dating-rating-val">${personality}</span></div>
          <div class="dating-rating-row"><span class="dating-rating-label">Compat.</span><span class="dating-rating-val">${compat}</span></div>
        `;
            }

            // Update depth bar
            const depthFill = card.querySelector('.dating-depth-fill');
            if (depthFill) depthFill.style.height = `${snap.normalizedZ * 100}%`;
        });

        this.dragEngine.on('dragEnd', async (snap) => {
            document.getElementById('dating-hint').style.opacity = '0.5';
            const rating = this.resolver.resolve(snap);
            const card = this.stack.querySelector('.dating-card');

            if (rating.resolved) {
                const profile = PROFILES[this.currentIndex];
                this.history.push({ itemId: profile.id, rating });

                // Add to matches
                this.matches.push({ profile, rating });
                document.getElementById('dating-count').textContent = this.matches.length;

                // Animate exit
                if (card) {
                    card.style.transition = 'transform 0.4s ease-out, opacity 0.3s';
                    card.style.transform = `translate(${snap.x > 0 ? 600 : -600}px, ${snap.y * 200}px) rotate(${snap.x > 0 ? 30 : -30}deg) scale(0.8)`;
                    card.style.opacity = '0';
                    await new Promise(r => setTimeout(r, 400));
                    card.remove();
                }

                this.currentIndex++;
                this._loadProfile();
            } else {
                // Snap back
                if (card) {
                    card.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    card.style.transform = 'translate(0, 0) rotate(0) scale(1)';
                }
            }
        });
    }

    _loadProfile() {
        if (this.currentIndex >= PROFILES.length) {
            document.getElementById('dating-hint').innerHTML = '<p>All profiles rated! 💜</p><p class="hint-sub">Check your matches</p>';
            document.getElementById('dating-hint').style.opacity = '1';
            return;
        }

        const p = PROFILES[this.currentIndex];

        const card = document.createElement('div');
        card.className = 'dating-card';
        card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="dating-card-photo" draggable="false">
      <div class="dating-card-info">
        <div class="dating-card-name">${p.name} <span class="dating-card-age">${p.age}</span></div>
        <p class="dating-card-bio">${p.bio}</p>
        <div class="dating-card-tags">${p.tags.map(t => `<span class="dating-tag">${t}</span>`).join('')}</div>
      </div>
      <div class="dating-rating-badge"></div>
      <div class="dating-depth"><div class="dating-depth-fill"></div></div>
    `;
        this.stack.appendChild(card);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.datingDemo = new DatingDemo();
});
