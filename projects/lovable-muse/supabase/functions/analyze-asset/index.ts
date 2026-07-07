import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl, fileName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an asset analysis assistant for a production pipeline. Analyze images and return structured data. Always respond with the requested tool call.`,
          },
          {
            role: "user",
            content: [
              { type: "text", text: `Analyze this production asset named "${fileName}". Describe what you see, identify the type of asset (character design, environment, prop, storyboard frame, marketing material, etc.), and suggest relevant tags for searchability.` },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "tag_asset",
              description: "Return analysis results for a production asset",
              parameters: {
                type: "object",
                properties: {
                  description: { type: "string", description: "A 1-2 sentence description of what the image contains" },
                  asset_type: { type: "string", enum: ["character", "environment", "prop", "storyboard", "marketing", "style_guide", "texture", "concept_art", "ui_element", "other"] },
                  tags: { type: "array", items: { type: "string" }, description: "5-15 relevant searchable tags" },
                  colors: { type: "array", items: { type: "string" }, description: "Dominant colors in the image" },
                  mood: { type: "string", description: "Overall mood/atmosphere" },
                },
                required: ["description", "asset_type", "tags"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "tag_asset" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-asset error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
