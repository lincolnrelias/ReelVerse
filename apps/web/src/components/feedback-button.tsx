'use client';

import { MessageSquarePlus } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export function FeedbackButton() {
  const { t } = useTranslation();

  return (
    <a
      href={process.env.NEXT_PUBLIC_FEEDBACK_URL || 'mailto:contato@reelverse.app'}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-surface-elevated/80 px-4 py-2.5 text-sm font-medium text-text-secondary border border-white/10 backdrop-blur-md shadow-lg shadow-black/20 transition-all hover:bg-white/10 hover:text-text-primary hover:scale-105 active:scale-95"
    >
      <MessageSquarePlus className="w-4 h-4 text-neon" />
      <span>{t.common.feedback}</span>
    </a>
  );
}
