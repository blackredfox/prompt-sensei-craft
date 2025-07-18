/**
 * Prompt Transformer Module
 * Transforms raw user input into polished prompts suitable for AI generation
 */

/**
 * Transforms a raw prompt input into a polished, enhanced version
 * @param input - Raw user input string
 * @returns Transformed prompt string
 */
export function transformPrompt(input: string): string {
  if (!input || typeof input !== 'string') return '';

  let transformed = input.trim();
  if (!transformed) return '';

  transformed = removeRedundantPunctuation(transformed);
  transformed = normalizeCasing(transformed);
  transformed = enrichVagueInputs(transformed);
  transformed = addMissingQuestionMark(transformed);
  transformed = addClaritySuffix(transformed);

  return transformed;
}

/**
 * Removes redundant punctuation like multiple question marks or exclamation points
 */
function removeRedundantPunctuation(text: string): string {
  return text
    .replace(/\?{2,}/g, '?')
    .replace(/!{2,}/g, '!')
    .replace(/\.{3,}/g, '...')
    .replace(/\s+/g, ' ');
}

/**
 * Normalizes casing - capitalizes first letter if appropriate
 */
function normalizeCasing(text: string): string {
  if (!text) return text;
  if (text[0] === text[0].toLowerCase() && /[a-z]/.test(text[0])) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  return text;
}

/**
 * Enriches vague or overly simple inputs with more specific phrasing
 */
function enrichVagueInputs(text: string): string {
  const lowerText = text.toLowerCase().trim();

  const vaguePatterns = [
    {
      pattern: /^(tell me something|say something|anything)\.?$/,
      replacement:
        'Provide an interesting and informative explanation about a topic of your choice.'
    },
    {
      pattern: /^(help|help me)\.?$/,
      replacement:
        "Provide helpful guidance and assistance on a topic you'd like to learn about."
    },
    {
      pattern: /^(what|what\?)\.?$/,
      replacement: 'Explain a concept or topic in detail.'
    },
    {
      pattern: /^(how|how\?)\.?$/,
      replacement: 'Provide step-by-step instructions or explanation for a process.'
    },
    {
      pattern: /^(why|why\?)\.?$/,
      replacement: 'Explain the reasons and background behind a concept or phenomenon.'
    },
    {
      pattern: /^(explain|explain something)\.?$/,
      replacement: 'Provide a detailed explanation about a topic of interest.'
    }
  ];

  for (const { pattern, replacement } of vaguePatterns) {
    if (pattern.test(lowerText)) {
      return replacement;
    }
  }

  return text;
}

/**
 * Adds a question mark if the input is a question but lacks one
 */
function addMissingQuestionMark(text: string): string {
  const questionStarters = ['What', 'Why', 'How', 'When', 'Where', 'Who'];

  const startsLikeQuestion = questionStarters.some(starter =>
    text.startsWith(starter)
  );

  if (startsLikeQuestion) {
    if (text.endsWith('.')) return text.slice(0, -1) + '?';
    if (!text.endsWith('?')) return text + '?';
  }

  return text;
}

/**
 * Adds clarity suffixes to improve prompt quality if needed
 */
function addClaritySuffix(text: string): string {
  if (
    text.length > 100 ||
    text.includes('detailed') ||
    text.includes('explain') ||
    text.includes('describe') ||
    text.includes('comprehensive') ||
    text.includes('step-by-step')
  ) {
    return text;
  }

  const isSimpleQuestion =
    text.length < 50 &&
    (
      text.includes('?') ||
      text.toLowerCase().startsWith('what') ||
      text.toLowerCase().startsWith('how') ||
      text.toLowerCase().startsWith('why') ||
      text.toLowerCase().startsWith('who') ||
      text.toLowerCase().startsWith('when') ||
      text.toLowerCase().startsWith('where')
    );

  if (isSimpleQuestion) {
    const cleanText = text.replace(/[.!?]+$/, '');
    return `${cleanText}? Be clear and detailed in your response.`;
  }

  return text;
}

/**
 * Checks if a prompt is likely high quality based on length and content
 */
export function isHighQualityPrompt(prompt: string): boolean {
  if (!prompt || prompt.length < 20) return false;

  const qualityIndicators = [
    'detailed',
    'comprehensive',
    'explain',
    'describe',
    'analyze',
    'including',
    'such as',
    'for example',
    'step-by-step',
    'background',
    'context',
    'examples',
    'implications',
    'considerations'
  ];

  const lowerPrompt = prompt.toLowerCase();
  const indicatorCount = qualityIndicators.filter(indicator =>
    lowerPrompt.includes(indicator)
  ).length;

  return indicatorCount >= 2 || prompt.length > 80;
}
