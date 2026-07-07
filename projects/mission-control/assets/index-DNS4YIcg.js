(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&a(c)}).observe(document,{childList:!0,subtree:!0});function s(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(i){if(i.ep)return;i.ep=!0;const n=s(i);fetch(i.href,n)}})();const ie={};function p(e,t){ie[e]=t}function Pe(e){window.location.hash=e}function De(e){function t(){const s=window.location.hash.slice(1)||"/",a=ie[s];if(a){e.classList.remove("view-enter"),e.innerHTML="",e.offsetWidth,e.innerHTML=a(),e.classList.add("view-enter"),document.querySelectorAll(".nav-item").forEach(n=>{n.classList.toggle("active",n.dataset.route===s)});const i=document.querySelector(".topbar-breadcrumb span");if(i){const n={"/":"Mission Control","/agents":"Agent Fleet","/tasks":"Task Operations","/skills":"Skill Forge","/projects":"Project Hub","/migration":"Migration Console","/demos":"Demo Gallery","/people":"People","/teams":"Teams","/files":"File Manager","/docs":"Documentation","/changelog":"Changelog"};i.textContent=n[s]||"Unknown"}window.__afterViewRender&&(window.__afterViewRender(),window.__afterViewRender=null)}}window.addEventListener("hashchange",t),t()}const l=[{id:"agent-1",name:"Architect",role:"System Designer",avatar:"🏗️",image:"/images/agents/architect.png",color:"#00f0ff",status:"active",workspace:"nexus-core",currentTask:"Designing multi-tenant data schema",tasksCompleted:47,skillsUsed:12,uptime:"14h 32m",skills:["System Architecture","Database Design","API Design","Security"],personality:"Methodical and precise. Thinks in systems and patterns.",performance:94},{id:"agent-2",name:"Forge",role:"Full-Stack Builder",avatar:"⚡",image:"/images/agents/forge.png",color:"#e040fb",status:"active",workspace:"app-builder",currentTask:"Building React dashboard components",tasksCompleted:83,skillsUsed:18,uptime:"22h 15m",skills:["React","Node.js","CSS Architecture","TypeScript","Vite"],personality:"Fast and iterative. Ships early, refines later.",performance:91},{id:"agent-3",name:"Sentinel",role:"QA & Security",avatar:"🛡️",image:"/images/agents/sentinel.png",color:"#69f0ae",status:"active",workspace:"security-ops",currentTask:"Running penetration tests on API layer",tasksCompleted:36,skillsUsed:8,uptime:"11h 48m",skills:["Pen Testing","Code Review","OWASP","Monitoring"],personality:"Vigilant and thorough. Finds what others miss.",performance:97},{id:"agent-4",name:"Pixel",role:"UI/UX Designer",avatar:"🎨",image:"/images/agents/pixel.png",color:"#ffab40",status:"idle",workspace:"design-lab",currentTask:"Waiting for new design brief",tasksCompleted:29,skillsUsed:6,uptime:"8h 05m",skills:["Figma","CSS","Animation","Design Systems","Accessibility"],personality:"Creative and detail-oriented. Every pixel matters.",performance:88},{id:"agent-5",name:"Scribe",role:"Content & Documentation",avatar:"📜",image:"/images/agents/scribe.png",color:"#b388ff",status:"active",workspace:"content-hub",currentTask:"Migrating WordPress blog posts",tasksCompleted:62,skillsUsed:9,uptime:"18h 22m",skills:["Technical Writing","SEO","Content Strategy","WordPress","Markdown"],personality:"Clear communicator. Makes complex things simple.",performance:92},{id:"agent-6",name:"Oracle",role:"Data & Analytics",avatar:"🔮",image:"/images/agents/oracle.png",color:"#448aff",status:"offline",workspace:"data-pipeline",currentTask:"Scheduled maintenance",tasksCompleted:41,skillsUsed:11,uptime:"0h 00m",skills:["Python","SQL","ETL Pipelines","Visualization","ML Models"],personality:"Analytical and data-driven. Speaks in numbers.",performance:95}],m=[{id:"t-1",title:"Design multi-tenant data schema",agent:"agent-1",project:"proj-1",priority:"high",status:"in-progress",progress:65,steps:[{name:"Research schema patterns",done:!0},{name:"Draft ERD diagram",done:!0},{name:"Review with team",done:!1},{name:"Implement migrations",done:!1}]},{id:"t-2",title:"Build dashboard navigation",agent:"agent-2",project:"proj-1",priority:"high",status:"complete",progress:100,steps:[{name:"Create sidebar component",done:!0},{name:"Add routing logic",done:!0},{name:"Animate transitions",done:!0}]},{id:"t-3",title:"Security audit — authentication flow",agent:"agent-3",project:"proj-1",priority:"critical",status:"in-progress",progress:40,steps:[{name:"Map auth endpoints",done:!0},{name:"Test JWT validation",done:!1},{name:"Check rate limiting",done:!1},{name:"Write security report",done:!1}]},{id:"t-4",title:"Design onboarding flow",agent:"agent-4",project:"proj-2",priority:"medium",status:"queued",progress:0,steps:[{name:"Research best practices",done:!1},{name:"Create wireframes",done:!1},{name:"Build prototype in Figma",done:!1}]},{id:"t-5",title:"Migrate WordPress blog content",agent:"agent-5",project:"proj-3",priority:"high",status:"in-progress",progress:72,steps:[{name:"Export WP database",done:!0},{name:"Parse post content",done:!0},{name:"Convert to markdown",done:!0},{name:"Import media assets",done:!1},{name:"Validate all links",done:!1}]},{id:"t-6",title:"Set up analytics pipeline",agent:"agent-6",project:"proj-1",priority:"medium",status:"queued",progress:0,steps:[{name:"Configure data sources",done:!1},{name:"Build ETL scripts",done:!1},{name:"Create dashboards",done:!1}]},{id:"t-7",title:"Build agent communication protocol",agent:"agent-1",project:"proj-1",priority:"critical",status:"review",progress:90,steps:[{name:"Design message format",done:!0},{name:"Implement pub/sub",done:!0},{name:"Add error handling",done:!0},{name:"Performance testing",done:!1}]},{id:"t-8",title:"Create skill generation engine",agent:"agent-2",project:"proj-1",priority:"high",status:"in-progress",progress:55,steps:[{name:"Design template system",done:!0},{name:"Build skill compiler",done:!0},{name:"Add validation layer",done:!1},{name:"Integration tests",done:!1}]},{id:"t-9",title:"Import Claude conversation archive",agent:"agent-5",project:"proj-3",priority:"medium",status:"in-progress",progress:30,steps:[{name:"Download conversation JSONs",done:!0},{name:"Parse message threads",done:!1},{name:"Extract artifacts",done:!1},{name:"Index and categorize",done:!1}]},{id:"t-10",title:"Responsive layout Polish",agent:"agent-4",project:"proj-2",priority:"low",status:"queued",progress:0,steps:[{name:"Audit breakpoints",done:!1},{name:"Fix mobile navigation",done:!1},{name:"Test on devices",done:!1}]},{id:"t-11",title:"Import Lovable prototypes",agent:"agent-5",project:"proj-3",priority:"medium",status:"queued",progress:0,steps:[{name:"Catalog all prototypes",done:!1},{name:"Screenshot each state",done:!1},{name:"Archive source code",done:!1}]},{id:"t-12",title:"Build task orchestration engine",agent:"agent-1",project:"proj-1",priority:"critical",status:"in-progress",progress:35,steps:[{name:"Design task queue",done:!0},{name:"Implement priority system",done:!1},{name:"Add dependency resolution",done:!1},{name:"Build retry logic",done:!1}]}],f=[{id:"s-1",name:"API Gateway Config",type:"Integration",icon:"🔌",color:"#00f0ff",version:"2.1.0",usageCount:34,description:"Configure and manage API gateway routing, rate limiting, and authentication.",agents:["agent-1","agent-3"]},{id:"s-2",name:"React Component Builder",type:"Code",icon:"⚛️",color:"#e040fb",version:"3.0.1",usageCount:89,description:"Generate production-ready React components with TypeScript and testing.",agents:["agent-2"]},{id:"s-3",name:"Database Migrator",type:"Data",icon:"🗄️",color:"#69f0ae",version:"1.4.2",usageCount:22,description:"Safely migrate database schemas with rollback support and data validation.",agents:["agent-1","agent-6"]},{id:"s-4",name:"Figma Exporter",type:"Design",icon:"🎯",color:"#ffab40",version:"1.0.0",usageCount:15,description:"Export Figma designs as CSS, SVG assets, and component specifications.",agents:["agent-4"]},{id:"s-5",name:"Content Parser",type:"Data",icon:"📝",color:"#b388ff",version:"2.2.0",usageCount:56,description:"Parse and normalize content from WordPress, Medium, Ghost, and custom CMSes.",agents:["agent-5"]},{id:"s-6",name:"Security Scanner",type:"Automation",icon:"🔍",color:"#ff5252",version:"1.8.3",usageCount:42,description:"Automated OWASP Top 10 vulnerability scanning with detailed reports.",agents:["agent-3"]},{id:"s-7",name:"CSS Generator",type:"Code",icon:"🎨",color:"#448aff",version:"2.0.0",usageCount:67,description:"Generate design system tokens, utility classes, and component styles.",agents:["agent-2","agent-4"]},{id:"s-8",name:"Chat Importer",type:"Integration",icon:"💬",color:"#00f0ff",version:"1.1.0",usageCount:18,description:"Import and index conversation archives from Claude, ChatGPT, and other AI platforms.",agents:["agent-5"]},{id:"s-9",name:"ETL Pipeline Builder",type:"Data",icon:"🔄",color:"#69f0ae",version:"1.3.0",usageCount:29,description:"Build extract-transform-load pipelines for data migration and sync.",agents:["agent-6"]},{id:"s-10",name:"Test Suite Generator",type:"Automation",icon:"🧪",color:"#e040fb",version:"1.5.0",usageCount:38,description:"Auto-generate unit, integration, and E2E test suites from code analysis.",agents:["agent-2","agent-3"]}],h=[{id:"proj-1",name:"Nexus Core Platform",description:"The central command center for multi-agent workspace management",status:"active",icon:"🌐",image:"/images/projects/nexus-core.png",color:"#00f0ff",progress:48,team:["agent-1","agent-2","agent-3","agent-6"],taskCount:24,fileCount:156},{id:"proj-2",name:"HolodeckOS Website",description:"Immersive portfolio and showcase website with 3D effects",status:"active",icon:"🎭",image:"/images/projects/holodeck.png",color:"#e040fb",progress:35,team:["agent-2","agent-4"],taskCount:12,fileCount:67},{id:"proj-3",name:"Content Migration Hub",description:"Migrating all content from legacy platforms into unified system",status:"migrating",icon:"📦",image:"/images/projects/migration.png",color:"#ffab40",progress:28,team:["agent-5","agent-6"],taskCount:18,fileCount:342},{id:"proj-4",name:"AI Chat Archive",description:"Complete archive of all AI conversations and artifacts",status:"active",icon:"💬",image:"/images/projects/chat-archive.png",color:"#b388ff",progress:15,team:["agent-5"],taskCount:8,fileCount:1247},{id:"proj-5",name:"Legacy WordPress Sites",description:"Collection of WordPress sites pending migration or archival",status:"archived",icon:"🏛️",image:"/images/projects/wordpress.png",color:"#5a6478",progress:100,team:[],taskCount:0,fileCount:534}],F=[{id:"src-1",name:"Claude",icon:"🤖",color:"#d97706",status:"connected",itemCount:847,category:"AI Chats",description:"Anthropic Claude conversations and artifacts"},{id:"src-2",name:"ChatGPT",icon:"💚",color:"#10b981",status:"connected",itemCount:1234,category:"AI Chats",description:"OpenAI ChatGPT conversations and outputs"},{id:"src-3",name:"Lovable",icon:"💜",color:"#8b5cf6",status:"pending",itemCount:23,category:"Prototypes",description:"Lovable.dev generated applications and prototypes"},{id:"src-4",name:"Figma",icon:"🎨",color:"#f97316",status:"connected",itemCount:56,category:"Designs",description:"Figma design files and component libraries"},{id:"src-5",name:"WordPress",icon:"📰",color:"#3b82f6",status:"migrating",itemCount:312,category:"Websites",description:"WordPress sites, posts, pages, and media"},{id:"src-6",name:"Emergent",icon:"🌊",color:"#06b6d4",status:"pending",itemCount:15,category:"Prototypes",description:"Emergent AI-built applications and experiments"},{id:"src-7",name:"GitHub",icon:"🐱",color:"#f3f4f6",status:"connected",itemCount:89,category:"Code",description:"GitHub repositories and project code"}],O=[{id:"imp-1",name:"Claude Conversations Batch 1",source:"Claude",status:"complete",progress:100,items:250},{id:"imp-2",name:"WordPress — Main Blog",source:"WordPress",status:"running",progress:68,items:156},{id:"imp-3",name:"ChatGPT Archive Jan-Jun 2025",source:"ChatGPT",status:"running",progress:42,items:480},{id:"imp-4",name:"Figma Project Files",source:"Figma",status:"queued",progress:0,items:56},{id:"imp-5",name:"Claude Conversations Batch 2",source:"Claude",status:"queued",progress:0,items:597},{id:"imp-6",name:"Lovable Prototypes",source:"Lovable",status:"queued",progress:0,items:23}],I=[{id:"d-1",name:"Holodeck Portal",source:"Custom",type:"Website",icon:"🌀",color:"#e040fb",status:"active",description:"3D portal gateway with scroll effects",image:"/images/demos/portal.png"},{id:"d-2",name:"TabSpace Multiplayer",source:"Custom",type:"Web App",icon:"🎮",color:"#00f0ff",status:"active",description:"Multiplayer tab management system",image:"/images/demos/tabspace.png"},{id:"d-3",name:"AI Chat Analyzer",source:"Lovable",type:"Tool",icon:"📊",color:"#69f0ae",status:"rebuild",description:"Analyze patterns in AI conversation history",image:"/images/demos/analytics.png"},{id:"d-4",name:"Portfolio v3",source:"WordPress",type:"Website",icon:"🌐",color:"#ffab40",status:"archive",description:"Personal portfolio website with CMS",image:"/images/projects/wordpress.png"},{id:"d-5",name:"Design Token Generator",source:"Claude",type:"Tool",icon:"🎨",color:"#b388ff",status:"active",description:"Generate CSS design tokens from natural language",image:"/images/demos/design-tokens.png"},{id:"d-6",name:"Invoice Dashboard",source:"Lovable",type:"Web App",icon:"💰",color:"#448aff",status:"rebuild",description:"Client invoicing and payment tracking dashboard",image:"/images/demos/invoice.png"},{id:"d-7",name:"Blog CMS",source:"WordPress",type:"Website",icon:"📝",color:"#ff5252",status:"archive",description:"Content management system for blog posts",image:"/images/projects/wordpress.png"},{id:"d-8",name:"Emergent Prototype Alpha",source:"Emergent",type:"Prototype",icon:"🧪",color:"#06b6d4",status:"archive",description:"Early-stage AI agent interface prototype",image:"/images/demos/prototype.png"}],Be=[{time:"2 min ago",text:'<strong>Forge</strong> completed task "Build dashboard navigation"',type:"complete",color:"#69f0ae"},{time:"8 min ago",text:"<strong>Scribe</strong> imported 156 WordPress posts",type:"migration",color:"#ffab40"},{time:"15 min ago",text:"<strong>Sentinel</strong> flagged 2 security issues in auth flow",type:"alert",color:"#ff5252"},{time:"22 min ago",text:'<strong>Architect</strong> generated skill "API Gateway Config v2.1"',type:"skill",color:"#00f0ff"},{time:"35 min ago",text:"<strong>Forge</strong> deployed skill-forge view to staging",type:"deploy",color:"#e040fb"},{time:"45 min ago",text:"<strong>Oracle</strong> went offline for maintenance",type:"status",color:"#5a6478"},{time:"1h ago",text:"<strong>Pixel</strong> completed onboarding flow wireframes",type:"complete",color:"#69f0ae"},{time:"1h 15m ago",text:"<strong>Scribe</strong> started importing Claude conversations",type:"migration",color:"#ffab40"},{time:"2h ago",text:'<strong>Architect</strong> created task "Build task orchestration engine"',type:"task",color:"#00f0ff"},{time:"2h 30m ago",text:"<strong>Sentinel</strong> completed vulnerability scan — 0 critical issues",type:"complete",color:"#69f0ae"}],u={totalBudget:500,spent:127.43,remaining:372.57,breakdown:[{category:"Image Generation",spent:48.2,operations:156,icon:"🖼️",color:"#e040fb"},{category:"Agent Runtime",spent:34.8,operations:892,icon:"🤖",color:"#00f0ff"},{category:"Content Migration",spent:22.15,operations:2576,icon:"📦",color:"#ffab40"},{category:"Skill Execution",spent:12.9,operations:410,icon:"⚡",color:"#69f0ae"},{category:"API Calls",spent:9.38,operations:3421,icon:"🔌",color:"#448aff"}]},w=[{id:"human-1",name:"Justin Massion",role:"Founder & Administrator",avatar:"JM",image:null,email:"justin@nexus.dev",color:"#00f0ff",status:"active",skills:["Strategy","Product Vision","Design Direction","Project Management"],teamIds:["team-1","team-2","team-3"],projectIds:["proj-1","proj-2","proj-3","proj-4"]},{id:"human-2",name:"Alex Rivera",role:"Lead Developer",avatar:"AR",image:null,email:"alex@nexus.dev",color:"#e040fb",status:"active",skills:["TypeScript","React","Node.js","DevOps"],teamIds:["team-1"],projectIds:["proj-1"]},{id:"human-3",name:"Sam Chen",role:"Designer",avatar:"SC",image:null,email:"sam@nexus.dev",color:"#ffab40",status:"idle",skills:["UI/UX","Figma","Brand Design","Motion Graphics"],teamIds:["team-2"],projectIds:["proj-2"]}],k=[{id:"team-1",name:"Core Platform",description:"Building the Nexus Command Center infrastructure",color:"#00f0ff",icon:"🚀",memberIds:["human-1","human-2","agent-1","agent-2","agent-3"],projectIds:["proj-1"]},{id:"team-2",name:"Creative Studio",description:"Design, branding, and visual experiences",color:"#e040fb",icon:"🎨",memberIds:["human-1","human-3","agent-4","agent-2"],projectIds:["proj-2"]},{id:"team-3",name:"Content Ops",description:"Content migration, archival, and CMS management",color:"#ffab40",icon:"📦",memberIds:["human-1","agent-5","agent-6"],projectIds:["proj-3","proj-4"]}],C=[{id:"conv-1",contactId:"agent-1",contactType:"agent",messages:[{from:"agent-1",text:"Schema draft for multi-tenant is ready for review.",time:"2:14 PM"},{from:"human-1",text:"Great — push it to the staging branch.",time:"2:15 PM"},{from:"agent-1",text:"Done. Also added rollback migration scripts.",time:"2:16 PM"},{from:"human-1",text:"Perfect. Sentinel, can you audit it?",time:"2:17 PM"},{from:"agent-1",text:"I'll flag Sentinel now.",time:"2:18 PM"}],unread:1},{id:"conv-2",contactId:"agent-2",contactType:"agent",messages:[{from:"agent-2",text:"Dashboard nav component shipped to main.",time:"1:45 PM"},{from:"human-1",text:"Animations smooth?",time:"1:46 PM"},{from:"agent-2",text:"60fps across all routes. Used spring easing.",time:"1:47 PM"}],unread:0},{id:"conv-3",contactId:"agent-3",contactType:"agent",messages:[{from:"agent-3",text:"⚠️ Found 2 vulnerabilities in the auth flow.",time:"12:30 PM"},{from:"human-1",text:"Critical?",time:"12:31 PM"},{from:"agent-3",text:"Medium severity. JWT expiry not enforced on 2 endpoints. Patching now.",time:"12:32 PM"},{from:"agent-3",text:"Patch applied. Running regression tests.",time:"12:50 PM"}],unread:2},{id:"conv-4",contactId:"agent-5",contactType:"agent",messages:[{from:"agent-5",text:"WordPress migration at 72%. Media assets importing now.",time:"11:00 AM"},{from:"human-1",text:"Any broken links?",time:"11:05 AM"},{from:"agent-5",text:"14 broken image refs found. Auto-fixing with archive.org fallbacks.",time:"11:06 AM"}],unread:0},{id:"conv-5",contactId:"human-2",contactType:"human",messages:[{from:"human-2",text:"Hey, I pushed the API refactor to dev branch.",time:"10:30 AM"},{from:"human-1",text:"Nice! I'll have Sentinel audit it.",time:"10:32 AM"},{from:"human-2",text:"Sounds good. Also — can we discuss the auth strategy later?",time:"10:33 AM"}],unread:1}];JSON.parse(localStorage.getItem("nexus_feedback")||"[]");const ne="nexus_feedback";function B(){try{return JSON.parse(localStorage.getItem(ne)||"[]")}catch{return[]}}function U(e){localStorage.setItem(ne,JSON.stringify(e))}function X(e){const t=B(),s={id:"fb-"+Date.now(),text:e.text,category:e.category||"general",priority:e.priority||"medium",status:"new",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),response:null};return t.unshift(s),U(t),s}function oe(){return B()}function Ee(e){const t=B(),s=t.find(a=>a.id===e);s&&(s.status="done",s.updatedAt=new Date().toISOString(),U(t))}function Le(e){const t=B().filter(s=>s.id!==e);U(t)}function Fe(){const e=l.filter(o=>o.status==="active").length,t=m.filter(o=>o.status==="in-progress").length,s=m.filter(o=>o.status==="complete").length,a=(u.spent/u.totalBudget*100).toFixed(0),i=w.length+l.length,n=oe(),c=[{id:"q-1",icon:"🔐",title:"Auth Strategy Decision",description:"Sentinel found 2 medium-severity vulnerabilities. Should we implement OAuth2 or stick with JWT refresh tokens?",priority:"high",category:"Security"},{id:"q-2",icon:"🎨",title:"Design System Update",description:"Pixel proposed switching to a dark glassmorphism theme for the portal. Review the mockups and provide direction.",priority:"medium",category:"Design"},{id:"q-3",icon:"📦",title:"Migration Priority",description:"WordPress blog has 312 posts. Should we prioritize migrating all content or only posts from the last 2 years?",priority:"medium",category:"Content"},{id:"q-4",icon:"🤖",title:"Agent Deployment",description:"Oracle is offline for maintenance. Deploy a temporary data agent or wait for Oracle to come back online?",priority:"low",category:"Operations"}];return`
    <div class="view-header">
      <div class="view-header-left">
        <h1 class="view-title">Mission Control</h1>
        <p class="view-subtitle">Interactive command center — review, decide, and provide feedback</p>
      </div>
      <div class="view-actions">
        <button class="btn btn-secondary" id="btn-deploy-agent">⚡ Deploy Agent</button>
        <button class="btn btn-primary" id="btn-new-task">+ New Task</button>
      </div>
    </div>

    <!-- Quick Actions Bar -->
    <div style="display:flex;gap:var(--space-sm);margin-bottom:var(--space-xl);flex-wrap:wrap;">
      <a href="#/agents" class="btn btn-ghost" style="font-size:var(--text-xs);">🤖 Agent Fleet (${e} online)</a>
      <a href="#/tasks" class="btn btn-ghost" style="font-size:var(--text-xs);">📋 Task Ops (${t} running)</a>
      <a href="#/people" class="btn btn-ghost" style="font-size:var(--text-xs);">👥 People (${i})</a>
      <a href="#/teams" class="btn btn-ghost" style="font-size:var(--text-xs);">🏢 Teams (${k.length})</a>
      <a href="#/files" class="btn btn-ghost" style="font-size:var(--text-xs);">📂 Files</a>
      <a href="#/skills" class="btn btn-ghost" style="font-size:var(--text-xs);">⚡ Skills</a>
    </div>

    <!-- Metrics Row -->
    <div class="metrics-row stagger-children" style="margin-bottom: var(--space-xl);">
      <div class="card stat-card hover-lift hover-glow-cyan">
        <div class="stat-icon" style="background: var(--accent-cyan-dim); color: var(--accent-cyan);">⚡</div>
        <div class="stat-value" style="color: var(--accent-cyan);">${e}</div>
        <div class="stat-label">Agents Online</div>
        <div class="stat-change positive">of ${l.length} total</div>
      </div>
      <div class="card stat-card hover-lift hover-glow-magenta">
        <div class="stat-icon" style="background: var(--accent-magenta-dim); color: var(--accent-magenta);">🔄</div>
        <div class="stat-value" style="color: var(--accent-magenta);">${t}</div>
        <div class="stat-label">Tasks Running</div>
        <div class="stat-change positive">${s} completed</div>
      </div>
      <div class="card stat-card hover-lift">
        <div class="stat-icon" style="background: var(--accent-green-dim); color: var(--accent-green);">👥</div>
        <div class="stat-value" style="color: var(--accent-green);">${i}</div>
        <div class="stat-label">Team Members</div>
        <div class="stat-change positive">${w.length} humans + ${l.length} AI</div>
      </div>
      <div class="card stat-card hover-lift">
        <div class="stat-icon" style="background: var(--accent-amber-dim); color: var(--accent-amber);">💳</div>
        <div class="stat-value" style="color: var(--accent-amber);">$${u.remaining.toFixed(0)}</div>
        <div class="stat-label">Credits Left</div>
        <div class="stat-change ${a>50?"negative":"positive"}">${a}% used</div>
      </div>
    </div>

    <!-- Two Column: Action Items + Feedback -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg); margin-bottom: var(--space-lg);">

      <!-- Action Items / Questions -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">🎯 Action Items</h2>
          <span class="badge badge-running" style="font-size:10px;">
            <span class="badge-dot live-pulse"></span>
            ${c.length} pending
          </span>
        </div>
        <div class="stagger-children" style="display:flex;flex-direction:column;gap:var(--space-sm);">
          ${c.map(o=>`
            <div class="card hover-lift" style="padding:var(--space-md);">
              <div style="display:flex;align-items:start;gap:var(--space-sm);">
                <span style="font-size:20px;flex-shrink:0;">${o.icon}</span>
                <div style="flex:1;min-width:0;">
                  <div style="display:flex;align-items:center;gap:var(--space-xs);margin-bottom:4px;">
                    <span style="font-weight:700;font-size:var(--text-sm);">${o.title}</span>
                    <span style="font-size:9px;padding:2px 6px;border-radius:var(--radius-full);background:${o.priority==="high"?"var(--accent-red-dim)":o.priority==="medium"?"var(--accent-amber-dim)":"var(--bg-tertiary)"};color:${o.priority==="high"?"var(--accent-red)":o.priority==="medium"?"var(--accent-amber)":"var(--text-tertiary)"};font-weight:600;text-transform:uppercase;">${o.priority}</span>
                    <span style="font-size:9px;padding:2px 6px;border-radius:var(--radius-full);background:var(--bg-tertiary);color:var(--text-tertiary);font-weight:500;">${o.category}</span>
                  </div>
                  <p style="font-size:var(--text-xs);color:var(--text-secondary);line-height:1.5;margin-bottom:var(--space-sm);">${o.description}</p>
                  <div style="display:flex;gap:var(--space-xs);">
                    <input type="text" class="feedback-response-input" data-question="${o.id}" placeholder="Type your decision or feedback..."
                      style="flex:1;padding:6px 12px;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:var(--radius-full);color:var(--text-primary);font-size:12px;font-family:var(--font-sans);outline:none;" />
                    <button class="btn btn-primary" data-action="submit-response" data-question="${o.id}" style="font-size:11px;padding:6px 14px;">Submit</button>
                  </div>
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Feedback Queue -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">📝 Feedback Queue</h2>
          <span class="mono" style="font-size:var(--text-xs);color:var(--text-tertiary);">${n.length} items</span>
        </div>

        <!-- New Feedback Form -->
        <div class="card" style="padding:var(--space-md);margin-bottom:var(--space-sm);">
          <div style="font-size:var(--text-xs);font-weight:600;color:var(--text-tertiary);margin-bottom:var(--space-xs);">SUBMIT NEW FEEDBACK</div>
          <div style="display:flex;gap:var(--space-xs);margin-bottom:var(--space-xs);">
            <select id="feedback-category" style="padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);color:var(--text-primary);font-size:12px;font-family:var(--font-sans);">
              <option value="general">General</option>
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
              <option value="design">Design</option>
              <option value="priority">Priority Change</option>
            </select>
            <select id="feedback-priority" style="padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);color:var(--text-primary);font-size:12px;font-family:var(--font-sans);">
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="low">Low</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div style="display:flex;gap:var(--space-xs);">
            <textarea id="feedback-text" placeholder="Describe what you need, changes you want, or decisions made..." rows="2"
              style="flex:1;padding:8px 12px;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);color:var(--text-primary);font-size:12px;font-family:var(--font-sans);resize:vertical;outline:none;"></textarea>
          </div>
          <button class="btn btn-primary" data-action="submit-feedback" style="margin-top:var(--space-xs);font-size:11px;width:100%;">💾 Save Feedback (auto-queued for Antigravity)</button>
        </div>

        <!-- Existing Feedback Items -->
        <div class="card" style="padding:var(--space-sm);">
          <div id="feedback-list" style="display:flex;flex-direction:column;gap:var(--space-xs);max-height:300px;overflow-y:auto;">
            ${n.length===0?`
              <div style="text-align:center;padding:var(--space-lg);color:var(--text-tertiary);">
                <div style="font-size:24px;margin-bottom:var(--space-xs);">📭</div>
                <div style="font-size:var(--text-xs);">No feedback yet. Your feedback will auto-queue for Antigravity.</div>
              </div>
            `:n.map(o=>`
              <div style="display:flex;align-items:start;gap:var(--space-xs);padding:8px;border-radius:var(--radius-sm);background:var(--bg-primary);border:1px solid var(--border-subtle);">
                <span style="font-size:10px;padding:2px 6px;border-radius:var(--radius-full);background:${o.status==="new"?"var(--accent-cyan-dim)":o.status==="in-progress"?"var(--accent-amber-dim)":"var(--accent-green-dim)"};color:${o.status==="new"?"var(--accent-cyan)":o.status==="in-progress"?"var(--accent-amber)":"var(--accent-green)"};font-weight:600;text-transform:uppercase;white-space:nowrap;">${o.status}</span>
                <div style="flex:1;min-width:0;">
                  <div style="font-size:12px;color:var(--text-primary);word-break:break-word;">${o.text}</div>
                  <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px;font-family:var(--font-mono);">
                    ${o.category} · ${o.priority} · ${new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style="display:flex;gap:2px;flex-shrink:0;">
                  ${o.status!=="done"?`<button data-action="done-feedback" data-fb="${o.id}" style="border:none;background:var(--accent-green-dim);color:var(--accent-green);width:22px;height:22px;border-radius:4px;cursor:pointer;font-size:10px;" title="Mark done">✓</button>`:""}
                  <button data-action="delete-feedback" data-fb="${o.id}" style="border:none;background:var(--accent-red-dim);color:var(--accent-red);width:22px;height:22px;border-radius:4px;cursor:pointer;font-size:10px;" title="Delete">✕</button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row: Activity Feed + Credit Tracker -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-lg);">
      <!-- Activity Feed -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Activity Feed</h2>
          <span style="font-size: var(--text-xs); color: var(--text-tertiary);" class="mono">LIVE</span>
        </div>
        <div class="card" style="padding: var(--space-sm);">
          <div class="activity-feed stagger-children">
            ${Be.map(o=>`
              <div class="activity-item">
                <div class="activity-dot" style="background: ${o.color};"></div>
                <div class="activity-content">
                  <div class="activity-text">${o.text}</div>
                  <div class="activity-time">${o.time}</div>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- Credit Tracker -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">💳 Credit Usage</h2>
          <span class="mono" style="font-size: var(--text-xs); color: var(--accent-amber);">$${u.spent.toFixed(2)} / $${u.totalBudget.toFixed(2)}</span>
        </div>
        <div class="card" style="padding: var(--space-lg);">
          <div style="margin-bottom: var(--space-md);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-size: var(--text-xs); color: var(--text-secondary);">Budget Used</span>
              <span class="mono" style="font-size: var(--text-xs); color: ${a>80?"var(--accent-red)":a>50?"var(--accent-amber)":"var(--accent-green)"};">${a}%</span>
            </div>
            <div class="progress-bar" style="height: 8px;">
              <div class="progress-bar-fill" style="width: ${a}%; background: linear-gradient(90deg, var(--accent-green), ${a>50?"var(--accent-amber)":"var(--accent-green)"}, ${a>80?"var(--accent-red)":"var(--accent-amber)"});"></div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--space-xs);">
            ${u.breakdown.map(o=>`
              <div style="display: flex; align-items: center; gap: var(--space-sm); padding: 6px 0;">
                <span style="font-size: var(--text-sm);">${o.icon}</span>
                <span style="flex: 1; font-size: var(--text-xs); color: var(--text-secondary);">${o.category}</span>
                <span class="mono" style="font-size: var(--text-xs); color: var(--text-tertiary);">${o.operations.toLocaleString()} ops</span>
                <span class="mono" style="font-size: var(--text-xs); font-weight: 600; color: ${o.color};">$${o.spent.toFixed(2)}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  `}function Oe(){const e=document.getElementById("main-content");e&&e.addEventListener("click",t=>{const s=t.target.closest("[data-action]");if(s)switch(s.dataset.action){case"submit-response":{const a=s.dataset.question,i=document.querySelector(`.feedback-response-input[data-question="${a}"]`);i&&i.value.trim()&&(X({text:`[Response to ${a}] ${i.value.trim()}`,category:"response",priority:"high"}),i.value="",i.placeholder="✓ Saved! Queued for Antigravity.",i.style.borderColor="var(--accent-green)",setTimeout(()=>M(),500));break}case"submit-feedback":{const a=document.getElementById("feedback-text"),i=document.getElementById("feedback-category"),n=document.getElementById("feedback-priority");a&&a.value.trim()&&(X({text:a.value.trim(),category:(i==null?void 0:i.value)||"general",priority:(n==null?void 0:n.value)||"medium"}),a.value="",M());break}case"done-feedback":{Ee(s.dataset.fb),M();break}case"delete-feedback":{Le(s.dataset.fb),M();break}}})}function M(){const e=document.getElementById("feedback-list");if(!e)return;const t=oe();if(t.length===0){e.innerHTML=`
      <div style="text-align:center;padding:var(--space-lg);color:var(--text-tertiary);">
        <div style="font-size:24px;margin-bottom:var(--space-xs);">📭</div>
        <div style="font-size:var(--text-xs);">No feedback yet.</div>
      </div>
    `;return}e.innerHTML=t.map(s=>`
    <div style="display:flex;align-items:start;gap:var(--space-xs);padding:8px;border-radius:var(--radius-sm);background:var(--bg-primary);border:1px solid var(--border-subtle);">
      <span style="font-size:10px;padding:2px 6px;border-radius:var(--radius-full);background:${s.status==="new"?"var(--accent-cyan-dim)":s.status==="in-progress"?"var(--accent-amber-dim)":"var(--accent-green-dim)"};color:${s.status==="new"?"var(--accent-cyan)":s.status==="in-progress"?"var(--accent-amber)":"var(--accent-green)"};font-weight:600;text-transform:uppercase;white-space:nowrap;">${s.status}</span>
      <div style="flex:1;min-width:0;">
        <div style="font-size:12px;color:var(--text-primary);word-break:break-word;">${s.text}</div>
        <div style="font-size:10px;color:var(--text-tertiary);margin-top:2px;font-family:var(--font-mono);">
          ${s.category} · ${s.priority} · ${new Date(s.createdAt).toLocaleString()}
        </div>
      </div>
      <div style="display:flex;gap:2px;flex-shrink:0;">
        ${s.status!=="done"?`<button data-action="done-feedback" data-fb="${s.id}" style="border:none;background:var(--accent-green-dim);color:var(--accent-green);width:22px;height:22px;border-radius:4px;cursor:pointer;font-size:10px;" title="Mark done">✓</button>`:""}
        <button data-action="delete-feedback" data-fb="${s.id}" style="border:none;background:var(--accent-red-dim);color:var(--accent-red);width:22px;height:22px;border-radius:4px;cursor:pointer;font-size:10px;" title="Delete">✕</button>
      </div>
    </div>
  `).join("")}function Ge(){return`
    <div class="view-header">
      <div class="view-header-left">
        <h1 class="view-title">Agent Fleet</h1>
        <p class="view-subtitle">Manage your multi-agent team — ${l.filter(e=>e.status==="active").length} of ${l.length} agents online</p>
      </div>
      <div class="view-actions">
        <button class="btn btn-secondary">⚙️ Configure</button>
        <button class="btn btn-primary">+ New Agent</button>
      </div>
    </div>

    <div class="card-grid card-grid-2 stagger-children">
      ${l.map(e=>`
        <div class="card hover-lift hover-glow-cyan" style="cursor: pointer; overflow: hidden; padding: 0;">
          <!-- Agent Portrait Banner -->
          <div style="position: relative; height: 160px; overflow: hidden;">
            <img src="${e.image}" alt="${e.name}" style="width: 100%; height: 100%; object-fit: cover; object-position: top center; filter: brightness(0.7);" />
            <div style="position: absolute; inset: 0; background: linear-gradient(0deg, var(--bg-elevated) 5%, transparent 60%);"></div>
            <div style="position: absolute; top: var(--space-sm); right: var(--space-sm);">
              <span class="badge badge-${e.status}">
                <span class="badge-dot ${e.status==="active"?"live-pulse":""}"></span>
                ${e.status}
              </span>
            </div>
            <div class="progress-ring" style="position: absolute; bottom: var(--space-sm); right: var(--space-sm);">
              <svg width="48" height="48">
                <circle class="progress-ring-bg" cx="24" cy="24" r="20" stroke-width="3"/>
                <circle class="progress-ring-fill" cx="24" cy="24" r="20" stroke-width="3"
                  stroke="${e.color}"
                  stroke-dasharray="${2*Math.PI*20}"
                  stroke-dashoffset="${2*Math.PI*20*(1-e.performance/100)}"/>
              </svg>
              <span class="progress-ring-text" style="font-size: 10px;">${e.performance}%</span>
            </div>
          </div>

          <div style="padding: var(--space-md) var(--space-lg) var(--space-lg);">
            <!-- Name & Role -->
            <div style="margin-bottom: var(--space-sm);">
              <div style="font-size: var(--text-lg); font-weight: 800; letter-spacing: -0.02em;">${e.name}</div>
              <div style="font-size: var(--text-sm); color: var(--text-secondary);">${e.role}</div>
            </div>

            <!-- Current Task -->
            <div class="agent-card-task" style="margin-bottom: var(--space-sm);">
              <span class="task-indicator" style="background: ${e.status==="active"?e.color:"var(--text-tertiary)"}; ${e.status==="active"?"animation: pulseGlow 2s infinite;":""}"></span>
              <span class="truncate">${e.currentTask}</span>
            </div>

            <!-- Personality -->
            <p style="font-size: var(--text-xs); color: var(--text-tertiary); font-style: italic; margin-bottom: var(--space-sm);">"${e.personality}"</p>

            <!-- Skills -->
            <div class="agent-skills" style="margin-bottom: var(--space-sm);">
              ${e.skills.map(t=>`<span class="tag">${t}</span>`).join("")}
            </div>

            <!-- Stats -->
            <div class="agent-card-stats">
              <div class="agent-stat">
                <div class="agent-stat-value" style="color: ${e.color};">${e.tasksCompleted}</div>
                <div class="agent-stat-label">Tasks Done</div>
              </div>
              <div class="agent-stat">
                <div class="agent-stat-value" style="color: ${e.color};">${e.skillsUsed}</div>
                <div class="agent-stat-label">Skills Used</div>
              </div>
            </div>

            <!-- Workspace Info -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-sm); padding-top: var(--space-sm); border-top: 1px solid var(--border-subtle);">
              <span class="mono" style="font-size: var(--text-xs); color: var(--text-tertiary);">ws: ${e.workspace}</span>
              <span class="mono" style="font-size: var(--text-xs); color: var(--text-tertiary);">⏱ ${e.uptime}</span>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `}function re(e){return l.find(t=>t.id===e)||{name:"?",avatar:"❓",color:"#5a6478"}}function ce(e){switch(e){case"critical":return"var(--accent-red)";case"high":return"var(--accent-amber)";case"medium":return"var(--accent-cyan)";case"low":return"var(--text-tertiary)";default:return"var(--text-tertiary)"}}function Re(e){const t=re(e.agent),s=e.steps.filter(a=>a.done).length;return`
    <div class="task-card hover-lift" data-task="${e.id}">
      <div style="display: flex; align-items: center; gap: var(--space-xs); margin-bottom: var(--space-xs);">
        <span style="width: 4px; height: 16px; border-radius: 2px; background: ${ce(e.priority)};"></span>
        <span class="badge badge-${e.priority==="critical"?"running":"queued"}" style="font-size: 10px; ${e.priority==="critical"?"background: var(--accent-red-dim); color: var(--accent-red);":""}">${e.priority}</span>
      </div>
      <div class="task-card-title">${e.title}</div>
      <div class="task-card-meta">
        <span class="mono">${e.id}</span>
        <span>•</span>
        <span>${e.project}</span>
      </div>

      <!-- Progress -->
      <div class="progress-bar progress-cyan" style="margin-bottom: var(--space-xs);">
        <div class="progress-bar-fill ${e.status==="in-progress"?"animated":""}" style="width: ${e.progress}%;"></div>
      </div>
      <div style="font-size: var(--text-xs); color: var(--text-tertiary); font-family: var(--font-mono);">${e.progress}%</div>

      <!-- Steps -->
      <div class="task-steps">
        ${e.steps.map(a=>`
          <div class="task-step">
            <span class="task-step-check ${a.done?"done":""}">
              ${a.done?"✓":""}
            </span>
            <span${a.done?' style="text-decoration: line-through; opacity: 0.5;"':""}>${a.name}</span>
          </div>
        `).join("")}
      </div>

      <!-- Footer -->
      <div class="task-card-footer">
        <div class="task-card-assignee">
          <div class="avatar avatar-sm" style="background: ${t.color}20; font-size: 12px;">${t.avatar}</div>
          <span style="font-size: var(--text-xs); color: var(--text-secondary);">${t.name}</span>
        </div>
        <span style="font-size: var(--text-xs); color: var(--text-tertiary); font-family: var(--font-mono);">${s}/${e.steps.length}</span>
      </div>
    </div>
  `}function de(){return`
    <div class="kanban-board">
      ${[{key:"queued",title:"Queued",color:"var(--accent-blue)"},{key:"in-progress",title:"In Progress",color:"var(--accent-cyan)"},{key:"review",title:"Review",color:"var(--accent-magenta)"},{key:"complete",title:"Complete",color:"var(--accent-green)"}].map(t=>{const s=m.filter(a=>a.status===t.key);return`
          <div class="kanban-column">
            <div class="kanban-column-header">
              <span class="kanban-column-title" style="color: ${t.color};">${t.title}</span>
              <span class="kanban-column-count">${s.length}</span>
            </div>
            <div class="stagger-children" style="display: flex; flex-direction: column; gap: var(--space-sm);">
              ${s.map(Re).join("")}
            </div>
          </div>
        `}).join("")}
    </div>
  `}function Ne(){return`
    <div class="timeline">
      ${[...m].sort((t,s)=>s.progress-t.progress).map(t=>{const s=re(t.agent);return`
          <div class="timeline-item">
            <div class="timeline-dot" style="background: ${ce(t.priority)};"></div>
            <div class="timeline-content">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-xs);">
                <span style="font-weight: 700; font-size: var(--text-sm);">${t.title}</span>
                <span class="badge badge-${t.status==="in-progress"?"running":t.status==="review"?"review":t.status==="complete"?"complete":"queued"}">
                  <span class="badge-dot"></span>
                  ${t.status}
                </span>
              </div>
              <div style="display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-sm);">
                <div class="task-card-assignee">
                  <div class="avatar avatar-sm" style="background: ${s.color}20; font-size: 12px;">${s.avatar}</div>
                  <span style="font-size: var(--text-xs); color: var(--text-secondary);">${s.name}</span>
                </div>
                <span class="mono" style="font-size: var(--text-xs); color: var(--text-tertiary);">${t.project}</span>
              </div>
              <div class="progress-bar progress-cyan">
                <div class="progress-bar-fill" style="width: ${t.progress}%;"></div>
              </div>
              <div style="font-size: var(--text-xs); color: var(--text-tertiary); font-family: var(--font-mono); margin-top: 4px;">${t.progress}% complete</div>
            </div>
          </div>
        `}).join("")}
    </div>
  `}function qe(){return`
    <div class="view-header">
      <div class="view-header-left">
        <h1 class="view-title">Task Operations</h1>
        <p class="view-subtitle">${m.length} tasks across all projects — ${m.filter(e=>e.status==="in-progress").length} currently running</p>
      </div>
      <div class="view-actions">
        <button class="btn btn-primary">+ New Task</button>
      </div>
    </div>

    <div class="task-controls">
      <div class="view-toggle" id="task-view-toggle">
        <button class="view-toggle-btn active" data-view="kanban">⊞ Board</button>
        <button class="view-toggle-btn" data-view="timeline">≡ Timeline</button>
      </div>

      <select class="filter-dropdown" id="filter-agent">
        <option value="all">All Agents</option>
        ${l.map(e=>`<option value="${e.id}">${e.avatar} ${e.name}</option>`).join("")}
      </select>

      <select class="filter-dropdown" id="filter-priority">
        <option value="all">All Priorities</option>
        <option value="critical">🔴 Critical</option>
        <option value="high">🟡 High</option>
        <option value="medium">🔵 Medium</option>
        <option value="low">⚪ Low</option>
      </select>
    </div>

    <div id="task-view-container">
      ${de()}
    </div>
  `}function We(){const e=document.querySelectorAll("#task-view-toggle .view-toggle-btn"),t=document.getElementById("task-view-container");e.forEach(s=>{s.addEventListener("click",()=>{e.forEach(i=>i.classList.remove("active")),s.classList.add("active");const a=s.dataset.view;t.innerHTML=a==="kanban"?de():Ne()})})}function He(e){return e.map(t=>l.find(s=>s.id===t)).filter(Boolean)}const Ke=["All","Code","Data","Design","Integration","Automation"];function Ue(){var e;return`
    <div class="view-header">
      <div class="view-header-left">
        <h1 class="view-title">Skill Forge</h1>
        <p class="view-subtitle">Skill library, generation history, and usage analytics — ${f.length} skills deployed</p>
      </div>
      <div class="view-actions">
        <button class="btn btn-secondary">📊 Analytics</button>
        <button class="btn btn-primary">+ Generate Skill</button>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="content-vault-tabs" style="margin-bottom: var(--space-lg);">
      ${Ke.map((t,s)=>`
        <button class="vault-tab ${s===0?"active":""}" data-category="${t}">${t}</button>
      `).join("")}
    </div>

    <!-- Usage Stats Bar -->
    <div class="metrics-row stagger-children" style="margin-bottom: var(--space-xl);">
      <div class="card stat-card hover-lift">
        <div class="stat-icon" style="background: var(--accent-cyan-dim); color: var(--accent-cyan);">🔧</div>
        <div class="stat-value" style="color: var(--accent-cyan);">${f.length}</div>
        <div class="stat-label">Total Skills</div>
      </div>
      <div class="card stat-card hover-lift">
        <div class="stat-icon" style="background: var(--accent-magenta-dim); color: var(--accent-magenta);">📈</div>
        <div class="stat-value" style="color: var(--accent-magenta);">${f.reduce((t,s)=>t+s.usageCount,0)}</div>
        <div class="stat-label">Total Invocations</div>
      </div>
      <div class="card stat-card hover-lift">
        <div class="stat-icon" style="background: var(--accent-green-dim); color: var(--accent-green);">🏆</div>
        <div class="stat-value" style="color: var(--accent-green);">${((e=f.sort((t,s)=>s.usageCount-t.usageCount)[0])==null?void 0:e.name.split(" ")[0])||"N/A"}</div>
        <div class="stat-label">Most Used</div>
      </div>
      <div class="card stat-card hover-lift">
        <div class="stat-icon" style="background: var(--accent-amber-dim); color: var(--accent-amber);">⚡</div>
        <div class="stat-value" style="color: var(--accent-amber);">3</div>
        <div class="stat-label">Generated Today</div>
      </div>
    </div>

    <!-- Skill Grid -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">Skill Library</h2>
        <span style="font-size: var(--text-xs); color: var(--text-tertiary);">${f.length} skills</span>
      </div>
      <div class="card-grid card-grid-3 stagger-children">
        ${f.map(t=>{const s=He(t.agents);return`
            <div class="card skill-card hover-lift hover-glow-cyan" style="cursor: pointer;">
              <div class="skill-card-icon" style="background: ${t.color}15; color: ${t.color};">${t.icon}</div>
              <div class="skill-card-name">${t.name}</div>
              <div class="skill-card-desc">${t.description}</div>

              <div style="display: flex; align-items: center; gap: var(--space-xs); margin-bottom: var(--space-sm);">
                <span class="tag">${t.type}</span>
                <span class="mono" style="font-size: var(--text-xs); color: var(--text-tertiary);">v${t.version}</span>
              </div>

              <div class="skill-card-meta">
                <div style="display: flex; align-items: center; gap: -4px;">
                  ${s.map(a=>`
                    <div class="avatar avatar-sm" style="background: ${a.color}20; font-size: 10px; margin-left: -4px; border: 2px solid var(--bg-elevated);" title="${a.name}">${a.avatar}</div>
                  `).join("")}
                </div>
                <div class="skill-usage">
                  <span style="color: ${t.color};">${t.usageCount}</span> uses
                </div>
              </div>
            </div>
          `}).join("")}
      </div>
    </div>

    <!-- Generation History -->
    <div class="section" style="margin-top: var(--space-xl);">
      <div class="section-header">
        <h2 class="section-title">Recent Generation History</h2>
      </div>
      <div class="card" style="padding: var(--space-sm);">
        <div class="activity-feed">
          <div class="activity-item">
            <div class="activity-dot" style="background: var(--accent-cyan);"></div>
            <div class="activity-content">
              <div class="activity-text"><strong>API Gateway Config</strong> updated to v2.1.0 — added rate limiting support</div>
              <div class="activity-time">22 min ago</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-dot" style="background: var(--accent-magenta);"></div>
            <div class="activity-content">
              <div class="activity-text"><strong>Test Suite Generator</strong> created at v1.5.0 — auto-generates E2E tests</div>
              <div class="activity-time">1h ago</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-dot" style="background: var(--accent-green);"></div>
            <div class="activity-content">
              <div class="activity-text"><strong>Chat Importer</strong> updated to v1.1.0 — added ChatGPT support</div>
              <div class="activity-time">3h ago</div>
            </div>
          </div>
          <div class="activity-item">
            <div class="activity-dot" style="background: var(--accent-amber);"></div>
            <div class="activity-content">
              <div class="activity-text"><strong>ETL Pipeline Builder</strong> created at v1.3.0 — supports 12 data sources</div>
              <div class="activity-time">5h ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function Ve(e){return e.map(t=>l.find(s=>s.id===t)).filter(Boolean)}function Je(e){return m.filter(t=>t.project===e)}function _e(e){return{active:"badge-active",migrating:"badge-migrating",paused:"badge-idle",archived:"badge-archived"}[e]||"badge-queued"}function Qe(){return`
    <div class="view-header">
      <div class="view-header-left">
        <h1 class="view-title">Project Hub</h1>
        <p class="view-subtitle">${h.length} projects — ${h.filter(e=>e.status==="active").length} active, ${h.filter(e=>e.status==="migrating").length} migrating</p>
      </div>
      <div class="view-actions">
        <button class="btn btn-secondary">📋 Templates</button>
        <button class="btn btn-primary">+ New Project</button>
      </div>
    </div>

    <div class="card-grid card-grid-2 stagger-children">
      ${h.map(e=>{const t=Ve(e.team),a=Je(e.id).filter(i=>i.status==="in-progress").length;return`
          <div class="card hover-lift hover-glow-cyan" style="cursor: pointer; overflow: hidden; padding: 0;">
            <!-- Project Thumbnail Image -->
            <div class="project-card-thumb" style="position: relative;">
              <img src="${e.image}" alt="${e.name}" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.65);" />
              <div style="position: absolute; inset: 0; background: linear-gradient(0deg, var(--bg-elevated) 10%, transparent 70%);"></div>
              <div style="position: absolute; top: var(--space-sm); right: var(--space-sm);">
                <span class="badge ${_e(e.status)}">
                  <span class="badge-dot ${e.status==="active"||e.status==="migrating"?"live-pulse":""}"></span>
                  ${e.status}
                </span>
              </div>
              <div style="position: absolute; bottom: var(--space-sm); left: var(--space-md);">
                <span style="font-size: var(--text-lg); font-weight: 800; text-shadow: 0 2px 8px rgba(0,0,0,0.8);">${e.name}</span>
              </div>
            </div>

            <div style="padding: var(--space-md) var(--space-lg) var(--space-lg);">
              <div class="project-card-desc">${e.description}</div>

              <!-- Progress -->
              <div style="margin: var(--space-sm) 0;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span style="font-size: var(--text-xs); color: var(--text-secondary);">Progress</span>
                  <span class="mono" style="font-size: var(--text-xs); color: ${e.color};">${e.progress}%</span>
                </div>
                <div class="progress-bar progress-cyan">
                  <div class="progress-bar-fill" style="width: ${e.progress}%; background: linear-gradient(90deg, ${e.color}, ${e.color}88);"></div>
                </div>
              </div>

              <!-- Footer -->
              <div class="project-card-footer">
                <div style="display: flex; align-items: center;">
                  ${t.length>0?`
                    <div class="project-card-team">
                      ${t.map(i=>`
                        <div style="width: 28px; height: 28px; border-radius: 50%; overflow: hidden; margin-left: -8px; border: 2px solid var(--bg-elevated);">
                          <img src="${i.image}" alt="${i.name}" style="width: 100%; height: 100%; object-fit: cover;" title="${i.name}" />
                        </div>
                      `).join("")}
                    </div>
                  `:'<span style="font-size: var(--text-xs); color: var(--text-tertiary);">No team assigned</span>'}
                </div>
                <div style="display: flex; gap: var(--space-md);">
                  <span style="font-size: var(--text-xs); color: var(--text-tertiary);"><span class="mono">${e.taskCount}</span> tasks</span>
                  <span style="font-size: var(--text-xs); color: var(--text-tertiary);"><span class="mono">${e.fileCount}</span> files</span>
                </div>
              </div>

              ${a>0?`
                <div style="margin-top: var(--space-sm); padding-top: var(--space-sm); border-top: 1px solid var(--border-subtle);">
                  <div style="display: flex; align-items: center; gap: var(--space-xs);">
                    <span class="badge-dot live-pulse" style="background: var(--accent-cyan); width: 6px; height: 6px; border-radius: 50%;"></span>
                    <span style="font-size: var(--text-xs); color: var(--accent-cyan);">${a} task${a>1?"s":""} in progress</span>
                  </div>
                </div>
              `:""}
            </div>
          </div>
        `}).join("")}
    </div>
  `}function ee(e){return{connected:"var(--accent-green)",migrating:"var(--accent-cyan)",pending:"var(--accent-amber)",error:"var(--accent-red)"}[e]||"var(--text-tertiary)"}function Ze(e){return{complete:"badge-complete",running:"badge-running",queued:"badge-queued"}[e]||"badge-queued"}function Ye(){const e=F.reduce((a,i)=>a+i.itemCount,0),t=F.filter(a=>a.status==="connected").length,s=O.filter(a=>a.status==="running").length;return`
    <div class="view-header">
      <div class="view-header-left">
        <h1 class="view-title">Migration Console</h1>
        <p class="view-subtitle">Consolidate all your digital creations into one unified system</p>
      </div>
      <div class="view-actions">
        <button class="btn btn-secondary">🔍 Scan</button>
        <button class="btn btn-primary">+ Connect Source</button>
      </div>
    </div>

    <div class="metrics-row stagger-children" style="margin-bottom: var(--space-xl);">
      <div class="card stat-card hover-lift">
        <div class="stat-icon" style="background: var(--accent-cyan-dim); color: var(--accent-cyan);">🔗</div>
        <div class="stat-value" style="color: var(--accent-cyan);">${t}</div>
        <div class="stat-label">Sources Connected</div>
      </div>
      <div class="card stat-card hover-lift">
        <div class="stat-icon" style="background: var(--accent-magenta-dim); color: var(--accent-magenta);">📦</div>
        <div class="stat-value" style="color: var(--accent-magenta);">${e.toLocaleString()}</div>
        <div class="stat-label">Total Items</div>
      </div>
      <div class="card stat-card hover-lift">
        <div class="stat-icon" style="background: var(--accent-green-dim); color: var(--accent-green);">⬇️</div>
        <div class="stat-value" style="color: var(--accent-green);">${s}</div>
        <div class="stat-label">Active Imports</div>
      </div>
      <div class="card stat-card hover-lift">
        <div class="stat-icon" style="background: var(--accent-amber-dim); color: var(--accent-amber);">✅</div>
        <div class="stat-value" style="color: var(--accent-amber);">${O.filter(a=>a.status==="complete").length}</div>
        <div class="stat-label">Completed</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h2 class="section-title">Source Connectors</h2>
      </div>
      <div class="card-grid card-grid-4 stagger-children">
        ${F.map(a=>`
          <div class="card source-card hover-lift hover-glow-cyan">
            <div class="source-card-icon" style="background: ${a.color}15;">${a.icon}</div>
            <div class="source-card-name">${a.name}</div>
            <div class="source-card-status">
              <span class="badge-dot" style="background: ${ee(a.status)};"></span>
              <span style="color: ${ee(a.status)};">${a.status}</span>
            </div>
            <div class="source-card-count" style="color: ${a.color};">${a.itemCount.toLocaleString()}</div>
            <div class="source-card-label">${a.category}</div>
            <div style="margin-top: var(--space-sm); padding-top: var(--space-sm); border-top: 1px solid var(--border-subtle);">
              <p style="font-size: var(--text-xs); color: var(--text-tertiary);">${a.description}</p>
            </div>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="section" style="margin-top: var(--space-xl);">
      <div class="section-header"><h2 class="section-title">Import Queue</h2></div>
      <div class="import-queue stagger-children">
        ${O.map(a=>`
          <div class="import-item">
            <div style="font-size: var(--text-xl);">${a.status==="complete"?"✅":a.status==="running"?"🔄":"⏳"}</div>
            <div class="import-item-info">
              <div class="import-item-name">${a.name}</div>
              <div class="import-item-source">${a.source} · ${a.items} items</div>
            </div>
            <div class="import-item-progress">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span class="badge ${Ze(a.status)}"><span class="badge-dot ${a.status==="running"?"live-pulse":""}"></span>${a.status}</span>
                <span class="mono" style="font-size: var(--text-xs); color: var(--text-tertiary);">${a.progress}%</span>
              </div>
              <div class="progress-bar ${a.status==="complete"?"progress-green":"progress-cyan"}">
                <div class="progress-bar-fill ${a.status==="running"?"animated":""}" style="width: ${a.progress}%;"></div>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>

    <div class="section" style="margin-top: var(--space-xl);">
      <div class="section-header"><h2 class="section-title">Content Vault</h2></div>
      <div class="content-vault-tabs">
        ${["All","Chats","Artifacts","Demos","Sites","Code"].map((a,i)=>`<button class="vault-tab ${i===0?"active":""}">${a}</button>`).join("")}
      </div>
      <div class="card" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: var(--space-md);">
        ${[{icon:"💬",name:"System Architecture Discussion",meta:"Claude · Chat · Dec 2025"},{icon:"📄",name:"Dashboard Wireframe v2",meta:"Claude · Artifact · Jan 2026"},{icon:"🌐",name:"Portfolio Website Backup",meta:"WordPress · Site · Nov 2025"},{icon:"🎨",name:"Design System Tokens",meta:"Figma · Artifact · Feb 2026"},{icon:"💬",name:"Marketing Copy Generation",meta:"ChatGPT · Chat · Oct 2025"},{icon:"🧪",name:"Invoice App Prototype",meta:"Lovable · Demo · Sep 2025"}].map(a=>`
          <div style="display: flex; align-items: center; gap: var(--space-sm); padding: var(--space-sm); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); cursor: pointer;" class="hover-lift">
            <span style="font-size: var(--text-xl);">${a.icon}</span>
            <div style="flex:1;min-width:0;"><div class="truncate" style="font-size: var(--text-sm); font-weight: 600;">${a.name}</div><div style="font-size: var(--text-xs); color: var(--text-tertiary);">${a.meta}</div></div>
          </div>
        `).join("")}
      </div>
    </div>
  `}function Xe(e){switch(e){case"active":return{label:"View Live",color:"var(--accent-green)"};case"rebuild":return{label:"Rebuild",color:"var(--accent-amber)"};case"archive":return{label:"Archived",color:"var(--text-tertiary)"};default:return{label:"View",color:"var(--text-secondary)"}}}function et(){const e=I.filter(s=>s.status==="active").length,t=I.filter(s=>s.status==="rebuild").length;return`
    <div class="view-header">
      <div class="view-header-left">
        <h1 class="view-title">Demo Gallery</h1>
        <p class="view-subtitle">${I.length} demos — ${e} active, ${t} flagged for rebuild</p>
      </div>
      <div class="view-actions">
        <select class="filter-dropdown">
          <option>All Sources</option>
          <option>Custom</option>
          <option>Lovable</option>
          <option>WordPress</option>
          <option>Claude</option>
          <option>Emergent</option>
        </select>
        <select class="filter-dropdown">
          <option>All Status</option>
          <option>Active</option>
          <option>Rebuild</option>
          <option>Archive</option>
        </select>
      </div>
    </div>

    <div class="card-grid card-grid-3 stagger-children">
      ${I.map(s=>{const a=Xe(s.status);return`
          <div class="card demo-card hover-lift hover-glow-cyan" style="overflow: hidden; padding: 0; cursor: pointer;">
            <!-- Demo Preview Image -->
            <div style="position: relative; height: 180px; overflow: hidden;">
              <img src="${s.image}" alt="${s.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease, filter 0.4s ease; filter: brightness(0.75);" />
              <div style="position: absolute; inset: 0; background: linear-gradient(0deg, var(--bg-elevated) 8%, transparent 60%);"></div>
              <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; background: rgba(0,0,0,0.5);" class="demo-hover-overlay">
                <button class="btn btn-primary" style="font-size: var(--text-sm); padding: 8px 20px;">▶ Preview</button>
              </div>
              <div style="position: absolute; top: var(--space-sm); right: var(--space-sm);">
                <span class="badge badge-${s.status==="active"?"active":s.status==="rebuild"?"idle":"archived"}">
                  <span class="badge-dot"></span>
                  ${a.label}
                </span>
              </div>
            </div>

            <div style="padding: var(--space-sm) var(--space-md) var(--space-md);">
              <div style="font-weight: 700; font-size: var(--text-base); margin-bottom: 4px;">${s.name}</div>
              <div style="display: flex; align-items: center; gap: var(--space-xs); font-size: var(--text-xs); color: var(--text-tertiary); margin-bottom: var(--space-xs);">
                <span>${s.source}</span>
                <span>·</span>
                <span>${s.type}</span>
              </div>
              <p style="font-size: var(--text-xs); color: var(--text-tertiary);">${s.description}</p>
            </div>
          </div>
        `}).join("")}
    </div>

    <!-- Preview Modal -->
    <div class="modal-overlay" id="demo-modal">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title" id="modal-title">Preview</span>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div style="display: flex; align-items: center; justify-content: center; height: 400px; background: var(--bg-tertiary); border-radius: var(--radius-md);">
            <div style="text-align: center;">
              <div style="font-size: 64px; margin-bottom: var(--space-md);">🚀</div>
              <p style="color: var(--text-secondary);">Interactive preview loading...</p>
              <p style="font-size: var(--text-xs); color: var(--text-tertiary); margin-top: var(--space-xs);">Connect a live URL to enable iframe preview</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function tt(){const e=document.getElementById("demo-modal"),t=document.getElementById("modal-close-btn");document.querySelectorAll(".demo-card").forEach(a=>{const i=a.querySelector(".demo-hover-overlay"),n=a.querySelector("img");i&&n&&(a.addEventListener("mouseenter",()=>{i.style.opacity="1",n.style.transform="scale(1.05)",n.style.filter="brightness(0.5)"}),a.addEventListener("mouseleave",()=>{i.style.opacity="0",n.style.transform="scale(1)",n.style.filter="brightness(0.75)"}));const c=a.querySelector(".btn-primary");c&&c.addEventListener("click",o=>{var Y;o.stopPropagation();const r=(Y=a.querySelector('div[style*="font-weight: 700"]'))==null?void 0:Y.textContent,v=document.getElementById("modal-title");v&&(v.textContent=r||"Preview"),e&&e.classList.add("active")})}),t&&e&&(t.addEventListener("click",()=>e.classList.remove("active")),e.addEventListener("click",a=>{a.target===e&&e.classList.remove("active")}))}function le(){const e=w.map(s=>({...s,type:"human",tasksCompleted:0,performance:null})),t=l.map(s=>({...s,type:"agent",email:null,teamIds:k.filter(a=>a.memberIds.includes(s.id)).map(a=>a.id)}));return[...e,...t]}function at(e){return e.type==="agent"&&e.image?`<img src="${e.image}" alt="${e.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`:e.type==="human"&&e.image?`<img src="${e.image}" alt="${e.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`:e.type==="agent"?`<span style="font-size:28px;">${e.avatar}</span>`:`<span style="font-size:16px;font-weight:800;color:${e.color};letter-spacing:0.5px;">${e.avatar}</span>`}function st(e){const t=e.teamIds||k.filter(s=>s.memberIds.includes(e.id)).map(s=>s.id);return k.filter(s=>t.includes(s.id))}function it(e){return m.filter(t=>t.agent===e.id)}function pe(e){const t=st(e),a=it(e).filter(i=>i.status==="in-progress").length;return`
    <div class="card hover-lift hover-glow-cyan" style="padding:0; overflow:hidden; cursor:pointer;">
      <!-- Top Banner -->
      <div style="position:relative; height:${e.type==="agent"&&e.image?"130px":"80px"}; overflow:hidden; background: linear-gradient(135deg, ${e.color}15, ${e.color}05);">
        ${e.type==="agent"&&e.image?`
          <img src="${e.image}" alt="${e.name}" style="width:100%;height:100%;object-fit:cover;object-position:top;filter:brightness(0.6);" />
          <div style="position:absolute;inset:0;background:linear-gradient(0deg,var(--bg-elevated) 5%,transparent 60%);"></div>
        `:""}
        <div style="position:absolute;top:var(--space-xs);right:var(--space-xs);display:flex;gap:4px;">
          <span class="badge badge-${e.status}" style="font-size:10px;">
            <span class="badge-dot ${e.status==="active"?"live-pulse":""}"></span>
            ${e.status}
          </span>
          <span style="font-size:9px;padding:3px 8px;border-radius:var(--radius-full);background:${e.type==="human"?"var(--accent-green-dim)":"var(--accent-cyan-dim)"};color:${e.type==="human"?"var(--accent-green)":"var(--accent-cyan)"};font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">
            ${e.type==="human"?"👤 Human":"🤖 AI"}
          </span>
        </div>
      </div>

      <div style="padding:var(--space-md) var(--space-lg) var(--space-lg);">
        <!-- Avatar & Name -->
        <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-sm);${e.type==="agent"&&e.image?"margin-top:-24px;":""}">
          <div style="width:48px;height:48px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:${e.color}15;border:2px solid ${e.color}40;flex-shrink:0;">
            ${at(e)}
          </div>
          <div>
            <div style="font-size:var(--text-lg);font-weight:800;letter-spacing:-0.02em;">${e.name}</div>
            <div style="font-size:var(--text-sm);color:var(--text-secondary);">${e.role}</div>
          </div>
        </div>

        ${e.email?`
          <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:var(--space-sm);font-family:var(--font-mono);">
            ✉ ${e.email}
          </div>
        `:""}

        ${e.personality?`
          <p style="font-size:var(--text-xs);color:var(--text-tertiary);font-style:italic;margin-bottom:var(--space-sm);">"${e.personality}"</p>
        `:""}

        <!-- Skills -->
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:var(--space-sm);">
          ${e.skills.map(i=>`<span class="tag">${i}</span>`).join("")}
        </div>

        <!-- Teams -->
        ${t.length>0?`
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:var(--space-sm);">
            ${t.map(i=>`
              <span style="font-size:10px;padding:2px 8px;border-radius:var(--radius-full);background:${i.color}15;color:${i.color};font-weight:600;">
                ${i.icon} ${i.name}
              </span>
            `).join("")}
          </div>
        `:""}

        <!-- Stats -->
        <div style="display:flex;gap:var(--space-lg);padding-top:var(--space-sm);border-top:1px solid var(--border-subtle);">
          ${e.type==="agent"?`
            <div>
              <div class="mono" style="font-size:var(--text-sm);font-weight:700;color:${e.color};">${e.tasksCompleted}</div>
              <div style="font-size:var(--text-xs);color:var(--text-tertiary);">Tasks Done</div>
            </div>
            <div>
              <div class="mono" style="font-size:var(--text-sm);font-weight:700;color:${e.color};">${e.performance}%</div>
              <div style="font-size:var(--text-xs);color:var(--text-tertiary);">Performance</div>
            </div>
          `:""}
          <div>
            <div class="mono" style="font-size:var(--text-sm);font-weight:700;color:${e.color};">${a}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary);">Active Tasks</div>
          </div>
          <div>
            <div class="mono" style="font-size:var(--text-sm);font-weight:700;color:${e.color};">${t.length}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary);">Teams</div>
          </div>
        </div>
      </div>
    </div>
  `}function nt(){const e=le(),t=w.length,s=l.length;return`
    <div class="view-header">
      <div class="view-header-left">
        <h1 class="view-title">People</h1>
        <p class="view-subtitle">${e.length} members — ${t} humans, ${s} AI agents</p>
      </div>
      <div class="view-actions">
        <button class="btn btn-secondary" id="btn-add-human">👤 Add Human</button>
        <button class="btn btn-primary" id="btn-add-agent">🤖 Add Agent</button>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="task-controls" style="margin-bottom: var(--space-lg);">
      <div class="view-toggle" id="people-filter">
        <button class="view-toggle-btn active" data-filter="all">All (${e.length})</button>
        <button class="view-toggle-btn" data-filter="human">👤 Humans (${t})</button>
        <button class="view-toggle-btn" data-filter="agent">🤖 AI Agents (${s})</button>
      </div>
    </div>

    <div class="card-grid card-grid-2 stagger-children" id="people-grid">
      ${e.map(pe).join("")}
    </div>
  `}function ot(){const e=document.querySelectorAll("#people-filter .view-toggle-btn");e.forEach(t=>{t.addEventListener("click",()=>{e.forEach(c=>c.classList.remove("active")),t.classList.add("active");const s=t.dataset.filter,a=le(),i=s==="all"?a:a.filter(c=>c.type===s),n=document.getElementById("people-grid");n&&(n.innerHTML=i.map(pe).join(""))})})}function rt(e){const t=l.find(a=>a.id===e);if(t)return{...t,type:"agent"};const s=w.find(a=>a.id===e);return s?{...s,type:"human"}:{name:"?",avatar:"?",color:"#5a6478",type:"unknown"}}function ct(e){return e.type==="agent"&&e.image?`<img src="${e.image}" alt="${e.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`:e.type==="agent"?`<span style="font-size:14px;">${e.avatar}</span>`:`<span style="font-size:10px;font-weight:800;color:${e.color};">${e.avatar}</span>`}function dt(e){return m.filter(t=>e.memberIds.includes(t.agent))}function lt(e){const t=e.memberIds.map(rt),s=h.filter(r=>e.projectIds.includes(r.id)),a=dt(e),i=a.filter(r=>r.status==="in-progress").length,n=a.filter(r=>r.status==="complete").length,c=t.filter(r=>r.type==="human").length,o=t.filter(r=>r.type==="agent").length;return`
    <div class="card hover-lift" style="overflow:hidden;padding:0;">
      <!-- Team Header -->
      <div style="padding:var(--space-lg);background:linear-gradient(135deg, ${e.color}12, ${e.color}04);border-bottom:1px solid var(--border-subtle);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-sm);">
          <div style="display:flex;align-items:center;gap:var(--space-sm);">
            <span style="font-size:28px;">${e.icon}</span>
            <div>
              <div style="font-size:var(--text-xl);font-weight:800;letter-spacing:-0.02em;">${e.name}</div>
              <div style="font-size:var(--text-sm);color:var(--text-secondary);">${e.description}</div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div style="display:flex;gap:var(--space-lg);margin-top:var(--space-md);">
          <div>
            <div class="mono" style="font-size:var(--text-lg);font-weight:700;color:${e.color};">${t.length}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary);">Members</div>
          </div>
          <div>
            <div class="mono" style="font-size:var(--text-lg);font-weight:700;color:var(--accent-cyan);">${i}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary);">Active Tasks</div>
          </div>
          <div>
            <div class="mono" style="font-size:var(--text-lg);font-weight:700;color:var(--accent-green);">${n}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary);">Completed</div>
          </div>
          <div>
            <div class="mono" style="font-size:var(--text-lg);font-weight:700;color:var(--accent-amber);">${s.length}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary);">Projects</div>
          </div>
        </div>
      </div>

      <!-- Members List -->
      <div style="padding:var(--space-md) var(--space-lg);">
        <div style="font-size:var(--text-xs);font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:var(--space-sm);">
          Team Members — ${c} human${c!==1?"s":""}, ${o} AI
        </div>
        <div style="display:flex;flex-direction:column;gap:var(--space-xs);">
          ${t.map(r=>`
            <div style="display:flex;align-items:center;gap:var(--space-sm);padding:6px 8px;border-radius:var(--radius-sm);transition:background var(--transition-fast);cursor:pointer;" onmouseenter="this.style.background='var(--bg-tertiary)'" onmouseleave="this.style.background='transparent'">
              <div style="width:32px;height:32px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;background:${r.color}15;border:2px solid ${r.color}30;flex-shrink:0;">
                ${ct(r)}
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-size:var(--text-sm);font-weight:600;">${r.name}</div>
                <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${r.role}</div>
              </div>
              <span style="font-size:9px;padding:2px 6px;border-radius:var(--radius-full);background:${r.type==="human"?"var(--accent-green-dim)":"var(--accent-cyan-dim)"};color:${r.type==="human"?"var(--accent-green)":"var(--accent-cyan)"};font-weight:600;">
                ${r.type==="human"?"👤":"🤖"}
              </span>
              <span class="badge badge-${r.status}" style="font-size:9px;">
                <span class="badge-dot ${r.status==="active"?"live-pulse":""}"></span>
                ${r.status}
              </span>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Assigned Projects -->
      ${s.length>0?`
        <div style="padding:0 var(--space-lg) var(--space-lg);">
          <div style="font-size:var(--text-xs);font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:var(--space-xs);">
            Projects
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${s.map(r=>`
              <a href="#/projects" style="font-size:11px;padding:4px 10px;border-radius:var(--radius-full);background:${r.color}12;color:${r.color};font-weight:600;border:1px solid ${r.color}25;text-decoration:none;transition:all var(--transition-fast);"
                 onmouseenter="this.style.background='${r.color}25'" onmouseleave="this.style.background='${r.color}12'">
                ${r.icon} ${r.name}
              </a>
            `).join("")}
          </div>
        </div>
      `:""}
    </div>
  `}function pt(){return`
    <div class="view-header">
      <div class="view-header-left">
        <h1 class="view-title">Teams</h1>
        <p class="view-subtitle">${k.length} teams managing ${h.filter(e=>e.status!=="archived").length} active projects</p>
      </div>
      <div class="view-actions">
        <button class="btn btn-primary" id="btn-new-team">+ New Team</button>
      </div>
    </div>

    <div class="stagger-children" style="display:flex;flex-direction:column;gap:var(--space-lg);">
      ${k.map(lt).join("")}
    </div>
  `}const b={name:"Mission Control Center",type:"directory",children:[{name:"src",type:"directory",children:[{name:"views",type:"directory",children:[{name:"mission-control.js",type:"file",size:"10.8 KB",modified:"2026-02-28",ext:"js"},{name:"agent-fleet.js",type:"file",size:"4.7 KB",modified:"2026-02-28",ext:"js"},{name:"task-ops.js",type:"file",size:"7.8 KB",modified:"2026-02-28",ext:"js"},{name:"project-hub.js",type:"file",size:"5.4 KB",modified:"2026-02-28",ext:"js"},{name:"people.js",type:"file",size:"6.2 KB",modified:"2026-02-28",ext:"js"},{name:"teams.js",type:"file",size:"5.1 KB",modified:"2026-02-28",ext:"js"},{name:"file-manager.js",type:"file",size:"8.9 KB",modified:"2026-02-28",ext:"js"}]},{name:"styles",type:"directory",children:[{name:"index.css",type:"file",size:"4.4 KB",modified:"2026-02-28",ext:"css"},{name:"layout.css",type:"file",size:"8.3 KB",modified:"2026-02-28",ext:"css"},{name:"cards.css",type:"file",size:"7.4 KB",modified:"2026-02-28",ext:"css"},{name:"views.css",type:"file",size:"14.8 KB",modified:"2026-02-28",ext:"css"},{name:"animations.css",type:"file",size:"5.5 KB",modified:"2026-02-28",ext:"css"},{name:"chat-bubbles.css",type:"file",size:"6.1 KB",modified:"2026-02-28",ext:"css"}]},{name:"components",type:"directory",children:[{name:"chat-system.js",type:"file",size:"8.2 KB",modified:"2026-02-28",ext:"js"}]},{name:"services",type:"directory",children:[{name:"feedback-store.js",type:"file",size:"1.2 KB",modified:"2026-02-28",ext:"js"}]},{name:"main.js",type:"file",size:"5.1 KB",modified:"2026-02-28",ext:"js"},{name:"router.js",type:"file",size:"2.0 KB",modified:"2026-02-28",ext:"js"},{name:"state.js",type:"file",size:"19.5 KB",modified:"2026-02-28",ext:"js"}]},{name:"public",type:"directory",children:[{name:"favicon.svg",type:"file",size:"637 B",modified:"2026-02-27",ext:"svg"},{name:"images",type:"directory",children:[{name:"agents",type:"directory",children:[{name:"architect.png",type:"file",size:"245 KB",modified:"2026-02-28",ext:"png"},{name:"forge.png",type:"file",size:"312 KB",modified:"2026-02-28",ext:"png"},{name:"sentinel.png",type:"file",size:"289 KB",modified:"2026-02-28",ext:"png"},{name:"pixel.png",type:"file",size:"267 KB",modified:"2026-02-28",ext:"png"},{name:"scribe.png",type:"file",size:"298 KB",modified:"2026-02-28",ext:"png"},{name:"oracle.png",type:"file",size:"256 KB",modified:"2026-02-28",ext:"png"}]},{name:"projects",type:"directory",children:[{name:"nexus-core.png",type:"file",size:"178 KB",modified:"2026-02-28",ext:"png"},{name:"holodeck.png",type:"file",size:"203 KB",modified:"2026-02-28",ext:"png"},{name:"migration.png",type:"file",size:"156 KB",modified:"2026-02-28",ext:"png"}]},{name:"demos",type:"directory",children:[{name:"portal.png",type:"file",size:"189 KB",modified:"2026-02-28",ext:"png"},{name:"tabspace.png",type:"file",size:"234 KB",modified:"2026-02-28",ext:"png"}]}]}]},{name:"index.html",type:"file",size:"794 B",modified:"2026-02-28",ext:"html"},{name:"package.json",type:"file",size:"243 B",modified:"2026-02-27",ext:"json"},{name:"vite.config.js",type:"file",size:"120 B",modified:"2026-02-27",ext:"js"}]};let P=[],x=null,D="grid",$="";function R(e){return e.type==="directory"?"📁":{js:"📜",ts:"💠",css:"🎨",html:"🌐",json:"📋",md:"📝",svg:"🖼️",png:"🖼️",jpg:"🖼️",gif:"🖼️",py:"🐍",sh:"⚙️",yml:"📦",yaml:"📦",txt:"📄",pdf:"📑",mp4:"🎬",mp3:"🎵",zip:"📦"}[e.ext]||"📄"}function N(e){return e.type==="directory"?"var(--accent-amber)":{js:"var(--accent-amber)",ts:"var(--accent-blue)",css:"var(--accent-magenta)",html:"var(--accent-red)",json:"var(--accent-green)",md:"var(--accent-purple)",svg:"var(--accent-cyan)",png:"var(--accent-cyan)",py:"var(--accent-blue)"}[e.ext]||"var(--text-tertiary)"}function q(){var t;let e=b;for(const s of P){const a=(t=e.children)==null?void 0:t.find(i=>i.name===s);if(a&&a.type==="directory")e=a;else break}return e}function te(e){return e.type!=="directory"||!e.children?0:e.children.length}function z(e,t=""){let s=[];if(!e.children)return s;for(const a of e.children){const i=t?`${t}/${a.name}`:a.name;s.push({...a,path:i}),a.type==="directory"&&(s=s.concat(z(a,i)))}return s}function ve(){const e=[{name:"Root",path:[]}];let t=[];for(const s of P)t=[...t,s],e.push({name:s,path:[...t]});return`
    <div class="file-breadcrumbs">
      ${e.map((s,a)=>`
        <span class="file-breadcrumb ${a===e.length-1?"active":""}" data-action="nav-breadcrumb" data-path="${JSON.stringify(s.path)}">
          ${s.name}
        </span>
        ${a<e.length-1?'<span class="file-breadcrumb-sep">/</span>':""}
      `).join("")}
    </div>
  `}function W(e){return e.length===0?'<div style="text-align:center;padding:var(--space-3xl);color:var(--text-tertiary);"><div style="font-size:32px;margin-bottom:var(--space-sm);">📂</div><div>Empty directory</div></div>':D==="list"?`
      <div class="file-list">
        <div class="file-list-header">
          <span class="file-list-col name">Name</span>
          <span class="file-list-col size">Size</span>
          <span class="file-list-col modified">Modified</span>
          <span class="file-list-col type">Type</span>
        </div>
        ${e.map(t=>`
          <div class="file-list-row ${x===t.name?"selected":""}" 
               data-action="${t.type==="directory"?"open-dir":"select-file"}" 
               data-name="${t.name}">
            <span class="file-list-col name">
              <span class="file-icon" style="color:${N(t)};">${R(t)}</span>
              <span>${t.name}</span>
            </span>
            <span class="file-list-col size mono">${t.size||`${te(t)} items`}</span>
            <span class="file-list-col modified mono">${t.modified||"—"}</span>
            <span class="file-list-col type">${t.type==="directory"?"Folder":(t.ext||"").toUpperCase()}</span>
          </div>
        `).join("")}
      </div>
    `:`
    <div class="file-grid">
      ${e.map(t=>`
        <div class="file-card ${x===t.name?"selected":""}" 
             data-action="${t.type==="directory"?"open-dir":"select-file"}" 
             data-name="${t.name}">
          <div class="file-card-icon" style="color:${N(t)};">
            ${R(t)}
          </div>
          <div class="file-card-name truncate">${t.name}</div>
          <div class="file-card-meta mono">${t.size||`${te(t)} items`}</div>
        </div>
      `).join("")}
    </div>
  `}function ge(e,t=0){const s=t*16;return e.type==="directory"?`
      <div class="tree-item tree-dir" style="padding-left:${s}px;" data-action="tree-toggle" data-name="${e.name}">
        <span class="tree-arrow">▸</span>
        <span class="file-icon" style="color:var(--accent-amber);">📁</span>
        <span class="tree-label">${e.name}</span>
      </div>
      <div class="tree-children" style="display:none;">
        ${(e.children||[]).map(a=>ge(a,t+1)).join("")}
      </div>
    `:`
    <div class="tree-item tree-file" style="padding-left:${s+16}px;" data-action="tree-select" data-name="${e.name}">
      <span class="file-icon" style="color:${N(e)};">${R(e)}</span>
      <span class="tree-label">${e.name}</span>
    </div>
  `}function vt(){let t=q().children||[];$&&(t=z(b).filter(n=>n.name.toLowerCase().includes($.toLowerCase()))),t=[...t].sort((i,n)=>i.type==="directory"&&n.type!=="directory"?-1:i.type!=="directory"&&n.type==="directory"?1:i.name.localeCompare(n.name));const s=z(b).filter(i=>i.type==="file").length,a=z(b).filter(i=>i.type==="directory").length;return`
    <div class="view-header">
      <div class="view-header-left">
        <h1 class="view-title">File Manager</h1>
        <p class="view-subtitle">${s} files in ${a} directories</p>
      </div>
      <div class="view-actions">
        <button class="btn btn-secondary" id="btn-new-folder">📁 New Folder</button>
        <button class="btn btn-primary" id="btn-new-file">+ New File</button>
      </div>
    </div>

    <div class="file-manager-layout">
      <!-- Sidebar Tree -->
      <div class="file-tree-sidebar">
        <div style="font-size:var(--text-xs);font-weight:600;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.05em;padding:var(--space-sm) var(--space-md);border-bottom:1px solid var(--border-subtle);">
          Explorer
        </div>
        <div class="file-tree" id="file-tree">
          ${ge(b)}
        </div>
      </div>

      <!-- Main Panel -->
      <div class="file-main-panel">
        <!-- Toolbar -->
        <div class="file-toolbar">
          ${ve()}
          <div style="display:flex;gap:var(--space-xs);align-items:center;">
            <div style="position:relative;">
              <input type="text" id="file-search" placeholder="Search files..." value="${$}"
                style="padding:6px 12px 6px 28px;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:var(--radius-full);color:var(--text-primary);font-size:12px;font-family:var(--font-sans);width:180px;outline:none;" />
              <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:12px;color:var(--text-tertiary);">🔍</span>
            </div>
            <div class="view-toggle" id="file-view-toggle">
              <button class="view-toggle-btn ${D==="grid"?"active":""}" data-view="grid">⊞</button>
              <button class="view-toggle-btn ${D==="list"?"active":""}" data-view="list">≡</button>
            </div>
          </div>
        </div>

        <!-- File Grid / List -->
        <div class="file-content" id="file-content">
          ${W(t)}
        </div>
      </div>
    </div>
  `}function gt(){const e=document.getElementById("main-content");if(!e)return;e.addEventListener("click",i=>{const n=i.target.closest("[data-action]");if(n)switch(n.dataset.action){case"open-dir":P.push(n.dataset.name),x=null,a();break;case"select-file":x=n.dataset.name,a();break;case"nav-breadcrumb":P=JSON.parse(n.dataset.path),x=null,a();break;case"tree-toggle":{const c=n.nextElementSibling;if(c){const o=c.style.display==="none";c.style.display=o?"block":"none";const r=n.querySelector(".tree-arrow");r&&(r.textContent=o?"▾":"▸")}break}case"tree-select":x=n.dataset.name,a();break}});const t=document.getElementById("file-view-toggle");t&&t.addEventListener("click",i=>{const n=i.target.closest(".view-toggle-btn");n&&(D=n.dataset.view,a())});const s=document.getElementById("file-search");s&&s.addEventListener("input",i=>{$=i.target.value;const n=document.getElementById("file-content");if(n){const c=q();let o=$?z(b).filter(r=>r.name.toLowerCase().includes($.toLowerCase())):c.children||[];o=[...o].sort((r,v)=>r.type==="directory"&&v.type!=="directory"?-1:r.type!=="directory"&&v.type==="directory"?1:r.name.localeCompare(v.name)),n.innerHTML=W(o)}});function a(){const i=document.getElementById("file-content"),n=document.querySelector(".file-toolbar");if(i){let o=q().children||[];o=[...o].sort((r,v)=>r.type==="directory"&&v.type!=="directory"?-1:r.type!=="directory"&&v.type==="directory"?1:r.name.localeCompare(v.name)),i.innerHTML=W(o)}if(n){const c=n.querySelector(".file-breadcrumbs");c&&(c.outerHTML=ve())}}}const me="nexus_docs",ue="nexus_changelog",fe="nexus_comments";function T(){try{const t=JSON.parse(localStorage.getItem(me)||"null");if(t&&t.length>0)return t}catch{}const e=xt();return E(e),e}function E(e){localStorage.setItem(me,JSON.stringify(e))}function ye(){return T()}function V(e){return T().find(t=>t.id===e)||null}function mt(e){const t=T(),s={id:"doc-"+Date.now(),title:e.title||"Untitled",category:e.category||"General",icon:e.icon||"📄",content:e.content||"",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),author:e.author||"Antigravity",tags:e.tags||[],pinned:e.pinned||!1};return t.unshift(s),E(t),xe({type:"doc-created",title:`Created: ${s.title}`,description:`New documentation page "${s.title}" added to ${s.category}.`,docId:s.id}),s}function ut(e,t){const s=T(),a=s.findIndex(i=>i.id===e);a>=0&&(s[a]={...s[a],...t,updatedAt:new Date().toISOString()},E(s))}function ft(e){const t=T().filter(s=>s.id!==e);E(t)}function he(){try{const t=JSON.parse(localStorage.getItem(ue)||"null");if(t&&t.length>0)return t}catch{}const e=$t();return be(e),e}function be(e){localStorage.setItem(ue,JSON.stringify(e))}function yt(){return he()}function xe(e){const t=he(),s={id:"cl-"+Date.now(),type:e.type||"update",title:e.title,description:e.description||"",timestamp:new Date().toISOString(),author:e.author||"Antigravity",icon:ht(e.type),color:bt(e.type),docId:e.docId||null,tags:e.tags||[]};return t.unshift(s),be(t),s}function ht(e){return{feature:"🚀",bugfix:"🐛",design:"🎨",refactor:"♻️","doc-created":"📝","doc-updated":"✏️",prompt:"💬",walkthrough:"🗺️",planning:"📋",deployment:"🌐",update:"🔄",milestone:"🏆",feedback:"📣"}[e]||"🔄"}function bt(e){return{feature:"#00f0ff",bugfix:"#ff5252",design:"#e040fb",refactor:"#69f0ae","doc-created":"#b388ff","doc-updated":"#448aff",prompt:"#ffab40",walkthrough:"#00f0ff",planning:"#e040fb",deployment:"#69f0ae",update:"#448aff",milestone:"#ffab40",feedback:"#b388ff"}[e]||"#448aff"}function L(){try{return JSON.parse(localStorage.getItem(fe)||"[]")}catch{return[]}}function J(e){localStorage.setItem(fe,JSON.stringify(e))}function _(e){return L().filter(t=>t.targetId===e)}function $e(e){const t=L(),s={id:"cmt-"+Date.now(),targetId:e.targetId,targetType:e.targetType,targetLabel:e.targetLabel||"",text:e.text,author:e.author||"Justin",authorAvatar:e.authorAvatar||"JM",createdAt:new Date().toISOString(),resolved:!1};return t.unshift(s),J(t),s}function we(e){const t=L(),s=t.find(a=>a.id===e);s&&(s.resolved=!0,J(t))}function ke(e){J(L().filter(t=>t.id!==e))}function xt(){return[{id:"doc-seed-1",title:"Mission Control Center — Architecture",category:"Architecture",icon:"🏗️",pinned:!0,createdAt:"2026-02-28T13:00:00Z",updatedAt:"2026-02-28T18:15:00Z",author:"Antigravity",tags:["architecture","overview"],content:`
        <h2>System Architecture</h2>
        <p>The Nexus Command Center is a <strong>Vite vanilla JS SPA</strong> with hash-based routing, designed as a comprehensive workspace management platform.</p>

        <h3>Tech Stack</h3>
        <ul>
          <li><strong>Build:</strong> Vite 6.x — instant HMR, ES modules</li>
          <li><strong>Language:</strong> Vanilla JavaScript (ES modules)</li>
          <li><strong>Styling:</strong> Vanilla CSS with design tokens</li>
          <li><strong>Fonts:</strong> Inter + JetBrains Mono via Google Fonts</li>
          <li><strong>State:</strong> In-memory JS objects + localStorage persistence</li>
          <li><strong>Routing:</strong> Custom hash-based router (<code>router.js</code>)</li>
        </ul>

        <h3>Directory Structure</h3>
        <pre><code>src/
├── main.js              # App bootstrap, sidebar, routing
├── router.js            # Hash-based SPA router
├── state.js             # Global data store (agents, tasks, humans, teams, etc.)
├── components/
│   └── chat-system.js   # Floating chat bubbles
├── services/
│   ├── feedback-store.js  # localStorage feedback persistence
│   └── docs-store.js      # Documentation & changelog persistence
├── views/
│   ├── mission-control.js # Interactive overview + feedback hub
│   ├── agent-fleet.js     # AI agent management
│   ├── task-ops.js        # Kanban + timeline task views
│   ├── people.js          # Human + AI roster
│   ├── teams.js           # Team composition
│   ├── file-manager.js    # CMS file browser
│   ├── docs.js            # Documentation center
│   ├── changelog.js       # Change log viewer
│   ├── skill-forge.js     # Skill management
│   ├── project-hub.js     # Project overview
│   ├── migration.js       # Content migration console
│   └── demo-gallery.js    # Demo showcase
└── styles/
    ├── index.css          # Design tokens & resets
    ├── layout.css         # Shell layout
    ├── cards.css          # Card components
    ├── views.css          # View-specific styles
    ├── animations.css     # Animations & transitions
    ├── chat-bubbles.css   # Chat system styles
    ├── file-manager.css   # File browser styles
    └── docs.css           # Documentation styles</code></pre>

        <h3>Design System</h3>
        <p>Dark glassmorphism theme with neon accent colors. Key tokens:</p>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px;">
          <div style="background:#00f0ff;color:#0a0e1a;padding:8px;border-radius:8px;text-align:center;font-size:11px;font-weight:700;">Cyan</div>
          <div style="background:#e040fb;color:#0a0e1a;padding:8px;border-radius:8px;text-align:center;font-size:11px;font-weight:700;">Magenta</div>
          <div style="background:#69f0ae;color:#0a0e1a;padding:8px;border-radius:8px;text-align:center;font-size:11px;font-weight:700;">Green</div>
          <div style="background:#ffab40;color:#0a0e1a;padding:8px;border-radius:8px;text-align:center;font-size:11px;font-weight:700;">Amber</div>
        </div>
      `},{id:"doc-seed-2",title:"Major Feature Build — Chat, People, Teams, CMS",category:"Walkthroughs",icon:"🗺️",pinned:!0,createdAt:"2026-02-28T13:25:00Z",updatedAt:"2026-02-28T13:55:00Z",author:"Antigravity",tags:["walkthrough","phase-1","phase-2","phase-3","phase-4"],content:`
        <h2>Feature Build Summary</h2>
        <p>Six major phases implemented in a single session:</p>

        <h3>🗨️ Phase 1: Chat Bubble System</h3>
        <p>Facebook-style bottom-right tray with expandable panels. Android-style draggable floating bubbles. Persists across route navigation. Unread badges with pulse animations.</p>
        <p><strong>Files:</strong> <code>chat-system.js</code>, <code>chat-bubbles.css</code></p>

        <h3>👥 Phase 2: People & Team Management</h3>
        <p>Combined human + AI roster with filter tabs. Team cards with mixed member lists. Many-to-many relationships: humans/agents → teams → projects.</p>
        <p><strong>Files:</strong> <code>people.js</code>, <code>teams.js</code></p>

        <h3>🎯 Phase 3: Interactive Overview & Feedback</h3>
        <p>Mission Control rewritten with action items (inline response forms), a persistent feedback queue (localStorage), and auto-queuing for Antigravity.</p>
        <p><strong>Files:</strong> <code>mission-control.js</code>, <code>feedback-store.js</code></p>

        <h3>📂 Phase 4: File/Folder Management CMS</h3>
        <p>Tree sidebar, breadcrumbs, grid/list toggle, search, file type icons with color coding.</p>
        <p><strong>Files:</strong> <code>file-manager.js</code>, <code>file-manager.css</code></p>

        <h3>🔧 Phase 5: Task Delegation</h3>
        <p>Workflow file for Claude Code delegation created at <code>.agents/workflows/delegate-to-claude-code.md</code>.</p>

        <h3>✅ Phase 6: Integration & Verification</h3>
        <p>All routes wired, breadcrumbs updated, browser-verified with zero errors.</p>
      `},{id:"doc-seed-3",title:"Getting Started — Navigation Guide",category:"Guides",icon:"🧭",pinned:!1,createdAt:"2026-02-28T14:00:00Z",updatedAt:"2026-02-28T14:00:00Z",author:"Antigravity",tags:["guide","onboarding"],content:`
        <h2>Navigating Mission Control</h2>
        <p>The sidebar organizes all sections into logical groups:</p>

        <table>
          <thead><tr><th>Section</th><th>Pages</th><th>Purpose</th></tr></thead>
          <tbody>
            <tr><td><strong>Command</strong></td><td>Mission Control, Agent Fleet, Task Ops</td><td>Core operational views</td></tr>
            <tr><td><strong>Manage</strong></td><td>People, Teams</td><td>Human + AI member management</td></tr>
            <tr><td><strong>Build</strong></td><td>Skill Forge, Project Hub</td><td>Dev tools and project tracking</td></tr>
            <tr><td><strong>CMS</strong></td><td>File Manager</td><td>File/folder browsing</td></tr>
            <tr><td><strong>Docs</strong></td><td>Documentation, Changelog</td><td>Knowledge base & history</td></tr>
            <tr><td><strong>Migrate</strong></td><td>Migration, Demos</td><td>Content import & showcase</td></tr>
          </tbody>
        </table>

        <h3>Key Features</h3>
        <ul>
          <li><strong>Chat Bubbles:</strong> Click any chip in the bottom-right tray to open a chat. Click ⊙ to detach as a draggable bubble.</li>
          <li><strong>Feedback System:</strong> Submit feedback from Mission Control — it auto-queues for Antigravity.</li>
          <li><strong>Comments:</strong> Leave contextual comments on any doc page or changelog entry.</li>
          <li><strong>Search:</strong> Use the global search bar in the topbar.</li>
        </ul>
      `}]}function $t(){return[{id:"cl-seed-1",type:"milestone",title:"🏆 Mission Control Center v2.0 — Major Feature Build",description:"Implemented 6 major feature phases: Chat Bubbles, People/Teams, Feedback System, File Manager, Task Delegation, and Integration. All views verified in browser with zero errors.",timestamp:"2026-02-28T13:55:00Z",author:"Antigravity",icon:"🏆",color:"#ffab40",tags:["milestone","v2.0"]},{id:"cl-seed-2",type:"feature",title:"Chat Bubble System",description:"Facebook-style bottom-right tray with minimizable chat chips. Expandable panels with message history. Android-style draggable floating bubbles. Unread badges with animations.",timestamp:"2026-02-28T13:30:00Z",author:"Antigravity",icon:"🚀",color:"#00f0ff",tags:["feature","chat","phase-1"]},{id:"cl-seed-3",type:"feature",title:"People & Team Management",description:"Combined human + AI member roster with filter tabs. Team cards with mixed member lists, project assignments, and task metrics. Many-to-many data model.",timestamp:"2026-02-28T13:35:00Z",author:"Antigravity",icon:"🚀",color:"#00f0ff",tags:["feature","people","teams","phase-2"]},{id:"cl-seed-4",type:"feature",title:"Interactive Overview & Feedback System",description:"Mission Control dashboard rewritten with action items, inline response forms, a persistent feedback queue (localStorage), and auto-queuing for Antigravity.",timestamp:"2026-02-28T13:40:00Z",author:"Antigravity",icon:"🚀",color:"#00f0ff",tags:["feature","feedback","phase-3"]},{id:"cl-seed-5",type:"feature",title:"File/Folder Management CMS",description:"Visual file browser with sidebar tree explorer, breadcrumb navigation, grid/list toggle, file search, and color-coded file type icons.",timestamp:"2026-02-28T13:45:00Z",author:"Antigravity",icon:"🚀",color:"#00f0ff",tags:["feature","cms","phase-4"]},{id:"cl-seed-6",type:"doc-created",title:"Claude Code Workflow Created",description:"Task delegation workflow file for Claude Code via VS Code extension added at .agents/workflows/delegate-to-claude-code.md.",timestamp:"2026-02-28T13:50:00Z",author:"Antigravity",icon:"📝",color:"#b388ff",tags:["workflow","claude-code","phase-5"]},{id:"cl-seed-7",type:"feature",title:"Documentation & Changelog System",description:"Full documentation center with rich HTML pages, contextual commenting, and automatic changelog capture for all prompts and walkthroughs.",timestamp:"2026-02-28T13:55:00Z",author:"Antigravity",icon:"🚀",color:"#00f0ff",tags:["feature","docs","changelog"]}]}let g=null,Ce="all";function Se(e){return{Architecture:"#00f0ff",Walkthroughs:"#e040fb",Guides:"#69f0ae",Prompts:"#ffab40",API:"#448aff",General:"#b388ff"}[e]||"#5a6478"}function wt(e){return{Architecture:"🏗️",Walkthroughs:"🗺️",Guides:"🧭",Prompts:"💬",API:"🔌",General:"📄"}[e]||"📄"}function kt(e){const t=[...new Set(e.map(i=>i.category))],s=e.filter(i=>i.pinned),a=Ce;return`
    <div class="docs-sidebar">
      <div class="docs-sidebar-header">
        <div style="font-size:var(--text-xs);font-weight:700;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.05em;">Documentation</div>
        <button class="btn btn-primary" style="font-size:10px;padding:4px 10px;" data-action="new-doc">+ New</button>
      </div>

      <!-- Search -->
      <div style="padding:0 var(--space-sm) var(--space-sm);">
        <input type="text" id="doc-search" placeholder="Search docs..."
          style="width:100%;padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:var(--radius-sm);color:var(--text-primary);font-size:12px;font-family:var(--font-sans);outline:none;" />
      </div>

      <!-- Category Filters -->
      <div style="padding:0 var(--space-sm) var(--space-sm);display:flex;flex-wrap:wrap;gap:4px;">
        <button class="docs-cat-btn ${a==="all"?"active":""}" data-action="filter-cat" data-cat="all">All</button>
        ${t.map(i=>`
          <button class="docs-cat-btn ${a===i?"active":""}" data-action="filter-cat" data-cat="${i}">${wt(i)} ${i}</button>
        `).join("")}
      </div>

      <!-- Pinned -->
      ${s.length>0?`
        <div class="docs-sidebar-section">
          <div class="docs-sidebar-section-title">📌 Pinned</div>
          ${s.map(i=>H(i)).join("")}
        </div>
      `:""}

      <!-- All Docs -->
      <div class="docs-sidebar-section" id="docs-list">
        <div class="docs-sidebar-section-title">All Pages</div>
        ${(a==="all"?e:e.filter(i=>i.category===a)).map(i=>H(i)).join("")}
      </div>
    </div>
  `}function H(e){const t=g===e.id,s=_(e.id).length;return`
    <div class="docs-list-item ${t?"active":""}" data-action="open-doc" data-id="${e.id}">
      <span class="docs-list-icon">${e.icon}</span>
      <div class="docs-list-info">
        <div class="docs-list-title">${e.title}</div>
        <div class="docs-list-meta">
          <span style="color:${Se(e.category)};">${e.category}</span>
          ${s>0?`<span>💬 ${s}</span>`:""}
        </div>
      </div>
      ${e.pinned?'<span style="font-size:10px;">📌</span>':""}
    </div>
  `}function je(e){if(!e)return`
      <div class="docs-empty">
        <div style="font-size:48px;margin-bottom:var(--space-md);">📚</div>
        <h3 style="color:var(--text-primary);margin-bottom:var(--space-xs);">Welcome to Documentation</h3>
        <p style="color:var(--text-tertiary);font-size:var(--text-sm);max-width:400px;">Select a page from the sidebar, or create a new one. Every prompt, walkthrough, and decision is automatically captured here.</p>
      </div>
    `;const t=_(e.id),s=t.filter(i=>!i.resolved),a=t.filter(i=>i.resolved);return`
    <div class="docs-viewer" id="docs-viewer">
      <!-- Doc Header -->
      <div class="docs-header">
        <div style="display:flex;align-items:center;gap:var(--space-sm);">
          <span style="font-size:28px;">${e.icon}</span>
          <div>
            <h1 class="docs-title">${e.title}</h1>
            <div class="docs-meta">
              <span class="docs-tag" style="--tag-color:${Se(e.category)};">${e.category}</span>
              ${e.tags.map(i=>`<span class="docs-tag-plain">${i}</span>`).join("")}
              <span class="docs-meta-sep">·</span>
              <span>by ${e.author}</span>
              <span class="docs-meta-sep">·</span>
              <span>Updated ${new Date(e.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div style="display:flex;gap:var(--space-xs);">
          <button class="btn btn-ghost" data-action="pin-doc" data-id="${e.id}" style="font-size:11px;">${e.pinned?"📌 Unpin":"📌 Pin"}</button>
          <button class="btn btn-ghost" data-action="delete-doc" data-id="${e.id}" style="font-size:11px;color:var(--accent-red);">🗑 Delete</button>
        </div>
      </div>

      <!-- Doc Body (Rich HTML) -->
      <div class="docs-body">
        ${e.content}
      </div>

      <!-- Comment Section -->
      <div class="docs-comments-section">
        <div class="docs-comments-header">
          <h3>💬 Comments <span class="docs-comment-count">${s.length}</span></h3>
        </div>

        <!-- Comment Input -->
        <div class="docs-comment-form">
          <div class="docs-comment-avatar">JM</div>
          <div style="flex:1;">
            <textarea id="doc-comment-input" rows="2" placeholder="Leave a comment on this page..." class="docs-comment-textarea"></textarea>
            <div style="display:flex;justify-content:flex-end;margin-top:var(--space-xs);">
              <button class="btn btn-primary" data-action="post-comment" data-id="${e.id}" style="font-size:11px;padding:5px 14px;">Post Comment</button>
            </div>
          </div>
        </div>

        <!-- Open Comments -->
        ${s.length>0?`
          <div class="docs-comment-list">
            ${s.map(i=>ae(i)).join("")}
          </div>
        `:`
          <div style="text-align:center;padding:var(--space-lg);color:var(--text-tertiary);font-size:var(--text-xs);">No comments yet. Be the first to add context.</div>
        `}

        <!-- Resolved Comments -->
        ${a.length>0?`
          <details style="margin-top:var(--space-sm);">
            <summary style="font-size:var(--text-xs);color:var(--text-tertiary);cursor:pointer;padding:var(--space-xs);">
              ${a.length} resolved comment${a.length>1?"s":""}
            </summary>
            <div class="docs-comment-list" style="opacity:0.6;">
              ${a.map(i=>ae(i,!0)).join("")}
            </div>
          </details>
        `:""}
      </div>
    </div>
  `}function ae(e,t=!1){return`
    <div class="docs-comment ${t?"resolved":""}">
      <div class="docs-comment-avatar" style="background:var(--accent-cyan-dim);color:var(--accent-cyan);">${e.authorAvatar}</div>
      <div class="docs-comment-body">
        <div class="docs-comment-header">
          <span class="docs-comment-author">${e.author}</span>
          <span class="docs-comment-time">${Ct(e.createdAt)}</span>
        </div>
        <div class="docs-comment-text">${e.text}</div>
        <div class="docs-comment-actions">
          ${t?"":`<button data-action="resolve-comment" data-cid="${e.id}" class="docs-comment-action-btn">✓ Resolve</button>`}
          <button data-action="delete-comment" data-cid="${e.id}" class="docs-comment-action-btn" style="color:var(--accent-red);">Delete</button>
        </div>
      </div>
    </div>
  `}function Ct(e){const t=new Date,s=new Date(e),a=Math.floor((t-s)/1e3);return a<60?"just now":a<3600?`${Math.floor(a/60)}m ago`:a<86400?`${Math.floor(a/3600)}h ago`:`${Math.floor(a/86400)}d ago`}function Ae(){const e=ye(),t=g?V(g):null;return`
    <div class="view-header">
      <div class="view-header-left">
        <h1 class="view-title">Documentation</h1>
        <p class="view-subtitle">${e.length} pages — knowledge base, walkthroughs, and prompts</p>
      </div>
    </div>

    <div class="docs-layout">
      ${kt(e)}
      <div class="docs-main" id="docs-main">
        ${je(t)}
      </div>
    </div>
  `}function ze(){const e=document.getElementById("main-content");if(!e)return;e.addEventListener("click",s=>{const a=s.target.closest("[data-action]");if(a)switch(a.dataset.action){case"open-doc":g=a.dataset.id,j();break;case"filter-cat":Ce=a.dataset.cat,j();break;case"new-doc":g=mt({title:"New Page",category:"General",content:"<p>Start writing here...</p>"}).id,j();break;case"pin-doc":{const n=V(a.dataset.id);n&&ut(a.dataset.id,{pinned:!n.pinned}),j();break}case"delete-doc":ft(a.dataset.id),g===a.dataset.id&&(g=null),j();break;case"post-comment":{const n=document.getElementById("doc-comment-input");n&&n.value.trim()&&($e({targetId:a.dataset.id,targetType:"doc",text:n.value.trim()}),G());break}case"resolve-comment":we(a.dataset.cid),G();break;case"delete-comment":ke(a.dataset.cid),G();break}});const t=document.getElementById("doc-search");t&&t.addEventListener("input",s=>{const a=s.target.value.toLowerCase(),i=ye(),n=a?i.filter(o=>o.title.toLowerCase().includes(a)||o.category.toLowerCase().includes(a)||o.tags.some(r=>r.toLowerCase().includes(a))):i,c=document.getElementById("docs-list");c&&(c.innerHTML=`<div class="docs-sidebar-section-title">Results (${n.length})</div>`+n.map(o=>H(o)).join(""))})}function j(){const e=document.getElementById("main-content");e&&(e.innerHTML=Ae(),ze())}function G(){const e=document.getElementById("docs-main");if(e){const t=g?V(g):null;e.innerHTML=je(t)}}let A="all",K=null;function St(e){const t=_(e.id),s=K===e.id,a=new Date(e.timestamp),i=a.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),n=a.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});return`
    <div class="changelog-entry" data-action="toggle-entry" data-id="${e.id}">
      <div class="changelog-timeline">
        <div class="changelog-dot" style="background:${e.color};box-shadow:0 0 8px ${e.color}40;"></div>
        <div class="changelog-line"></div>
      </div>
      <div class="changelog-card ${s?"expanded":""}">
        <div class="changelog-card-header">
          <div style="display:flex;align-items:center;gap:var(--space-sm);flex:1;min-width:0;">
            <span class="changelog-icon" style="background:${e.color}15;color:${e.color};">${e.icon}</span>
            <div style="flex:1;min-width:0;">
              <div class="changelog-entry-title">${e.title}</div>
              <div class="changelog-entry-meta">
                <span class="changelog-type-badge" style="--type-color:${e.color};">${e.type}</span>
                <span>by ${e.author}</span>
                <span class="docs-meta-sep">·</span>
                <span>${i} at ${n}</span>
                ${t.length>0?`<span class="docs-meta-sep">·</span><span>💬 ${t.length}</span>`:""}
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:var(--space-xs);">
            ${e.tags.map(c=>`<span class="changelog-tag">${c}</span>`).join("")}
            <span class="changelog-expand-icon">${s?"▾":"▸"}</span>
          </div>
        </div>

        ${e.description?`
          <div class="changelog-description">${e.description}</div>
        `:""}

        ${s?`
          <!-- Comment Section -->
          <div class="changelog-comments">
            <div class="docs-comment-form" style="border-top:1px solid var(--border-subtle);padding-top:var(--space-sm);margin-top:var(--space-sm);">
              <div class="docs-comment-avatar" style="width:28px;height:28px;font-size:10px;">JM</div>
              <div style="flex:1;display:flex;gap:var(--space-xs);">
                <input type="text" class="changelog-comment-input" data-id="${e.id}" placeholder="Add a comment..."
                  style="flex:1;padding:6px 10px;background:var(--bg-primary);border:1px solid var(--border-subtle);border-radius:var(--radius-full);color:var(--text-primary);font-size:12px;font-family:var(--font-sans);outline:none;" />
                <button class="btn btn-primary" data-action="post-cl-comment" data-id="${e.id}" style="font-size:10px;padding:4px 10px;">Post</button>
              </div>
            </div>
            ${t.length>0?`
              <div style="display:flex;flex-direction:column;gap:var(--space-xs);margin-top:var(--space-sm);">
                ${t.map(c=>`
                  <div class="docs-comment" style="padding:6px 8px;">
                    <div class="docs-comment-avatar" style="width:24px;height:24px;font-size:9px;background:var(--accent-cyan-dim);color:var(--accent-cyan);">${c.authorAvatar}</div>
                    <div class="docs-comment-body" style="font-size:11px;">
                      <div style="display:flex;align-items:center;gap:var(--space-xs);">
                        <span style="font-weight:600;color:var(--text-primary);">${c.author}</span>
                        <span style="color:var(--text-tertiary);font-size:10px;">${jt(c.createdAt)}</span>
                      </div>
                      <div style="color:var(--text-secondary);margin-top:2px;">${c.text}</div>
                      <div style="display:flex;gap:var(--space-sm);margin-top:4px;">
                        ${c.resolved?'<span style="font-size:10px;color:var(--accent-green);">✓ Resolved</span>':`<button data-action="resolve-cl-comment" data-cid="${c.id}" style="font-size:10px;color:var(--accent-green);background:none;border:none;cursor:pointer;">✓ Resolve</button>`}
                        <button data-action="delete-cl-comment" data-cid="${c.id}" style="font-size:10px;color:var(--accent-red);background:none;border:none;cursor:pointer;">Delete</button>
                      </div>
                    </div>
                  </div>
                `).join("")}
              </div>
            `:""}
          </div>
        `:""}
      </div>
    </div>
  `}function jt(e){const t=new Date,s=new Date(e),a=Math.floor((t-s)/1e3);return a<60?"just now":a<3600?`${Math.floor(a/60)}m ago`:a<86400?`${Math.floor(a/3600)}h ago`:`${Math.floor(a/86400)}d ago`}function Te(){const e=yt(),t=[...new Set(e.map(i=>i.type))],s=A==="all"?e:e.filter(i=>i.type===A),a={};return s.forEach(i=>{const n=new Date(i.timestamp).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});a[n]||(a[n]=[]),a[n].push(i)}),`
    <div class="view-header">
      <div class="view-header-left">
        <h1 class="view-title">Changelog</h1>
        <p class="view-subtitle">${e.length} entries — every change, prompt, and decision tracked</p>
      </div>
      <div class="view-actions">
        <button class="btn btn-primary" data-action="add-entry" id="btn-add-changelog">+ Add Entry</button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="task-controls" style="margin-bottom:var(--space-lg);">
      <div class="view-toggle" id="cl-type-filter">
        <button class="view-toggle-btn ${A==="all"?"active":""}" data-type="all">All (${e.length})</button>
        ${t.map(i=>`
          <button class="view-toggle-btn ${A===i?"active":""}" data-type="${i}">
            ${At(i)} ${i} (${e.filter(n=>n.type===i).length})
          </button>
        `).join("")}
      </div>
    </div>

    <!-- Timeline -->
    <div class="changelog-timeline-container">
      ${Object.entries(a).map(([i,n])=>`
        <div class="changelog-date-group">
          <div class="changelog-date-label">${i}</div>
          ${n.map(St).join("")}
        </div>
      `).join("")}
    </div>
  `}function At(e){return{feature:"🚀",bugfix:"🐛",design:"🎨",refactor:"♻️","doc-created":"📝","doc-updated":"✏️",prompt:"💬",walkthrough:"🗺️",planning:"📋",deployment:"🌐",update:"🔄",milestone:"🏆",feedback:"📣"}[e]||"🔄"}function Ie(){const e=document.getElementById("main-content");if(!e)return;e.addEventListener("click",s=>{const a=s.target.closest("[data-action]");if(a)switch(a.dataset.action){case"toggle-entry":K=K===a.dataset.id?null:a.dataset.id,y();break;case"add-entry":{xe({type:"update",title:"Manual Entry",description:"New changelog entry added.",author:"Justin"}),y();break}case"post-cl-comment":{const i=e.querySelector(`.changelog-comment-input[data-id="${a.dataset.id}"]`);i&&i.value.trim()&&($e({targetId:a.dataset.id,targetType:"changelog",text:i.value.trim()}),y());break}case"resolve-cl-comment":we(a.dataset.cid),y();break;case"delete-cl-comment":ke(a.dataset.cid),y();break}});const t=document.getElementById("cl-type-filter");t&&t.addEventListener("click",s=>{const a=s.target.closest(".view-toggle-btn");a&&(A=a.dataset.type,y())})}function y(){const e=document.getElementById("main-content");e&&(e.innerHTML=Te(),Ie())}let d={openChats:[],dragState:null,trayVisible:!0};function Q(e){return e.contactType==="agent"?l.find(t=>t.id===e.contactId)||{name:"?",avatar:"❓",color:"#5a6478"}:w.find(t=>t.id===e.contactId)||{name:"?",avatar:"??",color:"#5a6478"}}function Z(e,t){return t.contactType==="agent"?e.image?`<img src="${e.image}" alt="${e.name}" class="chat-avatar-img" />`:`<span class="chat-avatar-emoji">${e.avatar}</span>`:`<span class="chat-avatar-initials" style="background: ${e.color}30; color: ${e.color};">${e.avatar}</span>`}function zt(){return C.reduce((e,t)=>e+t.unread,0)}function Tt(){const e=zt(),t=d.openChats.map(s=>s.id);return`
    <div class="chat-tray" id="chat-tray">
      <!-- Chat chips for each conversation -->
      ${C.map(s=>{const a=Q(s);return`
          <div class="chat-chip ${t.includes(s.id)?"chat-chip-active":""} ${s.unread>0?"has-unread":""}"
               data-conv="${s.id}"
               data-action="toggle-chat"
               style="--chip-color: ${a.color};">
            <div class="chat-chip-avatar">
              ${Z(a,s)}
              <span class="chat-chip-status ${a.status==="active"?"online":a.status==="idle"?"idle":"offline"}"></span>
            </div>
            <span class="chat-chip-name">${a.name}</span>
            ${s.unread>0?`<span class="chat-chip-badge">${s.unread}</span>`:""}
          </div>
        `}).join("")}

      <!-- Toggle tray button -->
      <button class="chat-tray-toggle" data-action="toggle-tray" title="Chat">
        💬
        ${e>0?`<span class="chat-tray-badge">${e}</span>`:""}
      </button>
    </div>
  `}function It(e){const t=C.find(a=>a.id===e);if(!t)return"";const s=Q(t);return`
    <div class="chat-panel" id="chat-panel-${e}" data-conv="${e}">
      <div class="chat-panel-header" data-action="drag-panel" data-conv="${e}">
        <div class="chat-panel-header-left">
          <div class="chat-panel-avatar" style="--chip-color: ${s.color};">
            ${Z(s,t)}
          </div>
          <div class="chat-panel-info">
            <span class="chat-panel-name">${s.name}</span>
            <span class="chat-panel-role">${s.role}</span>
          </div>
        </div>
        <div class="chat-panel-actions">
          <button class="chat-panel-btn" data-action="bubble-chat" data-conv="${e}" title="Detach as bubble">⊙</button>
          <button class="chat-panel-btn" data-action="minimize-chat" data-conv="${e}" title="Minimize">─</button>
          <button class="chat-panel-btn" data-action="close-chat" data-conv="${e}" title="Close">✕</button>
        </div>
      </div>
      <div class="chat-panel-messages" id="chat-messages-${e}">
        ${t.messages.map(a=>`
            <div class="chat-msg ${a.from==="human-1"?"chat-msg-me":"chat-msg-them"}">
              <div class="chat-msg-bubble">${a.text}</div>
              <div class="chat-msg-time">${a.time}</div>
            </div>
          `).join("")}
      </div>
      <div class="chat-panel-input">
        <input type="text" class="chat-input" placeholder="Type a message..." data-conv="${e}" id="chat-input-${e}" />
        <button class="chat-send-btn" data-action="send-msg" data-conv="${e}">↑</button>
      </div>
    </div>
  `}function Mt(e){var c,o;const t=C.find(r=>r.id===e);if(!t)return"";const s=Q(t),a=d.openChats.find(r=>r.id===e),i=((c=a==null?void 0:a.position)==null?void 0:c.x)??window.innerWidth-80,n=((o=a==null?void 0:a.position)==null?void 0:o.y)??100;return`
    <div class="chat-bubble-float" id="chat-bubble-${e}"
         data-conv="${e}"
         style="left: ${i}px; top: ${n}px; --chip-color: ${s.color};"
         data-action="bubble-click">
      <div class="chat-bubble-avatar">
        ${Z(s,t)}
      </div>
      ${t.unread>0?`<span class="chat-bubble-badge">${t.unread}</span>`:""}
      <span class="chat-bubble-name">${s.name}</span>
    </div>
  `}function S(){const e=document.getElementById("chat-system-container");if(!e)return;const t=d.openChats.filter(a=>a.mode==="panel"),s=d.openChats.filter(a=>a.mode==="bubble");e.innerHTML=`
    ${Tt()}
    <div class="chat-panels-container" id="chat-panels">
      ${t.map(a=>It(a.id)).join("")}
    </div>
    <div class="chat-bubbles-container" id="chat-bubbles">
      ${s.map(a=>Mt(a.id)).join("")}
    </div>
  `,t.forEach(a=>{const i=document.getElementById(`chat-messages-${a.id}`);i&&(i.scrollTop=i.scrollHeight)})}function se(e){const t=d.openChats.find(a=>a.id===e);t?t.mode==="panel"?d.openChats=d.openChats.filter(a=>a.id!==e):t.mode="panel":d.openChats.push({id:e,mode:"panel",position:null,groupId:null});const s=C.find(a=>a.id===e);s&&(s.unread=0),S()}function Pt(e){d.openChats=d.openChats.filter(t=>t.id!==e),S()}function Dt(e){d.openChats=d.openChats.filter(t=>t.id!==e),S()}function Bt(e){const t=d.openChats.find(s=>s.id===e);t&&(t.mode="bubble",t.position={x:window.innerWidth-80,y:100+d.openChats.filter(s=>s.mode==="bubble").indexOf(t)*70}),S()}function Me(e){const t=document.getElementById(`chat-input-${e}`);if(!t||!t.value.trim())return;const s=C.find(a=>a.id===e);if(s){const i=new Date().toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});s.messages.push({from:"human-1",text:t.value.trim(),time:i})}S()}function Et(e,t){const s=document.getElementById(`chat-bubble-${e}`);if(!s)return;const a=s.getBoundingClientRect();d.dragState={chatId:e,offsetX:t.clientX-a.left,offsetY:t.clientY-a.top},s.classList.add("dragging");function i(c){if(!d.dragState)return;const o=d.openChats.find(r=>r.id===d.dragState.chatId);o&&(o.position={x:c.clientX-d.dragState.offsetX,y:c.clientY-d.dragState.offsetY}),s.style.left=`${c.clientX-d.dragState.offsetX}px`,s.style.top=`${c.clientY-d.dragState.offsetY}px`}function n(){s&&s.classList.remove("dragging"),d.dragState=null,document.removeEventListener("mousemove",i),document.removeEventListener("mouseup",n)}document.addEventListener("mousemove",i),document.addEventListener("mouseup",n)}function Lt(e){const t=e.target.closest("[data-action]");if(!t)return;const s=t.dataset.action,a=t.dataset.conv;switch(s){case"toggle-chat":se(a);break;case"minimize-chat":Pt(a);break;case"close-chat":Dt(a);break;case"bubble-chat":Bt(a);break;case"send-msg":Me(a);break;case"toggle-tray":d.trayVisible=!d.trayVisible;const i=document.getElementById("chat-tray");i&&i.classList.toggle("collapsed",!d.trayVisible);break;case"bubble-click":se(a);break}}function Ft(e){e.key==="Enter"&&e.target.classList.contains("chat-input")&&Me(e.target.dataset.conv)}function Ot(e){const t=e.target.closest(".chat-bubble-float");t&&(e.preventDefault(),Et(t.dataset.conv,e))}function Gt(){const e=document.createElement("div");e.id="chat-system-container",document.getElementById("app").appendChild(e),e.addEventListener("click",Lt),e.addEventListener("keydown",Ft),e.addEventListener("mousedown",Ot),S()}const Rt=[{section:"Command"},{path:"/",icon:"🎯",label:"Mission Control",badge:""},{path:"/agents",icon:"🤖",label:"Agent Fleet",badge:"4"},{path:"/tasks",icon:"📋",label:"Task Operations",badge:"5"},{section:"Manage"},{path:"/people",icon:"👥",label:"People",badge:"9"},{path:"/teams",icon:"🏢",label:"Teams",badge:"3"},{section:"Build"},{path:"/skills",icon:"⚡",label:"Skill Forge",badge:"10"},{path:"/projects",icon:"📁",label:"Project Hub",badge:"5"},{section:"CMS"},{path:"/files",icon:"📂",label:"File Manager",badge:""},{section:"Docs"},{path:"/docs",icon:"📚",label:"Documentation",badge:""},{path:"/changelog",icon:"📜",label:"Changelog",badge:""},{section:"Migrate"},{path:"/migration",icon:"📦",label:"Migration",badge:"2"},{path:"/demos",icon:"🎪",label:"Demo Gallery",badge:"8"}];function Nt(){const e=document.getElementById("app");e.innerHTML=`
    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">N</div>
        <span class="sidebar-title">NEXUS</span>
      </div>

      <nav class="sidebar-nav" id="sidebar-nav">
        ${Rt.map(t=>t.section?`<div class="sidebar-section-label">${t.section}</div>`:`
            <div class="nav-item" data-route="${t.path}" id="nav-${t.path.replace("/","")||"home"}">
              <span class="nav-icon">${t.icon}</span>
              <span>${t.label}</span>
              ${t.badge?`<span class="nav-badge">${t.badge}</span>`:""}
            </div>
          `).join("")}
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-avatar">JM</div>
          <div class="sidebar-user-info">
            <span class="sidebar-user-name">Justin</span>
            <span class="sidebar-user-role">Administrator</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Area -->
    <div class="main-wrapper">
      <header class="topbar">
        <div class="topbar-breadcrumb">
          Nexus &nbsp;/&nbsp; <span>Mission Control</span>
        </div>
        <div class="topbar-search">
          <span class="topbar-search-icon">🔍</span>
          <input type="text" placeholder="Search agents, tasks, skills, projects..." id="global-search" />
        </div>
        <div class="topbar-actions">
          <div class="credit-counter" style="display: flex; align-items: center; gap: 6px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: var(--radius-full); padding: 4px 12px; margin-right: var(--space-sm); cursor: pointer;" title="Credit Usage" onclick="window.location.hash='/'">
            <span style="font-size: 12px;">💳</span>
            <span class="mono" style="font-size: 11px; font-weight: 600; color: var(--accent-green);">$${u.remaining.toFixed(0)}</span>
            <span style="font-size: 10px; color: var(--text-tertiary);">left</span>
          </div>
          <button class="topbar-btn" title="Notifications" id="btn-notif">
            🔔
            <span class="notification-dot"></span>
          </button>
          <button class="topbar-btn" title="Settings" id="btn-settings">⚙️</button>
        </div>
      </header>

      <main class="main-content" id="main-content"></main>
    </div>
  `}function qt(){p("/",()=>(window.__afterViewRender=Oe,Fe())),p("/agents",()=>Ge()),p("/tasks",()=>(window.__afterViewRender=We,qe())),p("/skills",()=>Ue()),p("/projects",()=>Qe()),p("/migration",()=>Ye()),p("/demos",()=>(window.__afterViewRender=tt,et())),p("/people",()=>(window.__afterViewRender=ot,nt())),p("/teams",()=>pt()),p("/files",()=>(window.__afterViewRender=gt,vt())),p("/docs",()=>(window.__afterViewRender=ze,Ae())),p("/changelog",()=>(window.__afterViewRender=Ie,Te()))}function Wt(){document.getElementById("sidebar-nav").addEventListener("click",e=>{const t=e.target.closest(".nav-item");t&&Pe(t.dataset.route)})}Nt();qt();Wt();De(document.getElementById("main-content"));Gt();
