import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PromptAnswers } from "./PromptSensei";
import { Copy, CheckCheck, RotateCcw, Lightbulb, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResultScreenProps {
  answers: PromptAnswers;
  onRestart: () => void;
}

function generateOptimizedPrompt(answers: PromptAnswers): { prompt: string; explanation: string } {
  const { question, audience, tone, format, complexity } = answers;
  
  let prompt = "";
  let explanation = "";

  // Start with role/context based on complexity
  if (complexity === "optimize") {
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
  prompt += question.trim();
  if (!question.trim().endsWith("?") && !question.trim().endsWith(".")) {
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

  // Generate explanation
  explanation = `This prompt was optimized with several key elements:\n\n`;
  
  if (complexity === "optimize") {
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
  
  explanation += `These elements work together to give you more relevant, well-structured responses that match your specific needs.`;

  return { prompt, explanation };
}

export function ResultScreen({ answers, onRestart }: ResultScreenProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const { prompt, explanation } = generateOptimizedPrompt(answers);

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
                <CardTitle className="text-lg">Why This Works</CardTitle>
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
            <Button
              onClick={handleCopy}
              size="lg"
              className="bg-gradient-primary hover:shadow-glow-primary text-primary-foreground"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Prompt
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}