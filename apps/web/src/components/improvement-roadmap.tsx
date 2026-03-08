'use client';

import { Zap, ArrowRight, ChevronRight } from 'lucide-react';
import type { AnalysisResult, Improvement } from '@reelverse/shared';

function getEffortConfig(effort: Improvement['effort']) {
  switch (effort) {
    case 'fácil': return { label: 'Fácil', emoji: '🟢', className: 'effort-easy' };
    case 'moderado': return { label: 'Moderado', emoji: '🟡', className: 'effort-moderate' };
    case 'avançado': return { label: 'Avançado', emoji: '🔴', className: 'effort-advanced' };
  }
}

function getImpactConfig(impact: Improvement['impact']) {
  switch (impact) {
    case 'alto': return { label: 'Alto impacto', color: '#00F5D4' };
    case 'médio': return { label: 'Médio impacto', color: '#FFD93D' };
    case 'baixo': return { label: 'Baixo impacto', color: '#A29BFE' };
  }
}

function getDimensionLabel(dim: string): string {
  const map: Record<string, string> = {
    hook: 'Hook', narrative: 'Narrativa', copy: 'Copy',
    editing: 'Edição', audio: 'Áudio', cta: 'CTA',
  };
  return map[dim] ?? dim;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#00F5D4';
  if (score >= 60) return '#A29BFE';
  if (score >= 40) return '#FFD93D';
  return '#FF6B6B';
}

export function ImprovementRoadmap({ result }: { result: AnalysisResult }) {
  const improvements = result.improvements ?? [];

  if (improvements.length === 0) return null;

  return (
    <section className="animate-fade-in-up delay-2">
      <div className="flex items-center gap-3 mb-5">
        <span className="text-2xl">🎯</span>
        <h2 className="text-xl font-display font-bold text-text-primary">Próximos Passos</h2>
        <span className="tag tag-accent text-[10px]">{improvements.length} melhorias</span>
      </div>

      <div className="space-y-3">
        {improvements.map((imp, i) => {
          const effort = getEffortConfig(imp.effort);
          const impact = getImpactConfig(imp.impact);
          const currentColor = getScoreColor(imp.currentScore);
          const projectedColor = getScoreColor(imp.projectedScore);
          const sectionId = `section-${imp.dimension}`;

          return (
            <button
              key={i}
              onClick={() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className="group w-full text-left rounded-2xl bg-surface border border-white/[0.06] p-5 hover:border-primary/30 transition-all hover:bg-surface-elevated"
              style={{ animationDelay: `${(i + 2) * 0.1}s` }}
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="tag tag-primary text-[10px] font-semibold flex-shrink-0">
                    {getDimensionLabel(imp.dimension)}
                  </span>
                  <span className="text-[10px] font-medium flex-shrink-0" style={{ color: impact.color }}>
                    {impact.label}
                  </span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0 ${effort.className}`}>
                  {effort.emoji} {effort.label}
                </span>
              </div>

              {/* Action */}
              <p className="text-sm text-text-primary font-medium mb-3 leading-relaxed break-words">
                {imp.action}
              </p>

              {/* Score projection */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-lg font-display font-bold" style={{ color: currentColor }}>
                    {imp.currentScore}
                  </span>
                  
                  {/* Progress bar */}
                  <div className="flex-1 h-2 rounded-full bg-white/[0.04] overflow-hidden relative">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full opacity-30"
                      style={{ width: `${imp.projectedScore}%`, backgroundColor: projectedColor }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ width: `${imp.currentScore}%`, backgroundColor: currentColor }}
                    />
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-text-secondary/40" />
                  
                  <span className="text-lg font-display font-bold" style={{ color: projectedColor }}>
                    {imp.projectedScore}
                  </span>
                </div>

                <span className="text-[10px] text-text-secondary/50 font-medium">
                  +{imp.projectedScore - imp.currentScore} pts
                </span>
              </div>

              {/* Example */}
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-3">
                <div className="flex items-start gap-2">
                  <Zap className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-text-secondary leading-relaxed break-words flex-1 min-w-0">{imp.example}</p>
                </div>
              </div>

              {/* Click hint */}
              <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-primary flex items-center gap-0.5">
                  Ver análise completa <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
