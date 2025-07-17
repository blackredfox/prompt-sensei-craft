import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PromptAnswers, polishText, polishTextAsync } from "./PromptSensei";
import { PromptQualityMeter } from "./PromptQualityMeter";
import { usePromptLibrary } from "@/hooks/usePromptLibrary";
import { Copy, CheckCheck, RotateCcw, Lightbulb, Sparkles, ExternalLink, Info, Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OpenInButtons } from "./OpenInButtons";
import { askOpenAI } from "@/services/prompt-service";
import { useTranslation } from 'react-i18next';

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

async function generateOptimizedPrompt(answers: PromptAnswers, t: any, currentLanguage: string): Promise<{ prompt: string; explanation: string; polishInfo?: { original: string; polished: string }; polishAttempted?: boolean }> {
  const { question, audience, tone, format, complexity, depth, polishInput, insightMode, language } = answers;
  
  // Polish the question - always try for English, or if explicitly requested
  let finalQuestion = question;
  let polishInfo: { original: string; polished: string } | undefined;
  let polishAttempted = false;
  
  // Always attempt polish for English language, or if user explicitly requested it
  if (currentLanguage === 'en' || polishInput === "true") {
    polishAttempted = true;
    console.log('[⚠️ Attempting to polish]', question, 'Language:', currentLanguage);
    const { polished, wasPolished } = await polishTextAsync(question, currentLanguage);
    if (wasPolished) {
      console.log('[✅ Polish success]', polished);
      polishInfo = { original: question, polished };
      finalQuestion = polished;
    } else {
      console.log('[ℹ️ Polish unchanged]', question);
    }
  }
  
  let prompt = "";
  let explanation = "";

  // Language mapping for building prompts in the target language
  const languageMap: Record<string, string> = {
    english: "English",
    spanish: "Spanish", 
    french: "French",
    german: "German",
    russian: "Russian",
    chinese: "Chinese",
    japanese: "Japanese"
  };
  
  // Determine the target language for the prompt construction
  const promptLanguage = language && language !== "auto" ? language : 
    currentLanguage === 'ru' ? 'russian' :
    currentLanguage === 'es' ? 'spanish' :
    currentLanguage === 'fr' ? 'french' :
    currentLanguage === 'de' ? 'german' :
    currentLanguage === 'zh' ? 'chinese' :
    currentLanguage === 'ar' ? 'auto' : 
    'english';
  
  const targetLanguage = languageMap[promptLanguage] || "English";
  const isEnglish = promptLanguage === 'english';

  // Localized prompt segments based on UI language
  const localizedPrompts = {
    ru: {
      persona: {
        expert: "Вы эксперт-консультант с глубокими знаниями в своей области. ",
        friendly: "Вы полезный и дружелюбный помощник, который ясно объясняет вещи. ",
        creative: "Вы творческий и инновационный помощник, который мыслит нестандартно. ",
        short: "Вы лаконичный помощник, который сразу переходит к сути. "
      },
      audience: {
        client: " Этот ответ будет передан клиенту, поэтому, пожалуйста, убедитесь, что он профессиональный и отполированный.",
        manager: " Это для презентации руководству, поэтому сосредоточьтесь на ключевых выводах и практических рекомендациях.",
        myself: " Это для моего личного понимания, поэтому не стесняйтесь включать подробные объяснения и контекст.",
        code: " Вы старший программист. Пожалуйста, пишите чистый, хорошо документированный код и включайте комментарии и объяснения где это необходимо.",
        other: " Пожалуйста, сделайте ответ доступным для общей аудитории."
      },
      format: {
        bullet: " Пожалуйста, оформите ваш ответ в виде чёткого маркированного списка с ключевыми пунктами.",
        steps: " Пожалуйста, предоставьте пошаговый ответ с пронумерованными инструкциями.",
        paragraph: " Пожалуйста, предоставьте подробный ответ в формате абзаца."
      },
      tone: {
        short: " Сделайте ответ лаконичным и избегайте ненужных деталей.",
        creative: " Не стесняйтесь включать творческие примеры и инновационные подходы.",
        expert: " Включите соответствующие технические детали и профессиональные выводы.",
        friendly: " Используйте тёплый, разговорный тон, который легко понять."
      }
    },
    es: {
      persona: {
        expert: "Eres un consultor experto con conocimientos profundos en tu campo. ",
        friendly: "Eres un asistente útil y amigable que explica las cosas claramente. ",
        creative: "Eres un asistente creativo e innovador que piensa fuera de la caja. ",
        short: "Eres un asistente conciso que va directo al grano. "
      },
      audience: {
        client: " Esta respuesta será compartida con un cliente, así que asegúrate de que sea profesional y pulida.",
        manager: " Esto es para una presentación a la gerencia, así que enfócate en insights clave y recomendaciones accionables.",
        myself: " Esto es para mi comprensión personal, así que siéntete libre de incluir explicaciones detalladas y contexto.",
        code: " Eres un ingeniero de software senior. Por favor escribe código limpio y bien documentado, e incluye comentarios y explicaciones cuando sea relevante.",
        other: " Por favor haz la respuesta accesible para una audiencia general."
      },
      format: {
        bullet: " Por favor formatea tu respuesta como una lista de viñetas clara con puntos clave.",
        steps: " Por favor proporciona una respuesta paso a paso con instrucciones numeradas.",
        paragraph: " Por favor proporciona una respuesta detallada en formato de párrafo."
      },
      tone: {
        short: " Mantén la respuesta concisa y evita detalles innecesarios.",
        creative: " Siéntete libre de incluir ejemplos creativos y enfoques innovadores.",
        expert: " Incluye detalles técnicos relevantes e insights profesionales.",
        friendly: " Usa un tono cálido y conversacional que sea fácil de entender."
      }
    }
  };

  // Get localized strings or fall back to English
  const currentLocalizedPrompts = localizedPrompts[currentLanguage as keyof typeof localizedPrompts];

  // Expert role enrichment for professional tone with deep insight/analysis needs
  const shouldAddExpertRole = tone === "professional" && 
    (insightMode === "deep" || depth === "deep") &&
    !finalQuestion.toLowerCase().includes("expert") && 
    !finalQuestion.toLowerCase().includes("консультант") &&
    !finalQuestion.toLowerCase().includes("experto") &&
    !finalQuestion.toLowerCase().includes("consultant");

  // Expert role prefixes by language
  const expertRolePrefixes = {
    en: "You are an expert consultant with deep knowledge in your field. ",
    ru: "Вы — эксперт-консультант с глубокими знаниями в своей области. ",
    es: "Eres un consultor experto con un profundo conocimiento en tu campo. ",
    de: "Du bist ein fachkundiger Berater mit umfassendem Wissen auf deinem Gebiet. ",
    fr: "Vous êtes un consultant expert avec une connaissance approfondie dans votre domaine. ",
    zh: "您是该领域具有深厚知识的专家顾问。",
    ar: "أنت مستشار خبير ذو معرفة عميقة في مجالك. ",
    ja: "あなたは、専門分野に深い知識を持つエキスパートコンサルタントです。",
    he: "אתה יועץ מומחה בעל ידע מעמיק בתחום שלך. "
  };

  // Check if this is a beginner-friendly prompt
  const isBeginnerPrompt = tone === "I'm new" || tone === "beginner";
  
  // Auto-detect persona first and add it at the beginning for Russian
  const detectedPersona = detectPersona(finalQuestion);
  let hasPersona = false;
  let expertRoleAdded = false;
  
  if (detectedPersona && complexity === "optimize") {
    prompt += detectedPersona;
    hasPersona = true;
  } else if (shouldAddExpertRole && complexity === "optimize" && !isBeginnerPrompt) {
    // Add expert role enrichment (but not for beginner prompts)
    const expertPrefix = expertRolePrefixes[currentLanguage as keyof typeof expertRolePrefixes] || expertRolePrefixes.en;
    prompt += expertPrefix;
    hasPersona = true;
    expertRoleAdded = true;
  } else if (complexity === "optimize") {
    // Use localized persona or fallback to English
    if (currentLocalizedPrompts?.persona[tone as keyof typeof currentLocalizedPrompts.persona]) {
      prompt += currentLocalizedPrompts.persona[tone as keyof typeof currentLocalizedPrompts.persona];
      hasPersona = true;
    } else {
      // Fallback to English
      switch (tone) {
        case "expert":
        case "professional":
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
      hasPersona = true;
    }
  }

  // Add the main question - for Russian, improve structure
  if (currentLanguage === 'ru') {
    // For Russian, ensure proper sentence order: persona first, then question
    prompt += finalQuestion.trim();
    if (!finalQuestion.trim().endsWith("?") && !finalQuestion.trim().endsWith(".")) {
      prompt += ".";
    }
  } else {
    // For other languages, keep existing structure
    prompt += finalQuestion.trim();
    if (!finalQuestion.trim().endsWith("?") && !finalQuestion.trim().endsWith(".")) {
      prompt += ".";
    }
  }

  // Add audience context with localization
  if (complexity === "optimize") {
    if (currentLocalizedPrompts?.audience[audience as keyof typeof currentLocalizedPrompts.audience]) {
      prompt += currentLocalizedPrompts.audience[audience as keyof typeof currentLocalizedPrompts.audience];
    } else {
      // Fallback to English
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
        case "code":
          prompt += " You are a senior software engineer. Please write clean, well-documented code, and include comments and explanations where relevant.";
          break;
        case "other":
          prompt += " Please make the response accessible to a general audience.";
          break;
      }
    }
  }

  // Add format requirements with localization
  if (currentLocalizedPrompts?.format[format as keyof typeof currentLocalizedPrompts.format]) {
    prompt += currentLocalizedPrompts.format[format as keyof typeof currentLocalizedPrompts.format];
  } else {
    // Fallback to English
    switch (format) {
      case "bullet":
        prompt += " Please format your response as a clear bullet list with key points.";
        break;
      case "steps":
        if (audience === "code") {
          prompt += " Break down your response into logical code blocks and describe each step clearly.";
        } else {
          prompt += " Please provide a step-by-step response with numbered instructions.";
        }
        break;
      case "paragraph":
        prompt += " Please provide a detailed response in paragraph format.";
        break;
    }
  }

  // Add tone refinements with localization
  if (complexity === "optimize") {
    if (currentLocalizedPrompts?.tone[tone as keyof typeof currentLocalizedPrompts.tone]) {
      prompt += currentLocalizedPrompts.tone[tone as keyof typeof currentLocalizedPrompts.tone];
    } else {
      // Fallback to English
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
  }

  // Add DeepSearch modifier (localized)
  if (depth === "deep") {
    if (currentLanguage === 'ru') {
      if (audience === "code") {
        prompt += " Включите крайние случаи, соображения производительности и лучшие практики, если применимо. Проанализируйте тему широко и предоставьте подробные объяснения.";
      } else {
        prompt += " Включите выводы, основанные на исследованиях, сравнения, ссылки или реальные примеры по мере необходимости. Проанализируйте тему широко и предоставьте подробные объяснения.";
      }
    } else if (currentLanguage === 'es') {
      if (audience === "code") {
        prompt += " Incluye casos extremos, consideraciones de rendimiento y mejores prácticas si es aplicable. Analiza el tema ampliamente y proporciona explicaciones completas.";
      } else {
        prompt += " Incluye insights basados en investigación, comparaciones, referencias o ejemplos del mundo real según sea necesario. Analiza el tema ampliamente y proporciona explicaciones completas.";
      }
    } else {
      if (audience === "code") {
        prompt += " Include edge cases, performance considerations, and best practices if applicable. Analyze the topic broadly and provide thorough explanations.";
      } else {
        prompt += " Include research-based insights, comparisons, references, or real-world examples as needed. Analyze the topic broadly and provide thorough explanations.";
      }
    }
  }

  // Add Deep Insight Mode (localized)
  if (insightMode === "deep") {
    if (currentLanguage === 'ru') {
      prompt += " Анализируйте глубоко. Сравнивайте перспективы. Предоставляйте реальные примеры и рассуждения за вашим ответом.";
    } else if (currentLanguage === 'es') {
      prompt += " Analiza profundamente. Compara perspectivas. Proporciona ejemplos del mundo real y razonamiento detrás de tu respuesta.";
    } else {
      prompt += " Analyze deeply. Compare perspectives. Provide real-world examples and reasoning behind your answer.";
    }
  }

  // Add clarity and structure suffix for expert role enrichment or beginner-friendly prompts
  let expertClaritySuffix = "";
  
  if (expertRoleAdded) {
    const clarityStructureSuffixes = {
      en: " Please provide a step-by-step response with numbered instructions. Respond in clear, fluent English.",
      ru: " Пожалуйста, дайте пошаговый ответ с нумерованными инструкциями. Ответьте ясно и грамотно.",
      es: " Por favor, proporciona una respuesta paso a paso con instrucciones numeradas. Responde con claridad y fluidez.",
      de: " Bitte geben Sie eine schrittweise Antwort mit nummerierten Anweisungen. Antworten Sie klar und flüssig.",
      fr: " Veuillez fournir une réponse étape par étape avec des instructions numérotées. Répondez clairement et avec fluidité.",
      zh: " 请提供带编号的分步骤回答。用清晰、流利的语言作答。",
      ar: " يرجى تقديم إجابة خطوة بخطوة مع تعليمات مرقمة. أجب بلغة واضحة وطليقة.",
      ja: " 番号付きのステップバイステップの回答を提供してください。明確で流暢な日本語で答えてください。",
      he: " אנא ספק תגובה שלב אחר שלב עם הוראות ממוספרות. השב בעברית ברורה ורהוטה."
    };
    
    expertClaritySuffix = clarityStructureSuffixes[currentLanguage as keyof typeof clarityStructureSuffixes] || clarityStructureSuffixes.en;
  } else if (isBeginnerPrompt && polishInput === "true") {
    // Add beginner-friendly clarity suffix when polish is enabled but no expert role is added
    const newbieFriendlySuffixes = {
      en: " Please explain this in a clear and beginner-friendly way. Avoid oversimplification.",
      ru: " Поясните это ясно и доступно для новичков. Избегайте чрезмерных упрощений.",
      es: " Explique esto de manera clara y fácil para principiantes. Evite simplificaciones excesivas.",
      de: " Erklären Sie dies klar und anfängerfreundlich. Vermeiden Sie zu starke Vereinfachung.",
      fr: " Expliquez cela de manière claire et accessible aux débutants. Évitez les simplifications excessives.",
      zh: " 请用清晰、适合初学者的方式解释。避免过度简化。",
      ar: " يرجى الشرح بطريقة واضحة وسهلة للمبتدئين. تجنب التبسيط الزائد.",
      ja: " 初心者にもわかるように、わかりやすく説明してください。過度な単純化は避けてください。",
      he: " אנא הסבר בצורה ברורה ופשוטה למתחילים. הימנע מפישוט יתר."
    };
    
    expertClaritySuffix = newbieFriendlySuffixes[currentLanguage as keyof typeof newbieFriendlySuffixes] || newbieFriendlySuffixes.en;
  }

  // Add language preference with enhanced instructions for all languages
  if (!isEnglish) {
    if (currentLanguage === 'ru') {
      prompt += ` ВАЖНО: Отвечайте полностью на русском языке. Используйте родной уровень русского языка с правильной грамматикой, культурным контекстом и идиоматическими выражениями. Если первоначальный вопрос был на английском или другом языке, переведите ваше понимание и отвечайте полностью на русском языке. Убедитесь, что все объяснения, примеры и детали культурно подходят для русскоязычных.`;
    } else if (currentLanguage === 'es') {
      prompt += ` IMPORTANTE: Responde completamente en español. Usa español de nivel nativo con gramática adecuada, contexto cultural y expresiones idiomáticas. Si la pregunta original estaba en inglés u otro idioma, traduce tu comprensión y responde completamente en español. Asegúrate de que todas las explicaciones, ejemplos y detalles sean culturalmente apropiados para hablantes de español.`;
    } else if (currentLanguage === 'fr') {
      prompt += ` IMPORTANT: Répondez entièrement en français. Utilisez un français de niveau natif avec une grammaire appropriée, un contexte culturel et des expressions idiomatiques. Si la question originale était en anglais ou dans une autre langue, traduisez votre compréhension et répondez entièrement en français. Assurez-vous que toutes les explications, exemples et détails sont culturellement appropriés pour les francophones.`;
    } else if (currentLanguage === 'de') {
      prompt += ` WICHTIG: Antworten Sie vollständig auf Deutsch. Verwenden Sie muttersprachliches Deutsch mit angemessener Grammatik, kulturellem Kontext und idiomatischen Ausdrücken. Wenn die ursprüngliche Frage auf Englisch oder in einer anderen Sprache war, übersetzen Sie Ihr Verständnis und antworten Sie vollständig auf Deutsch. Stellen Sie sicher, dass alle Erklärungen, Beispiele und Details kulturell für deutsche Sprecher geeignet sind.`;
    } else if (currentLanguage === 'zh') {
      prompt += ` 重要：请完全用中文回答。使用母语水平的中文，包括正确的语法、文化背景和习语表达。如果原始问题是英文或其他语言，请翻译您的理解并完全用中文回答。确保所有解释、例子和细节都适合中文使用者的文化背景。`;
    } else if (currentLanguage === 'ar') {
      prompt += ` مهم: أجب كاملاً باللغة العربية. استخدم العربية بمستوى الناطق الأصلي مع القواعد المناسبة والسياق الثقافي والتعبيرات الاصطلاحية. إذا كان السؤال الأصلي بالإنجليزية أو لغة أخرى، ترجم فهمك وأجب كاملاً بالعربية. تأكد من أن جميع التفسيرات والأمثلة والتفاصيل مناسبة ثقافياً للمتحدثين بالعربية.`;
    } else if (currentLanguage === 'ja') {
      prompt += ` 重要：完全に日本語で回答してください。適切な文法、文化的背景、慣用表現を含む母語レベルの日本語を使用してください。元の質問が英語や他の言語だった場合は、理解を翻訳し、完全に日本語で回答してください。すべての説明、例、詳細が日本語話者にとって文化的に適切であることを確認してください。`;
    } else if (currentLanguage === 'he') {
      prompt += ` חשוב: ענה באופן מלא בעברית. השתמש בעברית ברמת דובר שפת אם עם דקדוק מתאים, הקשר תרבותי וביטויים אידיומטיים. אם השאלה המקורית הייתה באנגלית או בשפה אחרת, תרגם את ההבנה שלך וענה באופן מלא בעברית. ודא שכל ההסברים, הדוגמאות והפרטים מתאימים תרבותית לדוברי עברית.`;
    } else {
      prompt += ` IMPORTANT: Respond entirely in ${targetLanguage}. Use native-level ${targetLanguage} with proper grammar, cultural context, and idiomatic expressions. If the original question was in English or another language, translate your understanding and respond completely in ${targetLanguage}. Ensure all explanations, examples, and details are culturally appropriate for ${targetLanguage} speakers.`;
    }
  } else {
    prompt += ` Respond in clear, fluent English.`;
  }

  // Add expert clarity suffix after language instructions
  if (expertClaritySuffix) {
    prompt += expertClaritySuffix;
  }

  // Generate explanation in the UI language using translation keys
  explanation = t('why_prompt_works') + `:\n\n`;
  
  if (detectedPersona && complexity === "optimize") {
    explanation += `• **${t('smart_persona_detection')}**: ${t('smart_persona_detection_desc')}\n\n`;
  } else if (complexity === "optimize") {
    explanation += `• **${t('role_definition')}**: ${t('role_definition_desc', { tone })}\n\n`;
  }
  
  explanation += `• **${t('clear_intent')}**: ${t('clear_intent_desc')}\n\n`;
  
  if (complexity === "optimize") {
    explanation += `• **${t('audience_context')}**: ${t('audience_context_desc', { audience: t(`audience_${audience}`) })}\n\n`;
  }
  
  explanation += `• **${t('format_specification')}**: ${t('format_specification_desc', { format: t(`format_${format}`) })}\n\n`;
  
  if (complexity === "optimize") {
    explanation += `• **${t('tone_guidance')}**: ${t('tone_guidance_desc', { tone: t(`tone_${tone}`) })}\n\n`;
  }

  if (depth === "deep") {
    explanation += `• **${t('deepsearch_mode')}**: ${t('deepsearch_mode_desc')}\n\n`;
  }

  if (insightMode === "deep") {
    explanation += `• **${t('deep_insight_mode')}**: ${t('deep_insight_mode_desc')}\n\n`;
  }

  if (!isEnglish) {
    explanation += `• **${t('multilingual_support')}**: ${t('multilingual_support_desc', { language: targetLanguage })}\n\n`;
  } else {
    explanation += `• **${t('language_setting')}**: ${t('language_setting_desc')}\n\n`;
  }
  
  explanation += t('prompt_elements_conclusion');

  return { prompt, explanation, polishInfo };
}

export function ResultScreen({ answers, onRestart }: ResultScreenProps) {
  const [copied, setCopied] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [explanation, setExplanation] = useState<string>("");
  // State tracking for polish attempts that failed or succeeded
  const [polishInfo, setPolishInfo] = useState<{ original: string; polished: string } | undefined>();
  const [polishAttemptedNoEffect, setPolishAttemptedNoEffect] = useState<boolean>(false);
  const { toast } = useToast();
  const { savePrompt } = usePromptLibrary();
  const { t, i18n } = useTranslation();
  
  // Generate the optimized prompt on component mount and when answers change
  useEffect(() => {
    generateOptimizedPrompt(answers, t, i18n.language).then(({ prompt, explanation, polishInfo, polishAttempted }) => {
      setPrompt(prompt);
      setExplanation(explanation);
      setPolishInfo(polishInfo);
      // Track if polish was attempted but had no effect
      setPolishAttemptedNoEffect(polishAttempted && !polishInfo);
      if (polishAttempted && !polishInfo) {
        console.log('[⚠️ Polish attempted but no changes made]');
      }
    });
  }, [answers, t, i18n.language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      toast({
        title: t('copy_success'),
        description: t('copy_success_desc'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: t('copy_failed'),
        description: t('copy_failed_desc'),
        variant: "destructive",
      });
    }
  };

  const handleOpenChatGPT = () => {
    const encodedPrompt = encodeURIComponent(prompt);
    const chatGPTUrl = `https://chat.openai.com/?prompt=${encodedPrompt}`;
    window.open(chatGPTUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTestWithAI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get language preference
      const languageMap: Record<string, string> = {
        english: "English",
        spanish: "Spanish", 
        french: "French",
        german: "German",
        russian: "Russian",
        chinese: "Chinese",
        japanese: "Japanese"
      };
      
      const targetLanguage = answers.language && answers.language !== "auto" 
        ? languageMap[answers.language] || "English"
        : "English";
      
      const response = await askOpenAI(prompt, targetLanguage);
      setAiResponse(response);
      
      toast({
        title: t('ai_response_generated'),
        description: t('ai_response_success'),
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      toast({
        title: t('error'),
        description: t('error_ai_failed'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
              {t('your_optimized_prompt')}
            </span>
          </div>
          <Badge variant="secondary" className="mb-4">
            {t('ready_to_use')}
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
                      {t('polish_notice')}
                    </p>
                    <div className="text-xs space-y-1">
                      <div className="text-muted-foreground">
                        <span className="font-mono bg-background/50 px-2 py-1 rounded border">{t('original')}</span> {polishInfo.original}
                      </div>
                      <div className="text-foreground">
                        <span className="font-mono bg-primary/10 px-2 py-1 rounded border">{t('improved')}</span> {polishInfo.polished}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Debug indicator when polish was attempted but had no effect */}
          {polishAttemptedNoEffect && (
            <Card className="border-border/50 bg-yellow-50 dark:bg-yellow-950/20 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      [Debug] Polish function was triggered but no changes were made. This could indicate that the OpenAI polish service wasn't reached or didn't apply changes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generated Prompt */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-glow-secondary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">{t('your_optimized_prompt')}</CardTitle>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="border-border/50 hover:border-primary/50"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-4 h-4 mr-2" />
                      {t('copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      {t('copy')}
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

          {/* Prompt Quality Meter */}
          <PromptQualityMeter prompt={prompt} answers={answers} />

          {/* Test with AI */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{t('test_your_prompt')}</CardTitle>
                </div>
                <Button
                  onClick={handleTestWithAI}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="border-border/50 hover:border-primary/50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('thinking')}
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      {t('test_with_ai')}
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-4">
                  {error}
                </div>
              )}
              
              {aiResponse && (
                <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                  <p className="text-sm text-muted-foreground mb-2">{t('ai_response')}</p>
                  <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {aiResponse}
                  </div>
                </div>
              )}
              
              {!aiResponse && !loading && (
                <p className="text-muted-foreground text-sm">
                  {t('click_test_ai')}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Open in AI Buttons */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <OpenInButtons prompt={prompt} />
            </CardContent>
          </Card>

          {/* Explanation */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">{t('why_prompt_works')}</CardTitle>
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
              {t('restart')}
            </Button>
            <Button
              onClick={handleCopy}
              size="lg"
              variant="outline"
              className="border-border/50 hover:border-primary/50"
            >
              {copied ? (
                <>
                  <CheckCheck className="w-4 h-4 mr-2" />
                  {t('copied')}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  {t('copy_prompt')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}