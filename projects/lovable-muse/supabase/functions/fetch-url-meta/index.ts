import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: "URL required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the page with a timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let html = "";
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; LinkPreview/1.0)",
          "Accept": "text/html,application/xhtml+xml",
        },
        redirect: "follow",
      });
      // Only read first 50KB to keep it fast
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let bytes = 0;
      if (reader) {
        while (bytes < 50000) {
          const { done, value } = await reader.read();
          if (done) break;
          html += decoder.decode(value, { stream: true });
          bytes += value.length;
        }
        reader.cancel();
      }
    } catch (e) {
      // Fetch failed — return minimal info
    } finally {
      clearTimeout(timeout);
    }

    // Parse metadata from HTML
    const getMetaContent = (nameOrProp: string): string | null => {
      // Try property= first (og:tags), then name=
      const propRegex = new RegExp(
        `<meta[^>]+(?:property|name)=["']${nameOrProp}["'][^>]+content=["']([^"']+)["']`,
        "i"
      );
      const match = html.match(propRegex);
      if (match) return match[1];
      // Try reversed attribute order
      const revRegex = new RegExp(
        `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${nameOrProp}["']`,
        "i"
      );
      const revMatch = html.match(revRegex);
      return revMatch ? revMatch[1] : null;
    };

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title =
      getMetaContent("og:title") ||
      getMetaContent("twitter:title") ||
      (titleMatch ? titleMatch[1].trim() : null);

    const description =
      getMetaContent("og:description") ||
      getMetaContent("description") ||
      getMetaContent("twitter:description") ||
      null;

    const image =
      getMetaContent("og:image") ||
      getMetaContent("twitter:image") ||
      null;

    // Extract favicon
    const faviconMatch = html.match(
      /<link[^>]+rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]+href=["']([^"']+)["']/i
    );
    let favicon: string | null = null;
    if (faviconMatch) {
      favicon = faviconMatch[1];
      // Make absolute
      if (favicon.startsWith("//")) favicon = "https:" + favicon;
      else if (favicon.startsWith("/")) {
        try {
          const u = new URL(url);
          favicon = u.origin + favicon;
        } catch { }
      }
    } else {
      try {
        const u = new URL(url);
        favicon = u.origin + "/favicon.ico";
      } catch { }
    }

    // Try to detect keywords/tags from meta
    const keywords = getMetaContent("keywords");
    const tags = keywords
      ? keywords.split(",").map((k: string) => k.trim()).filter(Boolean).slice(0, 8)
      : [];

    // Detect category heuristically
    let suggestedCategory = "general";
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, "");
      if (
        hostname.includes("docs.") ||
        hostname.includes("wiki") ||
        hostname.includes("readme") ||
        url.includes("/docs") ||
        url.includes("/documentation")
      )
        suggestedCategory = "documentation";
      else if (
        hostname.includes("github.com") ||
        hostname.includes("gitlab.com") ||
        hostname.includes("bitbucket.org")
      )
        suggestedCategory = "tool";
      else if (
        hostname.includes("api.") ||
        url.includes("/api/") ||
        url.includes("swagger") ||
        url.includes("postman")
      )
        suggestedCategory = "api";
      else if (
        url.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar)(\?|$)/i) ||
        hostname.includes("drive.google") ||
        hostname.includes("dropbox")
      )
        suggestedCategory = "file";
      else if (
        hostname.includes("pinterest") ||
        hostname.includes("behance") ||
        hostname.includes("dribbble") ||
        hostname.includes("artstation") ||
        url.includes("reference")
      )
        suggestedCategory = "reference";
      else if (
        hostname.includes("figma") ||
        hostname.includes("canva") ||
        hostname.includes("miro") ||
        hostname.includes("notion") ||
        hostname.includes("linear") ||
        hostname.includes("trello") ||
        hostname.includes("slack") ||
        hostname.includes("discord") ||
        hostname.includes("blender")
      )
        suggestedCategory = "tool";
    } catch { }

    return new Response(
      JSON.stringify({
        title: title ? decodeHTMLEntities(title) : null,
        description: description ? decodeHTMLEntities(description) : null,
        image,
        favicon,
        tags,
        suggestedCategory,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
}
