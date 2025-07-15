import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Check, HelpCircle, AlertTriangle } from "lucide-react";

interface Question {
  id: string;
  title: string;
  subtitle: string;
  type: "textarea" | "select";
  placeholder?: string;
  tooltip?: string;
  options?: {
    value: string;
    label: string;
    description: string;
  }[];
}

interface QuestionStepProps {
  question: Question;
  answer: string;
  onAnswer: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  allAnswers?: Record<string, string>;
}

export function QuestionStep({
  question,
  answer,
  onAnswer,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  allAnswers = {}
}: QuestionStepProps) {
  const canProceed = answer.trim().length > 0;

  // Adaptive feedback logic
  const getAdaptiveFeedback = () => {
    if (question.id === "tone" && allAnswers.audience === "manager" && answer === "friendly") {
      return {
        type: "suggestion",
        message: "💼 Would you prefer to keep it more professional? That's often better for manager-level communication."
      };
    }
    if (question.id === "tone" && allAnswers.audience === "client" && answer === "short") {
      return {
        type: "suggestion", 
        message: "📋 Consider 'Expert' tone for client work - it builds confidence and trust."
      };
    }
    return null;
  };

  const adaptiveFeedback = getAdaptiveFeedback();

  return (
    <div className="space-y-8">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-glow-secondary">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
            {question.title}
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            {question.subtitle}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {question.type === "textarea" ? (
            <div>
              <Textarea
                value={answer}
                onChange={(e) => onAnswer(e.target.value)}
                placeholder={question.placeholder}
                className="min-h-32 resize-none border-border/50 bg-background/50 focus:border-primary focus:ring-primary text-lg"
              />
              {question.tooltip && (
                <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <HelpCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {question.tooltip}
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Be as detailed as possible for better results
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {question.options?.map((option) => (
                <Card
                  key={option.value}
                  className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-glow-secondary ${
                    answer === option.value 
                      ? 'border-primary bg-primary/10 shadow-glow-primary' 
                      : 'border-border/50 hover:border-primary/50'
                  }`}
                  onClick={() => onAnswer(option.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {option.label}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      {answer === option.value && (
                        <div className="p-1 rounded-full bg-gradient-primary">
                          <Check className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Tooltip for select questions */}
              {question.tooltip && (
                <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <HelpCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    {question.tooltip}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Adaptive Feedback */}
          {adaptiveFeedback && answer && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {adaptiveFeedback.message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isFirstStep}
          className="border-border/50 hover:border-primary/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={onNext}
          disabled={!canProceed}
          className={`${canProceed 
            ? 'bg-gradient-primary hover:shadow-glow-primary text-primary-foreground' 
            : 'bg-muted text-muted-foreground'
          } transition-all duration-300`}
        >
          {isLastStep ? (
            <>
              Show me my perfect prompt
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}