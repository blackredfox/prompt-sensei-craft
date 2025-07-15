import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Copy, MessageSquare, Search, Globe, Brain } from "lucide-react";

interface OpenInButtonsProps {
  prompt: string;
}

export function OpenInButtons({ prompt }: OpenInButtonsProps) {
  const { toast } = useToast();

  const openIn = (platform: string) => {
    const encoded = encodeURIComponent(prompt);
    const urls: Record<string, string> = {
      chatgpt: `https://chat.openai.com/?q=${encoded}`,
      gemini: `https://gemini.google.com/app?q=${encoded}`,
      perplexity: `https://www.perplexity.ai/search?q=${encoded}`,
      you: `https://you.com/search?q=${encoded}`,
    };
    
    if (urls[platform]) {
      window.open(urls[platform], "_blank", "noopener,noreferrer");
    }
  };

  const copyForClaude = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast({
        title: "Prompt copied!",
        description: "Ready to paste into Claude.ai",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please copy the prompt manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Open in your favorite AI</h3>
        <p className="text-sm text-muted-foreground">
          Send your optimized prompt directly to popular AI platforms
        </p>
      </div>
      
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={() => openIn("chatgpt")}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Open in ChatGPT
        </Button>
        
        <Button
          onClick={() => openIn("gemini")}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium"
        >
          <Brain className="w-4 h-4 mr-2" />
          Open in Gemini
        </Button>
        
        <Button
          onClick={copyForClaude}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy for Claude
        </Button>
        
        <Button
          onClick={() => openIn("perplexity")}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium"
        >
          <Search className="w-4 h-4 mr-2" />
          Open in Perplexity
        </Button>
        
        <Button
          onClick={() => openIn("you")}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium"
        >
          <Globe className="w-4 h-4 mr-2" />
          Open in You.com
        </Button>
      </div>
    </div>
  );
}