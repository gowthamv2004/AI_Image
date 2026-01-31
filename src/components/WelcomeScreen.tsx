import { Sparkles, Image, Wand2, MessageSquare, Palette } from "lucide-react";

const features = [
  {
    icon: Image,
    title: "Text to Image",
    description: "Describe any image and watch it come to life instantly",
  },
  {
    icon: Wand2,
    title: "Image Editing",
    description: "Upload an image and transform it with natural language",
  },
  {
    icon: MessageSquare,
    title: "Chat & Create",
    description: "Have natural conversations while generating stunning visuals",
  },
  {
    icon: Palette,
    title: "Style Control",
    description: "Specify artistic styles, colors, and compositions",
  },
];

const suggestions = [
  "A futuristic cityscape at sunset with flying cars",
  "A cozy coffee shop interior with warm lighting",
  "An astronaut floating in a sea of flowers",
  "A mystical forest with glowing mushrooms",
];

interface WelcomeScreenProps {
  onSuggestionClick: (suggestion: string) => void;
}

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 glow-primary animate-float">
        <Sparkles className="w-10 h-10 text-primary-foreground" />
      </div>

      <h1 className="text-4xl md:text-5xl font-bold mb-3 text-center">
        <span className="text-gradient">Create Anything</span>
      </h1>
      <p className="text-lg text-muted-foreground text-center max-w-md mb-10">
        Powered by advanced AI to generate and edit stunning images from your imagination
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full mb-12">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors group"
          >
            <feature.icon className="w-8 h-8 mb-3 text-primary group-hover:text-accent transition-colors" />
            <h3 className="font-medium mb-1">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>

      <div className="w-full max-w-2xl">
        <p className="text-sm text-muted-foreground mb-3 text-center">Try these prompts:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestionClick(suggestion)}
              className="px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary text-sm text-foreground transition-colors border border-border hover:border-primary/50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
