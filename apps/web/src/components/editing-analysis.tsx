'use client';

import { Film, Scissors, Sparkles } from 'lucide-react';
import type { AnalysisResult } from '@reelverse/shared';
import { useTranslation } from '@/hooks/use-translation';

function getScoreColor(score: number): string {
  if (score >= 80) return '#00F5D4';
  if (score >= 60) return '#A29BFE';
  if (score >= 40) return '#FFD93D';
  return '#FF6B6B';
}

export function EditingAnalysis({ editing, score }: { editing: AnalysisResult['editing']; score: number }) {
  const { t } = useTranslation();
  const color = getScoreColor(score);
  const remaining = 100 - score;

  return (
    <div id="section-editing" className="rounded-2xl bg-surface border border-white/[0.06] overflow-hidden">
      <div className="relative px-5 py-4 border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-r from-neon/10 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-neon" />
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <span className="text-xl">✂️</span> {t.deepDive.editing.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold" style={{ color }}>{score}</span>
            {remaining > 0 && <span className="text-[10px] text-text-secondary/50">-{remaining} pts</span>}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="space-y-5 flex-1">
          {editing.standoutTechnique && (
            <div className="p-4 rounded-xl bg-neon/5 border border-neon/10 text-sm">
              <span className="font-semibold text-neon mr-1">Técnica Destaque:</span>
              <span className="text-text-secondary">{editing.standoutTechnique}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-xs text-text-secondary/60 uppercase tracking-wider mb-1">{t.deepDive.editing.totalCuts}</p>
              <p className="text-xl font-display font-bold text-text-primary">{editing.totalCuts}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-xs text-text-secondary/60 uppercase tracking-wider mb-1">{t.deepDive.editing.avgDuration}</p>
              <p className="text-xl font-display font-bold text-text-primary">{editing.avgCutDuration.toFixed(1)}s</p>
            </div>
          </div>

          {editing.transitionTypes.length > 0 && (
            <div>
              <p className="text-xs text-text-secondary/60 uppercase tracking-wider mb-2">{t.deepDive.editing.transitions}</p>
              <div className="flex flex-wrap gap-1.5">
                {editing.transitionTypes.map((tItem, i) => (
                <span key={i} className="tag">
                  {tItem}
                </span>
              ))}
              </div>
            </div>
          )}

          {editing.visualEffects.length > 0 && (
            <div>
              <p className="text-xs text-text-secondary/60 uppercase tracking-wider mb-2">{t.deepDive.editing.visuals}</p>
              <div className="flex flex-wrap gap-1.5">
                {editing.visualEffects.map((e, i) => (
                <span key={i} className="tag">
                  {e}
                </span>
              ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-text-secondary/60 uppercase tracking-wider mb-1.5">{t.deepDive.editing.pacing}</p>
            <p className="text-sm text-text-secondary leading-relaxed">{editing.pacing}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
