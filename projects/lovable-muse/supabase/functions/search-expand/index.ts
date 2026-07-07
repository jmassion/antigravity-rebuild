import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ synonyms: [], tags: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a search expansion assistant for a creative production pipeline app. Given a search query, return synonyms and related tags that would help find relevant assets, documents, and prompts. Focus on creative/production terminology.`,
          },
          {
            role: "user",
            content: `Expand this search query with synonyms and related tags: "${query}"`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "expand_search",
              description: "Return synonyms and related tags for the search query",
              parameters: {
                type: "object",
                properties: {
                  synonyms: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-6 synonym terms or alternate phrasings",
                  },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-8 related tags/categories that match the intent",
                  },
                },
                required: ["synonyms", "tags"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "expand_search" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status, await response.text());
      return new Response(JSON.stringify({ synonyms: [], tags: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ synonyms: [], tags: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("search-expand error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
