'use client';

import { useState, useEffect } from 'react';
import type { AnalysisStatusEnum } from '@reelverse/shared';
import type { VideoMeta } from '@reelverse/shared';
import { Loader2 } from 'lucide-react';

const STEPS: { status: AnalysisStatusEnum; label: string; emoji: string }[] = [
  { status: 'pending', label: 'Na fila de processamento', emoji: '⏳' },
  { status: 'extracting', label: 'Extraindo vídeo e metadados', emoji: '📥' },
  { status: 'processing_video', label: 'Analisando cortes e frames', emoji: '🎬' },
  { status: 'transcribing', label: 'Transcrevendo áudio com IA', emoji: '🎙️' },
  { status: 'analyzing', label: 'Desconstruindo roteiro e hook', emoji: '🧠' },
];

const ENGAGEMENT_TEXTS = [
  "Você sabia? Hooks visuais nos primeiros 3s aumentam a retenção em 47%.",
  "Nossa IA está assistindo seu vídeo frame por frame...",
  "Calculando a densidade de cortes e ritmo da edição.",
  "Mapeando quebras de padrão no seu storytelling...",
  "Comparando seu vídeo com milhares de virais bem-sucedidos.",
];

interface AnalysisLoadingProps {
  status: AnalysisStatusEnum;
  videoMeta?: VideoMeta | null;
}

export function AnalysisLoading({ status, videoMeta }: AnalysisLoadingProps) {
  const [funFactIndex, setFunFactIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setFunFactIndex((prev) => (prev + 1) % ENGAGEMENT_TEXTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const currentIndex = STEPS.findIndex((s) => s.status === status);
  const progress = currentIndex < 0 ? 0 : ((currentIndex + 1) / STEPS.length) * 100;
  const currentStep = STEPS[currentIndex] || STEPS[0];

  return (
    <div className="space-y-6 max-w-xl mx-auto w-full">
      {/* Informações do vídeo com Glassmorphism minimalista */}
      {videoMeta && (
        <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl p-4 animate-fade-in-up">
          {videoMeta.thumbnailUrl && (
            <img
              src={videoMeta.thumbnailUrl}
              alt=""
              className="w-24 h-40 rounded-xl object-cover flex-shrink-0 shadow-lg"
            />
          )}
          <div className="min-w-0 flex-1 flex flex-col justify-center">
            <span className="tag tag-accent text-[10px] w-fit mb-2">Desconstruindo</span>
            <p className="font-display font-bold text-text-primary truncate">{videoMeta.title}</p>
            <p className="text-sm text-text-secondary">{videoMeta.channelName}</p>
          </div>
        </div>
      )}

      {/* Main Glassmorphic Loading Card */}
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-fade-in-up delay-2">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon/10 rounded-full blur-[80px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
        
        {/* Dynamic Focus Area */}
        <div className="relative z-10 text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/[0.05] border border-white/10 shadow-inner mb-6 relative">
            <span className="text-4xl animate-bounce">{currentStep.emoji}</span>
            <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping opacity-20" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-text-primary mb-3">
            {currentStep.label}
          </h2>
          
          {/* Attention Retainer Text */}
          <div className="h-12 sm:h-6 relative">
            <p 
              key={funFactIndex} 
              className="text-sm text-text-secondary absolute inset-0 text-center animate-fade-in-up px-2"
            >
              {ENGAGEMENT_TEXTS[funFactIndex]}
            </p>
          </div>
        </div>

        {/* Thick Neon Progress Bar */}
        <div className="h-2.5 rounded-full bg-black/40 border border-white/5 overflow-hidden mb-10 relative z-10 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-primary via-accent to-neon transition-all duration-[1000ms] ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-shimmer" style={{
              backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              backgroundSize: '200% 100%'
            }} />
          </div>
        </div>
        
        {/* Stepper List */}
        <ul className="space-y-4 relative z-10">
          {STEPS.map((step, i) => {
            const active = step.status === status;
            const done = currentIndex > i;
            
            return (
              <li
                key={step.status}
                className={`flex items-center gap-4 text-sm transition-all duration-500 rounded-xl p-3 ${
                  done 
                    ? 'text-text-secondary bg-white/[0.02]' 
                    : active 
                      ? 'text-text-primary font-medium bg-white/[0.06] border border-white/[0.05] shadow-lg translate-x-2 scale-[1.02]' 
                      : 'text-text-secondary/40 opacity-50'
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-black/20">
                  {done ? (
                    <span className="text-lg">✅</span>
                  ) : active ? (
                    <Loader2 className="w-5 h-5 animate-spin text-accent" />
                  ) : (
                    <span className="text-lg grayscale opacity-50">{step.emoji}</span>
                  )}
                </div>
                <span className="flex-1 min-w-0 break-words leading-tight mt-1">{step.label}</span>
                {active && <span className="text-[10px] uppercase font-bold text-accent animate-pulse tracking-wider flex-shrink-0">Processando</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
