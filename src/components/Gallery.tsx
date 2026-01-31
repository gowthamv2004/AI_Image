import { useState } from "react";
import { X, Download, Maximize2, Wand2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  url: string;
  prompt: string;
  style?: string;
  createdAt: Date;
}

interface GalleryProps {
  images: GalleryImage[];
  onEnhance?: (imageUrl: string) => void;
  onCreateVideo?: (imageUrl: string) => void;
}

export function Gallery({ images, onEnhance, onCreateVideo }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `generated-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <Maximize2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No images yet</h3>
        <p className="text-muted-foreground max-w-sm">
          Start creating images and they'll appear here in your gallery.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-card cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg glow-accent"
            onClick={() => setSelectedImage(image)}
          >
            <img
              src={image.url}
              alt={image.prompt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-xs text-foreground line-clamp-2 mb-2">{image.prompt}</p>
                {image.style && (
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                    {image.style}
                  </span>
                )}
              </div>
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(image.url, index);
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-12 right-0 flex gap-2">
              {onEnhance && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onEnhance(selectedImage.url);
                    setSelectedImage(null);
                  }}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Enhance
                </Button>
              )}
              {onCreateVideo && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    onCreateVideo(selectedImage.url);
                    setSelectedImage(null);
                  }}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Create Video
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownload(selectedImage.url, 0)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <img
              src={selectedImage.url}
              alt={selectedImage.prompt}
              className="w-full h-full object-contain rounded-xl"
            />
            <div className="mt-4 p-4 bg-card rounded-xl border border-border">
              <p className="text-foreground">{selectedImage.prompt}</p>
              {selectedImage.style && (
                <span className="inline-block mt-2 px-2 py-1 text-xs rounded-full bg-primary/20 text-primary">
                  {selectedImage.style}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
