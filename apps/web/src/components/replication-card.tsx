'use client';

import { useState } from 'react';
import { Check, AlertTriangle, Copy, Repeat } from 'lucide-react';
import type { AnalysisResult } from '@reelverse/shared';

export function ReplicationCard({ replication }: { replication: AnalysisResult['replication'] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(replication.templateScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  return (
    <div className="rounded-2xl bg-surface border border-white/[0.06] overflow-hidden animate-fade-in-up delay-7">
      {/* Gradient top accent */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-neon" />

      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧬</span>
          <h2 className="text-xl font-display font-bold text-text-primary">Playbook de Replicação</h2>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed break-words">{replication.summary}</p>

        {/* Takeaways */}
        <div>
          <h4 className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.15em] mb-3">
            Padrões replicáveis
          </h4>
          <div className="space-y-2">
            {replication.keyTakeaways.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm animate-slide-in-right" style={{ animationDelay: `${(i + 7) * 0.1}s` }}>
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-neon/15 flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-neon" />
                </span>
                <span className="text-text-primary leading-relaxed break-words flex-1 min-w-0">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Script */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.15em]">
              Script modelo
            </h4>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[10px] text-text-secondary hover:text-primary transition-colors px-2.5 py-1 rounded-lg hover:bg-white/5 border border-white/[0.06]"
            >
              <Copy className="w-3 h-3" />
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
          <div className="relative rounded-xl bg-background border border-white/[0.06] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-primary/30 via-accent/20 to-transparent" />
            <pre className="p-5 text-sm text-text-primary whitespace-pre-wrap break-words leading-relaxed font-mono">
              {replication.templateScript}
            </pre>
          </div>
        </div>

        {/* What to avoid */}
        <div>
          <h4 className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.15em] mb-3">
            O que evitar
          </h4>
          <div className="space-y-2">
            {replication.whatToAvoid.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-warning/15 flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-3 h-3 text-warning" />
                </span>
                <span className="text-text-primary leading-relaxed break-words flex-1 min-w-0">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
