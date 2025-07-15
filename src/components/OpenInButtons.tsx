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
          variant="outline"
          onClick={() => openIn("chatgpt")}
          className="border-border/50 hover:border-green-500/50 hover:text-green-600 dark:hover:text-green-400"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Open in ChatGPT
        </Button>
        
        <Button
          variant="outline"
          onClick={() => openIn("gemini")}
          className="border-border/50 hover:border-blue-500/50 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Brain className="w-4 h-4 mr-2" />
          Open in Gemini
        </Button>
        
        <Button
          variant="outline"
          onClick={copyForClaude}
          className="border-border/50 hover:border-orange-500/50 hover:text-orange-600 dark:hover:text-orange-400"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy for Claude
        </Button>
        
        <Button
          variant="outline"
          onClick={() => openIn("perplexity")}
          className="border-border/50 hover:border-purple-500/50 hover:text-purple-600 dark:hover:text-purple-400"
        >
          <Search className="w-4 h-4 mr-2" />
          Open in Perplexity
        </Button>
        
        <Button
          variant="outline"
          onClick={() => openIn("you")}
          className="border-border/50 hover:border-cyan-500/50 hover:text-cyan-600 dark:hover:text-cyan-400"
        >
          <Globe className="w-4 h-4 mr-2" />
          Open in You.com
        </Button>
      </div>
    </div>
  );
}