'use client';

import { useTranslation, useTranslationStore } from '@/hooks/use-translation';
import { Globe } from 'lucide-react';
import { useEffect, useState } from 'react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslationStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-colors text-xs font-medium text-text-secondary"
      title="Toggle Language"
    >
      <Globe className="w-3.5 h-3.5" />
      <span className="uppercase">{language}</span>
    </button>
  );
}
