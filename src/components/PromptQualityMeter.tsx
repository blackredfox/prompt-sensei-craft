import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, Target, Lightbulb, AlertCircle } from "lucide-react";

interface PromptQualityMeterProps {
  prompt: string;
  answers: {
    question: string;
    audience: string;
    tone: string;
    format: string;
    complexity: string;
    depth?: string;
    polishInput?: string;
  };
}

interface ScoreResult {
  score: number;
  tier: "Poor" | "Good" | "Great";
  suggestions: string[];
  breakdown: {
    length: number;
    persona: number;
    format: number;
    specificity: number;
    structure: number;
  };
}

function scorePrompt(prompt: string, answers: PromptQualityMeterProps["answers"]): ScoreResult {
  let score = 0;
  const suggestions: string[] = [];
  const breakdown = {
    length: 0,
    persona: 0,
    format: 0,
    specificity: 0,
    structure: 0
  };

  // 1. Length scoring (0-2 points)
  if (prompt.length > 50) {
    breakdown.length = 1;
    score += 1;
  }
  if (prompt.length > 150) {
    breakdown.length = 2;
    score += 1;
  } else if (prompt.length <= 50) {
    suggestions.push("Try being more specific about your goal or requirements");
  }

  // 2. Persona/Role presence (0-2 points)
  if (prompt.includes("Act as") || prompt.includes("You are") || prompt.includes("expert") || prompt.includes("assistant")) {
    breakdown.persona = 2;
    score += 2;
  } else if (answers.complexity === "optimize") {
    suggestions.push("Enable 'Make it smarter' for automatic expert role detection");
  }

  // 3. Format specification (0-2 points)
  if (prompt.includes("bullet") || prompt.includes("step") || prompt.includes("list") || prompt.includes("paragraph")) {
    breakdown.format = 2;
    score += 2;
  } else {
    suggestions.push("Add format specification like bullet points or step-by-step");
  }

  // 4. Specificity (0-2 points)
  const specificityWords = ["specific", "detailed", "examples", "include", "please provide", "explain how", "show me"];
  const hasSpecificity = specificityWords.some(word => prompt.toLowerCase().includes(word.toLowerCase()));
  if (hasSpecificity) {
    breakdown.specificity = 2;
    score += 2;
  } else {
    suggestions.push("Add specific requests like 'include examples' or 'explain how'");
  }

  // 5. Structure and context (0-2 points)
  if (prompt.includes("audience") || prompt.includes("client") || prompt.includes("manager") || answers.depth === "deep") {
    breakdown.structure = 2;
    score += 2;
  } else if (answers.complexity === "simple") {
    breakdown.structure = 1;
    score += 1;
  } else {
    suggestions.push("Consider specifying your audience or enabling DeepSearch mode");
  }

  // Grammar and polish bonus
  if (answers.polishInput === "true") {
    score += 1; // Bonus for using polish feature
  }

  // Determine tier
  let tier: "Poor" | "Good" | "Great";
  if (score >= 8) tier = "Great";
  else if (score >= 5) tier = "Good";
  else tier = "Poor";

  return { score: Math.min(score, 10), tier, suggestions, breakdown };
}

export function PromptQualityMeter({ prompt, answers }: PromptQualityMeterProps) {
  const result = scorePrompt(prompt, answers);
  
  const getColorClass = (tier: string) => {
    switch (tier) {
      case "Great": return "text-green-600 dark:text-green-400";
      case "Good": return "text-yellow-600 dark:text-yellow-400";
      case "Poor": return "text-red-600 dark:text-red-400";
      default: return "text-muted-foreground";
    }
  };

  const getBadgeVariant = (tier: string) => {
    switch (tier) {
      case "Great": return "default";
      case "Good": return "secondary";
      case "Poor": return "destructive";
      default: return "outline";
    }
  };

  const getProgressColor = (tier: string) => {
    switch (tier) {
      case "Great": return "bg-green-500";
      case "Good": return "bg-yellow-500";
      case "Poor": return "bg-red-500";
      default: return "bg-muted";
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Prompt Quality Score</CardTitle>
          </div>
          <Badge variant={getBadgeVariant(result.tier)} className="font-medium">
            {result.tier}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score Display */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Score</span>
              <span className={`text-2xl font-bold ${getColorClass(result.tier)}`}>
                {result.score}/10
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(result.tier)}`}
                style={{ width: `${(result.score / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Length & Detail:</span>
            <span className="font-medium">{result.breakdown.length}/2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Expert Role:</span>
            <span className="font-medium">{result.breakdown.persona}/2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Format Clarity:</span>
            <span className="font-medium">{result.breakdown.format}/2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Specificity:</span>
            <span className="font-medium">{result.breakdown.specificity}/2</span>
          </div>
        </div>

        {/* Suggestions for improvement */}
        {result.suggestions.length > 0 && result.score < 8 && (
          <div className="mt-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                  💡 Ways to improve your prompt:
                </h4>
                <ul className="text-xs text-orange-600 dark:text-orange-400 space-y-1">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-1">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Success message for high scores */}
        {result.score >= 8 && (
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Excellent prompt!</strong> This should generate high-quality, targeted responses from any AI assistant.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}