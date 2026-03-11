'use client';

import { Megaphone, MapPin } from 'lucide-react';
import type { AnalysisResult } from '@reelverse/shared';
import { useTranslation } from '@/hooks/use-translation';

function getScoreColor(score: number): string {
  if (score >= 80) return '#00F5D4';
  if (score >= 60) return '#A29BFE';
  if (score >= 40) return '#FFD93D';
  return '#FF6B6B';
}

interface CtaAnalysisProps {
  cta: AnalysisResult['cta'];
  score: number;
}

export function CtaAnalysis({ cta, score }: CtaAnalysisProps) {
  const { t } = useTranslation();
  const color = getScoreColor(score);
  const remaining = 100 - score;

  return (
    <div id="section-cta" className="rounded-2xl bg-surface border border-white/[0.06] overflow-hidden">
      <div className="relative px-5 py-4 border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-r from-error/10 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-error" />
            <h3 className="text-base font-display font-bold">{t.deepDive.cta.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold" style={{ color }}>{score}</span>
            {remaining > 0 && <span className="text-[10px] text-text-secondary/50">-{remaining} pts</span>}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
          <span className={`w-8 h-8 flex-shrink-0 mt-0.5 rounded-full flex items-center justify-center text-sm font-bold ${cta.hasCta ? 'bg-neon/15 text-neon' : 'bg-error/15 text-error'}`}>
            {cta.hasCta ? '✓' : '✗'}
          </span>
          {cta.hasCta === false && (
            <span className="text-sm text-text-primary font-medium mt-1">
              {t.deepDive.cta.missing}
            </span>
          )}
        </div>

        {cta.hasCta && (
          <div className="grid grid-cols-2 gap-2">
            {cta.type && (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-3">
                <span className="text-[10px] text-text-secondary uppercase tracking-wider block mb-1.5">Tipo</span>
                <span className="tag tag-primary text-xs">{cta.type}</span>
              </div>
            )}
            {cta.placement && (
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-3">
                <span className="text-[10px] text-text-secondary uppercase tracking-wider block mb-1.5">{t.deepDive.cta.where}</span>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-text-secondary/50" />
                  <span className="text-xs text-text-primary">{cta.placement}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {cta.text && (
          <blockquote className="border-l-2 border-accent/30 pl-3 text-sm text-text-primary/80 italic break-words">
            &ldquo;{cta.text}&rdquo;
          </blockquote>
        )}

        <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
          <p className="text-xs text-text-secondary leading-relaxed break-words">{cta.effectiveness}</p>
        </div>
      </div>
    </div>
  );
}
