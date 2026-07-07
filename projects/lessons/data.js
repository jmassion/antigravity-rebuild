// ─── Lessons Data Store ───
// Each lesson has sections, key concepts, analogies, and progress tracking

window.AG_LESSONS = [
    {
        id: "mcp-api-basics",
        title: "MCP vs API — The Real Difference",
        subtitle: "What developers overcomplicate, explained simply",
        category: "Foundations",
        difficulty: "beginner",
        icon: "fa-plug",
        color: "linear-gradient(135deg, #667eea, #764ba2)",
        dateAdded: "2025-03-05",
        estimatedMinutes: 8,
        progress: 0,
        tags: ["MCP", "API", "Integration", "Basics"],
        sections: [
            {
                id: "api-explained",
                title: "API — The Data Messenger",
                icon: "fa-envelope",
                content: `An API is just instructions to control data between apps. That's it.

Think of it like a waiter at a restaurant:
• You (App A) tell the waiter (API) what you want
• The waiter goes to the kitchen (App B) and gets it
• The waiter brings back your food (data)

The waiter doesn't cook. The waiter doesn't rearrange the kitchen. The waiter just carries messages and data back and forth.`,
                keyPoints: [
                    "API = instructions to control DATA between apps",
                    "It's a messenger — it carries requests and responses",
                    "It does NOT control the other app's features"
                ],
                visual: "messenger"
            },
            {
                id: "mcp-explained",
                title: "MCP — The Remote Control",
                icon: "fa-gamepad",
                content: `MCP tells your app how to talk to AND CONTROL another app. Not just data — the actual features and functionality.

Think of it like a universal remote control:
• You don't just ask the TV what channel it's on (that's API)
• You actually CHANGE the channel, adjust the volume, open apps (that's MCP)
• MCP gives you the buttons to control what the other app DOES

MCP = Model Context Protocol. It's how AI agents get hands-on access to tools, not just data.`,
                keyPoints: [
                    "MCP = instructions to control FEATURES & FUNCTIONALITY",
                    "Goes beyond data — controls what the app actually does",
                    "Like a universal remote vs. just reading the TV guide"
                ],
                visual: "remote-control"
            },
            {
                id: "comparison",
                title: "Side by Side",
                icon: "fa-columns",
                content: `Here's the simple breakdown:

API says: "Hey Spotify, what song is playing?"
MCP says: "Hey Spotify, skip this track, turn up the volume, and add this to my playlist."

API = Read the menu, order food
MCP = Walk into the kitchen and cook

Both are important. APIs handle data flow. MCPs handle capability access.`,
                keyPoints: [
                    "API = data access (read/write information)",
                    "MCP = capability access (use features & tools)",
                    "Agents need BOTH to be truly useful"
                ],
                visual: "comparison"
            }
        ]
    },
    {
        id: "skills-explained",
        title: "Skills — The Agent's SOPs",
        subtitle: "Teaching agents HOW to do things, not just what to do",
        category: "Foundations",
        difficulty: "beginner",
        icon: "fa-book-open",
        color: "linear-gradient(135deg, #11998e, #38ef7d)",
        dateAdded: "2025-03-05",
        estimatedMinutes: 6,
        progress: 0,
        tags: ["Skills", "SOPs", "Agent Training", "Workflows"],
        sections: [
            {
                id: "what-are-skills",
                title: "Skills = Standard Operating Procedures",
                icon: "fa-clipboard-list",
                content: `Skills are like SOPs (Standard Operating Procedures). They teach the agent HOW to do things.

Just like a new employee gets an SOP manual:
• "Here's how to process a return"
• "Here's how to onboard a client"
• "Here's how to write a marketing email"

Skills tell agents:
• "Here's how to use this API to pull customer data"
• "Here's how to use this MCP to generate an image"
• "Here's how to combine tools to design a beautiful marketing campaign"`,
                keyPoints: [
                    "Skills = SOPs for AI agents",
                    "They teach the HOW, not just the WHAT",
                    "Combine APIs + MCPs + logic into repeatable workflows"
                ],
                visual: "skill-tree"
            },
            {
                id: "skill-tree",
                title: "The Skill Tree",
                icon: "fa-sitemap",
                content: `Think of skills like a video game skill tree:

🌱 Basic Skills:
  → Read files, search the web, send messages

🌿 Intermediate Skills:
  → Use APIs to pull data, format reports, analyze trends

🌳 Advanced Skills:
  → Design marketing campaigns using multiple tools
  → Orchestrate multi-step workflows
  → Combine MCP + API + custom logic

Each skill builds on the ones below it. An agent that can "design a marketing campaign" needs to first know how to use image generation (MCP), pull brand data (API), write copy (skill), and arrange layouts (skill).`,
                keyPoints: [
                    "Skills stack — basic ones enable advanced ones",
                    "Like a video game skill tree",
                    "Complex skills combine multiple simpler skills"
                ],
                visual: "tree"
            }
        ]
    },
    {
        id: "agent-anatomy",
        title: "Anatomy of an Agent",
        subtitle: "The obvious blueprint that developers overcomplicate",
        category: "Agent Architecture",
        difficulty: "intermediate",
        icon: "fa-robot",
        color: "linear-gradient(135deg, #f093fb, #f5576c)",
        dateAdded: "2025-03-05",
        estimatedMinutes: 12,
        progress: 0,
        tags: ["Agents", "Architecture", "Teams", "Soul", "Memory"],
        sections: [
            {
                id: "the-obvious-truth",
                title: "It's All Obvious",
                icon: "fa-lightbulb",
                content: `Developers are slowly figuring out how to use codified terms and confusing diagrams to do simple things that are obvious to people with common sense.

Strip away the jargon, and building an agent system is just:
• Make a worker (agent)
• Give them a team of helpers (sub-agents)
• Give them tools to use (MCPs & APIs)
• Teach them skills (SOPs / skill tree)
• Give them a handbook to follow (rules & plans)
• Give them a personality (soul)
• Give them a good memory system (context & retrieval)
• Give them regular tasks (recurring workflows)

That's it. That's the whole field of "AI Agent Architecture."`,
                keyPoints: [
                    "Agent architecture = common sense organization",
                    "Developers wrap obvious concepts in jargon",
                    "It's just: worker + tools + skills + rules + memory"
                ],
                visual: "anatomy"
            },
            {
                id: "agent-components",
                title: "The Components",
                icon: "fa-puzzle-piece",
                content: `Every agent has these parts:

🧠 SOUL — Intention, personality, purpose
  "I am a marketing assistant who is creative and detail-oriented"

🛠️ TOOLS — MCPs and APIs they can control
  Image generators, email senders, data pullers

📚 SKILLS — SOPs they've learned
  How to write copy, design campaigns, analyze data

📋 RULES — Guardrails they follow
  Brand guidelines, response formats, safety limits

🗂️ MEMORY — Organized for fast access
  Recent conversations, project context, long-term knowledge

🔄 RECURRING TASKS — Things they do regularly
  Daily reports, weekly summaries, monitoring

👥 SUB-WORKERS — Team of specialized helpers
  One for writing, one for design, one for data`,
                keyPoints: [
                    "Soul = personality + purpose + intention",
                    "Tools = MCPs + APIs",
                    "Skills = learned procedures (SOPs)",
                    "Rules = guardrails and guidelines",
                    "Memory = organized knowledge for speed",
                    "Recurring tasks = scheduled workflows",
                    "Sub-workers = specialized team members"
                ],
                visual: "components"
            },
            {
                id: "company-handbook",
                title: "The Company Handbook",
                icon: "fa-book",
                content: `Agents need to regularly check:

📖 Company Plans — What are we building? What's the roadmap?
📋 Product Instructions — How do we build things here?
📚 Handbook — Company values, processes, standards

Just like a good employee doesn't just wing it — they check the docs, follow the process, and align with the team's goals.

The difference between a chaotic AI and a useful one is whether it has a good handbook to follow.`,
                keyPoints: [
                    "Agents need reference documents just like employees",
                    "Plans, instructions, and handbooks keep agents aligned",
                    "Good documentation = good agent behavior"
                ],
                visual: "handbook"
            }
        ]
    },
    {
        id: "workspaces-explained",
        title: "Workspaces — Don't Step on Each Other's Shoes",
        subtitle: "Managing who works on what and when",
        category: "Agent Architecture",
        difficulty: "intermediate",
        icon: "fa-folder-tree",
        color: "linear-gradient(135deg, #fc4a1a, #f7b733)",
        dateAdded: "2025-03-05",
        estimatedMinutes: 5,
        progress: 0,
        tags: ["Workspaces", "Collaboration", "Git", "Concurrency"],
        sections: [
            {
                id: "the-problem",
                title: "The Messy Room Problem",
                icon: "fa-broom",
                content: `Consider workspaces as folders or project rooms.

If you let a bunch of people go in and move files around and do things simultaneously, then everyone steps on each other's shoes and you get a mess of work that needs to be reorganized and merged.

It's like 5 people trying to rearrange the same room at the same time:
• Person A moves the couch left
• Person B moves the couch right
• Person C is trying to put a table where the couch was
• Total chaos.`,
                keyPoints: [
                    "Workspaces = project folders / rooms",
                    "Multiple agents in same space = chaos",
                    "Unmanaged concurrent work = merge nightmares"
                ],
                visual: "chaos"
            },
            {
                id: "the-solution",
                title: "Smart Workspace Management",
                icon: "fa-check-circle",
                content: `If you manage who's working on which folder/room and when, then you don't run into problems.

2+ agents working on the same project needs:
• RULES — Who can edit what and when
• METHODS — How to work smart (branches, locks, queues)
• MERGE STRATEGY — How to combine work when appropriate

It's like a construction site:
• Electricians work on wiring (their zone)
• Plumbers work on pipes (their zone)
• They coordinate when zones overlap
• A foreman manages the schedule

Same with agents. Give them lanes. Coordinate handoffs. Merge when ready.`,
                keyPoints: [
                    "Manage who works on what and when",
                    "Rules + methods + merge strategy",
                    "Like a construction site with zones and a foreman"
                ],
                visual: "organized"
            }
        ]
    }
];

