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
}

const questions = [
  {
    id: "question",
    title: "What do you want to ask the AI?",
    subtitle: "Be as specific as possible about what you need help with",
    type: "textarea" as const,
    placeholder: "e.g., Help me write a marketing email for my new product launch..."
  },
  {
    id: "audience",
    title: "Who is the answer for?",
    subtitle: "This helps me tailor the language and detail level",
    type: "select" as const,
    options: [
      { value: "myself", label: "Myself", description: "Personal use or learning" },
      { value: "client", label: "My client", description: "Professional deliverable" },
      { value: "manager", label: "My manager", description: "Work presentation or report" },
      { value: "other", label: "Other", description: "General audience" }
    ]
  },
  {
    id: "tone",
    title: "What tone or style do you prefer?",
    subtitle: "Choose the voice that fits your needs",
    type: "select" as const,
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
    options: [
      { value: "bullet", label: "Bullet list", description: "Easy to scan key points" },
      { value: "steps", label: "Step-by-step", description: "Sequential instructions" },
      { value: "paragraph", label: "Paragraph", description: "Detailed explanation" }
    ]
  },
  {
    id: "complexity",
    title: "Should I optimize this prompt or keep it simple?",
    subtitle: "Choose based on your AI experience level",
    type: "select" as const,
    options: [
      { value: "optimize", label: "Optimize", description: "Add context, examples, and detailed instructions" },
      { value: "simple", label: "Keep simple", description: "Direct and straightforward approach" }
    ]
  }
];

export function PromptSensei() {
  const [currentStep, setCurrentStep] = useState(0); // 0 = welcome, 1-5 = questions, 6 = result
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
          answer={answers[currentQuestion.id as keyof PromptAnswers] || ""}
          onAnswer={(value) => handleAnswer(currentQuestion.id, value)}
          onNext={handleNext}
          onBack={handleBack}
          isFirstStep={currentStep === 1}
          isLastStep={currentStep === questions.length}
        />
      </div>
    </div>
  );
}