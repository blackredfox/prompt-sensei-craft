import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { WelcomeScreen } from "./WelcomeScreen";
import { QuestionStep } from "./QuestionStep";
import { ResultScreen } from "./ResultScreen";
import { Brain, Sparkles } from "lucide-react";

export interface PromptAnswers {
  question: string;
  audience: string;
  tone: string;
  format: string;
  complexity: string;
  depth?: string;
  polishInput?: string; // "true" or "false" to match select options
  insightMode?: string;
  language?: string;
}

// Grammar and polish utility functions
export function polishText(text: string): { polished: string; wasPolished: boolean } {
  const original = text.trim();
  if (!original) return { polished: original, wasPolished: false };
  
  let polished = original;
  let hasChanges = false;
  
  // Common fixes - array of [pattern, replacement] pairs
  const fixes: [RegExp, string][] = [
    [/\s+/g, ' '], // Multiple spaces to single space
    [/\bi\b/g, 'I'], // Lowercase 'i' to 'I'
    [/\bim\b/gi, "I'm"], // 'im' to "I'm"
    [/\bdont\b/gi, "don't"], // 'dont' to "don't"
    [/\bcant\b/gi, "can't"], // 'cant' to "can't"
    [/\bwont\b/gi, "won't"], // 'wont' to "won't"
    [/\bisnt\b/gi, "isn't"], // 'isnt' to "isn't"
    [/\barent\b/gi, "aren't"], // 'arent' to "aren't"
    [/\bsaj\b/gi, "say"], // Common typo
    [/\bto do not\b/gi, "not to"], // Grammar fix
    [/\bwow can i\b/gi, "How can I"], // Common start
  ];
  
  fixes.forEach(([pattern, replacement]) => {
    const newText = polished.replace(pattern, replacement);
    if (newText !== polished) {
      hasChanges = true;
      polished = newText;
    }
  });
  
  // Capitalize first letter
  if (polished && polished[0] !== polished[0].toUpperCase()) {
    polished = polished[0].toUpperCase() + polished.slice(1);
    hasChanges = true;
  }
  
  // Ensure proper sentence ending
  if (polished && !/[.!?]$/.test(polished)) {
    polished += polished.includes('?') || polished.toLowerCase().startsWith('how') || 
               polished.toLowerCase().startsWith('what') || polished.toLowerCase().startsWith('why') ||
               polished.toLowerCase().startsWith('when') || polished.toLowerCase().startsWith('where') ? '?' : '.';
    hasChanges = true;
  }
  
  return { polished, wasPolished: hasChanges };
}

