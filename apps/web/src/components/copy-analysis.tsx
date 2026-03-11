'use client';

import { FileText, Quote } from 'lucide-react';
import type { AnalysisResult } from '@reelverse/shared';
import { useTranslation } from '@/hooks/use-translation';

function getScoreColor(score: number): string {
  if (score >= 80) return '#00F5D4';
  if (score >= 60) return '#A29BFE';
  if (score >= 40) return '#FFD93D';
  return '#FF6B6B';
}

export function CopyAnalysis({ copy, score }: { copy: AnalysisResult['copy']; score: number }) {
  const { t } = useTranslation();
  const color = getScoreColor(score);
  const remaining = 100 - score;

  return (
    <div id="section-copy" className="rounded-2xl bg-surface border border-white/[0.06] overflow-hidden">
      <div className="relative px-5 py-4 border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent" />
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <span className="text-xl">✍️</span> {t.deepDive.copy.title}
          </h3>
          <span className="text-2xl font-display font-bold" style={{ color: getScoreColor(score) }}>
            {score}
          </span>
          {remaining > 0 && <span className="text-[10px] text-text-secondary/50">-{remaining} pts</span>}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-5 flex-1">
          <div>
            <p className="text-xs text-text-secondary/60 uppercase tracking-wider mb-1.5">{t.deepDive.copy.mainMessage}</p>
            <p className="text-sm text-text-primary font-medium">{copy.mainMessage}</p>
          </div>

          {copy.copyFormulas.length > 0 && (
            <div>
              <p className="text-xs text-text-secondary/60 uppercase tracking-wider mb-2">{t.deepDive.copy.formulas}</p>
              <div className="flex flex-wrap gap-1.5">
                {copy.copyFormulas.map((f, i) => (
                <span key={i} className="tag">
                  {f}
                </span>
              ))}
              </div>
            </div>
          )}

          {copy.powerWords.length > 0 && (
            <div>
              <p className="text-xs text-text-secondary/60 uppercase tracking-wider mb-2">{t.deepDive.copy.powerWords}</p>
              <div className="flex flex-wrap gap-1.5">
                {copy.powerWords.map((w, i) => (
                <span key={i} className="tag tag-neon">
                  {w}
                </span>
              ))}
              </div>
            </div>
          )}

          {copy.hashtagStrategy && (
            <div>
              <p className="text-xs text-text-secondary/60 uppercase tracking-wider mb-1.5">{t.deepDive.copy.hashtags}</p>
              <p className="text-sm text-text-secondary">{copy.hashtagStrategy}</p>
            </div>
          )}

          {copy.captionAnalysis && (
            <div>
              <p className="text-xs text-text-secondary/60 uppercase tracking-wider mb-1.5">{t.deepDive.copy.caption}</p>
              <p className="text-sm text-text-secondary leading-relaxed">{copy.captionAnalysis}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
