import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Sparkles, Zap, Target, MessageSquare, Smile, Code2, SearchCheck, Languages, Edit3, Settings, Rocket } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-primary rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-secondary rounded-full blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-gradient-accent rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative container max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-gradient-primary shadow-glow-primary">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PromptSensei
            </h1>
          </div>
          
          <h2 className="text-2xl md:text-3xl text-foreground mb-6 font-semibold">
            Master the art of AI prompting
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-10">
            Transform your ideas into powerful AI prompts in minutes. Get better results from ChatGPT, Claude, and Gemini with our guided optimization process.
          </p>

          <Button 
            onClick={onStart}
            size="lg"
            className="bg-gradient-primary hover:shadow-glow-primary text-primary-foreground px-10 py-6 text-xl font-semibold transition-all duration-300 hover:scale-105 rounded-2xl"
          >
            <MessageSquare className="w-6 h-6 mr-3" />
            Start Crafting Your Prompt
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No signup required • Takes 2 minutes
          </p>
        </div>

        {/* Feature Clusters */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* Cluster 1: Smart Results */}
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm hover:shadow-glow-secondary transition-all duration-300 rounded-2xl p-6">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto p-3 rounded-xl bg-gradient-primary w-fit mb-4">
                <Target className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Smart Results</CardTitle>
              <p className="text-muted-foreground">Intelligent optimization for better AI responses</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Smart Optimization</p>
                  <p className="text-muted-foreground text-xs">Add context and precise instructions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Instant Results</p>
                  <p className="text-muted-foreground text-xs">Get optimized prompts in under 2 minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Tailored Output</p>
                  <p className="text-muted-foreground text-xs">Customize tone, format, and complexity</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cluster 2: Personalized for You */}
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm hover:shadow-glow-secondary transition-all duration-300 rounded-2xl p-6">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto p-3 rounded-xl bg-gradient-secondary w-fit mb-4">
                <Smile className="w-8 h-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Personalized for You</CardTitle>
              <p className="text-muted-foreground">Built for every skill level and use case</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Smile className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Beginner Friendly</p>
                  <p className="text-muted-foreground text-xs">No jargon, just step-by-step guidance</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Code2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Code-Ready Prompts</p>
                  <p className="text-muted-foreground text-xs">Clean, structured code with explanations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cluster 3: Global & Pro */}
          <Card className="border-border/50 bg-card/30 backdrop-blur-sm hover:shadow-glow-secondary transition-all duration-300 rounded-2xl p-6">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto p-3 rounded-xl bg-gradient-accent w-fit mb-4">
                <SearchCheck className="w-8 h-8 text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Global & Pro</CardTitle>
              <p className="text-muted-foreground">Advanced features for power users</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <SearchCheck className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Deep Insight Mode</p>
                  <p className="text-muted-foreground text-xs">Advanced analysis and synthesis</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Languages className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Multilingual Friendly</p>
                  <p className="text-muted-foreground text-xs">Create prompts in your native language</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center mb-20">
          <h3 className="text-3xl font-bold mb-4">How It Works</h3>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Three simple steps to transform your ideas into powerful AI prompts
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mb-6 shadow-glow-primary">
                <Edit3 className="w-8 h-8 text-primary-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-3">1. Enter Your Idea</h4>
              <p className="text-muted-foreground">
                Start with any question or task you want to give to AI
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-secondary flex items-center justify-center mb-6 shadow-glow-secondary">
                <Settings className="w-8 h-8 text-accent-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-3">2. Answer Quick Questions</h4>
              <p className="text-muted-foreground">
                We'll guide you through optimizing your prompt step by step
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-accent flex items-center justify-center mb-6 shadow-glow-accent">
                <Rocket className="w-8 h-8 text-accent-foreground" />
              </div>
              <h4 className="text-xl font-semibold mb-3">3. Get Optimized Prompt</h4>
              <p className="text-muted-foreground">
                Copy your enhanced prompt and get better AI results
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm border border-border/50 rounded-3xl p-12">
            <h3 className="text-3xl font-bold mb-4">Ready to master AI prompting?</h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already getting better results from their AI conversations
            </p>
            <Button 
              onClick={onStart}
              size="lg"
              className="bg-gradient-primary hover:shadow-glow-primary text-primary-foreground px-10 py-6 text-xl font-semibold transition-all duration-300 hover:scale-105 rounded-2xl"
            >
              <MessageSquare className="w-6 h-6 mr-3" />
              Start Your Journey
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}