const questions = [
  {
    id: "question",
    title: "What do you want to ask the AI?",
    subtitle: "Be as specific as possible about what you need help with",
    type: "textarea" as const,
    placeholder: "e.g., Help me write a marketing email for my new product launch...",
    tooltip: "💡 Tip: The more details you provide, the more helpful the AI can be. Instead of 'Write resume', try 'Write resume for a junior frontend developer in fintech.'"
  },
  {
    id: "audience",
    title: "Who is the answer for?",
    subtitle: "This helps me tailor the language and detail level",
    type: "select" as const,
    tooltip: "Clients prefer polished and persuasive language, while personal use can be more casual. Choose Code Generation if you're using AI to write, refactor, or explain code — includes technical guidance and structured output",
    options: [
      { value: "myself", label: "Myself", description: "Personal use or learning" },
      { value: "client", label: "My client", description: "Professional deliverable" },
      { value: "manager", label: "My manager", description: "Work presentation or report" },
      { value: "code", label: "Code Generation", description: "Writing prompts for AI to generate or explain code" },
      { value: "other", label: "Other", description: "General audience" }
    ]
  },
  {
    id: "tone",
    title: "What tone or style do you prefer?",
    subtitle: "Tone controls how formal, casual or emotional the response sounds",
    type: "select" as const,
    tooltip: "Friendly = casual and warm. Expert = formal and authoritative. Short = concise and direct. Creative = imaginative and engaging",
    options: [
      { value: "friendly", label: "Friendly", description: "Conversational and approachable" },
      { value: "expert", label: "Expert", description: "Professional and authoritative" },
      { value: "short", label: "Short", description: "Concise and to the point" },
      { value: "creative", label: "Creative", description: "Imaginative and engaging" }
    ]
  },
  {
    id: "format",
    title: "What format would be best?",
    subtitle: "How would you like the information structured?",
    type: "select" as const,
    tooltip: "Bullet = overview and key points. Steps = process and tutorials. Paragraph = essay-style detailed explanations",
    options: [
      { value: "bullet", label: "Bullet list", description: "Great for summaries or key points" },
      { value: "steps", label: "Step-by-step", description: "Perfect for tutorials or walkthroughs" },
      { value: "paragraph", label: "Paragraph", description: "Detailed explanation" }
    ]
  },
  {
    id: "complexity",
    title: "How smart should I make this prompt?",
    subtitle: "Choose based on your AI experience level",
    type: "select" as const,
    tooltip: "Optimize adds structure, examples, and expert tone for better results. Keep it simple for straightforward responses",
    options: [
      { value: "optimize", label: "Make it smarter", description: "Add context, examples, and detailed instructions" },
      { value: "simple", label: "I'm new — keep it clear", description: "Direct and straightforward approach" }
    ]
  },
  {
    id: "depth",
    title: "Would you like the AI to go deeper?",
    subtitle: "Choose how thorough you want the AI's analysis to be",
    type: "select" as const,
    tooltip: "DeepSearch enables analytical thinking, comparisons, and research-based insights",
    options: [
      { value: "deep", label: "🔎 DeepSearch", description: "Let the AI explore sources, trends, comparisons, and give a smart, thoughtful response" },
      { value: "simple", label: "🎯 Keep it Simple", description: "Just answer my question clearly" }
    ]
  },
  {
    id: "polishInput",
    title: "Polish my input automatically?",
    subtitle: "Help improve grammar and clarity of your question",
    type: "select" as const,
    tooltip: "We'll gently fix common grammar mistakes and improve clarity while preserving your meaning",
    options: [
      { value: "true", label: "✨ Polish it", description: "Fix grammar and improve clarity automatically" },
      { value: "false", label: "💭 Keep as-is", description: "Use my exact wording" }
    ]
  },
  {
    id: "insightMode",
    title: "Would you like deeper reasoning in your answer?",
    subtitle: "Choose how analytical you want the AI's response to be",
    type: "select" as const,
    tooltip: "Deep Insight helps you get better analytical responses — ideal for complex topics, strategy, or research",
    options: [
      { value: "deep", label: "🔍 Deep Insight", description: "Ask the AI to analyze deeply, compare views, and provide real examples" },
      { value: "simple", label: "💬 Just Answer", description: "Keep it clear and to the point" }
    ]
  },
  {
    id: "language",
    title: "What language should the AI respond in?",
    subtitle: "Choose your preferred response language",
    type: "select" as const,
    tooltip: "Choose the language you'd like the AI to respond in. You can also let the system detect it automatically",
    options: [
      { value: "english", label: "English", description: "Respond in English" },
      { value: "spanish", label: "Spanish", description: "Respond in Spanish" },
      { value: "french", label: "French", description: "Respond in French" },
      { value: "russian", label: "Russian", description: "Respond in Russian" },
      { value: "auto", label: "Auto-detect", description: "Detect language from question" }
    ]
  }
];

export function PromptSensei() {
  const [currentStep, setCurrentStep] = useState(0); // 0 = welcome, 1-6 = questions, 7 = result
  const [answers, setAnswers] = useState<Partial<PromptAnswers>>({});

  const handleStart = () => {
    setCurrentStep(1);
  };

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      setCurrentStep(questions.length + 1); // Go to result
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
  };

  if (currentStep === 0) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (currentStep === questions.length + 1) {
    return <ResultScreen answers={answers as PromptAnswers} onRestart={handleRestart} />;
  }

  const currentQuestion = questions[currentStep - 1];
  const progress = (currentStep / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-gradient-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="container max-w-3xl mx-auto px-4 py-8 pt-16">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PromptSensei
            </span>
          </div>
          <Badge variant="secondary" className="mb-4">
            Step {currentStep} of {questions.length}
          </Badge>
        </div>

        <QuestionStep
          question={currentQuestion}
          answer={answers[currentQuestion.id as keyof PromptAnswers] as string || ""}
          onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
          onNext={handleNext}
          onBack={handleBack}
          isFirstStep={currentStep === 1}
          isLastStep={currentStep === questions.length}
          allAnswers={answers as Record<string, string>}
        />
      </div>
    </div>
  );
}