'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { youtubeShortRegex } from '@reelverse/shared';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface UrlInputProps {
  onSubmit: (videoUrl: string, cachedAnalysisId?: string) => Promise<void>;
  disabled?: boolean;
}

export function UrlInput({ onSubmit, disabled }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { t, language } = useTranslation();

  const isWorking = loading || isNavigating;
  const valid = url.trim() !== '' && youtubeShortRegex.test(url.trim());

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = url.trim();
    if (!youtubeShortRegex.test(trimmed)) {
      setError(t.home.urlInputError);
      return;
    }
    setLoading(true);
    try {
      const { checkCachedAnalysis } = await import('@/lib/api');
      const cached = await checkCachedAnalysis(trimmed);
      if (cached.cached && cached.analysisId) {
        setIsNavigating(true);
        await onSubmit(trimmed, cached.analysisId);
        return;
      }
      
      // Update the URL locally calling the api
      const { createAnalysis } = await import('@/lib/api');
      const { id } = await createAnalysis({ videoUrl: trimmed, language });
      
      setIsNavigating(true);
      await onSubmit(trimmed, id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar análise.');
      setLoading(false);
      setIsNavigating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="url"
          placeholder={t.home.urlInputPlaceholder}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={disabled || isWorking}
          className="flex-1 transition-opacity duration-300"
          style={{ opacity: isWorking ? 0.7 : 1 }}
        />
        <Button 
          type="submit" 
          disabled={!valid || isWorking || disabled} 
          size="lg" 
          className="sm:w-auto min-w-[140px] relative transition-all duration-300"
        >
          {isWorking ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {isNavigating ? t.home.urlInputButtonRedirecting : t.home.urlInputButtonLoading}
            </span>
          ) : (
            t.home.urlInputButtonDefault
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
    </form>
  );
}
