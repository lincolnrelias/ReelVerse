'use client';

import type { AnalysisResult, VideoMeta } from '@reelverse/shared';
import { VerdictHero } from './verdict-hero';
import { ImprovementRoadmap } from './improvement-roadmap';
import { StrengthsSection } from './strengths-section';
import { RadarChart } from './radar-chart';
import { HookAnalysis } from './hook-analysis';
import { CopyAnalysis } from './copy-analysis';
import { EditingAnalysis } from './editing-analysis';
import { AudioAnalysis } from './audio-analysis';
import { CtaAnalysis } from './cta-analysis';
import { NarrativeTimeline } from './narrative-timeline';
import { ReplicationCard } from './replication-card';
import { useTranslation } from '@/hooks/use-translation';

interface AnalysisReportProps {
  result: AnalysisResult;
  videoMeta?: VideoMeta | null;
  processingTimeMs?: number;
}

export function AnalysisReport({ result, videoMeta, processingTimeMs }: AnalysisReportProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* 1. Immediate value — how's the video? */}
      <VerdictHero result={result} videoMeta={videoMeta} processingTimeMs={processingTimeMs} />

      {/* 2. Actionable — what to fix, with score projections */}
      <ImprovementRoadmap result={result} />

      {/* 3. Celebrate wins */}
      <StrengthsSection result={result} />

      {/* 4. Visual overview */}
      <RadarChart result={result} />

      {/* 5. Deep dive */}
      <section className="space-y-4 animate-fade-in-up delay-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🔬</span>
          <h2 className="text-xl font-display font-bold text-text-primary">{t.report.detailedAnalysis}</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <HookAnalysis hook={result.hook} score={result.hookScore} />
          <CopyAnalysis copy={result.copy} score={result.copyScore} />
          <EditingAnalysis editing={result.editing} score={result.editingScore} />
          <AudioAnalysis audio={result.audio} score={result.audioScore} />
          <CtaAnalysis cta={result.cta} score={result.ctaScore} />
          <NarrativeTimeline narrative={result.narrative} score={result.narrativeScore} />
        </div>
      </section>

      {/* 6. Replication playbook */}
      <ReplicationCard replication={result.replication} />
    </div>
  );
}
