import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PromptAnswers, polishText } from "./PromptSensei";
import { Copy, CheckCheck, RotateCcw, Lightbulb, Sparkles, ExternalLink, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResultScreenProps {
  answers: PromptAnswers;
  onRestart: () => void;
}

// Auto-detect and suggest persona based on question content
function detectPersona(question: string): string {
  const lowerQuestion = question.toLowerCase();
  
  if (lowerQuestion.includes('etsy') || lowerQuestion.includes('shop') || lowerQuestion.includes('ecommerce') || lowerQuestion.includes('e-commerce')) {
    return "Act as an experienced e-commerce coach specializing in online marketplaces. ";
  }
  if (lowerQuestion.includes('finance') || lowerQuestion.includes('money') || lowerQuestion.includes('investment') || lowerQuestion.includes('budget')) {
    return "You are a certified financial advisor with expertise in personal finance and investment strategies. ";
  }
  if (lowerQuestion.includes('marketing') || lowerQuestion.includes('promotion') || lowerQuestion.includes('advertising')) {
    return "Act as a digital marketing expert with proven experience in campaign strategy and audience engagement. ";
  }
  if (lowerQuestion.includes('code') || lowerQuestion.includes('programming') || lowerQuestion.includes('developer') || lowerQuestion.includes('software')) {
    return "You are a senior software engineer with extensive experience in modern development practices. ";
  }
  if (lowerQuestion.includes('resume') || lowerQuestion.includes('cv') || lowerQuestion.includes('job') || lowerQuestion.includes('career')) {
    return "Act as a professional career coach and HR expert with extensive experience in recruitment and career development. ";
  }
  if (lowerQuestion.includes('health') || lowerQuestion.includes('fitness') || lowerQuestion.includes('exercise') || lowerQuestion.includes('nutrition')) {
    return "You are a certified health and wellness expert with a background in nutrition and fitness coaching. ";
  }
  if (lowerQuestion.includes('business') || lowerQuestion.includes('startup') || lowerQuestion.includes('entrepreneur')) {
    return "Act as a business strategy consultant with experience helping startups and established companies grow. ";
  }
  
  return "";
}

function generateOptimizedPrompt(answers: PromptAnswers): { prompt: string; explanation: string; polishInfo?: { original: string; polished: string } } {
  const { question, audience, tone, format, complexity, depth, polishInput } = answers;
  
  // Polish the question if requested
  let finalQuestion = question;
  let polishInfo: { original: string; polished: string } | undefined;
  
  if (polishInput === "true") {
    const { polished, wasPolished } = polishText(question);
    if (wasPolished) {
      polishInfo = { original: question, polished };
      finalQuestion = polished;
    }
  }
  
  let prompt = "";
  let explanation = "";

  // Auto-detect persona first
  const detectedPersona = detectPersona(finalQuestion);
  if (detectedPersona && complexity === "optimize") {
    prompt += detectedPersona;
  } else if (complexity === "optimize") {
    // Fallback to general tone-based persona
    switch (tone) {
      case "expert":
        prompt += "You are an expert consultant with deep knowledge in your field. ";
        break;
      case "friendly":
        prompt += "You are a helpful and friendly assistant who explains things clearly. ";
        break;
      case "creative":
        prompt += "You are a creative and innovative assistant who thinks outside the box. ";
        break;
      case "short":
        prompt += "You are a concise assistant who gets straight to the point. ";
        break;
    }
  }

  // Add the main question
  prompt += finalQuestion.trim();
  if (!finalQuestion.trim().endsWith("?") && !finalQuestion.trim().endsWith(".")) {
    prompt += ".";
  }

  // Add audience context
  if (complexity === "optimize") {
    switch (audience) {
      case "client":
        prompt += " This response will be shared with a client, so please ensure it's professional and polished.";
        break;
      case "manager":
        prompt += " This is for a presentation to management, so please focus on key insights and actionable recommendations.";
        break;
      case "myself":
        prompt += " This is for my personal understanding, so feel free to include detailed explanations and context.";
        break;
      case "other":
        prompt += " Please make the response accessible to a general audience.";
        break;
    }
  }

  // Add format requirements
  switch (format) {
    case "bullet":
      prompt += " Please format your response as a clear bullet list with key points.";
      break;
    case "steps":
      prompt += " Please provide a step-by-step response with numbered instructions.";
      break;
    case "paragraph":
      prompt += " Please provide a detailed response in paragraph format.";
      break;
  }

  // Add tone refinements
  if (complexity === "optimize") {
    switch (tone) {
      case "short":
        prompt += " Keep the response concise and avoid unnecessary details.";
        break;
      case "creative":
        prompt += " Feel free to include creative examples and innovative approaches.";
        break;
      case "expert":
        prompt += " Include relevant technical details and professional insights.";
        break;
      case "friendly":
        prompt += " Use a warm, conversational tone that's easy to understand.";
        break;
    }
  }

  // Add DeepSearch modifier
  if (depth === "deep") {
    prompt += " Include research-based insights, comparisons, references, or real-world examples as needed. Analyze the topic broadly and provide thorough explanations.";
  }

  // Generate explanation
  explanation = `Here's why this prompt hits the mark:\n\n`;
  
  if (detectedPersona && complexity === "optimize") {
    explanation += `• **Smart Persona Detection**: I automatically detected your topic and assigned a specialized expert role to ensure authoritative, relevant responses.\n\n`;
  } else if (complexity === "optimize") {
    explanation += `• **Role Definition**: I set up the AI with a specific persona (${tone}) to ensure consistent voice throughout the response.\n\n`;
  }
  
  explanation += `• **Clear Intent**: Your core question is stated directly and clearly.\n\n`;
  
  if (complexity === "optimize") {
    explanation += `• **Audience Context**: I specified that this is for ${audience === "myself" ? "personal use" : audience === "client" ? "a client" : audience === "manager" ? "management" : "a general audience"}, which helps the AI tailor the complexity and tone.\n\n`;
  }
  
  explanation += `• **Format Specification**: I requested ${format === "bullet" ? "bullet points" : format === "steps" ? "step-by-step format" : "paragraph format"} to match your preference.\n\n`;
  
  if (complexity === "optimize") {
    explanation += `• **Tone Guidance**: I added specific instructions to maintain a ${tone} approach throughout the response.\n\n`;
  }

  if (depth === "deep") {
    explanation += `• **DeepSearch Mode**: I enabled thorough analysis with research-based insights, comparisons, and real-world examples for comprehensive responses.\n\n`;
  }
  
  explanation += `These elements work together to give you more relevant, well-structured responses that match your specific needs.`;

  return { prompt, explanation, polishInfo };
}

export function ResultScreen({ answers, onRestart }: ResultScreenProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const { prompt, explanation, polishInfo } = generateOptimizedPrompt(answers);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "Your optimized prompt is ready to use.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please select and copy the text manually.",
        variant: "destructive",
      });
    }
  };

  const handleOpenChatGPT = () => {
    const encodedPrompt = encodeURIComponent(prompt);
    const chatGPTUrl = `https://chat.openai.com/?prompt=${encodedPrompt}`;
    window.open(chatGPTUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Your Optimized Prompt
            </span>
          </div>
          <Badge variant="secondary" className="mb-4">
            Ready to use with ChatGPT, Claude, or Gemini
          </Badge>
        </div>

        <div className="space-y-8">
          {/* Polish Info Notice */}
          {polishInfo && (
            <Card className="border-border/50 bg-blue-50 dark:bg-blue-950/20 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      ✨ We polished your question slightly to help the AI understand better:
                    </p>
                    <div className="text-xs space-y-1">
                      <div className="text-muted-foreground">
                        <span className="font-mono bg-background/50 px-2 py-1 rounded border">Original:</span> {polishInfo.original}
                      </div>
                      <div className="text-foreground">
                        <span className="font-mono bg-primary/10 px-2 py-1 rounded border">Improved:</span> {polishInfo.polished}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated Prompt */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-glow-secondary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Your Optimized Prompt</CardTitle>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="border-border/50 hover:border-primary/50"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {prompt}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Explanation */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Here's why this prompt hits the mark</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <div className="whitespace-pre-line">{explanation}</div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onRestart}
              variant="outline"
              size="lg"
              className="border-border/50 hover:border-primary/50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Create Another Prompt
            </Button>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleCopy}
                size="lg"
                variant="outline"
                className="border-border/50 hover:border-primary/50"
              >
                {copied ? (
                  <>
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Prompt
                  </>
                )}
              </Button>
              <Button
                onClick={handleOpenChatGPT}
                size="lg"
                className="bg-gradient-primary hover:shadow-glow-primary text-primary-foreground"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in ChatGPT
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}