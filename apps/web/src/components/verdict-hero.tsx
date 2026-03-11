'use client';

import { useEffect, useState } from 'react';
import type { AnalysisResult, VideoMeta } from '@reelverse/shared';
import { useTranslation } from '@/hooks/use-translation';

function getVerdict(score: number, t: any) {
  if (score >= 85) return { emoji: '🔥', text: t.verdict.viral, color: '#00F5D4' };
  if (score >= 70) return { emoji: '💪', text: t.verdict.good, color: '#A29BFE' };
  if (score >= 50) return { emoji: '⚡', text: t.verdict.base, color: '#FFD93D' };
  if (score >= 30) return { emoji: '🎯', text: t.verdict.attention, color: '#FF8EB3' };
  return { emoji: '🔧', text: t.verdict.rework, color: '#FF6B6B' };
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#00F5D4';
  if (score >= 60) return '#A29BFE';
  if (score >= 40) return '#FFD93D';
  return '#FF6B6B';
}

interface VerdictHeroProps {
  result: AnalysisResult;
  videoMeta?: VideoMeta | null;
  processingTimeMs?: number;
}

export function VerdictHero({ result, videoMeta, processingTimeMs }: VerdictHeroProps) {
  const { t } = useTranslation();
  const [displayScore, setDisplayScore] = useState(0);
  const verdict = getVerdict(result.overallScore, t);
  const color = getScoreColor(result.overallScore);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  useEffect(() => {
    let frame: number;
    const duration = 1400;
    const start = performance.now();
    const target = result.overallScore;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [result.overallScore]);

  return (
    <section className="relative rounded-3xl overflow-hidden animate-fade-in-up">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/80" />

      {/* Noise texture */}
      <div className="absolute inset-0 noise" />

      {/* Gradient border */}
      <div className="absolute inset-0 gradient-border rounded-3xl" />

      <div className="relative z-10 p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Score Ring */}
          <div className="relative flex-shrink-0">
            <div className="relative w-40 h-40">
              {/* Glow behind ring */}
              <div className="absolute inset-2 rounded-full animate-glow-pulse" style={{ boxShadow: `0 0 40px 8px ${color}20` }} />
              
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r={radius} fill="none" className="score-ring-bg" strokeWidth="8" />
                <circle
                  cx="64" cy="64" r={radius}
                  fill="none" stroke={color} strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-100"
                  style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-display font-bold tracking-tight" style={{ color }}>{displayScore}</span>
                <span className="text-[10px] text-text-secondary uppercase tracking-[0.2em] mt-0.5">score</span>
              </div>
            </div>
          </div>

          {/* Verdict + Summary */}
          <div className="flex-1 text-center sm:text-left min-w-0 space-y-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-3xl flex-shrink-0">{verdict.emoji}</span>
              <h1 className="text-2xl sm:text-3xl font-display font-bold break-words" style={{ color: verdict.color }}>
                {verdict.text}
              </h1>
            </div>

            <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-lg">
              {result.verdictSummary}
            </p>

            {videoMeta && (
              <div className="inline-flex text-left items-center gap-3 rounded-2xl glass p-3 mt-4 max-w-md w-fit">
                {videoMeta.thumbnailUrl && (
                  <img src={videoMeta.thumbnailUrl} alt="" className="w-14 h-9 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text-primary pr-2 truncate">{videoMeta.title}</p>
                  <p className="text-[10px] text-text-secondary pr-2 truncate mt-0.5">
                    {videoMeta.channelName} • {videoMeta.duration}s{videoMeta.viewCount ? ` • ${videoMeta.viewCount.toLocaleString()} views` : ''}
                  </p>
                </div>
              </div>
            )}

            {processingTimeMs != null && (
              <p className="text-[10px] text-text-secondary/60 mt-2">
                {t.verdict.analyzedIn} {(processingTimeMs / 1000).toFixed(1)}s
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
