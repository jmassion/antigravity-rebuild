import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      projectIds = [],
      mode = "organized",
      includeAssets = true,
      includeStoryboards = true,
      includeDocs = true,
      includeTasks = true,
      includeLinks = true,
      includePlans = true,
      includeProvenance = true,
      includeSubProjects = true,
      tagFilter = null,
    } = await req.json();

    if (!projectIds.length) {
      return new Response(JSON.stringify({ error: "No projects selected" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gather all project IDs (including children if requested)
    let allProjectIds = [...projectIds];
    if (includeSubProjects) {
      const { data: children } = await supabase
        .from("projects")
        .select("id")
        .in("parent_id", projectIds);
      if (children) {
        allProjectIds = [...new Set([...allProjectIds, ...children.map((c: any) => c.id)])];
      }
    }

    // Fetch projects metadata
    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .in("id", allProjectIds);

    const exportData: any = {
      exportedAt: new Date().toISOString(),
      mode,
      projects: projects || [],
      assets: [],
      storyboards: [],
      docs: [],
      tasks: [],
      links: [],
      plans: [],
      provenance_edges: [],
    };

    // Assets
    if (includeAssets) {
      const { data: assetLinks } = await supabase
        .from("asset_projects")
        .select("asset_id, folder_path, assets(id, name, file_type, file_url, thumbnail_url, description, tags, ai_tags, ai_description, file_size)")
        .in("project_id", allProjectIds);

      let assets = (assetLinks || []).map((al: any) => ({
        ...al.assets,
        folder_path: al.folder_path,
        project_asset_link: al.asset_id,
      }));

      if (tagFilter?.length) {
        assets = assets.filter((a: any) => {
          const allTags = [...(a.tags || []), ...(a.ai_tags || [])];
          return tagFilter.some((t: string) => allTags.includes(t));
        });
      }

      exportData.assets = assets;
    }

    // Storyboards + frames
    if (includeStoryboards) {
      const { data: storyboards } = await supabase
        .from("storyboards")
        .select("id, name, description, project_id, tags, content_type, storyboard_frames(id, title, notes, status, sort_order, duration_seconds, asset_id, annotations, audio_url, ai_tags, ai_description)")
        .in("project_id", allProjectIds)
        .order("name");

      exportData.storyboards = storyboards || [];
    }

    // Docs
    if (includeDocs) {
      const { data: docs } = await supabase
        .from("docs")
        .select("id, title, content, category, slug, tags, icon, sort_order")
        .order("sort_order");

      let filteredDocs = docs || [];
      if (tagFilter?.length) {
        filteredDocs = filteredDocs.filter((d: any) =>
          tagFilter.some((t: string) => (d.tags || []).includes(t))
        );
      }
      exportData.docs = filteredDocs;
    }

    // Tasks
    if (includeTasks) {
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id, title, description, status, priority, due_date, project_id, assignee_id, frame_id, asset_id")
        .in("project_id", allProjectIds);

      exportData.tasks = tasks || [];
    }

    // Links
    if (includeLinks) {
      const { data: links } = await supabase
        .from("links")
        .select("id, title, url, description, tool_name, tags, category, project_id")
        .or(`project_id.in.(${allProjectIds.join(",")}),project_id.is.null`);

      exportData.links = links || [];
    }

    // Plans
    if (includePlans) {
      const { data: plans } = await supabase
        .from("plans")
        .select("id, title, brief, goals, deliverables, status, tags, content_type, project_id, created_at, updated_at")
        .or(`project_id.in.(${allProjectIds.join(",")}),project_id.is.null`);

      exportData.plans = plans || [];
    }

    // Provenance edges (prompt metadata / lineage)
    if (includeProvenance) {
      const { data: edges } = await supabase
        .from("provenance_edges")
        .select("id, source_type, source_id, target_type, target_id, relationship, notes, created_at");

      exportData.provenance_edges = edges || [];
    }

    // If organized mode, restructure into folder hierarchy
    if (mode === "organized") {
      const organized: any = {};
      for (const project of exportData.projects) {
        const pKey = project.name.replace(/[^a-zA-Z0-9_ -]/g, "");
        organized[pKey] = {
          _meta: {
            id: project.id,
            name: project.name,
            phase: project.phase,
            description: project.description,
            tags: project.tags,
            content_type: project.content_type,
            created_at: project.created_at,
            updated_at: project.updated_at,
          },
          assets: exportData.assets
            .map((a: any) => ({
              id: a.id,
              name: a.name,
              file_type: a.file_type,
              file_url: a.file_url,
              thumbnail_url: a.thumbnail_url,
              description: a.description,
              tags: a.tags,
              ai_tags: a.ai_tags,
              ai_description: a.ai_description,
              folder_path: a.folder_path,
            })),
          storyboards: exportData.storyboards
            .filter((s: any) => s.project_id === project.id)
            .map((s: any) => ({
              id: s.id,
              name: s.name,
              description: s.description,
              tags: s.tags,
              content_type: s.content_type,
              frames: (s.storyboard_frames || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
            })),
          plans: exportData.plans.filter(
            (p: any) => p.project_id === project.id || p.project_id === null
          ),
          tasks: exportData.tasks.filter((t: any) => t.project_id === project.id),
          links: exportData.links.filter(
            (l: any) => l.project_id === project.id || l.project_id === null
          ),
        };
      }
      organized._docs = exportData.docs;
      organized._provenance = exportData.provenance_edges;
      exportData.organized = organized;
    }

    return new Response(JSON.stringify(exportData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
