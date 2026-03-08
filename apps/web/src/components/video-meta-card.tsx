'use client';

import type { VideoMeta } from '@reelverse/shared';
import { Card, CardContent } from '@/components/ui/card';

export function VideoMetaCard({ meta }: { meta: VideoMeta }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          {meta.thumbnailUrl && (
            <img
              src={meta.thumbnailUrl}
              alt=""
              className="w-40 h-auto rounded-xl object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-text-primary">{meta.title}</h1>
            <p className="text-text-secondary">{meta.channelName}</p>
            <p className="text-sm text-text-secondary mt-2">
              {meta.duration}s · {meta.viewCount.toLocaleString()} views · {meta.likeCount.toLocaleString()} likes
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
