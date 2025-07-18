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
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Step 1: Trim leading/trailing whitespace
  let transformed = input.trim();

  if (!transformed) {
    return '';
  }

  // Step 2: Remove redundant punctuation
  transformed = removeRedundantPunctuation(transformed);

  // Step 3: Normalize casing
  transformed = normalizeCasing(transformed);

  // Step 4: Check for vague inputs and enrich them
  transformed = enrichVagueInputs(transformed);

  // Step 5: Apply fallback clarity suffixes if needed
  transformed = addClaritySuffix(transformed);

  return transformed;
}

/**
 * Removes redundant punctuation like multiple question marks or exclamation points
 */
function removeRedundantPunctuation(text: string): string {
  return text
    .replace(/\?{2,}/g, '?')  // Multiple question marks -> single
    .replace(/!{2,}/g, '!')   // Multiple exclamation points -> single
    .replace(/\.{3,}/g, '...') // Multiple dots -> ellipsis
    .replace(/\s+/g, ' ');    // Multiple spaces -> single space
}

/**
 * Normalizes casing - capitalizes first letter if appropriate
 */
function normalizeCasing(text: string): string {
  if (!text) return text;
  
  // Only capitalize if the text starts with a lowercase letter
  if (text[0] && text[0] === text[0].toLowerCase() && /[a-z]/.test(text[0])) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  
  return text;
}

/**
 * Enriches vague or overly simple inputs with more specific phrasing
 */
function enrichVagueInputs(text: string): string {
  const lowerText = text.toLowerCase().trim();
  
  // Common vague patterns and their enrichments
  const vaguePatterns = [
    {
      pattern: /^(tell me something|say something|anything)\.?$/,
      replacement: "Provide an interesting and informative explanation about a topic of your choice."
    },
    {
      pattern: /^(help|help me)\.?$/,
      replacement: "Provide helpful guidance and assistance on a topic you'd like to learn about."
    },
    {
      pattern: /^(what|what\?)\.?$/,
      replacement: "Explain a concept or topic in detail."
    },
    {
      pattern: /^(how|how\?)\.?$/,
      replacement: "Provide step-by-step instructions or explanation for a process."
    },
    {
      pattern: /^(why|why\?)\.?$/,
      replacement: "Explain the reasons and background behind a concept or phenomenon."
    },
    {
      pattern: /^(explain|explain something)\.?$/,
      replacement: "Provide a detailed explanation about a topic of interest."
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
 * Adds clarity suffixes to improve prompt quality if needed
 */
function addClaritySuffix(text: string): string {
  // Don't add suffix if text is already quite long or already has specific instructions
  if (text.length > 100 || 
      text.includes('detailed') || 
      text.includes('explain') || 
      text.includes('describe') ||
      text.includes('comprehensive') ||
      text.includes('step-by-step')) {
    return text;
  }

  // Check if it's a simple question that could benefit from more clarity
  const isSimpleQuestion = text.length < 50 && (
    text.includes('?') || 
    text.toLowerCase().startsWith('what') ||
    text.toLowerCase().startsWith('how') ||
    text.toLowerCase().startsWith('why') ||
    text.toLowerCase().startsWith('who') ||
    text.toLowerCase().startsWith('when') ||
    text.toLowerCase().startsWith('where')
  );

  if (isSimpleQuestion) {
    // Remove trailing punctuation before adding suffix
    const cleanText = text.replace(/[.!?]+$/, '');
    return `${cleanText}. Be clear and detailed in your response.`;
  }

  return text;
}

/**
 * Checks if a prompt is likely high quality based on length and content
 */
export function isHighQualityPrompt(prompt: string): boolean {
  if (!prompt || prompt.length < 20) return false;
  
  const qualityIndicators = [
    'detailed', 'comprehensive', 'explain', 'describe', 'analyze',
    'including', 'such as', 'for example', 'step-by-step', 'background',
    'context', 'examples', 'implications', 'considerations'
  ];
  
  const lowerPrompt = prompt.toLowerCase();
  const indicatorCount = qualityIndicators.filter(indicator => 
    lowerPrompt.includes(indicator)
  ).length;
  
  return indicatorCount >= 2 || prompt.length > 80;
}