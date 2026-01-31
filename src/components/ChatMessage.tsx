import { User, Sparkles, Download, Wand2, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  images?: string[];
  isLoading?: boolean;
  onEnhance?: (imageUrl: string) => void;
  onCreateVideo?: (imageUrl: string) => void;
}

export function ChatMessage({ role, content, images, isLoading, onEnhance, onCreateVideo }: ChatMessageProps) {
  const isUser = role === "user";

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `generated-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={cn(
        "flex gap-4 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
          isUser
            ? "bg-primary/10 text-primary"
            : "bg-gradient-primary text-primary-foreground glow-primary"
        )}
      >
        {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
      </div>

      <div
        className={cn(
          "flex-1 max-w-[80%] space-y-3",
          isUser ? "text-right" : "text-left"
        )}
      >
        <div
          className={cn(
            "inline-block px-5 py-3 rounded-2xl",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card border border-border rounded-bl-md"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          )}
        </div>

        {images && images.length > 0 && (
          <div className={cn("flex flex-wrap gap-3", isUser ? "justify-end" : "justify-start")}>
            {images.map((img, index) => (
              <div
                key={index}
                className="relative group rounded-xl overflow-hidden border border-border animate-scale-in glow-accent"
              >
                <img
                  src={img}
                  alt={`Generated image ${index + 1}`}
                  className="max-w-sm max-h-96 object-cover"
                />
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEnhance && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                      onClick={() => onEnhance(img)}
                    >
                      <Wand2 className="w-4 h-4" />
                    </Button>
                  )}
                  {onCreateVideo && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                      onClick={() => onCreateVideo(img)}
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                    onClick={() => handleDownload(img, index)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
