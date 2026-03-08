'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getAnalysis } from '@/lib/api';
import type { AnalysisStatus } from '@reelverse/shared';
import { AnalysisLoading } from '@/components/analysis-loading';
import { AnalysisReport } from '@/components/analysis-report';
import { Button } from '@/components/ui/button';

const POLL_INTERVAL_MS = 2000;

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const [status, setStatus] = useState<AnalysisStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getAnalysis(params.id);
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar análise.');
    }
  }, [params.id]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!status || status.status === 'completed' || status.status === 'failed') return;
    const timer = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [status?.status, fetchStatus]);

  if (error && !status) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
        <div className="absolute inset-0 noise" />
        <div className="relative z-10 text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔌</span>
          </div>
          <h2 className="text-xl font-display font-bold text-text-primary">Erro de Conexão</h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            {error}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={fetchStatus} className="w-full sm:w-auto">
              Tentar Novamente
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full">Página Inicial</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!status) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <p className="text-text-secondary">Carregando...</p>
      </main>
    );
  }

  if (status.status === 'failed') {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
        <div className="absolute inset-0 noise" />
        <div className="relative z-10 text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-text-primary">Ops, a análise falhou</h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-6">
            {status.errorMessage ?? 'Ocorreu um erro inesperado durante o processamento do seu vídeo. Por favor, tente novamente.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={fetchStatus} className="w-full sm:w-auto">
              Tentar Novamente
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full">Voltar ao Início</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (status.status === 'completed' && status.result) {
    return (
      <main className="min-h-screen p-6 pb-12">
        <div className="max-w-4xl mx-auto mb-6">
          <Link href="/" className="text-primary hover:underline text-sm">
            ← Nova análise
          </Link>
        </div>
        <AnalysisReport
          result={status.result}
          videoMeta={status.videoMeta}
          processingTimeMs={status.processingTimeMs}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center">
      <AnalysisLoading status={status.status} videoMeta={status.videoMeta} />
      <Link href="/" className="mt-6 text-sm text-text-secondary hover:text-primary">
        Cancelar e voltar
      </Link>
    </main>
  );
}
