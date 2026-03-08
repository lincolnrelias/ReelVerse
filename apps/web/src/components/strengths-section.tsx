'use client';

import { Check } from 'lucide-react';
import type { AnalysisResult } from '@reelverse/shared';

interface DimensionInfo {
  key: string;
  scoreKey: keyof AnalysisResult;
  label: string;
  getStrength: (r: AnalysisResult) => string;
}

const DIMENSIONS: DimensionInfo[] = [
  { key: 'hook', scoreKey: 'hookScore', label: 'Hook', getStrength: (r) => r.hook.description },
  { key: 'narrative', scoreKey: 'narrativeScore', label: 'Narrativa', getStrength: (r) => r.narrative.effectiveness },
  { key: 'copy', scoreKey: 'copyScore', label: 'Copy', getStrength: (r) => r.copy.mainMessage },
  { key: 'editing', scoreKey: 'editingScore', label: 'Edição', getStrength: (r) => r.editing.standoutTechnique },
  { key: 'audio', scoreKey: 'audioScore', label: 'Áudio', getStrength: (r) => r.audio.audioVideoSync },
  { key: 'cta', scoreKey: 'ctaScore', label: 'CTA', getStrength: (r) => r.cta.effectiveness },
];

export function StrengthsSection({ result }: { result: AnalysisResult }) {
  const sorted = [...DIMENSIONS]
    .map((d) => ({ ...d, score: result[d.scoreKey] as number }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return (
    <section className="animate-fade-in-up delay-3">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🔥</span>
        <h2 className="text-xl font-display font-bold text-text-primary">Pontos Fortes</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {sorted.map((dim, i) => (
          <div
            key={dim.key}
            className="relative rounded-2xl bg-surface p-5 overflow-hidden group"
            style={{ animationDelay: `${(i + 3) * 0.1}s` }}
          >
            {/* Subtle gradient accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon/60 via-neon/30 to-transparent" />

            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-primary">{dim.label}</span>
              <span className="text-2xl font-display font-bold text-neon">{dim.score}</span>
            </div>

            <div className="flex items-start gap-2">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neon/15 flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-neon" />
              </span>
              <p className="text-xs text-text-secondary leading-relaxed line-clamp-3 break-words flex-1 min-w-0">
                {dim.getStrength(result)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
