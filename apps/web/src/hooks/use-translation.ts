'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { en } from '@/dictionaries/en';
import { pt } from '@/dictionaries/pt';

type Language = 'en' | 'pt';

const dictionaries = {
  en,
  pt,
};

interface TranslationState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useTranslationStore = create<TranslationState>()(
  persist(
    (set) => ({
      language: 'en', // Default to English as per user request
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'reelverse-language',
    }
  )
);

export function useTranslation() {
  const { language, setLanguage } = useTranslationStore();
  
  // To avoid hydration mismatch if localStorage differs from server render,
  // we might just return the dictionary directly. Since Zustand persist is mostly client-side,
  // it handles initialization.
  const t = dictionaries[language];

  return { t, language, setLanguage };
}
