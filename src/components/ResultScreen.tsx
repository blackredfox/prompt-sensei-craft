import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PromptAnswers, polishText } from "./PromptSensei";
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

function generateOptimizedPrompt(answers: PromptAnswers, t: any, currentLanguage: string): { prompt: string; explanation: string; polishInfo?: { original: string; polished: string } } {
  const { question, audience, tone, format, complexity, depth, polishInput, insightMode, language } = answers;
  
  // Polish the question if requested
  let finalQuestion = question;
  let polishInfo: { original: string; polished: string } | undefined;
  
  if (polishInput === "true") {
    const { polished, wasPolished } = polishText(question);
    if (wasPolished) {
      polishInfo = { original: question, polished };
      finalQuestion = polished;
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

  // Auto-detect persona first
  const detectedPersona = detectPersona(finalQuestion);
  if (detectedPersona && complexity === "optimize") {
    prompt += detectedPersona;
  } else if (complexity === "optimize") {
    // Use localized persona or fallback to English
    if (currentLocalizedPrompts?.persona[tone as keyof typeof currentLocalizedPrompts.persona]) {
      prompt += currentLocalizedPrompts.persona[tone as keyof typeof currentLocalizedPrompts.persona];
    } else {
      // Fallback to English
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
  }

  // Add the main question
  prompt += finalQuestion.trim();
  if (!finalQuestion.trim().endsWith("?") && !finalQuestion.trim().endsWith(".")) {
    prompt += ".";
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

  // Add language preference with enhanced instructions
  if (!isEnglish) {
    if (currentLanguage === 'ru') {
      prompt += ` ВАЖНО: Отвечайте полностью на русском языке. Используйте родной уровень русского языка с правильной грамматикой, культурным контекстом и идиоматическими выражениями. Если первоначальный вопрос был на английском или другом языке, переведите ваше понимание и отвечайте полностью на русском языке. Убедитесь, что все объяснения, примеры и детали культурно подходят для русскоязычных.`;
    } else if (currentLanguage === 'es') {
      prompt += ` IMPORTANTE: Responde completamente en español. Usa español de nivel nativo con gramática adecuada, contexto cultural y expresiones idiomáticas. Si la pregunta original estaba en inglés u otro idioma, traduce tu comprensión y responde completamente en español. Asegúrate de que todas las explicaciones, ejemplos y detalles sean culturalmente apropiados para hablantes de español.`;
    } else {
      prompt += ` IMPORTANT: Respond entirely in ${targetLanguage}. Use native-level ${targetLanguage} with proper grammar, cultural context, and idiomatic expressions. If the original question was in English or another language, translate your understanding and respond completely in ${targetLanguage}. Ensure all explanations, examples, and details are culturally appropriate for ${targetLanguage} speakers.`;
    }
  } else {
    prompt += ` Respond in clear, fluent English.`;
  }

  // Generate explanation in the UI language
  explanation = t('why_prompt_works') + `:\n\n`;
  
  if (detectedPersona && complexity === "optimize") {
    explanation += `• **${currentLanguage === 'ru' ? 'Умное определение персоны' : currentLanguage === 'es' ? 'Detección Inteligente de Persona' : 'Smart Persona Detection'}**: ${currentLanguage === 'ru' ? 'Я автоматически определил вашу тему и назначил специализированную экспертную роль для обеспечения авторитетных, релевантных ответов.' : currentLanguage === 'es' ? 'Detecté automáticamente tu tema y asigné un rol de experto especializado para asegurar respuestas autorizadas y relevantes.' : 'I automatically detected your topic and assigned a specialized expert role to ensure authoritative, relevant responses.'}\n\n`;
  } else if (complexity === "optimize") {
    explanation += `• **${currentLanguage === 'ru' ? 'Определение роли' : currentLanguage === 'es' ? 'Definición de Rol' : 'Role Definition'}**: ${currentLanguage === 'ru' ? `Я настроил ИИ с конкретной персоной (${tone}) для обеспечения последовательного голоса на протяжении всего ответа.` : currentLanguage === 'es' ? `Configuré la IA con una persona específica (${tone}) para asegurar una voz consistente a lo largo de la respuesta.` : `I set up the AI with a specific persona (${tone}) to ensure consistent voice throughout the response.`}\n\n`;
  }
  
  explanation += `• **${currentLanguage === 'ru' ? 'Ясное намерение' : currentLanguage === 'es' ? 'Intención Clara' : 'Clear Intent'}**: ${currentLanguage === 'ru' ? 'Ваш основной вопрос изложен прямо и ясно.' : currentLanguage === 'es' ? 'Tu pregunta principal está planteada directa y claramente.' : 'Your core question is stated directly and clearly.'}\n\n`;
  
  if (complexity === "optimize") {
    const audienceText = audience === "myself" ? (currentLanguage === 'ru' ? "личного использования" : currentLanguage === 'es' ? "uso personal" : "personal use") : 
                        audience === "client" ? (currentLanguage === 'ru' ? "клиента" : currentLanguage === 'es' ? "un cliente" : "a client") : 
                        audience === "manager" ? (currentLanguage === 'ru' ? "руководства" : currentLanguage === 'es' ? "gerencia" : "management") : 
                        audience === "code" ? (currentLanguage === 'ru' ? "генерации кода с техническим руководством" : currentLanguage === 'es' ? "generación de código con guía técnica" : "code generation with technical guidance") : 
                        (currentLanguage === 'ru' ? "общей аудитории" : currentLanguage === 'es' ? "una audiencia general" : "a general audience");
    
    explanation += `• **${currentLanguage === 'ru' ? 'Контекст аудитории' : currentLanguage === 'es' ? 'Contexto de Audiencia' : 'Audience Context'}**: ${currentLanguage === 'ru' ? `Я указал, что это для ${audienceText}, что помогает ИИ настроить сложность и тон.` : currentLanguage === 'es' ? `Especifiqué que esto es para ${audienceText}, lo que ayuda a la IA a adaptar la complejidad y el tono.` : `I specified that this is for ${audienceText}, which helps the AI tailor the complexity and tone.`}\n\n`;
  }
  
  const formatText = format === "bullet" ? (currentLanguage === 'ru' ? "маркированные пункты" : currentLanguage === 'es' ? "puntos con viñetas" : "bullet points") : 
                    format === "steps" ? (currentLanguage === 'ru' ? "пошаговый формат" : currentLanguage === 'es' ? "formato paso a paso" : "step-by-step format") : 
                    (currentLanguage === 'ru' ? "формат абзаца" : currentLanguage === 'es' ? "formato de párrafo" : "paragraph format");
  
  explanation += `• **${currentLanguage === 'ru' ? 'Спецификация формата' : currentLanguage === 'es' ? 'Especificación de Formato' : 'Format Specification'}**: ${currentLanguage === 'ru' ? `Я запросил ${formatText} в соответствии с вашими предпочтениями.` : currentLanguage === 'es' ? `Solicité ${formatText} para coincidir con tu preferencia.` : `I requested ${formatText} to match your preference.`}\n\n`;
  
  if (complexity === "optimize") {
    explanation += `• **${currentLanguage === 'ru' ? 'Руководство по тону' : currentLanguage === 'es' ? 'Guía de Tono' : 'Tone Guidance'}**: ${currentLanguage === 'ru' ? `Я добавил конкретные инструкции для поддержания ${tone} подхода на протяжении всего ответа.` : currentLanguage === 'es' ? `Agregué instrucciones específicas para mantener un enfoque ${tone} a lo largo de la respuesta.` : `I added specific instructions to maintain a ${tone} approach throughout the response.`}\n\n`;
  }

  if (depth === "deep") {
    explanation += `• **${currentLanguage === 'ru' ? 'Режим глубокого поиска' : currentLanguage === 'es' ? 'Modo de Búsqueda Profunda' : 'DeepSearch Mode'}**: ${currentLanguage === 'ru' ? 'Я включил тщательный анализ с выводами, основанными на исследованиях, сравнениями и реальными примерами для всеобъемлющих ответов.' : currentLanguage === 'es' ? 'Habilité análisis exhaustivo con insights basados en investigación, comparaciones y ejemplos del mundo real para respuestas comprehensivas.' : 'I enabled thorough analysis with research-based insights, comparisons, and real-world examples for comprehensive responses.'}\n\n`;
  }

  if (insightMode === "deep") {
    explanation += `• **${currentLanguage === 'ru' ? 'Режим глубокого анализа' : currentLanguage === 'es' ? 'Modo de Análisis Profundo' : 'Deep Insight Mode'}**: ${currentLanguage === 'ru' ? 'Я добавил инструкции для ИИ анализировать глубоко, сравнивать перспективы и предоставлять реальные примеры для лучшего рассуждения.' : currentLanguage === 'es' ? 'Agregué instrucciones para que la IA analice profundamente, compare perspectivas y proporcione ejemplos del mundo real para mejor razonamiento.' : 'I added instructions for the AI to analyze deeply, compare perspectives, and provide real-world examples for better reasoning.'}\n\n`;
  }

  if (!isEnglish) {
    explanation += `• **${currentLanguage === 'ru' ? 'Расширенная многоязычная поддержка' : currentLanguage === 'es' ? 'Soporte Multilingüe Mejorado' : 'Enhanced Multilingual Support'}**: ${currentLanguage === 'ru' ? `Я добавил строгие инструкции для ИИ отвечать полностью на ${targetLanguage} языке с родным уровнем беглости, правильным культурным контекстом и идиоматическими выражениями. Это обеспечивает аутентичную коммуникацию независимо от языка вашего ввода.` : currentLanguage === 'es' ? `Agregué instrucciones estrictas para que la IA responda completamente en ${targetLanguage} con fluidez de nivel nativo, contexto cultural apropiado y expresiones idiomáticas. Esto asegura comunicación auténtica independientemente del idioma de tu entrada.` : `I added strong instructions for the AI to respond entirely in ${targetLanguage} with native-level fluency, proper cultural context, and idiomatic expressions. This ensures authentic communication regardless of your input language.`}\n\n`;
  } else {
    explanation += `• **${currentLanguage === 'ru' ? 'Настройка языка' : currentLanguage === 'es' ? 'Configuración de Idioma' : 'Language Setting'}**: ${currentLanguage === 'ru' ? 'Я убедился, что ответ будет на чистом, беглом английском языке.' : currentLanguage === 'es' ? 'Me aseguré de que la respuesta esté en inglés claro y fluido.' : 'I ensured the response will be in clear, fluent English.'}\n\n`;
  }
  
  explanation += currentLanguage === 'ru' ? 'Эти элементы работают вместе, чтобы дать вам более релевантные, хорошо структурированные ответы, соответствующие вашим конкретным потребностям.' : 
                currentLanguage === 'es' ? 'Estos elementos trabajan juntos para darte respuestas más relevantes y bien estructuradas que coinciden con tus necesidades específicas.' :
                'These elements work together to give you more relevant, well-structured responses that match your specific needs.';

  return { prompt, explanation, polishInfo };
}

export function ResultScreen({ answers, onRestart }: ResultScreenProps) {
  const [copied, setCopied] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { savePrompt } = usePromptLibrary();
  const { t, i18n } = useTranslation();
  
  const { prompt, explanation, polishInfo } = generateOptimizedPrompt(answers, t, i18n.language);

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