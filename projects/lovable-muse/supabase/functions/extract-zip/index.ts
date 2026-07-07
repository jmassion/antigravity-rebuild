import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const userId = claimsData.claims.sub as string;

    // Fetch display name for uploaded_by tag
    const adminClient = createClient(supabaseUrl, serviceKey);
    let displayName = userId;
    try {
      const { data: profile } = await adminClient.from('profiles').select('display_name').eq('user_id', userId).single();
      if (profile?.display_name) displayName = profile.display_name;
    } catch { /* fallback */ }
    const uploadedByTag = `uploaded_by:${displayName}`;

    const { storagePath, projectId, fileName } = await req.json();
    if (!storagePath) throw new Error("storagePath is required");

    // Use service role to download the ZIP

    const { data: zipData, error: dlError } = await adminClient.storage
      .from("assets")
      .download(storagePath);

    if (dlError || !zipData) throw new Error("Failed to download ZIP: " + dlError?.message);

    const zip = await JSZip.loadAsync(await zipData.arrayBuffer());
    const entries = Object.entries(zip.files).filter(([, f]) => !f.dir);

    // Limit to 100 files for safety
    const toExtract = entries.slice(0, 100);
    let extractedCount = 0;

    for (const [path, file] of toExtract) {
      try {
        const content = await file.async("uint8array");
        const name = path.split("/").pop() || path;
        if (name.startsWith(".") || name.startsWith("__MACOSX")) continue;

        const ext = name.split(".").pop() || "bin";
        const uploadPath = `${userId}/${crypto.randomUUID()}.${ext}`;

        const { error: upErr } = await adminClient.storage
          .from("assets")
          .upload(uploadPath, content, { upsert: false, contentType: getMimeType(ext) });

        if (upErr) { console.error("Upload error for", name, upErr); continue; }

        const { data: { publicUrl } } = adminClient.storage.from("assets").getPublicUrl(uploadPath);

        let fileType = "document";
        const mime = getMimeType(ext);
        if (mime.startsWith("image/")) fileType = "image";
        else if (mime.startsWith("video/")) fileType = "video";
        else if (mime.startsWith("audio/")) fileType = "audio";

        const thumbnailUrl = fileType === "image" ? publicUrl : null;

        const { data: asset, error: dbErr } = await adminClient
          .from("assets")
          .insert({
            name,
            file_url: publicUrl,
            file_type: fileType,
            file_size: content.length,
            thumbnail_url: thumbnailUrl,
            owner_id: userId,
            tags: [uploadedByTag],
          })
          .select("id")
          .single();

        if (dbErr) { console.error("DB error for", name, dbErr); continue; }

        if (projectId && asset) {
          await adminClient.from("asset_projects").insert({
            asset_id: asset.id,
            project_id: projectId,
          });
        }

        extractedCount++;
      } catch (fileErr) {
        console.error("Error extracting", path, fileErr);
      }
    }

    // Clean up original ZIP from storage
    await adminClient.storage.from("assets").remove([storagePath]);

    return new Response(JSON.stringify({ extractedCount, total: toExtract.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-zip error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
    webp: "image/webp", svg: "image/svg+xml", bmp: "image/bmp",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
    pdf: "application/pdf", json: "application/json", txt: "text/plain",
    psd: "image/vnd.adobe.photoshop", ai: "application/postscript",
  };
  return map[ext.toLowerCase()] || "application/octet-stream";
}
