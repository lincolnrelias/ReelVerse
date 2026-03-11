'use client';

import { Activity } from 'lucide-react';
import type { AnalysisResult } from '@reelverse/shared';
import { useTranslation } from '@/hooks/use-translation';

function getScoreColor(score: number): string {
  if (score >= 80) return '#00F5D4';
  if (score >= 60) return '#A29BFE';
  if (score >= 40) return '#FFD93D';
  return '#FF6B6B';
}

const PHASE_COLORS = [
  { bg: 'bg-primary', border: 'border-primary/40' },
  { bg: 'bg-accent/80', border: 'border-accent/30' },
  { bg: 'bg-neon/70', border: 'border-neon/30' },
  { bg: 'bg-warning/70', border: 'border-warning/30' },
];

interface NarrativeTimelineProps {
  narrative: AnalysisResult['narrative'];
  score: number;
}

export function NarrativeTimeline({ narrative, score }: NarrativeTimelineProps) {
  const { t } = useTranslation();
  const phases = narrative.phases ?? [];
  const total = phases.length > 0 ? Math.max(...phases.map((p) => p.endTime)) : 0;
  const color = getScoreColor(score);
  const remaining = 100 - score;

  return (
    <div id="section-narrative" className="rounded-2xl bg-surface border border-white/[0.06] overflow-hidden">
      <div className="relative px-5 py-4 border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-light/10 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-light" />
            <h3 className="text-base font-display font-bold">{t.deepDive.narrative.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold" style={{ color }}>{score}</span>
            {remaining > 0 && <span className="text-[10px] text-text-secondary/50">-{remaining} pts</span>}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="tag tag-primary">{narrative.structure}</span>
          <span className="tag">{narrative.pacing}</span>
        </div>

        {/* Timeline bar */}
        <div className="relative h-8 flex rounded-xl overflow-hidden bg-white/[0.03]">
          {phases.map((phase, i) => {
            const width = total > 0 ? ((phase.endTime - phase.startTime) / total) * 100 : 100 / phases.length;
            const colors = PHASE_COLORS[i % PHASE_COLORS.length];
            return (
              <div
                key={i}
                className={`${colors.bg} flex-shrink-0 relative group cursor-default flex items-center justify-center`}
                style={{ width: `${width}%` }}
              >
                <span className="text-[8px] text-white/80 font-medium truncate px-1">{phase.name}</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg bg-surface-elevated border border-white/10 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                  <p className="font-medium text-text-primary break-words whitespace-normal">{phase.name}</p>
                  <p className="text-text-secondary mt-0.5 break-words whitespace-normal">{phase.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Phase details */}
        <div className="grid gap-2">
          {phases.map((p, i) => {
            const colors = PHASE_COLORS[i % PHASE_COLORS.length];
            return (
              <div key={i} className={`rounded-xl bg-white/[0.02] p-3 border-l-2 ${colors.border}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-text-primary">{p.name}</span>
                  <span className="text-[10px] text-text-secondary/50 font-mono">
                    {p.startTime.toFixed(1)}s – {p.endTime.toFixed(1)}s
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed break-words">{p.description}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
          <p className="text-xs text-text-secondary/60 uppercase tracking-wider mb-1.5">{t.deepDive.narrative.analysis}</p>
          <p className="text-xs text-text-secondary leading-relaxed break-words">{narrative.effectiveness}</p>
        </div>
      </div>
    </div>
  );
}
