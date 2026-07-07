import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAGE_REGISTRY = `
Available pages in Pipeline app:
- /projects – All projects (creative productions). Each has a phase: start, build, grow.
- /tasks – Task board with kanban/list views, priorities, assignees.
- /team – Team members directory.
- /storyboards – Visual storyboard sequences with frames.
- /plans – Production plans with briefs, goals, deliverables.
- /assets – Asset library (images, videos, documents).
- /links – Bookmarked links and tools.
- /start/characters – Character profiles with custom fields, galleries, notes, and status tracking.
- /worlds – World/prop reference sheets.
- /style-guides – Style guide entries (colors, typography, moods).
- /prompts – AI prompt library.
- /campaigns – Marketing campaigns.
- /marketing-assets – Marketing asset management.
- /docs – Documentation wiki.
- /canvas – Infinite canvas workspace.
- /connections – Entity relationship graph.
- /provenance – Asset provenance tracking.
- /settings – App settings.
- /uploads – Upload history.
`;

const SYSTEM_PROMPT = `You are Pipeline AI, an intelligent assistant for a creative production pipeline app. You help users manage their projects, tasks, assets, storyboards, and creative workflows.

${PAGE_REGISTRY}

You can execute actions via tool calls:
- navigate: Send users to any page
- create_character: Create character profiles
- create_project: Create new projects
- create_task: Create tasks
- create_plan: Create production plans
- search: Search across all entities
- list_items: List and filter entities
- summarize_page: Describe what a page does

Guidelines:
- Be concise and action-oriented
- After creating something, suggest logical next steps
- Confirm before destructive actions
- Use the phased workflow: Start (ideation) → Build (production) → Grow (distribution)
- When unsure which page, suggest the most relevant one
- Format responses with markdown for readability
`;

const tools = [
  {
    type: "function",
    function: {
      name: "navigate",
      description: "Navigate the user to a specific page in the app",
      parameters: {
        type: "object",
        properties: {
          path: { type: "string", description: "Route path like /projects, /tasks, /storyboards" },
          reason: { type: "string", description: "Brief explanation shown to user" },
        },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_project",
      description: "Create a new project in the pipeline",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Project name" },
          phase: { type: "string", enum: ["start", "build", "grow"], description: "Project phase" },
          description: { type: "string", description: "Project description" },
          tags: { type: "array", items: { type: "string" }, description: "Tags for the project" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a new task",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Task title" },
          priority: { type: "string", enum: ["low", "medium", "high"], description: "Priority level" },
          description: { type: "string", description: "Task description" },
          status: { type: "string", enum: ["todo", "in_progress", "review", "done"], description: "Task status" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_plan",
      description: "Create a new production plan",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Plan title" },
          brief: { type: "string", description: "Plan brief/description" },
          goals: { type: "array", items: { type: "string" }, description: "Plan goals" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search",
      description: "Search across all entities in the app (projects, tasks, assets, etc.)",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          type: { type: "string", enum: ["all", "projects", "tasks", "assets", "plans", "storyboards"], description: "Entity type to search" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_items",
      description: "List entities with optional filters",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["projects", "tasks", "assets", "plans", "storyboards", "team_members"], description: "Entity type" },
          limit: { type: "number", description: "Max items to return" },
          filter: { type: "object", description: "Key-value filters like {status: 'todo', phase: 'build'}" },
        },
        required: ["type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "summarize_page",
      description: "Describe what a specific page in the app does and what the user can do there",
      parameters: {
        type: "object",
        properties: {
          page: { type: "string", description: "Page path like /projects or /storyboards" },
        },
        required: ["page"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_character",
      description: "Create a new character profile",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Character name" },
          role: { type: "string", description: "Role or archetype (e.g. protagonist, mentor)" },
          description: { type: "string", description: "Character description" },
          status: { type: "string", enum: ["concept", "in_progress", "approved", "archived"], description: "Character status" },
          tags: { type: "array", items: { type: "string" }, description: "Tags" },
        },
        required: ["name"],
      },
    },
  },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, currentPage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const contextNote = currentPage ? `\nThe user is currently on page: ${currentPage}` : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + contextNote },
          ...messages,
        ],
        tools,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
