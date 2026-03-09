'use client';

import { useEffect, useRef } from 'react';

// Expand window type for AdSense array
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdBannerProps {
  dataAdSlot: string;
  dataAdFormat?: string;
  dataFullWidthResponsive?: boolean;
  className?: string;
}

export function AdBanner({
  dataAdSlot,
  dataAdFormat = 'auto',
  dataFullWidthResponsive = true,
  className = '',
}: AdBannerProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isDev = process.env.NODE_ENV === 'development';
  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  useEffect(() => {
    // Prevent pushing multiple times to the same ad slot if it's already filled
    if (!isDev && adClientId && adRef.current && !adRef.current.hasChildNodes()) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense Error:', err);
      }
    }
  }, [isDev, adClientId]);

  // If ID is completely missing or in dev mode, show a placeholder
  if (isDev || !adClientId) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-400 text-sm font-medium overflow-hidden ${className}`}
        style={{ minHeight: '100px' }}
      >
        <span>[ Espaço Publicitário Reservado ]</span>
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-lg flex justify-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={adClientId}
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
}
