import { useState, useCallback } from 'react';

interface SavedPrompt {
  id: string;
  prompt: string;
  title: string;
  score: number;
  createdAt: Date;
  tags: string[];
}

interface UsePromptLibraryReturn {
  savedPrompts: SavedPrompt[];
  savePrompt: (prompt: string, title: string, score: number, tags?: string[]) => void;
  deletePrompt: (id: string) => void;
  getPrompt: (id: string) => SavedPrompt | undefined;
}

// Placeholder hook for future Pro features
export function usePromptLibrary(): UsePromptLibraryReturn {
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);

  const savePrompt = useCallback((prompt: string, title: string, score: number, tags: string[] = []) => {
    const newPrompt: SavedPrompt = {
      id: crypto.randomUUID(),
      prompt,
      title,
      score,
      createdAt: new Date(),
      tags
    };
    
    console.log("🚀 [Future Pro Feature] Saved to library:", {
      title,
      score,
      promptLength: prompt.length,
      tags
    });
    
    setSavedPrompts(prev => [newPrompt, ...prev]);
  }, []);

  const deletePrompt = useCallback((id: string) => {
    console.log("🗑️ [Future Pro Feature] Deleted from library:", id);
    setSavedPrompts(prev => prev.filter(p => p.id !== id));
  }, []);

  const getPrompt = useCallback((id: string) => {
    return savedPrompts.find(p => p.id === id);
  }, [savedPrompts]);

  return {
    savedPrompts,
    savePrompt,
    deletePrompt,
    getPrompt
  };
}