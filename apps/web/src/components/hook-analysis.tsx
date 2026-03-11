'use client';

import { Zap, Lightbulb } from 'lucide-react';
import type { AnalysisResult } from '@reelverse/shared';
import { useTranslation } from '@/hooks/use-translation';

function getScoreColor(score: number): string {
  if (score >= 80) return '#00F5D4';
  if (score >= 60) return '#A29BFE';
  if (score >= 40) return '#FFD93D';
  return '#FF6B6B';
}

export function HookAnalysis({ hook, score }: { hook: AnalysisResult['hook']; score: number }) {
  const { t } = useTranslation();
  const color = getScoreColor(score);
  const remaining = 100 - score;

  return (
    <div id="section-hook" className="rounded-2xl bg-surface border border-white/[0.06] overflow-hidden">
      {/* Gradient header */}
      <div className="relative px-5 py-4 border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-display font-bold flex items-center gap-2">
              <span className="text-xl">🎣</span> {t.deepDive.hook.title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold" style={{ color }}>{score}</span>
            {remaining > 0 && <span className="text-[10px] text-text-secondary/50">-{remaining} pts</span>}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="tag tag-primary">{hook.type}</span>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed break-words">{hook.description}</p>

        {hook.textUsed && (
          <blockquote className="border-l-2 border-primary/30 pl-3 py-1 text-sm text-text-primary/80 italic break-words">
            &ldquo;{hook.textUsed}&rdquo;
          </blockquote>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-text-secondary uppercase tracking-wider">Eficácia</span>
            <span className="pl-2 text-xs font-medium" style={{ color }}>{hook.effectiveness}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
          </div>
        </div>

        <div className="tip-box flex items-start gap-2.5">
          <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">Dica</span>
            <p className="text-sm text-text-primary mt-1 leading-relaxed break-words">{hook.improvementTip}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
