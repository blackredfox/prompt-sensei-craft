import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Copy, MessageSquare, Search, Globe, Brain } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface OpenInButtonsProps {
  prompt: string;
}

export function OpenInButtons({ prompt }: OpenInButtonsProps) {
  const { toast } = useToast();
  const { t } = useTranslation();

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
        title: t('prompt_copied'),
        description: t('ready_paste_claude'),
      });
    } catch (err) {
      toast({
        title: t('copy_failed'),
        description: t('copy_failed_desc'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{t('open_in_favorite_ai')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('send_optimized_prompt')}
        </p>
      </div>
      
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={() => openIn("chatgpt")}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          {t('open_in_chatgpt')}
        </Button>
        
        <Button
          onClick={() => openIn("gemini")}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium"
        >
          <Brain className="w-4 h-4 mr-2" />
          {t('open_in_gemini')}
        </Button>
        
        <Button
          onClick={copyForClaude}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium"
        >
          <Copy className="w-4 h-4 mr-2" />
          {t('copy_for_claude')}
        </Button>
        
        <Button
          onClick={() => openIn("perplexity")}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium"
        >
          <Search className="w-4 h-4 mr-2" />
          {t('open_in_perplexity')}
        </Button>
        
        <Button
          onClick={() => openIn("you")}
          className="bg-violet-600 hover:bg-violet-700 text-white font-medium"
        >
          <Globe className="w-4 h-4 mr-2" />
          {t('open_in_you')}
        </Button>
      </div>
    </div>
  );
}