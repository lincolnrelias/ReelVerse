'use client';

import { useEffect, useState } from 'react';

function getColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#F59E0B';
  if (score >= 40) return '#F97316';
  return '#EF4444';
}

function getLabel(score: number): string {
  if (score >= 80) return 'Ótimo';
  if (score >= 60) return 'Bom';
  if (score >= 40) return 'Ok';
  return 'Fraco';
}

function getGlow(score: number): string {
  if (score >= 80) return 'glow-success';
  if (score >= 60) return 'glow-warning';
  return 'glow-error';
}

interface ScoreCardProps {
  label: string;
  score: number;
  compact?: boolean;
}

export function ScoreCard({ label, score, compact = false }: ScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const color = getColor(score);
  const contextLabel = getLabel(score);
  const glowClass = getGlow(score);
  const radius = compact ? 28 : 36;
  const viewBox = compact ? 64 : 80;
  const center = viewBox / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;
  const strokeWidth = compact ? 6 : 8;

  useEffect(() => {
    let frame: number;
    const duration = 800;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className={`rounded-2xl border border-white/10 bg-surface flex flex-col items-center ${glowClass} ${compact ? 'p-3' : 'p-4'}`}>
      <div className={`relative ${compact ? 'w-16 h-16' : 'w-24 h-24'}`}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${viewBox} ${viewBox}`}>
          <circle
            cx={center} cy={center} r={radius}
            fill="none" stroke="currentColor" strokeWidth={strokeWidth}
            className="text-surface-elevated"
          />
          <circle
            cx={center} cy={center} r={radius}
            fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-100"
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center font-bold ${compact ? 'text-sm' : 'text-lg'}`}
          style={{ color }}
        >
          {displayScore}
        </span>
      </div>
      <p className={`text-text-secondary mt-1 ${compact ? 'text-[10px]' : 'text-sm'}`}>{label}</p>
      <span
        className={`text-[10px] font-medium mt-0.5 ${compact ? 'hidden' : ''}`}
        style={{ color }}
      >
        {contextLabel}
      </span>
    </div>
  );
}
