import type { AnalysisStatus, CreateAnalysisInput } from '@reelverse/shared';
import * as Sentry from '@sentry/nextjs';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function getMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: string }).message === 'string') {
    return (err as { message: string }).message;
  }
  return 'Erro desconhecido. Tente novamente.';
}

export async function createAnalysis(input: CreateAnalysisInput): Promise<{ id: string; status: string; createdAt: string }> {
  return Sentry.startSpan(
    {
      name: 'Create Analysis',
      op: 'http.client',
    },
    async (span) => {
      span.setAttribute('videoUrl', input.videoUrl);
      const res = await fetch(`${API_URL}/api/analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message ?? getMessage(data) ?? `Erro ${res.status}`);
      }
      return data;
    }
  );
}

export async function getAnalysis(id: string): Promise<AnalysisStatus> {
  return Sentry.startSpan(
    {
      name: `Get Analysis ${id}`,
      op: 'http.client',
    },
    async () => {
      const res = await fetch(`${API_URL}/api/analysis/${id}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message ?? getMessage(data) ?? `Erro ${res.status}`);
      }
      return data;
    }
  );
}

export async function checkCachedAnalysis(videoUrl: string): Promise<{ cached: boolean; analysisId?: string }> {
  const res = await fetch(`${API_URL}/api/analysis/cache-check?videoUrl=${encodeURIComponent(videoUrl)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { cached: false };
  return { cached: !!data.cached, analysisId: data.analysisId };
}
