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
}

export const useTranslationStore = create<TranslationState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (lang) => set({ language: lang }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'reelverse-language',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          // If no language was persisted, detect it
          const storage = localStorage.getItem('reelverse-language');
          if (!storage || !JSON.parse(storage).state?.language) {
            state.setLanguage(detectLanguage());
          }
        }
      },
    }
  )
);

export function useTranslation() {
  const { language, setLanguage, _hasHydrated } = useTranslationStore();
  
  // Use a default dictionary during hydration to prevent mismatches
  // Once hydrated, it will use the correct detected or persisted language
  const t = _hasHydrated ? dictionaries[language] : dictionaries[DEFAULT_LANGUAGE];

  return { t, language, setLanguage, isReady: _hasHydrated };
}