// ─── Progress Tracking ───
window.AG_LESSON_PROGRESS = {
    load() {
        try {
            const saved = localStorage.getItem('ag_lesson_progress');
            return saved ? JSON.parse(saved) : {};
        } catch { return {}; }
    },
    save(progressMap) {
        localStorage.setItem('ag_lesson_progress', JSON.stringify(progressMap));
    },
    getForLesson(lessonId) {
        const map = this.load();
        return map[lessonId] || { completed: [], percent: 0, lastAccessed: null };
    },
    markSectionComplete(lessonId, sectionId) {
        const map = this.load();
        if (!map[lessonId]) map[lessonId] = { completed: [], percent: 0, lastAccessed: null };
        if (!map[lessonId].completed.includes(sectionId)) {
            map[lessonId].completed.push(sectionId);
        }
        const lesson = window.AG_LESSONS.find(l => l.id === lessonId);
        if (lesson) {
            map[lessonId].percent = Math.round((map[lessonId].completed.length / lesson.sections.length) * 100);
        }
        map[lessonId].lastAccessed = new Date().toISOString();
        this.save(map);
        return map[lessonId];
    },
    getOverallStats() {
        const map = this.load();
        const total = window.AG_LESSONS.length;
        let completedLessons = 0;
        let totalSections = 0;
        let completedSections = 0;
        window.AG_LESSONS.forEach(l => {
            totalSections += l.sections.length;
            const p = map[l.id];
            if (p) {
                completedSections += p.completed.length;
                if (p.percent === 100) completedLessons++;
            }
        });
        return { total, completedLessons, totalSections, completedSections };
    }
};
