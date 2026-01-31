import { useRef, useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Gallery } from "@/components/Gallery";
import { VideoGenerator } from "@/components/VideoGenerator";
import { ImageEnhancer } from "@/components/ImageEnhancer";
import { useChat } from "@/hooks/useChat";
import type { ImageStyle } from "@/components/StyleSelector";
import { MessageSquare, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ViewMode = "chat" | "gallery";

const Index = () => {
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [videoGeneratorImage, setVideoGeneratorImage] = useState<string | null>(null);
  const [enhancerImage, setEnhancerImage] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (message: string, image?: string, style?: ImageStyle) => {
    sendMessage(message, image, style);
  };

  // Extract all generated images from messages for gallery
  const galleryImages = useMemo(() => {
    return messages
      .filter((m) => m.role === "assistant" && m.images && m.images.length > 0)
      .flatMap((m) =>
        (m.images || []).map((url, idx) => ({
          id: `${m.id}-${idx}`,
          url,
          prompt: messages.find(
            (msg, i) => msg.role === "user" && messages[i + 1]?.id === m.id
          )?.content || "Generated image",
          style: messages.find(
            (msg, i) => msg.role === "user" && messages[i + 1]?.id === m.id
          )?.style,
          createdAt: new Date(),
        }))
      );
  }, [messages]);

  const handleEnhanceImage = (imageUrl: string) => {
    setEnhancerImage(imageUrl);
  };

  const handleCreateVideo = (imageUrl: string) => {
    setVideoGeneratorImage(imageUrl);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark">
      <Header onNewChat={clearMessages} />

      {/* View Mode Toggle */}
      <div className="container max-w-4xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 p-1 bg-card border border-border rounded-xl w-fit">
          <Button
            variant={viewMode === "chat" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("chat")}
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </Button>
          <Button
            variant={viewMode === "gallery" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("gallery")}
            className="gap-2"
          >
            <Grid3X3 className="w-4 h-4" />
            Gallery
            {galleryImages.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/20">
                {galleryImages.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      <main className="flex-1 flex flex-col container max-w-4xl mx-auto px-4">
        {viewMode === "gallery" ? (
          <div className="flex-1 py-6">
            <Gallery
              images={galleryImages}
              onEnhance={handleEnhanceImage}
              onCreateVideo={handleCreateVideo}
            />
          </div>
        ) : (
          <>
            {messages.length === 0 ? (
              <WelcomeScreen onSuggestionClick={(suggestion) => handleSend(suggestion)} />
            ) : (
              <div className="flex-1 py-6 space-y-6 overflow-y-auto">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    images={message.images}
                    onEnhance={handleEnhanceImage}
                    onCreateVideo={handleCreateVideo}
                  />
                ))}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <ChatMessage role="assistant" content="" isLoading />
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            <div className="sticky bottom-0 py-6 bg-gradient-to-t from-background via-background to-transparent">
              <ChatInput onSend={handleSend} isLoading={isLoading} />
            </div>
          </>
        )}
      </main>

      {/* Video Generator Modal */}
      {videoGeneratorImage && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <VideoGenerator
              initialImage={videoGeneratorImage}
              onClose={() => setVideoGeneratorImage(null)}
            />
          </div>
        </div>
      )}

      {/* Image Enhancer Modal */}
      {enhancerImage && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <ImageEnhancer
              imageUrl={enhancerImage}
              onClose={() => setEnhancerImage(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
