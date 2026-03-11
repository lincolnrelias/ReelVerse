'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { en } from '@/dictionaries/en';
import { pt } from '@/dictionaries/pt';

type Language = 'en' | 'pt';

const dictionaries = {
  en,
  pt,
};

const SUPPORTED_LANGUAGES = Object.keys(dictionaries) as Language[];
const DEFAULT_LANGUAGE: Language = 'en';

function detectLanguage(): Language {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;

  const browserLanguages = navigator.languages || [navigator.language];
  
  for (const lang of browserLanguages) {
    const shortLang = lang.split('-')[0] as Language;
    if (SUPPORTED_LANGUAGES.includes(shortLang)) {
      return shortLang;
    }
  }

  return DEFAULT_LANGUAGE;
}

interface TranslationState {
  language: Language;
  setLanguage: (lang: Language) => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  isAutoDetectionDone: boolean;
  setAutoDetectionDone: (state: boolean) => void;
}

export const useTranslationStore = create<TranslationState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (lang) => set({ language: lang }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      isAutoDetectionDone: false,
      setAutoDetectionDone: (state) => set({ isAutoDetectionDone: state }),
    }),
    {
      name: 'reelverse-language',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export function useTranslation() {
  const { 
    language, 
    setLanguage, 
    _hasHydrated, 
    isAutoDetectionDone, 
    setAutoDetectionDone 
  } = useTranslationStore();
  
  useEffect(() => {
    if (_hasHydrated && !isAutoDetectionDone) {
      const detected = detectLanguage();
      
      if (detected !== language) {
        setLanguage(detected);
      }
      setAutoDetectionDone(true);
    }
  }, [_hasHydrated, isAutoDetectionDone, language, setLanguage, setAutoDetectionDone]);

  // Use a default dictionary during hydration to prevent mismatches
  const t = _hasHydrated ? dictionaries[language] : dictionaries[DEFAULT_LANGUAGE];

  return { t, language, setLanguage, isReady: _hasHydrated };
}
