import { transformPrompt, isHighQualityPrompt } from '../src/transformers/prompt-transformer';

describe('transformPrompt', () => {
  it('trims whitespace', () => {
    expect(transformPrompt('   What is AI?   ')).toBe('What is AI?. Be clear and detailed in your response.');
  });

  it('normalizes casing', () => {
    expect(transformPrompt('what is AI?')).toBe('What is AI?. Be clear and detailed in your response.');
  });

  it('removes redundant punctuation', () => {
    expect(transformPrompt('What is AI???')).toBe('What is AI?. Be clear and detailed in your response.');
  });

  it('enriches vague prompts', () => {
    expect(transformPrompt('tell me something')).toBe('Provide an interesting and informative explanation about a topic of your choice.');
  });

  it('adds clarity suffix to simple prompt', () => {
    expect(transformPrompt('What is marketing')).toBe('What is marketing. Be clear and detailed in your response.');
  });

  it('does not modify high-quality prompt', () => {
    const prompt = 'Explain the impact of climate change on global agriculture in a detailed and structured way.';
    expect(transformPrompt(prompt)).toBe(prompt);
  });
});

describe('isHighQualityPrompt', () => {
  it('detects low-quality short prompt', () => {
    expect(isHighQualityPrompt('Hi')).toBe(false);
  });

  it('detects high-quality long prompt', () => {
    expect(isHighQualityPrompt('Explain the history and cultural impact of jazz music, including key figures and movements.')).toBe(true);
  });

  it('detects presence of quality indicators', () => {
    expect(isHighQualityPrompt('Provide a comprehensive explanation and include examples.')).toBe(true);
  });
});