import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export interface ImageStyle {
  id: string;
  name: string;
  prompt: string;
  preview: string;
}

export const imageStyles: ImageStyle[] = [
  {
    id: "none",
    name: "No Style",
    prompt: "",
    preview: "🎨",
  },
  {
    id: "photorealistic",
    name: "Photorealistic",
    prompt: "photorealistic, ultra HD, 8K resolution, highly detailed, professional photography",
    preview: "📷",
  },
  {
    id: "anime",
    name: "Anime",
    prompt: "anime style, manga art, vibrant colors, Japanese animation aesthetic",
    preview: "🎌",
  },
  {
    id: "watercolor",
    name: "Watercolor",
    prompt: "watercolor painting, soft edges, flowing colors, artistic brushstrokes",
    preview: "🖌️",
  },
  {
    id: "oil-painting",
    name: "Oil Painting",
    prompt: "oil painting style, rich textures, classical art, museum quality",
    preview: "🖼️",
  },
  {
    id: "digital-art",
    name: "Digital Art",
    prompt: "digital art, concept art, vibrant, modern illustration style",
    preview: "💻",
  },
  {
    id: "3d-render",
    name: "3D Render",
    prompt: "3D rendered, CGI, octane render, highly detailed textures, realistic lighting",
    preview: "🎮",
  },
  {
    id: "sketch",
    name: "Pencil Sketch",
    prompt: "pencil sketch, hand-drawn, detailed line art, graphite drawing",
    preview: "✏️",
  },
  {
    id: "fantasy",
    name: "Fantasy Art",
    prompt: "fantasy art style, magical, ethereal lighting, epic fantasy illustration",
    preview: "🧙",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    prompt: "cyberpunk style, neon lights, futuristic, high-tech low-life aesthetic",
    preview: "🌃",
  },
  {
    id: "vintage",
    name: "Vintage",
    prompt: "vintage style, retro aesthetic, aged look, nostalgic film grain",
    preview: "📜",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    prompt: "minimalist style, clean lines, simple shapes, modern design",
    preview: "⬜",
  },
];

interface StyleSelectorProps {
  selectedStyle: ImageStyle;
  onStyleChange: (style: ImageStyle) => void;
  disabled?: boolean;
}

export function StyleSelector({ selectedStyle, onStyleChange, disabled }: StyleSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn(
            "h-9 px-3 gap-2 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/50 rounded-xl",
            selectedStyle.id !== "none" && "text-primary border-primary/50"
          )}
        >
          <span className="text-lg">{selectedStyle.preview}</span>
          <span className="text-sm font-medium hidden sm:inline">{selectedStyle.name}</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-2 bg-card/95 backdrop-blur-xl border-border" 
        align="start"
        sideOffset={8}
      >
        <div className="grid gap-1">
          <p className="text-xs text-muted-foreground px-2 py-1 font-medium">Image Style</p>
          {imageStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => {
                onStyleChange(style);
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                "hover:bg-muted",
                selectedStyle.id === style.id && "bg-primary/10 text-primary"
              )}
            >
              <span className="text-lg">{style.preview}</span>
              <span className="flex-1 text-sm font-medium">{style.name}</span>
              {selectedStyle.id === style.id && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
