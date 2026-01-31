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
    const { prompt, imageUrl } = await req.json();
    console.log("Video generation request - prompt:", prompt?.substring(0, 100), "hasImage:", !!imageUrl);

    const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");
    if (!RUNWAY_API_KEY) {
      console.error("RUNWAY_API_KEY is not configured");
      throw new Error("RUNWAY_API_KEY is not configured. Please add your Runway API key.");
    }

    // Create a video generation task with Runway Gen-3
    console.log("Creating Runway video generation task...");
    
    const createResponse = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RUNWAY_API_KEY}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify({
        model: "gen3a_turbo",
        promptImage: imageUrl,
        promptText: prompt || "Animate this image with smooth, natural motion",
        duration: 5,
        ratio: "16:9",
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("Runway API error:", createResponse.status, errorText);
      
      if (createResponse.status === 401) {
        throw new Error("Invalid Runway API key. Please check your API key.");
      }
      if (createResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      
      throw new Error(`Runway API error: ${createResponse.status}`);
    }

    const taskData = await createResponse.json();
    console.log("Task created:", taskData.id);

    // Poll for task completion
    const taskId = taskData.id;
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max wait

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      
      const statusResponse = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: {
          "Authorization": `Bearer ${RUNWAY_API_KEY}`,
          "X-Runway-Version": "2024-11-06",
        },
      });

      if (!statusResponse.ok) {
        console.error("Status check failed:", statusResponse.status);
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      console.log("Task status:", statusData.status);

      if (statusData.status === "SUCCEEDED") {
        videoUrl = statusData.output?.[0];
        break;
      } else if (statusData.status === "FAILED") {
        throw new Error("Video generation failed. Please try again.");
      }

      attempts++;
    }

    if (!videoUrl) {
      throw new Error("Video generation timed out. Please try again.");
    }

    console.log("Video generated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-video function:", error);
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
