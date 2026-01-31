import { useState } from "react";
import { Video, Loader2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VideoGeneratorProps {
  initialImage?: string;
  onClose?: () => void;
}

export function VideoGenerator({ initialImage, onClose }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    if (!prompt.trim() && !initialImage) {
      toast.error("Please enter a prompt or provide an image");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setVideoUrl(null);

    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 90));
    }, 1000);

    try {
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: {
          prompt: prompt.trim(),
          imageUrl: initialImage,
        },
      });

      clearInterval(progressInterval);

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setProgress(100);
      setVideoUrl(data.videoUrl);
      toast.success("Video generated successfully!");
    } catch (error) {
      console.error("Video generation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate video";
      toast.error(errorMessage);
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!videoUrl) return;
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = "generated-video.mp4";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
            <Video className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Video Generator</h3>
            <p className="text-sm text-muted-foreground">Powered by Runway ML</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {initialImage && (
        <div className="relative">
          <img
            src={initialImage}
            alt="Source image"
            className="w-full max-h-48 object-cover rounded-lg border border-border"
          />
          <span className="absolute top-2 left-2 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-xs text-foreground">
            Source Image
          </span>
        </div>
      )}

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={initialImage ? "Describe how to animate this image..." : "Describe the video you want to create..."}
        className="min-h-[80px] resize-none text-foreground"
        disabled={isGenerating}
      />

      {isGenerating && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Generating video...</span>
            <span className="text-foreground">{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {videoUrl && (
        <div className="space-y-3">
          <video
            src={videoUrl}
            controls
            className="w-full rounded-lg border border-border"
          />
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Video
          </Button>
        </div>
      )}

      <Button
        className="w-full bg-gradient-primary hover:opacity-90 glow-primary"
        onClick={handleGenerate}
        disabled={isGenerating || (!prompt.trim() && !initialImage)}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Video className="w-4 h-4 mr-2" />
            Generate Video
          </>
        )}
      </Button>
    </div>
  );
}
