// Edge Function: lang-detect
// Returns ISO code ('ru','bg','uk','en', etc.) guessed from text.
// Uses OpenAI for robust detection on mixed content. Cheap for short inputs.
import { serve } from "https://deno.land/std@0.220.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    if (!text || !text.trim()) {
      return new Response(JSON.stringify({ language: "unknown" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY is not set" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const sys = "You are a language detector. Given user text, respond with ONLY a lowercase ISO 639-1 language code (e.g., ru, bg, uk, en). If it's a mix, choose the dominant language. If unclear, respond \"unknown\".";
    const user = "Detect language code for:\n" + text;

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        temperature: 0,
        max_tokens: 5,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(JSON.stringify({ error: "OpenAI request failed", details: errText }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const data = await resp.json();
    let code = data?.choices?.[0]?.message?.content?.trim()?.toLowerCase() || "unknown";
    // sanitize to [a-z]{2}
    if (!/^[a-z]{2}$/.test(code)) code = "unknown";

    return new Response(JSON.stringify({ language: code }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Unexpected error", details: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
