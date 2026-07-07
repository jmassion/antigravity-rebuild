/* ============================================
   NoahOS Wiki — Data Store
   All AntiGravity doc pages with live docs URLs
   ============================================ */

const DOCS_BASE = 'https://antigravity.google/docs';

const WIKI_DATA = {
    categories: [
        { id: 'core', label: '🏠 Core Platform', color: 'cyan' },
        { id: 'agent', label: '🤖 Agent', color: 'purple' },
        { id: 'editor', label: '✏️ Editor', color: 'cyan' },
        { id: 'manager', label: '🎛️ Agent Manager', color: 'purple' },
        { id: 'tools', label: '🔧 Tools', color: 'mint' },
        { id: 'security', label: '🛡️ Security & Browser', color: 'pink' },
        { id: 'artifacts', label: '📋 Artifacts', color: 'mint' },
        { id: 'misc', label: '⚙️ Misc', color: 'gold' },
    ],

    pages: [
        // ─── Core Platform ────────────────────────
        {
            slug: 'home',
            title: 'Home',
            icon: '🏠',
            category: 'core',
            tag: 'Core',
            docsUrl: `${DOCS_BASE}/home`,
            image: null,
            description: 'Welcome to AntiGravity — the agentic development platform.',
            imported: true,
            noahContent: `
<h2>Welcome to the Holodeck</h2>
<p>AntiGravity is an agentic development platform that evolves the IDE for an agent-first era. Just like Lumi stepping through her portal for the first time, your journey begins here.</p>
<div class="highlight-box"><h4>🐸 Lumi Says:</h4><p>"Welcome to my world! Let me show you everything AntiGravity can do."</p></div>
<h2>What is AntiGravity?</h2>
<p>AntiGravity provides three levels of AI interaction: <strong>Tab</strong> (autocomplete), <strong>Command</strong> (inline edits), and the full <strong>Agent</strong> (complex multi-step tasks). Everything is powered by frontier AI models.</p>`
        },
        {
            slug: 'getting-started',
            title: 'Getting Started',
            icon: '🚪',
            category: 'core',
            tag: 'Core',
            docsUrl: `${DOCS_BASE}/get-started`,
            image: 'getting-started.png',
            description: 'Step through the portal into AntiGravity. Available on macOS 12+, Windows 10 64-bit, and Linux.',
            imported: true,
            noahContent: `
<h2>Welcome to the Holodeck</h2>
<p>AntiGravity is an agentic development platform that evolves the IDE for an agent-first era. Just like Lumi stepping through her portal for the first time, your journey begins with a single step.</p>
<div class="highlight-box"><h4>🐸 Lumi Says:</h4><p>"The first time I stepped through the portal, everything changed. The holodeck came alive around me, and Ribbit was right there waiting!"</p></div>
<h2>System Requirements</h2>
<ul>
<li><strong>macOS</strong> — Version 12 (Monterey) or later</li>
<li><strong>Windows</strong> — Windows 10 64-bit or later</li>
<li><strong>Linux</strong> — Most modern distributions supported</li>
</ul>
<h2>Your First Session</h2>
<p>Once installed, the <strong>Agent Manager</strong> is your central hub — your holodeck command console. Access it anytime with <code>Cmd + E</code> (macOS) or <code>Ctrl + E</code> (Windows/Linux).</p>
<h3>Step 1: Open the Portal</h3>
<p>Launch AntiGravity and you will be greeted by your AI agent companion, ready to help with any task.</p>
<h3>Step 2: Explore the Holodeck</h3>
<p>The interface adapts to your needs — from code editing to project management, from research to deployment.</p>
<h3>Step 3: Start Building</h3>
<p>Type your first prompt or open a project to begin. Your agent will guide you through the rest.</p>`
        },

        // ─── Agent ────────────────────────────────
        {
            slug: 'agent',
            title: 'The Agent',
            icon: '🐸',
            category: 'agent',
            tag: 'Agent',
            docsUrl: `${DOCS_BASE}/agent`,
            image: 'agent.png',
            description: 'Meet your AI agent — powered by frontier LLMs, capable of multi-step reasoning, tool use, and artifact creation.',
            imported: true,
            noahContent: `
<h2>Meet Ribbit — Your AI Partner</h2>
<p>In Lumi's world, Ribbit starts as a cute plushie companion but transforms into a powerful AI agent when work needs to be done. Similarly, the AntiGravity agent is unassuming until activated — then it becomes your most powerful tool.</p>
<h2>What Can the Agent Do?</h2>
<ul>
<li><strong>Multi-step reasoning</strong> — Break complex problems into actionable steps</li>
<li><strong>Tool use</strong> — Browse the web, run terminal commands, edit files</li>
<li><strong>Artifact creation</strong> — Generate plans, code, documentation, and more</li>
<li><strong>Code understanding</strong> — Navigate and comprehend entire codebases</li>
<li><strong>Browser automation</strong> — Test and interact with web applications</li>
</ul>
<h2>How to Interact</h2>
<p>Simply describe what you need. The agent understands natural language and will figure out the best approach.</p>
<div class="highlight-box"><h4>🐸 Ribbit Says:</h4><p>"I might look like a plushie, but I can refactor your entire codebase, debug production issues, and even browse the web for documentation — all while you take a snack break!"</p></div>`
        },
        {
            slug: 'models',
            title: 'AI Models',
            icon: '🌌',
            category: 'agent',
            tag: 'Agent',
            docsUrl: `${DOCS_BASE}/models`,
            image: 'models.png',
            description: 'Choose from a constellation of frontier AI models — each bringing unique strengths.',
            imported: true,
            noahContent: `
<h2>The Model Constellation</h2>
<p>Like choosing which star to navigate by, selecting the right AI model shapes your entire experience.</p>
<h2>Available Models</h2>
<h3>✨ Gemini 3.1 Pro</h3>
<p>Google's flagship model. Excellent at complex reasoning, code generation, and multi-modal tasks.</p>
<h3>🌊 Gemini 3 Flash</h3>
<p>Lightning-fast responses for simpler tasks. Perfect for quick edits and rapid iteration.</p>
<h3>🪶 Claude Sonnet / Opus 4.6</h3>
<p>Anthropic's thinking models with deep reasoning capabilities.</p>
<h3>⚙️ GPT-OSS-120b</h3>
<p>OpenAI's open-source powerhouse. A strong all-rounder.</p>
<div class="highlight-box"><h4>💡 Sticky Selection</h4><p>Your model choice is "sticky" per conversation — once you select a model, it stays active for that entire session.</p></div>`
        },
        {
            slug: 'agent-modes',
            title: 'Agent Modes & Settings',
            icon: '⚡',
            category: 'agent',
            tag: 'Agent',
            docsUrl: `${DOCS_BASE}/agent-modes-settings`,
            image: 'agent-modes.png',
            description: 'Switch between Planning Mode for deep research and Fast Mode for quick tasks.',
            imported: true,
            noahContent: `
<h2>Two Sides of the Holodeck</h2>
<p>Just like Lumi can switch between careful planning and rapid execution, the agent has two distinct modes.</p>
<h2>🧠 Planning Mode</h2>
<p>For deep research and complex, multi-file tasks:</p>
<ul>
<li>Takes time to thoroughly understand requirements</li>
<li>Organizes work into <strong>Task Groups</strong> for visibility</li>
<li>Creates implementation plans before making changes</li>
<li>Requests your approval at key decision points</li>
</ul>
<h2>⚡ Fast Mode</h2>
<p>For simple, localized tasks where speed is the priority:</p>
<ul>
<li>Prioritizes rapid response and execution</li>
<li>Focuses on single-file or small-scope changes</li>
<li>Minimizes overhead and planning steps</li>
<li>Gets you results in seconds, not minutes</li>
</ul>
<div class="highlight-box"><h4>🐸 Lumi's Tip:</h4><p>"I use Planning Mode when I'm redesigning a whole room in the holodeck, and Fast Mode when I just need to fix a light panel."</p></div>`
        },
        {
            slug: 'rules-workflows',
            title: 'Rules & Workflows',
            icon: '📜',
            category: 'agent',
            tag: 'Agent',
            docsUrl: `${DOCS_BASE}/rules-workflows`,
            image: 'rules-workflows.png',
            description: 'Set global rules and define repeatable workflow steps.',
            imported: true,
            noahContent: `
<h2>The Garden Path of Automation</h2>
<p>Rules are like glowing rune stones that guide behavior, and workflows are the paths those stones create.</p>
<h2>📝 Rules</h2>
<h3>Global Rules</h3>
<p>Stored in <code>~/.gemini/GEMINI.md</code>, these apply to every workspace.</p>
<h3>Workspace Rules</h3>
<p>Stored in <code>.agent/rules</code>, these apply to a specific project.</p>
<h2>🔄 Workflows</h2>
<p>Markdown-defined steps for repetitive tasks. Invoke with <code>/workflow-name</code> in the agent chat.</p>
<div class="highlight-box"><h4>💡 Invoking Workflows</h4><p>Type <code>/workflow-name</code> in the agent chat to invoke a workflow.</p></div>`
        },
        {
            slug: 'skills',
            title: 'Skills',
            icon: '🎒',
            category: 'agent',
            tag: 'Agent',
            docsUrl: `${DOCS_BASE}/skills`,
            image: 'skills.png',
            description: 'Reusable skill packs that extend the agent\'s abilities.',
            imported: true,
            noahContent: `
<h2>Your Power-Up Inventory</h2>
<p>Skills are like collectible power-up cards. Each skill pack teaches the agent new specialized abilities.</p>
<h2>Skill Structure</h2>
<ul>
<li><code>SKILL.md</code> — The main instruction file (required)</li>
<li><code>scripts/</code> — Helper scripts and utilities</li>
<li><code>examples/</code> — Reference implementations</li>
<li><code>resources/</code> — Additional assets and templates</li>
</ul>`
        },
        {
            slug: 'task-groups',
            title: 'Task Groups',
            icon: '📋',
            category: 'agent',
            tag: 'Agent',
            docsUrl: `${DOCS_BASE}/task-groups`,
            image: 'tasks.png',
            description: 'Break complex plans into smaller, auditable units of work.',
            imported: true,
            noahContent: `
<h2>The Branch Kanban Board</h2>
<p>Task Groups provide a visual breakdown of complex plans into smaller, manageable pieces of work.</p>
<h2>Tracking Progress</h2>
<ul>
<li>🟡 <strong>To Do</strong> — Tasks waiting to be started</li>
<li>🔵 <strong>In Progress</strong> — Currently being worked on</li>
<li>🟢 <strong>Done</strong> — Completed and verified</li>
</ul>
<div class="highlight-box"><h4>🌿 Organic Growth</h4><p>Task Groups grow organically as the agent discovers more about the problem.</p></div>`
        },
        {
            slug: 'browser-subagent',
            title: 'Browser Subagent',
            icon: '🌐',
            category: 'agent',
            tag: 'Agent',
            docsUrl: `${DOCS_BASE}/browser-subagent`,
            image: 'browser-subagent.png',
            description: 'Send mini-Ribbit into the browser — clicking, scrolling, capturing screenshots.',
            imported: true,
            noahContent: `
<h2>Ribbit Goes Browsing</h2>
<p>The Browser Subagent is like sending a miniature version of Ribbit inside a holographic web browser.</p>
<h2>What Can It Do?</h2>
<ul>
<li><strong>Click</strong> on buttons, links, and interactive elements</li>
<li><strong>Scroll</strong> through content and navigate pages</li>
<li><strong>Type</strong> text into forms and search fields</li>
<li><strong>Capture</strong> screenshots of page states</li>
<li><strong>Record</strong> action playback videos</li>
<li><strong>Extract</strong> DOM content and page data</li>
</ul>
<div class="highlight-box"><h4>🐸 Mini-Ribbit Says:</h4><p>"I might be small when I'm inside the browser, but I can click anything, read everything, and take screenshots along the way!"</p></div>`
        },
        {
            slug: 'strict-mode',
            title: 'Strict Mode',
            icon: '🔒',
            category: 'agent',
            tag: 'Security',
            docsUrl: `${DOCS_BASE}/strict-mode`,
            image: 'security.png',
            description: 'URL allow/deny lists, review policies, and workspace isolation.',
            imported: true,
            noahContent: `
<h2>Shields Up!</h2>
<p>Strict Mode enforces security boundaries to keep your holodeck safe.</p>
<h3>🌐 URL Allow/Deny Lists</h3>
<p>Control exactly which websites the agent can access.</p>
<h3>📋 Request Review Policies</h3>
<p>Require explicit approval before the agent runs terminal commands.</p>
<h3>📁 Workspace Isolation</h3>
<p>Restrict the agent to only access files within your current workspace.</p>
<div class="highlight-box"><h4>🛡️ When to Use Strict Mode</h4><p>Enable Strict Mode when working on sensitive projects or production environments.</p></div>`
        },
        {
            slug: 'sandbox',
            title: 'Sandboxing',
            icon: '🔮',
            category: 'agent',
            tag: 'Security',
            docsUrl: `${DOCS_BASE}/sandbox-mode`,
            image: 'sandbox.png',
            description: 'Kernel-level isolation for safe experimentation.',
            imported: true,
            noahContent: `
<h2>The Safety Snow Globe</h2>
<p>Sandbox Mode provides macOS kernel-level (Seatbelt) isolation for terminal commands.</p>
<ul>
<li><strong>File system access</strong> is limited to your workspace</li>
<li><strong>Network access</strong> can be restricted or blocked</li>
<li><strong>System modifications</strong> are prevented</li>
<li><strong>Dangerous commands</strong> are contained safely</li>
</ul>
<div class="highlight-box"><h4>⚠️ Platform Note</h4><p>Sandbox Mode is currently available on <strong>macOS only</strong>.</p></div>`
        },

        // ─── Editor ─────────────────────────────
        {
            slug: 'editor',
            title: 'Editor',
            icon: '✏️',
            category: 'editor',
            tag: 'Editor',
            docsUrl: `${DOCS_BASE}/editor`,
            image: 'editor.png',
            description: 'A VS Code-based environment with rich AI enhancements.',
            imported: true,
            noahContent: `
<h2>Your Crystalline Workspace</h2>
<p>The AntiGravity editor is built on VS Code, enhanced with AI superpowers that transform how you write code.</p>
<h2>AI-Enhanced Features</h2>
<h3>⚡ Tab — Advanced Autocomplete</h3>
<p>Context-aware completions that understand your entire codebase.</p>
<h3>💬 Command — Inline Instructions</h3>
<p>Press <code>Cmd + K</code> to open the inline command bar.</p>
<h3>🐸 Agent Panel</h3>
<p>The side panel where your full AI agent lives for complex, multi-step tasks.</p>
<div class="highlight-box"><h4>💡 Pro Tip</h4><p>Use Tab for quick completions, Command for single-file edits, and the Agent Panel for complex multi-file operations.</p></div>`
        },
        {
            slug: 'tab',
            title: 'Tab (Autocomplete)',
            icon: '⚡',
            category: 'editor',
            tag: 'Editor',
            docsUrl: `${DOCS_BASE}/tab`,
            image: null,
            description: 'Context-aware code completions that understand your codebase.',
            imported: true,
            noahContent: `<h2>Tab — Smart Autocomplete</h2><p>Press Tab to accept AI-powered code suggestions as you type. The model analyzes surrounding code, imports, and project structure to provide relevant completions.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'command',
            title: 'Command (Inline Edits)',
            icon: '💬',
            category: 'editor',
            tag: 'Editor',
            docsUrl: `${DOCS_BASE}/command`,
            image: null,
            description: 'Describe changes in natural language with inline commands.',
            imported: true,
            noahContent: `<h2>Command — Inline Edits</h2><p>Press <code>Cmd + K</code> to describe changes in natural language. The editor applies edits directly with a diff preview.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'agent-side-panel',
            title: 'Agent Side Panel',
            icon: '🤖',
            category: 'editor',
            tag: 'Editor',
            docsUrl: `${DOCS_BASE}/agent-side-panel`,
            image: null,
            description: 'Full AI agent in the editor side panel for complex tasks.',
            imported: true,
            noahContent: `<h2>Agent Side Panel</h2><p>The full AI agent lives in the editor side panel. Use it for complex, multi-step tasks: refactoring, debugging, research, generating tests, and more.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'review-changes-editor',
            title: 'Review Changes (Editor)',
            icon: '📝',
            category: 'editor',
            tag: 'Editor',
            docsUrl: `${DOCS_BASE}/review-changes-editor`,
            image: null,
            description: 'Review and accept agent-proposed code changes in the editor.',
            imported: true,
            noahContent: `<h2>Review Changes</h2><p>Review agent-proposed code changes with diff previews before accepting or rejecting them.</p><p>See the original docs for full details →</p>`
        },

        // ─── Agent Manager ──────────────────────
        {
            slug: 'agent-manager',
            title: 'Agent Manager',
            icon: '🎛️',
            category: 'manager',
            tag: 'Manager',
            docsUrl: `${DOCS_BASE}/agent-manager`,
            image: null,
            description: 'Central hub for managing agents, projects, and conversations.',
            imported: true,
            noahContent: `<h2>Command Center</h2><p>The Agent Manager is your central hub for interacting with the AI agent. Access it anytime with <code>Cmd + E</code>.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'workspaces',
            title: 'Workspaces',
            icon: '📁',
            category: 'manager',
            tag: 'Manager',
            docsUrl: `${DOCS_BASE}/workspaces`,
            image: null,
            description: 'Manage and switch between project workspaces.',
            imported: true,
            noahContent: `<h2>Workspaces</h2><p>Organize your projects and switch between different codebases.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'playground',
            title: 'Playground',
            icon: '🎮',
            category: 'manager',
            tag: 'Manager',
            docsUrl: `${DOCS_BASE}/playground`,
            image: null,
            description: 'Experiment with the AI agent without a project context.',
            imported: true,
            noahContent: `<h2>Playground</h2><p>A sandbox environment for experimenting with the AI agent without a specific project context.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'inbox',
            title: 'Inbox',
            icon: '📥',
            category: 'manager',
            tag: 'Manager',
            docsUrl: `${DOCS_BASE}/inbox`,
            image: null,
            description: 'Notifications and updates from your agent interactions.',
            imported: true,
            noahContent: `<h2>Inbox</h2><p>Track notifications and updates from your agent interactions.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'conversation-view',
            title: 'Conversation View',
            icon: '💬',
            category: 'manager',
            tag: 'Manager',
            docsUrl: `${DOCS_BASE}/conversation-view`,
            image: null,
            description: 'View and manage your agent conversations.',
            imported: true,
            noahContent: `<h2>Conversation View</h2><p>Browse, search, and manage your past agent conversations.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'browser-subagent-view',
            title: 'Browser Subagent View',
            icon: '🌐',
            category: 'manager',
            tag: 'Manager',
            docsUrl: `${DOCS_BASE}/browser-subagent-view`,
            image: null,
            description: 'View browser subagent actions and recordings.',
            imported: true,
            noahContent: `<h2>Browser Subagent View</h2><p>Watch live and recorded browser subagent sessions.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'panes',
            title: 'Panes',
            icon: '📐',
            category: 'manager',
            tag: 'Manager',
            docsUrl: `${DOCS_BASE}/panes`,
            image: null,
            description: 'Split and arrange your Agent Manager layout.',
            imported: true,
            noahContent: `<h2>Panes</h2><p>Customize your Agent Manager layout with split panes and arrangements.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'review-changes-manager',
            title: 'Review Changes (Manager)',
            icon: '📝',
            category: 'manager',
            tag: 'Manager',
            docsUrl: `${DOCS_BASE}/review-changes-manager`,
            image: null,
            description: 'Review and manage source control changes.',
            imported: true,
            noahContent: `<h2>Review Changes</h2><p>Review agent-proposed code changes in the Agent Manager view.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'changes-sidebar',
            title: 'Changes Sidebar',
            icon: '📊',
            category: 'manager',
            tag: 'Manager',
            docsUrl: `${DOCS_BASE}/changes-sidebar`,
            image: null,
            description: 'Track file changes and diffs in the sidebar.',
            imported: true,
            noahContent: `<h2>Changes Sidebar</h2><p>Track file modifications, additions, and deletions in the sidebar.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'terminal',
            title: 'Terminal',
            icon: '⬛',
            category: 'manager',
            tag: 'Manager',
            docsUrl: `${DOCS_BASE}/terminal`,
            image: null,
            description: 'Integrated terminal in the Agent Manager.',
            imported: true,
            noahContent: `<h2>Terminal</h2><p>Built-in terminal for running commands alongside your agent conversations.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'files',
            title: 'Files',
            icon: '📄',
            category: 'manager',
            tag: 'Manager',
            docsUrl: `${DOCS_BASE}/files`,
            image: null,
            description: 'File browser and manager.',
            imported: true,
            noahContent: `<h2>Files</h2><p>Browse, search, and manage your project files.</p><p>See the original docs for full details →</p>`
        },

        // ─── Tools ─────────────────────────────
        {
            slug: 'mcp',
            title: 'MCP Integration',
            icon: '🔌',
            category: 'tools',
            tag: 'Tools',
            docsUrl: `${DOCS_BASE}/mcp`,
            image: 'mcp.png',
            description: 'Connect your tools, databases, and services via Model Context Protocol.',
            imported: true,
            noahContent: `
<h2>Connecting the Network</h2>
<p>MCP (Model Context Protocol) is how Lumi connects her holodeck to external services.</p>
<h2>What Can You Connect?</h2>
<ul>
<li><strong>Databases</strong> — Query and manage your data stores</li>
<li><strong>APIs</strong> — Connect to external web services</li>
<li><strong>Local Tools</strong> — Integrate custom scripts and utilities</li>
<li><strong>Services</strong> — Link monitoring, CI/CD, and other platforms</li>
</ul>
<div class="highlight-box"><h4>💡 Getting Connected</h4><p>Configure your MCP servers in your workspace settings. The agent will automatically discover and use available tools.</p></div>`
        },

        // ─── Security & Browser ─────────────────
        {
            slug: 'browser',
            title: 'Browser',
            icon: '🌐',
            category: 'security',
            tag: 'Browser',
            docsUrl: `${DOCS_BASE}/browser`,
            image: null,
            description: 'Built-in browser for web interactions.',
            imported: true,
            noahContent: `<h2>Browser</h2><p>AntiGravity includes a built-in browser for web interactions and testing.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'chrome-extension',
            title: 'Chrome Extension',
            icon: '🧩',
            category: 'security',
            tag: 'Browser',
            docsUrl: `${DOCS_BASE}/chrome-extension`,
            image: null,
            description: 'Chrome extension for enhanced browser integration.',
            imported: true,
            noahContent: `<h2>Chrome Extension</h2><p>Install the Chrome extension for enhanced browser subagent integration.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'allowlist-denylist',
            title: 'Allowlist / Denylist',
            icon: '📋',
            category: 'security',
            tag: 'Browser',
            docsUrl: `${DOCS_BASE}/allowlist-denylist`,
            image: null,
            description: 'Configure which URLs the browser subagent can access.',
            imported: true,
            noahContent: `<h2>Allowlist / Denylist</h2><p>Control exactly which websites the browser subagent can access.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'separate-chrome-profile',
            title: 'Separate Chrome Profile',
            icon: '👤',
            category: 'security',
            tag: 'Browser',
            docsUrl: `${DOCS_BASE}/separate-chrome-profile`,
            image: null,
            description: 'Use a separate Chrome profile for the browser subagent.',
            imported: true,
            noahContent: `<h2>Separate Chrome Profile</h2><p>Configure a separate Chrome profile for browser subagent isolation.</p><p>See the original docs for full details →</p>`
        },

        // ─── Artifacts ─────────────────────────────
        {
            slug: 'artifacts',
            title: 'Artifacts Overview',
            icon: '📦',
            category: 'artifacts',
            tag: 'Artifacts',
            docsUrl: `${DOCS_BASE}/artifacts`,
            image: null,
            description: 'Overview of all artifact types created by the agent.',
            imported: true,
            noahContent: `<h2>Artifacts</h2><p>Artifacts are structured documents created by the agent to communicate work progress — plans, walkthroughs, task lists, and more.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'task-list',
            title: 'Task List',
            icon: '✅',
            category: 'artifacts',
            tag: 'Artifacts',
            docsUrl: `${DOCS_BASE}/task-list`,
            image: 'tasks.png',
            description: 'A living checklist that tracks your overarching goals.',
            imported: true,
            noahContent: `
<h2>The Growing Vine Checklist</h2>
<p>The Task List is a progress-tracking artifact. Like vines growing along the holodeck walls, it tracks progress visually.</p>
<h2>Format</h2>
<ul>
<li><code>[ ]</code> — Uncompleted tasks (bare branches)</li>
<li><code>[/]</code> — In progress tasks (budding vines)</li>
<li><code>[x]</code> — Completed tasks (flowering blooms)</li>
</ul>
<div class="highlight-box"><h4>🌱 Pro Tip</h4><p>Use indented sub-items for detailed breakdowns.</p></div>`
        },
        {
            slug: 'implementation-plan',
            title: 'Implementation Plan',
            icon: '📐',
            category: 'artifacts',
            tag: 'Artifacts',
            docsUrl: `${DOCS_BASE}/implementation-plan`,
            image: 'walkthrough.png',
            description: 'A technical plan for proposed changes requiring your approval.',
            imported: true,
            noahContent: `
<h2>The Holographic Blueprint</h2>
<p>Before making changes, the agent creates an Implementation Plan — your chance to review and approve the approach.</p>
<h2>What it Contains</h2>
<ul>
<li><strong>Goal Description</strong> — What the change accomplishes</li>
<li><strong>Proposed Changes</strong> — Files to modify, create, or delete</li>
<li><strong>User Review Items</strong> — Breaking changes or design decisions</li>
<li><strong>Verification Plan</strong> — How changes will be tested</li>
</ul>
<div class="highlight-box"><h4>📐 Blueprint Review</h4><p>Take time to review carefully. Suggest modifications, ask questions, or approve as-is.</p></div>`
        },
        {
            slug: 'walkthrough',
            title: 'Walkthrough',
            icon: '🖼️',
            category: 'artifacts',
            tag: 'Artifacts',
            docsUrl: `${DOCS_BASE}/walkthrough`,
            image: 'walkthrough.png',
            description: 'A post-task summary of the updated codebase state.',
            imported: true,
            noahContent: `
<h2>The Gallery Tour</h2>
<p>After completing a task, the agent creates a Walkthrough — a summary of everything that was done.</p>
<h2>What's Included</h2>
<ul>
<li><strong>Changes Made</strong> — Everything that was modified</li>
<li><strong>What Was Tested</strong> — Verification steps taken</li>
<li><strong>Validation Results</strong> — Proof that things work</li>
<li><strong>Screenshots / Recordings</strong> — Visual evidence</li>
</ul>
<div class="highlight-box"><h4>🖼️ Visual Proof</h4><p>Walkthroughs often include embedded screenshots and browser recordings for UI changes.</p></div>`
        },
        {
            slug: 'screenshots',
            title: 'Screenshots',
            icon: '📸',
            category: 'artifacts',
            tag: 'Artifacts',
            docsUrl: `${DOCS_BASE}/screenshots`,
            image: null,
            description: 'Image artifacts captured during agent work.',
            imported: true,
            noahContent: `<h2>Screenshots</h2><p>Image artifacts captured at specific moments during the agent's work — preserving exact page states.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'browser-recordings',
            title: 'Browser Recordings',
            icon: '📹',
            category: 'artifacts',
            tag: 'Artifacts',
            docsUrl: `${DOCS_BASE}/browser-recordings`,
            image: 'visual-logs.png',
            description: 'Full action playback videos of browser subagent sessions.',
            imported: true,
            noahContent: `
<h2>The Replay Chamber</h2>
<p>Browser recordings capture everything the agent does in the browser — every click, scroll, and interaction.</p>
<h2>Types of Visual Logs</h2>
<ul>
<li><strong>Screenshots</strong> — Captured during browser interactions</li>
<li><strong>Browser Recordings</strong> — WebP video replays of agent actions</li>
<li><strong>Generated Images</strong> — AI-created visuals and assets</li>
</ul>
<div class="highlight-box"><h4>📹 Full Transparency</h4><p>Visual Logs ensure you can see exactly what the agent did, step by step.</p></div>`
        },
        {
            slug: 'knowledge',
            title: 'Knowledge',
            icon: '🌳',
            category: 'artifacts',
            tag: 'Artifacts',
            docsUrl: `${DOCS_BASE}/knowledge`,
            image: 'knowledge.png',
            description: 'A persistent system that captures insights from your interactions.',
            imported: true,
            noahContent: `
<h2>The Memory Tree</h2>
<p>The Knowledge system captures and preserves insights, patterns, and learnings from your conversations.</p>
<h2>How It Works</h2>
<ul>
<li><strong>Automatic capture</strong> — Knowledge Items (KIs) are created from conversations</li>
<li><strong>Cross-conversation</strong> — KIs persist and are available in future sessions</li>
<li><strong>Verification</strong> — Always verify KI content against original sources</li>
</ul>
<div class="highlight-box"><h4>🌳 Living Knowledge</h4><p>KIs grow and update over time. They're starting points, not ground truths — always verify.</p></div>`
        },

        // ─── Misc ─────────────────────────────
        {
            slug: 'plans',
            title: 'Plans',
            icon: '💳',
            category: 'misc',
            tag: 'Misc',
            docsUrl: `${DOCS_BASE}/plans`,
            image: null,
            description: 'Available subscription plans and pricing.',
            imported: true,
            noahContent: `<h2>Plans</h2><p>View available subscription plans and pricing tiers.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'settings',
            title: 'Settings',
            icon: '⚙️',
            category: 'misc',
            tag: 'Misc',
            docsUrl: `${DOCS_BASE}/settings`,
            image: null,
            description: 'Configure AntiGravity preferences and options.',
            imported: true,
            noahContent: `<h2>Settings</h2><p>Configure your AntiGravity preferences, model selection, security settings, and more.</p><p>See the original docs for full details →</p>`
        },
        {
            slug: 'faq',
            title: 'FAQ',
            icon: '❓',
            category: 'misc',
            tag: 'Misc',
            docsUrl: `${DOCS_BASE}/faq`,
            image: null,
            description: 'Frequently asked questions about AntiGravity.',
            imported: true,
            noahContent: `<h2>FAQ</h2><p>Answers to common questions about AntiGravity.</p><p>See the original docs for full details →</p>`
        }
    ]
};
