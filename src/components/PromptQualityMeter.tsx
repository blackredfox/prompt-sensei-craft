import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gauge, Target, Lightbulb, AlertCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';

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
    language?: string;
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

function scorePrompt(prompt: string, answers: PromptQualityMeterProps["answers"], t: any): ScoreResult {
  let score = 0;
  const suggestions: string[] = [];
  const breakdown = {
    length: 0,
    persona: 0,
    format: 0,
    specificity: 0,
    structure: 0
  };
  
  // Detect if this is a non-English prompt and adjust scoring accordingly
  const isNonEnglishPrompt = () => {
    const language = answers.language;
    if (language && language !== 'english' && language !== 'auto') return true;
    
    // Also check for non-Latin scripts
    return /[а-яё\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\u0600-\u06ff\u0590-\u05ff]/i.test(prompt);
  };
  
  const isNonEnglish = isNonEnglishPrompt();

  // 1. Length scoring (0-2 points)
  if (prompt.length > 50) {
    breakdown.length = 1;
    score += 1;
  }
  if (prompt.length > 150) {
    breakdown.length = 2;
    score += 1;
  } else if (prompt.length <= 50) {
    suggestions.push(t('adaptive_feedback_length'));
  }

  // Check if this is a beginner-friendly prompt
  const isBeginnerPrompt = answers.tone === "I'm new" || answers.tone === "beginner";

  // 2. Persona/Role presence (0-2 points) - Language-aware
  const personaPatterns = isNonEnglish ? [
    // Russian
    /действуй как|ты.*эксперт|ты.*специалист|помощник/i,
    // Spanish
    /actúa como|eres.*experto|eres.*especialista|asistente/i,
    // French
    /agis comme|tu es.*expert|tu es.*spécialiste|assistant/i,
    // German
    /handele als|du bist.*experte|du bist.*spezialist|assistent/i,
    // Chinese
    /扮演|你是.*专家|你是.*助手/i,
    // Arabic
    /تصرف كما|أنت.*خبير|أنت.*مساعد/i,
    // Japanese
    /として行動|あなたは.*専門家|あなたは.*アシスタント/i,
    // Hebrew
    /פעל כמו|אתה.*מומחה|אתה.*עוזר/i
  ] : [/Act as|You are.*expert|You are.*assistant|expert|assistant/i];
  
  const hasPersona = personaPatterns.some(pattern => pattern.test(prompt));
  if (hasPersona) {
    breakdown.persona = 2;
    score += 2;
  } else if (answers.complexity === "optimize" && !isBeginnerPrompt) {
    // Don't penalize beginner prompts for lack of persona
    suggestions.push(t('adaptive_feedback_persona'));
  }

  // 3. Format specification (0-2 points) - Language-aware
  const formatPatterns = isNonEnglish ? [
    // Russian
    /список|пункт|шаг|абзац|маркированный/i,
    // Spanish
    /lista|punto|paso|párrafo|viñeta/i,
    // French
    /liste|point|étape|paragraphe|puce/i,
    // German
    /liste|punkt|schritt|absatz|aufzählung/i,
    // Chinese
    /列表|要点|步骤|段落|项目/i,
    // Arabic
    /قائمة|نقطة|خطوة|فقرة/i,
    // Japanese
    /リスト|箇条書き|ステップ|段落/i,
    // Hebrew
    /רשימה|נקודה|שלב|פסקה/i
  ] : [/bullet|step|list|paragraph/i];
  
  const hasFormat = formatPatterns.some(pattern => pattern.test(prompt));
  if (hasFormat) {
    breakdown.format = 2;
    score += 2;
  } else {
    suggestions.push(t('adaptive_feedback_format'));
  }

  // 4. Specificity (0-2 points) - Language-aware
  const specificityPatterns = isNonEnglish ? [
    // Russian
    /конкретн|подробн|пример|включи|объясни как|покажи/i,
    // Spanish
    /específico|detallado|ejemplo|incluye|explica cómo|muestra/i,
    // French
    /spécifique|détaillé|exemple|inclure|expliquer comment|montrer/i,
    // German
    /spezifisch|detailliert|beispiel|einschließen|erkläre wie|zeige/i,
    // Chinese
    /具体|详细|例子|包括|解释如何|显示/i,
    // Arabic
    /محدد|مفصل|مثال|تضمين|اشرح كيف|أظهر/i,
    // Japanese
    /具体的|詳細|例|含める|説明して|見せて/i,
    // Hebrew
    /ספציפי|מפורט|דוגמה|כלול|הסבר איך|הראה/i
  ] : [/specific|detailed|examples|include|please provide|explain how|show me/i];
  
  const hasSpecificity = specificityPatterns.some(pattern => pattern.test(prompt));
  if (hasSpecificity) {
    breakdown.specificity = 2;
    score += 2;
  } else {
    suggestions.push(t('adaptive_feedback_specificity'));
  }

  // 5. Structure and context (0-2 points) - Language-aware
  const contextPatterns = isNonEnglish ? [
    // Russian
    /аудитория|клиент|менеджер|руководитель/i,
    // Spanish
    /audiencia|cliente|gerente|jefe/i,
    // French
    /audience|client|gestionnaire|patron/i,
    // German
    /publikum|kunde|manager|chef/i,
    // Chinese
    /受众|客户|经理|老板/i,
    // Arabic
    /جمهور|عميل|مدير|رئيس/i,
    // Japanese
    /オーディエンス|クライアント|マネージャー|上司/i,
    // Hebrew
    /קהל|לקוח|מנהל|בוס/i
  ] : [/audience|client|manager/i];
  
  // Check for beginner-friendly clarity suffixes
  const beginnerClarityPatterns = isNonEnglish ? [
    // Russian
    /доступно для новичков|избегайте чрезмерных упрощений|ясно и доступно/i,
    // Spanish
    /fácil para principiantes|evite simplificaciones excesivas|clara y fácil/i,
    // French
    /accessible aux débutants|évitez les simplifications excessives|claire et accessible/i,
    // German
    /anfängerfreundlich|vermeiden Sie zu starke Vereinfachung|klar und anfängerfreundlich/i,
    // Chinese
    /适合初学者|避免过度简化|清晰.*适合初学者/i,
    // Arabic
    /سهلة للمبتدئين|تجنب التبسيط الزائد|واضحة وسهلة/i,
    // Japanese
    /初心者.*わかる|過度な単純化は避け|わかりやすく/i,
    // Hebrew
    /פשוטה למתחילים|הימנע מפישוט יתר|ברורה ופשוטה/i
  ] : [/beginner-friendly|avoid oversimplification|clear and beginner/i];
  
  const hasBeginnerClarity = beginnerClarityPatterns.some(pattern => pattern.test(prompt));
  const hasContext = contextPatterns.some(pattern => pattern.test(prompt)) || answers.depth === "deep";
  
  if (hasContext) {
    breakdown.structure = 2;
    score += 2;
  } else if (answers.complexity === "simple" || (isBeginnerPrompt && hasBeginnerClarity)) {
    // Give credit for beginner prompts with clarity suffixes
    breakdown.structure = 1;
    score += 1;
  } else {
    suggestions.push(t('adaptive_feedback_context'));
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
  const { t } = useTranslation();
  const result = scorePrompt(prompt, answers, t);
  
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
            <CardTitle className="text-lg">{t('prompt_quality_score')}</CardTitle>
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
              <span className="text-sm font-medium">{t('score')}</span>
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

        {/* Beginner tip - positioned above breakdown for better visibility */}
        {result.score <= 7 && (answers.tone === "I'm new" || answers.tone === "beginner") && (
          <div className="mt-6 p-4 rounded-lg bg-blue-100 dark:bg-blue-950/30 border-2 border-blue-500/40 dark:border-blue-400/40">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">
                  {t('beginner_tip_title')}
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {t('beginner_tip_body')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('length_detail')}:</span>
            <span className="font-medium">{result.breakdown.length}/2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('expert_role')}:</span>
            <span className="font-medium">{result.breakdown.persona}/2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('format_clarity')}:</span>
            <span className="font-medium">{result.breakdown.format}/2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t('specificity')}:</span>
            <span className="font-medium">{result.breakdown.specificity}/2</span>
          </div>
        </div>

        {/* Suggestions for improvement */}
        {result.suggestions.length > 0 && result.score < 8 && !(answers.tone === "I'm new" || answers.tone === "beginner") && (
          <div className="mt-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                  💡 {t('ways_to_improve')}:
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
                <strong>{t('excellent_prompt')}!</strong> {t('excellent_prompt_desc')}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}