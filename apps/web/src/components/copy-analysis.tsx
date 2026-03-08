'use client';

import { FileText, Quote } from 'lucide-react';
import type { AnalysisResult } from '@reelverse/shared';

function getScoreColor(score: number): string {
  if (score >= 80) return '#00F5D4';
  if (score >= 60) return '#A29BFE';
  if (score >= 40) return '#FFD93D';
  return '#FF6B6B';
}

interface CopyAnalysisProps {
  copy: AnalysisResult['copy'];
  score: number;
}

export function CopyAnalysis({ copy, score }: CopyAnalysisProps) {
  const color = getScoreColor(score);
  const remaining = 100 - score;

  return (
    <div id="section-copy" className="rounded-2xl bg-surface border border-white/[0.06] overflow-hidden">
      <div className="relative px-5 py-4 border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            <h3 className="text-base font-display font-bold">Copy & Texto</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold" style={{ color }}>{score}</span>
            {remaining > 0 && <span className="text-[10px] text-text-secondary/50">faltam {remaining}</span>}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-4 flex items-start gap-3">
          <Quote className="w-4 h-4 text-accent/60 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-text-primary leading-relaxed break-words flex-1 min-w-0">{copy.mainMessage}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-secondary uppercase tracking-wider">Tom</span>
          <span className="tag tag-accent">{copy.toneOfVoice}</span>
        </div>

        {copy.copyFormulas.length > 0 && (
          <div>
            <span className="text-[10px] text-text-secondary uppercase tracking-wider block mb-2">Fórmulas</span>
            <div className="flex flex-wrap gap-1.5">
              {copy.copyFormulas.map((f, i) => <span key={i} className="tag">{f}</span>)}
            </div>
          </div>
        )}

        {copy.powerWords.length > 0 && (
          <div>
            <span className="text-[10px] text-text-secondary uppercase tracking-wider block mb-2">Palavras de poder</span>
            <div className="flex flex-wrap gap-1.5">
              {copy.powerWords.map((w, i) => <span key={i} className="tag tag-neon">{w}</span>)}
            </div>
          </div>
        )}

        <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
          <p className="text-xs text-text-secondary leading-relaxed break-words">{copy.captionAnalysis}</p>
        </div>
      </div>
    </div>
  );
}
