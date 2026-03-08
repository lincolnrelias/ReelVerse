'use client';

import { Film, Scissors, Sparkles } from 'lucide-react';
import type { AnalysisResult } from '@reelverse/shared';

function getScoreColor(score: number): string {
  if (score >= 80) return '#00F5D4';
  if (score >= 60) return '#A29BFE';
  if (score >= 40) return '#FFD93D';
  return '#FF6B6B';
}

interface EditingAnalysisProps {
  editing: AnalysisResult['editing'];
  score: number;
}

export function EditingAnalysis({ editing, score }: EditingAnalysisProps) {
  const color = getScoreColor(score);
  const remaining = 100 - score;

  return (
    <div id="section-editing" className="rounded-2xl bg-surface border border-white/[0.06] overflow-hidden">
      <div className="relative px-5 py-4 border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-r from-neon/10 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-neon" />
            <h3 className="text-base font-display font-bold">Edição & Ritmo</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold" style={{ color }}>{score}</span>
            {remaining > 0 && <span className="text-[10px] text-text-secondary/50">faltam {remaining}</span>}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-3 text-center">
            <Scissors className="w-4 h-4 text-text-secondary/60 mx-auto mb-1" />
            <p className="text-xl font-display font-bold text-text-primary">{editing.totalCuts}</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider">Cortes</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-3 text-center">
            <p className="text-xl font-display font-bold text-text-primary mt-5">{editing.avgCutDuration.toFixed(1)}s</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider">Média/corte</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-3 text-center flex flex-col items-center justify-center">
            <span className="tag tag-primary text-[10px] mb-1">{editing.pacing}</span>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider">Ritmo</p>
          </div>
        </div>

        {editing.transitionTypes.length > 0 && (
          <div>
            <span className="text-[10px] text-text-secondary uppercase tracking-wider block mb-2">Transições</span>
            <div className="flex flex-wrap gap-1.5">
              {editing.transitionTypes.map((t, i) => <span key={i} className="tag">{t}</span>)}
            </div>
          </div>
        )}

        {editing.visualEffects.length > 0 && (
          <div>
            <span className="text-[10px] text-text-secondary uppercase tracking-wider block mb-2">Efeitos</span>
            <div className="flex flex-wrap gap-1.5">
              {editing.visualEffects.map((e, i) => <span key={i} className="tag">{e}</span>)}
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-xl bg-neon/[0.06] border border-neon/15 p-3">
          <Sparkles className="w-4 h-4 text-neon mt-0.5 flex-shrink-0" />
          <p className="text-sm text-text-primary leading-relaxed break-words flex-1 min-w-0">{editing.standoutTechnique}</p>
        </div>
      </div>
    </div>
  );
}
