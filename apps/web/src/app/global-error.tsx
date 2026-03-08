'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
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
    <html lang="pt-BR">
      <body>
        <main className="min-h-screen p-6 flex flex-col items-center justify-center relative overflow-hidden bg-[#0A0A12] text-white">
          <div className="absolute inset-0 bg-gradient-mesh opacity-30 pointer-events-none" />
          <div className="absolute inset-0 noise" />
          <div className="relative z-10 text-center space-y-4 max-w-md">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🛑</span>
            </div>
            <h2 className="text-2xl font-display font-bold">Erro Crítico</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Ocorreu um erro inesperado na aplicação. Nossa equipe já foi notificada.
            </p>
            <Button onClick={() => reset()} className="w-full sm:w-auto">
              Tentar Novamente
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
