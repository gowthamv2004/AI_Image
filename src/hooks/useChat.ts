import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ImageStyle } from "@/components/StyleSelector";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
  image?: string;
  style?: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateImage = useCallback(async (prompt: string, imageBase64?: string, style?: ImageStyle) => {
    try {
      // Apply style to prompt if selected
      let enhancedPrompt = prompt;
      if (style && style.prompt) {
        enhancedPrompt = `${prompt}, ${style.prompt}`;
      }

      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: {
          prompt: enhancedPrompt,
          mode: imageBase64 ? "edit" : "generate",
          imageBase64,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return {
        text: data.text || "Here's the image I created for you!",
        images: data.images || [],
      };
    } catch (error) {
      console.error("Image generation error:", error);
      throw error;
    }
  }, []);

  const streamChat = useCallback(
    async (userMessage: string, userImage?: string): Promise<string> => {
      const chatMessages = messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.image && { image: m.image }),
      }));

      chatMessages.push({
        role: "user",
        content: userMessage,
        ...(userImage && { image: userImage }),
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: chatMessages }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantContent = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: assistantContent } : m
                  );
                }
                return [
                  ...prev,
                  { id: crypto.randomUUID(), role: "assistant", content: assistantContent },
                ];
              });
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      return assistantContent;
    },
    [messages]
  );

  const sendMessage = useCallback(
    async (content: string, image?: string, style?: ImageStyle) => {
      if (!content.trim() && !image) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        ...(image && { image }),
        ...(style && { style: style.name }),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        // Check if user wants to generate an image
        const imageKeywords = [
          "generate",
          "create",
          "make",
          "draw",
          "design",
          "image",
          "picture",
          "photo",
          "illustration",
          "art",
          "visualize",
          "render",
        ];
        const wantsImage = imageKeywords.some((kw) =>
          content.toLowerCase().includes(kw)
        );

        if (wantsImage || image || style) {
          // Generate image with style
          const result = await generateImage(content, image, style);
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: result.text,
              images: result.images,
            },
          ]);
        } else {
          // Regular chat
          await streamChat(content, image);
        }
      } catch (error) {
        console.error("Send message error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Something went wrong";
        toast.error(errorMessage);
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `I'm sorry, I encountered an error: ${errorMessage}. Please try again.`,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [generateImage, streamChat]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}
