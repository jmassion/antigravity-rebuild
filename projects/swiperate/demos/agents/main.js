/**
 * Agent Creator Demo — SwipeRate for building AI teams
 * X = Technical Skill, Y = Creativity, Z = Reliability
 */

import { DragEngine } from '../../app/core/drag-engine.js';
import { RatingResolver } from '../../app/core/rating-resolver.js';
import { HistoryManager } from '../../app/core/history.js';

const AGENTS = [
    { id: 'a1', name: 'CodeMaster', type: 'Developer', desc: 'Full-stack code generation specialist. Expert in 40+ languages.', skills: ['Python', 'TypeScript', 'Rust', 'Go'], color: '#3b82f6', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=CodeMaster' },
    { id: 'a2', name: 'VisioAI', type: 'Designer', desc: 'UI/UX design agent with pixel-perfect output generation.', skills: ['Figma', 'CSS', 'Branding', 'Motion'], color: '#e879f9', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=VisioAI' },
    { id: 'a3', name: 'DataSage', type: 'Analyst', desc: 'Deep data analysis, pattern recognition and predictive modeling.', skills: ['SQL', 'Statistics', 'ML', 'Viz'], color: '#22c55e', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=DataSage' },
    { id: 'a4', name: 'WordSmith', type: 'Writer', desc: 'Content creation, copywriting, and multilingual translation.', skills: ['Copy', 'SEO', 'Translation', 'Tone'], color: '#f59e0b', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=WordSmith' },
    { id: 'a5', name: 'StratBot', type: 'Strategist', desc: 'Business strategy, market analysis, and growth planning.', skills: ['Strategy', 'Research', 'Planning', 'OKRs'], color: '#ef4444', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=StratBot' },
    { id: 'a6', name: 'TestGuard', type: 'QA Engineer', desc: 'Automated testing, bug detection, and quality assurance.', skills: ['Testing', 'CI/CD', 'Security', 'Perf'], color: '#06b6d4', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=TestGuard' },
    { id: 'a7', name: 'OpsRunner', type: 'DevOps', desc: 'Infrastructure management, deployment automation, monitoring.', skills: ['Docker', 'K8s', 'AWS', 'Terraform'], color: '#8b5cf6', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=OpsRunner' },
    { id: 'a8', name: 'ResearchBot', type: 'Researcher', desc: 'Academic research, literature review, and synthesis.', skills: ['Papers', 'Analysis', 'Citations', 'Summary'], color: '#10b981', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=ResearchBot' },
    { id: 'a9', name: 'SupportPro', type: 'Support', desc: 'Customer support, ticket routing, and issue resolution.', skills: ['Chat', 'Tickets', 'Empathy', 'KB'], color: '#f97316', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=SupportPro' },
    { id: 'a10', name: 'SecuriBot', type: 'Security', desc: 'Vulnerability scanning, threat detection, compliance checking.', skills: ['Pentest', 'OWASP', 'Audit', 'Encrypt'], color: '#dc2626', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=SecuriBot' },
];

class AgentDemo {
    constructor() {
        this.arena = document.getElementById('agent-arena');
        this.stack = document.getElementById('agent-stack');
        this.teamList = document.getElementById('agent-team-list');
        this.currentIndex = 0;
        this.team = [];

        this.resolver = new RatingResolver({
            xLabel: 'Technical Skill',
            yLabel: 'Creativity',
            zLabel: 'Reliability',
            invertY: true
        });

        this.history = new HistoryManager();
        this.dragEngine = new DragEngine(this.arena, { zEnabled: true });

        this._bindEvents();
        this._loadAgent();
    }

    _bindEvents() {
        this.dragEngine.on('dragStart', () => {
            document.getElementById('agent-hint').style.opacity = '0';
        });

        this.dragEngine.on('dragMove', (snap) => {
            const card = this.stack.querySelector('.agent-card');
            if (!card) return;

            const px = snap.x * 160;
            const py = snap.y * 160;
            const rot = snap.x * 15;
            const scale = 1 + snap.z * 0.1;
            card.style.transform = `translate(${px}px, ${py}px) rotate(${rot}deg) scale(${scale})`;

            const badge = card.querySelector('.agent-rating-badge');
            if (badge) {
                badge.style.opacity = '1';
                badge.innerHTML = `
          <div class="agent-rating-row"><span class="agent-rating-label">Tech</span><span class="agent-rating-val">${Math.round(snap.normalizedX * 100)}</span></div>
          <div class="agent-rating-row"><span class="agent-rating-label">Creative</span><span class="agent-rating-val">${Math.round((1 - snap.normalizedY) * 100)}</span></div>
          <div class="agent-rating-row"><span class="agent-rating-label">Reliable</span><span class="agent-rating-val">${Math.round(snap.normalizedZ * 100)}</span></div>
        `;
            }
        });

        this.dragEngine.on('dragEnd', async (snap) => {
            document.getElementById('agent-hint').style.opacity = '0.5';
            const rating = this.resolver.resolve(snap);
            const card = this.stack.querySelector('.agent-card');

            if (rating.resolved) {
                const agent = AGENTS[this.currentIndex];
                this.history.push({ itemId: agent.id, rating });

                // Add to team if tier A or above
                this.team.push({ agent, rating });
                this._updateTeam();
                this._updateStats();

                if (card) {
                    card.style.transition = 'transform 0.4s ease-out, opacity 0.3s';
                    card.style.transform = `translate(${snap.x > 0 ? 600 : -600}px, ${snap.y * 200}px) rotate(${snap.x > 0 ? 25 : -25}deg) scale(0.8)`;
                    card.style.opacity = '0';
                    await new Promise(r => setTimeout(r, 400));
                    card.remove();
                }

                this.currentIndex++;
                this._loadAgent();
            } else {
                if (card) {
                    card.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                    card.style.transform = 'translate(0, 0) rotate(0) scale(1)';
                }
            }
        });
    }

    _loadAgent() {
        if (this.currentIndex >= AGENTS.length) {
            document.getElementById('agent-hint').innerHTML = '<p>All agents evaluated! 🤖</p><p class="hint-sub">Your dream team is ready</p>';
            document.getElementById('agent-hint').style.opacity = '1';
            return;
        }

        const a = AGENTS[this.currentIndex];
        const bgGrad = `linear-gradient(135deg, ${a.color}33 0%, ${a.color}11 100%)`;

        const card = document.createElement('div');
        card.className = 'agent-card';
        card.innerHTML = `
      <div class="agent-card-visual" style="background:${bgGrad}">
        <span class="agent-card-type">${a.type}</span>
        <img class="agent-card-avatar" style="background:${a.color}11; border: 2px solid ${a.color}55;" src="${a.image}" alt="${a.name}" draggable="false" />
      </div>
      <div class="agent-card-info">
        <div class="agent-card-name">${a.name}</div>
        <p class="agent-card-desc">${a.desc}</p>
        <div class="agent-card-skills">${a.skills.map(s => `<span class="agent-skill">${s}</span>`).join('')}</div>
      </div>
      <div class="agent-rating-badge"></div>
    `;
        this.stack.appendChild(card);
    }

    _updateTeam() {
        // Sort by tier
        const sorted = [...this.team].sort((a, b) => {
            const order = { S: 0, A: 1, B: 2, C: 3, D: 4 };
            return (order[a.rating.tier] || 5) - (order[b.rating.tier] || 5);
        });

        this.teamList.innerHTML = sorted.map(({ agent, rating }) => {
            const tierColors = { S: '#fbbf24', A: '#8b5cf6', B: '#22c55e', C: '#3b82f6', D: '#6b7280' };
            return `
        <div class="agent-team-member">
          <img class="agent-team-member-avatar" style="background:${agent.color}11; border: 1px solid ${agent.color}55;" src="${agent.image}" alt="${agent.name}" draggable="false" />
          <div class="agent-team-member-info">
            <div class="agent-team-member-name">${agent.name}</div>
            <div style="font-size:11px;color:var(--ag-muted)">${agent.type}</div>
          </div>
          <span class="agent-team-member-tier" style="background:${tierColors[rating.tier] || '#666'}">${rating.tier}</span>
        </div>
      `;
        }).join('');
    }

    _updateStats() {
        document.getElementById('agent-evaluated').textContent = this.team.length;
        const elites = this.team.filter(t => t.rating.tier === 'S' || t.rating.tier === 'A').length;
        document.getElementById('agent-team-size').textContent = elites;

        const summary = document.getElementById('agent-team-summary');
        const avgScores = {};
        if (this.team.length > 0) {
            for (const { rating } of this.team) {
                for (const [key, val] of Object.entries(rating.scores)) {
                    avgScores[key] = (avgScores[key] || 0) + val;
                }
            }
            for (const key of Object.keys(avgScores)) avgScores[key] = Math.round(avgScores[key] / this.team.length);
            summary.innerHTML = `Avg: ${Object.entries(avgScores).map(([k, v]) => `${k}: ${v}`).join(' · ')}`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.agentDemo = new AgentDemo();
});
