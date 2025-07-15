import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, Zap, Target, MessageSquare, Smile, Code2, SearchCheck, Languages } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-primary rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-secondary rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-gradient-accent rounded-full blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative container max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-gradient-primary shadow-glow-primary">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PromptSensei
            </h1>
          </div>
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Master the art of AI prompting
          </p>
          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
            Transform your basic questions into powerful, optimized prompts that get better results from ChatGPT, Claude, and Gemini
          </p>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 gap-6 mb-12">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow-secondary transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-2 rounded-lg bg-gradient-secondary w-fit mb-3">
                <Sparkles className="w-6 h-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-lg">Smart Optimization</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground text-sm">
                Add context, examples, and precise instructions to maximize AI performance
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow-secondary transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-2 rounded-lg bg-gradient-secondary w-fit mb-3">
                <Target className="w-6 h-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-lg">Tailored Results</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground text-sm">
                Customize tone, format, and complexity based on your specific needs
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow-secondary transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-2 rounded-lg bg-gradient-secondary w-fit mb-3">
                <Zap className="w-6 h-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-lg">Instant Results</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground text-sm">
                Get your optimized prompt in under 2 minutes with our guided process
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow-secondary transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-2 rounded-lg bg-gradient-secondary w-fit mb-3">
                <Smile className="w-6 h-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-lg">Beginner Friendly</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground text-sm">
                No jargon, no pressure — just choose and go. We guide you step by step.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow-secondary transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-2 rounded-lg bg-gradient-secondary w-fit mb-3">
                <Code2 className="w-6 h-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-lg">Code-Ready Prompts</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground text-sm">
                Generate clean, structured code with built-in formatting, explanations, and edge cases.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow-secondary transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-2 rounded-lg bg-gradient-secondary w-fit mb-3">
                <SearchCheck className="w-6 h-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-lg">Deep Insight Mode</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground text-sm">
                Ask the AI to analyze, compare, and synthesize like a pro. Perfect for research, strategy, and long-form queries.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow-secondary transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-2 rounded-lg bg-gradient-secondary w-fit mb-3">
                <Languages className="w-6 h-6 text-accent-foreground" />
              </div>
              <CardTitle className="text-lg">Multilingual Friendly</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground text-sm">
                Create prompts in your native language. Perfect for ESL users, international teams, and cross-language tasks.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            onClick={onStart}
            size="lg"
            className="bg-gradient-primary hover:shadow-glow-primary text-primary-foreground px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Start Crafting Your Prompt
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No signup required • Takes 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
}