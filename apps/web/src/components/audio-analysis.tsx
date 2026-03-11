'use client';

import { Music, Mic, Volume2 } from 'lucide-react';
import type { AnalysisResult } from '@reelverse/shared';
import { useTranslation } from '@/hooks/use-translation';

function getScoreColor(score: number): string {
  if (score >= 80) return '#00F5D4';
  if (score >= 60) return '#A29BFE';
  if (score >= 40) return '#FFD93D';
  return '#FF6B6B';
}

interface AudioAnalysisProps {
  audio: AnalysisResult['audio'];
  score: number;
}

export function AudioAnalysis({ audio, score }: AudioAnalysisProps) {
  const { t } = useTranslation();
  const color = getScoreColor(score);
  const remaining = 100 - score;

  return (
    <div id="section-audio" className="rounded-2xl bg-surface border border-white/[0.06] overflow-hidden">
      <div className="relative px-5 py-4 border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-r from-warning/10 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-warning" />
            <h3 className="text-base font-display font-bold">{t.deepDive.audio.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-display font-bold" style={{ color }}>{score}</span>
            {remaining > 0 && <span className="text-[10px] text-text-secondary/50">-{remaining} pts</span>}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-3">
            <div className="flex items-center gap-2 mb-2">
              <Music className="w-3.5 h-3.5 text-text-secondary/60" />
              <span className="text-[10px] text-text-secondary uppercase tracking-wider">{t.deepDive.audio.music}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className={`w-6 h-6 flex-shrink-0 mt-0.5 rounded-full flex items-center justify-center text-[10px] font-bold ${audio.hasMusic ? 'bg-neon/15 text-neon' : 'bg-white/5 text-text-secondary/50'}`}>
                {audio.hasMusic ? '✓' : '✗'}
              </span>
              {audio.musicMood && <span className="tag text-[10px] flex-1">{audio.musicMood}</span>}
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-3">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-3.5 h-3.5 text-text-secondary/60" />
              <span className="text-[10px] text-text-secondary uppercase tracking-wider">{t.deepDive.audio.voiceover}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className={`w-6 h-6 flex-shrink-0 mt-0.5 rounded-full flex items-center justify-center text-[10px] font-bold ${audio.hasVoiceover ? 'bg-neon/15 text-neon' : 'bg-white/5 text-text-secondary/50'}`}>
                {audio.hasVoiceover ? '✓' : '✗'}
              </span>
              {audio.voiceoverStyle && <span className="tag text-[10px] flex-1">{audio.voiceoverStyle}</span>}
            </div>
          </div>
        </div>

        {audio.soundEffects.length > 0 && (
          <div>
            <span className="text-[10px] text-text-secondary uppercase tracking-wider block mb-2">{t.deepDive.audio.sfx}</span>
            <div className="flex flex-wrap gap-1.5">
              {audio.soundEffects.map((e, i) => <span key={i} className="tag">{e}</span>)}
            </div>
          </div>
        )}

        <div className="rounded-xl bg-white/[0.02] p-3 border border-white/[0.04]">
          <p className="text-xs text-text-secondary/60 uppercase tracking-wider mb-1.5">{t.deepDive.audio.sync}</p>
          <p className="text-xs text-text-secondary leading-relaxed break-words">{audio.audioVideoSync}</p>
        </div>
      </div>
    </div>
  );
}
