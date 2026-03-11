'use client';

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { AnalysisResult } from '@reelverse/shared';
import { useTranslation } from '@/hooks/use-translation';

interface RadarChartProps {
  result: AnalysisResult;
}

const DIMENSIONS = [
  { key: 'hookScore', name: 'Hook' },
  { key: 'narrativeScore', name: 'Narrativa' },
  { key: 'copyScore', name: 'Copy' },
  { key: 'editingScore', name: 'Edição' },
  { key: 'audioScore', name: 'Áudio' },
  { key: 'ctaScore', name: 'CTA' },
];

export function RadarChart({ result }: RadarChartProps) {
  const { t } = useTranslation();
  const data = DIMENSIONS.map((d) => ({
    subject: d.name,
    score: result[d.key as keyof AnalysisResult] as number,
    fullMark: 100,
  }));

  return (
    <div className="rounded-2xl bg-surface border border-white/[0.06] p-6 animate-fade-in-up delay-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📊</span>
        <h2 className="text-xl font-display font-bold text-text-primary">{t.radar.title}</h2>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#7B7B9B', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#7B7B9B', fontSize: 9 }} axisLine={false} />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#6C5CE7"
              fill="url(#radarGradient)"
              strokeWidth={2}
              dot={{ r: 3, fill: '#6C5CE7', stroke: '#6C5CE7' }}
            />
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6C5CE7" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#6C5CE7" stopOpacity={0.05} />
              </linearGradient>
            </defs>
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
