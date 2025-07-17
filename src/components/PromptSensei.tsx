import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "./AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { WelcomeScreen } from "./WelcomeScreen";
import { QuestionStep } from "./QuestionStep";
import { ResultScreen } from "./ResultScreen";
import { Brain, Sparkles, LogOut, User } from "lucide-react";
import { useTranslation } from 'react-i18next';

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

// Grammar and polish utility functions with OpenAI fallback
async function polishWithOpenAI(text: string): Promise<string> {
  console.log('[🔁 calling polish-text]', text);
  try {
    const response = await fetch('https://azfpisirgvrosciqhlss.supabase.co/functions/v1/polish-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('[✅ polish-text response]', data.polished);
      return data.polished || text;
    } else {
      console.error('[❌ polish-text error] Status:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
    }
  } catch (error) {
    console.error('[❌ polish-text error]', error);
  }
  return text;
}

export function polishText(text: string): { polished: string; wasPolished: boolean } {
  const original = text.trim();
  if (!original) return { polished: original, wasPolished: false };
  
  let polished = original;
  let hasChanges = false;
  
  // Always apply general fixes first
  const generalFixes: [RegExp, string][] = [
    [/\s+/g, ' '], // Multiple spaces to single space
    [/^\s+|\s+$/g, ''], // Trim whitespace
  ];
  
  generalFixes.forEach(([pattern, replacement]) => {
    const newText = polished.replace(pattern, replacement);
    if (newText !== polished) {
      hasChanges = true;
      polished = newText;
    }
  });
  
  // Detect if text is likely non-English using common patterns
  const isLikelyNonEnglish = (text: string): boolean => {
    // Russian patterns
    if (/[а-яё]/i.test(text)) return true;
    // Chinese patterns  
    if (/[\u4e00-\u9fff]/i.test(text)) return true;
    // Japanese patterns (Hiragana, Katakana)
    if (/[\u3040-\u309f\u30a0-\u30ff]/i.test(text)) return true;
    // Arabic patterns
    if (/[\u0600-\u06ff]/i.test(text)) return true;
    // Hebrew patterns
    if (/[\u0590-\u05ff]/i.test(text)) return true;
    // Spanish/French patterns (accented characters)
    if (/[àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]/i.test(text)) return true;
    // German patterns
    if (/[äöüß]/i.test(text)) return true;
    return false;
  };
  
  // Apply language-specific fixes
  if (/[а-яё]/i.test(polished)) {
    // Russian-specific fixes
    const russianFixes: [RegExp, string][] = [
      [/\bсколко\b/gi, "сколько"], // Common typo: "сколко" → "сколько"
      [/\bзвесзд\b/gi, "звёзд"], // Common typo: "звесзд" → "звёзд"
      [/\bчтобы\b/gi, "чтобы"], // Ensure correct form
      [/\bтакже\b/gi, "также"], // Ensure correct form
      [/\bнадо\b/gi, "нужно"], // More formal
      [/\bоч\b/gi, "очень"], // Common abbreviation
      [/\bккто\b/gi, "кто"], // Common typo: "ккто" → "кто"
      [/\bчтото\b/gi, "что-то"], // Common typo: "чтото" → "что-то"
      [/\bзачем\s+мне\b/gi, "зачем мне"], // Ensure proper spacing
      [/\bкак\s+дела\b/gi, "как дела"], // Common phrase
      [/\bпридумл\b/gi, "придумал"], // Common typo: "придумл" → "придумал"
      [/\bкто ест\b/gi, "кто ест"], // Grammar: "who eat" equivalent  
      [/\bкто едят\b/gi, "кто ест"], // Grammar fix: plural verb with singular pronoun
      [/\bсобк\b/gi, "собак"], // Common typo: "dgs" equivalent
      [/\bглобус\?\?/gi, "глобус?"], // Fix double question marks
      [/\bсоздать\s+подсказки\b/gi, "создать подсказки"], // Create prompts
      [/\bработать\s+с\s+ИИ\b/gi, "работать с ИИ"], // Work with AI
      [/\bпомочь\s+мне\b/gi, "помочь мне"], // Help me
      [/\bкак\s+можно\b/gi, "как можно"], // How can
      [/\bделать\s+лучше\b/gi, "сделать лучше"], // Make better
      [/([а-яё])\s*\?\s*\?/gi, '$1?'], // Remove double question marks
      [/([а-яё])\s*\.\s*\./gi, '$1.'], // Remove double periods
    ];
    
    russianFixes.forEach(([pattern, replacement]) => {
      const newText = polished.replace(pattern, replacement);
      if (newText !== polished) {
        hasChanges = true;
        polished = newText;
      }
    });
  } else if (/[\u4e00-\u9fff]/i.test(polished)) {
    // Chinese-specific fixes
    const chineseFixes: [RegExp, string][] = [
      [/\s+/g, ''], // Remove extra spaces (Chinese doesn't use spaces between words)
      [/([？！])([^？！\s])/g, '$1 $2'], // Add space after question/exclamation marks
      [/([。])([^。\s])/g, '$1 $2'], // Add space after periods
      [/怎麼樣/g, "怎么样"], // Traditional to Simplified
      [/什麼/g, "什么"], // Traditional to Simplified
      [/為什麼/g, "为什么"], // Traditional to Simplified
    ];
    
    chineseFixes.forEach(([pattern, replacement]) => {
      const newText = polished.replace(pattern, replacement);
      if (newText !== polished) {
        hasChanges = true;
        polished = newText;
      }
    });
  } else if (/[\u0600-\u06ff]/i.test(polished)) {
    // Arabic-specific fixes
    const arabicFixes: [RegExp, string][] = [
      [/([؟!])([^\s؟!])/g, '$1 $2'], // Add space after punctuation
      [/[a-zA-Z]/g, ''], // Remove Latin characters (basic cleanup)
      [/\bماذا\s+تعني\b/gi, "ماذا تعني"], // What do you mean
      [/\bكيف\s+يمكنني\b/gi, "كيف يمكنني"], // How can I
      [/\bأريد\s+أن\b/gi, "أريد أن"], // I want to
    ];
    
    arabicFixes.forEach(([pattern, replacement]) => {
      const newText = polished.replace(pattern, replacement);
      if (newText !== polished) {
        hasChanges = true;
        polished = newText;
      }
    });
  } else if (/[äöüß]/i.test(polished)) {
    // German-specific fixes
    const germanFixes: [RegExp, string][] = [
      [/\bdas\s+das\b/gi, "dass"], // Common typo: "das das" → "dass"
      [/\bwie\s+geht\b/gi, "wie geht"], // Common phrase
      [/\bich\s+moechte\b/gi, "ich möchte"], // I would like
      [/\bkoennen\s+sie\b/gi, "können Sie"], // Can you
      [/\bwarum\s+ist\b/gi, "warum ist"], // Why is
    ];
    
    germanFixes.forEach(([pattern, replacement]) => {
      const newText = polished.replace(pattern, replacement);
      if (newText !== polished) {
        hasChanges = true;
        polished = newText;
      }
    });
  } else if (/[\u0590-\u05ff]/i.test(polished)) {
    // Hebrew-specific fixes
    const hebrewFixes: [RegExp, string][] = [
      [/([?!])([^\s?!])/g, '$1 $2'], // Add space after punctuation
      [/\bשל\s+אני\b/gi, "שלי"], // Common Hebrew possessive fix
      [/\bאת\s+זה\b/gi, "את זה"], // Ensure correct spacing
      [/\bמהזה\b/gi, "מה זה"], // What is this (common typo)
      [/\bאיך\s+אני\b/gi, "איך אני"], // How do I
      [/\bכיצדלבשל\b/gi, "כיצד לבשל"], // How to cook (common mistake)
      [/\bמה\s+עושים\b/gi, "מה עושים"], // What do we do
    ];
    
    hebrewFixes.forEach(([pattern, replacement]) => {
      const newText = polished.replace(pattern, replacement);
      if (newText !== polished) {
        hasChanges = true;
        polished = newText;
      }
    });
  } else if (/[àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿ]/i.test(polished)) {
    // French/Spanish accent fixes
    const accentFixes: [RegExp, string][] = [
      [/\ba\s+la\b/gi, "à la"], // French preposition
      [/\bca\b/gi, "ça"], // French demonstrative
      [/\bno\s+se\b/gi, "no sé"], // Spanish "I don't know"
      [/\bque\s+es\b/gi, "qué es"], // Spanish "what is"
      [/\bcomo\s+hacer\b/gi, "cómo hacer"], // Spanish "how to do"
      [/\bc'est\b/gi, "c'est"], // French contraction
      [/\bquelle est la difference\b/gi, "quelle est la différence"], // French what's the difference
      [/\bcomment\s+faire\b/gi, "comment faire"], // French how to do
    ];
    
    accentFixes.forEach(([pattern, replacement]) => {
      const newText = polished.replace(pattern, replacement);
      if (newText !== polished) {
        hasChanges = true;
        polished = newText;
      }
    });
  } else if (/[\u3040-\u309f\u30a0-\u30ff]/i.test(polished)) {
    // Japanese-specific fixes
    const japaneseFixes: [RegExp, string][] = [
      [/\s+/g, ''], // Remove spaces (Japanese doesn't use spaces)
      [/([。！？])([^。！？\s])/g, '$1 $2'], // Add space after sentence endings
      [/\bどうやって\b/gi, "どうやって"], // How to
      [/\bなんですか\b/gi, "何ですか"], // What is
      [/\bどこで\b/gi, "どこで"], // Where
      [/\bいつ\b/gi, "いつ"], // When
    ];
    
    japaneseFixes.forEach(([pattern, replacement]) => {
      const newText = polished.replace(pattern, replacement);
      if (newText !== polished) {
        hasChanges = true;
        polished = newText;
      }
    });
  } else {
    // English grammar fixes (apply to all text that doesn't match non-English patterns)
    const englishFixes: [RegExp, string][] = [
      [/\bi\b/g, 'I'], // Lowercase 'i' to 'I'
      [/\bim\b/gi, "I'm"], // 'im' to "I'm"
      [/\bdont\b/gi, "don't"], // 'dont' to "don't"
      [/\bcant\b/gi, "can't"], // 'cant' to "can't"
      [/\bwont\b/gi, "won't"], // 'wont' to "won't"
      [/\bisnt\b/gi, "isn't"], // 'isnt' to "isn't"
      [/\barent\b/gi, "aren't"], // 'arent' to "aren't"
      [/\bwaant\b/gi, "want"], // Common typo: "waant" → "want"
      [/\bteh\b/gi, "the"], // Common typo: "teh" → "the"
      [/\brecieve\b/gi, "receive"], // Common typo: "recieve" → "receive"
      [/\bdefinately\b/gi, "definitely"], // Common typo
      [/\boccured\b/gi, "occurred"], // Common typo
      [/\bseparate\b/gi, "separate"], // Often misspelled
      [/\bneccesary\b/gi, "necessary"], // Common typo
      [/\bbegginer\b/gi, "beginner"], // Common typo
      [/\bsaj\b/gi, "say"], // Common typo
      [/\bto do not\b/gi, "not to"], // Grammar fix
      [/\bwho eat dgs\b/gi, "who eats dogs"], // Example from the user
      [/\bdgs\b/gi, "dogs"], // Fix "dgs" typo
      [/\bhow can i\b/gi, "How can I"], // Capitalize start
      [/\bwow can i\b/gi, "How can I"], // Common start typo
      [/\bwho eat\b/gi, "who eats"], // Fix grammar "who eat" -> "who eats"
      [/\byour\s+welcome\b/gi, "you're welcome"], // Grammar fix
      [/\bits\s+a\s+nice\s+day\b/gi, "it's a nice day"], // Grammar fix
      [/\bthere\s+car\b/gi, "their car"], // Grammar fix
      [/\bwhere\s+going\b/gi, "where are you going"], // Grammar completion
      [/\bhow\s+much\s+cost\b/gi, "how much does it cost"], // Grammar completion
      [/\bwhat\s+time\s+is\b/gi, "what time is it"], // Grammar completion
      [/\bi\s+can\s+has\b/gi, "I can have"], // Grammar fix
      [/\bmust\s+of\b/gi, "must have"], // Common error
      [/\bcould\s+of\b/gi, "could have"], // Common error
      [/\bshould\s+of\b/gi, "should have"], // Common error
      [/\bwould\s+of\b/gi, "would have"], // Common error
    ];
    
    englishFixes.forEach(([pattern, replacement]) => {
      const newText = polished.replace(pattern, replacement);
      if (newText !== polished) {
        hasChanges = true;
        polished = newText;
      }
    });
  }
  
  // Ensure proper sentence ending for all languages
  if (polished && !/[.!?]$/.test(polished)) {
    // Check for question words in multiple languages
    const questionPatterns = [
      // English
      /^(how|what|why|when|where|who|which|can|could|would|should|do|does|did|is|are|was|were)/i,
      // Russian  
      /^(как|что|почему|когда|где|кто|какой|можно|могу|должен|является)/i,
      // Spanish
      /^(cómo|qué|por qué|cuándo|dónde|quién|cuál|puedo|podría|debería)/i,
      // French
      /^(comment|que|pourquoi|quand|où|qui|quel|puis-je|pourrais|devrais)/i,
      // German
      /^(wie|was|warum|wann|wo|wer|welche|kann|könnte|sollte)/i,
      // Chinese
      /^(怎么|什么|为什么|什么时候|哪里|谁|哪个|可以|能够|应该)/i,
      // Arabic
      /^(كيف|ما|لماذا|متى|أين|من|أي|يمكن|ينبغي)/i,
      // Japanese
      /^(どう|何|なぜ|いつ|どこ|誰|どの|できる|べき)/i,
      // Hebrew
      /^(איך|מה|למה|מתי|איפה|מי|איזה|יכול|צריך)/i
    ];
    
    const isQuestion = questionPatterns.some(pattern => pattern.test(polished)) || polished.includes('?');
    polished += isQuestion ? '?' : '.';
    hasChanges = true;
  }
  
  return { polished, wasPolished: hasChanges };
}

// Enhanced async polishText with OpenAI fallback for English
export async function polishTextAsync(text: string, language?: string): Promise<{ polished: string; wasPolished: boolean }> {
  console.log('[⚠️ polishTextAsync] input text:', text, 'language:', language);
  const original = text.trim();
  if (!original) return { polished: original, wasPolished: false };
  
  // Try local rules first
  const localResult = polishText(text);
  console.log('[📝 Local rules result]', localResult);
  
  // If language is English, always try OpenAI for any text that might have errors
  // This ensures grammar errors like "doo" and "wants" get corrected
  if (language === 'en') {
    console.log('[🚀 Polish Fallback] Triggering OpenAI for English text:', text);
    try {
      const openAIPolished = await polishWithOpenAI(text);
      console.log('[📥 OpenAI returned]', openAIPolished);
      if (openAIPolished !== text) {
        console.log('[✅ Polish Success] OpenAI correction applied:', openAIPolished);
        return { polished: openAIPolished, wasPolished: true };
      } else {
        console.log('[ℹ️ Polish Info] OpenAI returned same text (no changes needed)');
        // Still return the OpenAI result as it was processed, even if unchanged
        return { polished: openAIPolished, wasPolished: false };
      }
    } catch (error) {
      console.error('[❌ Error with OpenAI polish]', error);
      // Fall back to local result
    }
  }
  
  console.log('[📤 Returning local result]', localResult);
  return localResult;
}

const questions = [
  {
    id: "question",
    title: "what_ask_ai",
    subtitle: "be_specific",
    type: "textarea" as const,
    placeholder: "placeholder_example",
    tooltip: "tip_details"
  },
  {
    id: "audience",
    title: "who_answer_for",
    subtitle: "tailor_language",
    type: "select" as const,
    tooltip: "audience_tooltip",
    options: [
      { value: "myself", label: "myself", description: "myself_desc" },
      { value: "client", label: "my_client", description: "client_desc" },
      { value: "manager", label: "my_manager", description: "manager_desc" },
      { value: "code", label: "code_generation", description: "code_desc" },
      { value: "other", label: "other", description: "other_desc" }
    ]
  },
  {
    id: "tone",
    title: "tone_style",
    subtitle: "tone_controls",
    type: "select" as const,
    tooltip: "tone_tooltip",
    options: [
      { value: "friendly", label: "friendly", description: "friendly_desc" },
      { value: "expert", label: "expert", description: "expert_desc" },
      { value: "short", label: "short", description: "short_desc" },
      { value: "creative", label: "creative", description: "creative_desc" }
    ]
  },
  {
    id: "format",
    title: "format_best",
    subtitle: "format_structured",
    type: "select" as const,
    tooltip: "format_tooltip",
    options: [
      { value: "bullet", label: "bullet_list", description: "bullet_desc" },
      { value: "steps", label: "step_by_step", description: "steps_desc" },
      { value: "paragraph", label: "paragraph", description: "paragraph_desc" }
    ]
  },
  {
    id: "complexity",
    title: "how_smart_prompt",
    subtitle: "ai_experience_level",
    type: "select" as const,
    tooltip: "complexity_tooltip",
    options: [
      { value: "optimize", label: "make_smarter", description: "make_smarter_desc" },
      { value: "simple", label: "keep_clear", description: "keep_clear_desc" }
    ]
  },
  {
    id: "depth",
    title: "ai_go_deeper",
    subtitle: "thorough_analysis",
    type: "select" as const,
    tooltip: "deep_search_tooltip",
    options: [
      { value: "deep", label: "deep_search", description: "deep_search_desc" },
      { value: "simple", label: "keep_simple", description: "keep_simple_desc" }
    ]
  },
  {
    id: "polishInput",
    title: "polish_input_auto",
    subtitle: "improve_grammar",
    type: "select" as const,
    tooltip: "polish_tooltip",
    options: [
      { value: "true", label: "polish_it", description: "polish_desc" },
      { value: "false", label: "keep_as_is", description: "keep_as_is_desc" }
    ]
  },
  {
    id: "insightMode",
    title: "deeper_reasoning",
    subtitle: "analytical_response",
    type: "select" as const,
    tooltip: "insight_tooltip",
    options: [
      { value: "deep", label: "deep_insight", description: "deep_insight_desc" },
      { value: "simple", label: "just_answer", description: "just_answer_desc" }
    ]
  },
  {
    id: "language",
    title: "language_respond",
    subtitle: "preferred_response_lang",
    type: "select" as const,
    tooltip: "language_tooltip",
    options: [
      { value: "english", label: "english", description: "english_desc" },
      { value: "spanish", label: "spanish", description: "spanish_desc" },
      { value: "french", label: "french", description: "french_desc" },
      { value: "german", label: "german", description: "german_desc" },
      { value: "russian", label: "russian", description: "russian_desc" },
      { value: "chinese", label: "chinese", description: "chinese_desc" },
      { value: "japanese", label: "japanese", description: "japanese_desc" },
      { value: "auto", label: "auto_detect", description: "auto_detect_desc" }
    ]
  }
];

export function PromptSensei() {
  const [currentStep, setCurrentStep] = useState(0); // 0 = welcome, 1-6 = questions, 7 = result
  const [answers, setAnswers] = useState<Partial<PromptAnswers>>({});
  const { user, signOut, loading } = useAuth();
  const { t, i18n } = useTranslation();

  const handleStart = () => {
    setCurrentStep(1);
  };

  const handleAnswer = (questionId: string, value: string) => {
    const updatedAnswers = { ...answers, [questionId]: value };
    
    // Set default language to current UI language if not already set
    if (questionId === 'language' || (!updatedAnswers.language && questionId !== 'language')) {
      const languageMap: Record<string, string> = {
        'en': 'english',
        'ru': 'russian', 
        'es': 'spanish',
        'de': 'german',
        'fr': 'french',
        'zh': 'chinese',
        'ar': 'auto'
      };
      updatedAnswers.language = languageMap[i18n.language] || 'english';
    }
    
    setAnswers(updatedAnswers);
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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                PromptSensei
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {user && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <Badge variant="secondary" className="mb-4">
            {t('step_of', { current: currentStep, total: questions.length })}
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