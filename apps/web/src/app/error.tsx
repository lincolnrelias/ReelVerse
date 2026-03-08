'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <main className="min-h-screen p-6 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
      <div className="absolute inset-0 noise" />
      <div className="relative z-10 text-center space-y-4 max-w-md">
        <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h2 className="text-2xl font-display font-bold text-text-primary">Ops, algo deu errado</h2>
        <p className="text-text-secondary text-sm leading-relaxed mb-6">
          Ocorreu um erro ao carregar esta página. Tente recarregar ou voltar para o início.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => reset()}>Tentar Novamente</Button>
          <Link href="/">
            <Button variant="secondary">Página Inicial</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
