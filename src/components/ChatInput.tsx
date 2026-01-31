import { useState, useRef, KeyboardEvent } from "react";
import { Send, ImagePlus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { StyleSelector, ImageStyle, imageStyles } from "./StyleSelector";

interface ChatInputProps {
  onSend: (message: string, image?: string, style?: ImageStyle) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>(imageStyles[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!input.trim() && !attachedImage) return;
    onSend(input.trim(), attachedImage || undefined, selectedStyle.id !== "none" ? selectedStyle : undefined);
    setInput("");
    setAttachedImage(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      {attachedImage && (
        <div className="mb-3 flex items-start gap-2 animate-fade-in">
          <div className="relative">
            <img
              src={attachedImage}
              alt="Attached"
              className="w-20 h-20 object-cover rounded-lg border border-border"
            />
            <button
              onClick={() => setAttachedImage(null)}
              className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:opacity-80 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <span className="text-sm text-muted-foreground">Image attached</span>
        </div>
      )}

      <div className="flex items-end gap-3 p-2 rounded-2xl bg-card border border-border shadow-lg">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || disabled}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <ImagePlus className="w-5 h-5" />
          </Button>
          
          <StyleSelector
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
            disabled={isLoading || disabled}
          />
        </div>

        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the image you want to create..."
          disabled={isLoading || disabled}
          className={cn(
            "flex-1 min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base text-foreground placeholder:text-muted-foreground",
            "scrollbar-thin scrollbar-thumb-muted"
          )}
          rows={1}
        />

        <Button
          onClick={handleSubmit}
          disabled={(!input.trim() && !attachedImage) || isLoading || disabled}
          size="icon"
          className="flex-shrink-0 bg-gradient-primary hover:opacity-90 transition-opacity glow-primary"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-3">
        Press Enter to send • Shift + Enter for new line • Attach images for editing
      </p>
    </div>
  );
}
