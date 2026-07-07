import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
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

    // Create admin client first (before any usage)
    const adminClient = createClient(supabaseUrl, serviceKey);

    // Fetch display name for uploaded_by tag
    let displayName = userId;
    try {
      const { data: profile } = await adminClient.from('profiles').select('display_name').eq('user_id', userId).single();
      if (profile?.display_name) displayName = profile.display_name;
    } catch { /* fallback to userId */ }
    const uploadedByTag = `uploaded_by:${displayName}`;

    const { url, provider, projectId } = await req.json();
    if (!url) throw new Error("url is required");

    // Convert share links to direct download URLs
    const downloadUrl = toDirectUrl(url, provider);

    // Fetch the file
    const fileRes = await fetch(downloadUrl);
    if (!fileRes.ok) throw new Error(`Failed to fetch file: ${fileRes.status} ${fileRes.statusText}`);

    const contentType = fileRes.headers.get("content-type") || "application/octet-stream";
    const contentDisposition = fileRes.headers.get("content-disposition") || "";
    
    // Extract filename
    let fileName = "imported-file";
    const match = contentDisposition.match(/filename[*]?=["']?([^"';]+)/);
    if (match) {
      fileName = match[1];
    } else {
      try {
        const urlPath = new URL(url).pathname;
        const lastSegment = urlPath.split("/").pop();
        if (lastSegment && lastSegment.includes(".")) fileName = lastSegment;
      } catch { /* ignore */ }
    }

    const blob = await fileRes.blob();
    const ext = fileName.split(".").pop()?.toLowerCase() || "bin";
    const storagePath = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await adminClient.storage
      .from("assets")
      .upload(storagePath, blob, { upsert: false, contentType });

    if (upErr) throw new Error("Storage upload failed: " + upErr.message);

    // Check if it's a ZIP — trigger automatic extraction
    const isZip = ext === "zip" || contentType === "application/zip" || contentType === "application/x-zip-compressed";

    if (isZip) {
      // Call the extract-zip function internally
      const extractRes = await fetch(`${supabaseUrl}/functions/v1/extract-zip`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ storagePath, projectId, fileName }),
      });

      const extractData = await extractRes.json();
      if (!extractRes.ok) throw new Error(extractData?.error || "ZIP extraction failed");

      return new Response(JSON.stringify({
        fileName,
        fileType: "zip",
        extracted: true,
        extractedCount: extractData.extractedCount || 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Non-ZIP: create asset record as before
    const { data: { publicUrl } } = adminClient.storage.from("assets").getPublicUrl(storagePath);

    let fileType = "document";
    if (contentType.startsWith("image/")) fileType = "image";
    else if (contentType.startsWith("video/")) fileType = "video";
    else if (contentType.startsWith("audio/")) fileType = "audio";

    const thumbnailUrl = fileType === "image" ? publicUrl : null;

    const { data: asset, error: dbErr } = await adminClient
      .from("assets")
      .insert({
        name: fileName,
        file_url: publicUrl,
        file_type: fileType,
        file_size: blob.size,
        thumbnail_url: thumbnailUrl,
        owner_id: userId,
        tags: [uploadedByTag],
      })
      .select("id")
      .single();

    if (dbErr) throw new Error("DB insert failed: " + dbErr.message);

    if (projectId && asset) {
      await adminClient.from("asset_projects").insert({
        asset_id: asset.id,
        project_id: projectId,
      });
    }

    return new Response(JSON.stringify({ assetId: asset?.id, fileName, fileType }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("import-cloud-file error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function toDirectUrl(url: string, provider: string): string {
  if (provider === "gdrive") {
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
      return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
    }
  }
  if (provider === "dropbox") {
    return url.replace("dl=0", "dl=1").replace("www.dropbox.com", "dl.dropboxusercontent.com");
  }
  if (provider === "onedrive") {
    if (url.includes("1drv.ms") || url.includes("onedrive.live.com")) {
      return url.replace("redir", "download");
    }
  }
  return url;
}
