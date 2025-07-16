import { supabase } from "@/integrations/supabase/client";

export async function askOpenAI(prompt: string, language: string = 'English') {
  try {
    const { data, error } = await supabase.functions.invoke('ask-openai', {
      body: { prompt, language }
    });

    if (error) {
      console.error('askOpenAI failed:', error);
      throw new Error('Failed to get OpenAI response');
    }

    return data.answer;
  } catch (err) {
    console.error('askOpenAI error:', err);
    throw err;
  }
}