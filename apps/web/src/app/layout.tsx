import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import { FeedbackButton } from '@/components/feedback-button';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ReelVerse — Engenharia Reversa de Vídeos Curtos',
    template: '%s | ReelVerse',
  },
  description: 'Descubra a anatomia do próximo vídeo viral. Cole um link do YouTube Shorts e receba instantaneamente os padrões de hook, copy, retenção e storytelling.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://reelverse.app', // Placeholder
    title: 'ReelVerse — Engenharia Reversa de Vídeos Curtos',
    description: 'Descubra a anatomia do próximo vídeo viral. Desconstrução 6D com IA para Shorts, Reels e TikTok.',
    siteName: 'ReelVerse',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReelVerse — Engenharia Reversa de Vídeos Curtos',
    description: 'Descubra a anatomia do próximo vídeo viral.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {process.env.NEXT_PUBLIC_CLARITY_ID && (
          <Script
            id="ms-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
              `,
            }}
          />
        )}
      </head>
      <body className="min-h-screen bg-background font-sans text-text-primary antialiased">
        {children}
        <FeedbackButton />
      </body>
    </html>
  );
}
