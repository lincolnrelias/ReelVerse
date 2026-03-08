import type { Metadata } from 'next';
import { getAnalysis } from '@/lib/api';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const data = await getAnalysis(params.id);
    if (data && data.videoMeta) {
      const { title, channelName, thumbnailUrl } = data.videoMeta;
      const scoreMsg = data.result ? `Score de Viralidade: ${data.result.overallScore}/100.` : '';
      
      return {
        title: `Análise: ${title}`,
        description: `Engenharia reversa estruturada do vídeo de ${channelName}. ${scoreMsg}`,
        openGraph: {
          title: `ReelVerse — Análise: ${title}`,
          description: `Desconstrução 6D do vídeo de ${channelName}. ${scoreMsg}`,
          images: thumbnailUrl ? [{ url: thumbnailUrl }] : [],
        },
        twitter: {
          card: 'summary_large_image',
          title: `Análise: ${title}`,
          description: `Descubra a anatomia deste vídeo de ${channelName}. ${scoreMsg}`,
          images: thumbnailUrl ? [thumbnailUrl] : [],
        }
      };
    }
  } catch (error) {
    // Falha silenciosa para fallback
  }

  return {
    title: 'Análise de Vídeo',
  };
}

export default function AnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
