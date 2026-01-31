import { useState } from "react";
import { Wand2, Loader2, Download, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageEnhancerProps {
  imageUrl: string;
  onClose?: () => void;
  onEnhanced?: (enhancedUrl: string) => void;
}

type EnhanceMode = "upscale" | "enhance" | "restore";

export function ImageEnhancer({ imageUrl, onClose, onEnhanced }: ImageEnhancerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<EnhanceMode>("enhance");

  const modes: { id: EnhanceMode; label: string; description: string; icon: React.ReactNode }[] = [
    {
      id: "upscale",
      label: "Upscale 2x",
      description: "Increase resolution while preserving details",
      icon: <ZoomIn className="w-4 h-4" />,
    },
    {
      id: "enhance",
      label: "Enhance",
      description: "Improve colors, contrast, and sharpness",
      icon: <Wand2 className="w-4 h-4" />,
    },
    {
      id: "restore",
      label: "Restore",
      description: "Fix artifacts and improve quality",
      icon: <Wand2 className="w-4 h-4" />,
    },
  ];

  const handleEnhance = async () => {
    setIsProcessing(true);
    setEnhancedUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke("enhance-image", {
        body: {
          imageUrl,
          mode: selectedMode,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setEnhancedUrl(data.enhancedUrl);
      onEnhanced?.(data.enhancedUrl);
      toast.success("Image enhanced successfully!");
    } catch (error) {
      console.error("Image enhancement error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to enhance image";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `enhanced-image.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
            <Wand2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Image Enhancer</h3>
            <p className="text-sm text-muted-foreground">Upscale & enhance your images</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Original</span>
          <img
            src={imageUrl}
            alt="Original"
            className="w-full aspect-square object-cover rounded-lg border border-border"
          />
        </div>
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Enhanced</span>
          {enhancedUrl ? (
            <img
              src={enhancedUrl}
              alt="Enhanced"
              className="w-full aspect-square object-cover rounded-lg border border-border"
            />
          ) : (
            <div className="w-full aspect-square rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/20">
              {isProcessing ? (
                <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              ) : (
                <span className="text-sm text-muted-foreground">Preview here</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm text-foreground">Enhancement Mode</span>
        <div className="grid grid-cols-3 gap-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedMode === mode.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {mode.icon}
                <span className="text-sm font-medium text-foreground">{mode.label}</span>
              </div>
              <p className="text-xs text-muted-foreground">{mode.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1 bg-gradient-primary hover:opacity-90 glow-primary"
          onClick={handleEnhance}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Enhance Image
            </>
          )}
        </Button>
        {enhancedUrl && (
          <Button variant="secondary" onClick={() => handleDownload(enhancedUrl)}>
            <Download className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
