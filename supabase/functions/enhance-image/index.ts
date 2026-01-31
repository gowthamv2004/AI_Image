import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { imageUrl, mode } = await req.json();
    console.log("Image enhancement request - mode:", mode);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Use Gemini to enhance the image
    let enhancementPrompt = "";
    switch (mode) {
      case "upscale":
        enhancementPrompt = "Upscale this image to higher resolution. Enhance details, sharpen edges, and improve clarity while maintaining the original composition and style. Make it look like a high-quality, high-resolution version of the original.";
        break;
      case "enhance":
        enhancementPrompt = "Enhance this image by improving colors, contrast, and sharpness. Make the colors more vibrant, increase dynamic range, and add subtle HDR-like effects while keeping it natural looking.";
        break;
      case "restore":
        enhancementPrompt = "Restore and clean up this image. Remove any artifacts, noise, or imperfections. Improve overall quality while preserving the original content and artistic intent.";
        break;
      default:
        enhancementPrompt = "Enhance this image to improve its overall quality.";
    }

    console.log("Calling Lovable AI Gateway for image enhancement...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: enhancementPrompt },
              {
                type: "image_url",
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      if (response.status === 402) {
        throw new Error("AI credits exhausted. Please add more credits to continue.");
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received successfully");

    const images = data.choices?.[0]?.message?.images || [];
    const enhancedUrl = images[0]?.image_url?.url || "";

    if (!enhancedUrl) {
      throw new Error("No enhanced image returned from AI");
    }

    return new Response(
      JSON.stringify({
        success: true,
        enhancedUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in enhance-image function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
