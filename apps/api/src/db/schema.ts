import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import type {
  VideoMeta,
  TranscriptionData,
  FrameAnalysisData,
  AnalysisResult,
} from '@reelverse/shared';

export const platformEnum = pgEnum('platform', [
  'youtube_shorts',
  'tiktok',
  'instagram_reels',
]);
export const analysisStatusEnum = pgEnum('analysis_status', [
  'pending',
  'extracting',
  'processing_video',
  'transcribing',
  'analyzing',
  'completed',
  'failed',
]);

export const analyses = pgTable('analyses', {
  id: uuid('id').defaultRandom().primaryKey(),
  videoUrl: text('video_url').notNull(),
  platform: platformEnum('platform').notNull().default('youtube_shorts'),
  status: analysisStatusEnum('status').notNull().default('pending'),
  errorMessage: text('error_message'),

  videoMeta: jsonb('video_meta').$type<VideoMeta>(),
  transcription: jsonb('transcription').$type<TranscriptionData>(),
  frameAnalysis: jsonb('frame_analysis').$type<FrameAnalysisData>(),
  result: jsonb('result').$type<AnalysisResult>(),

  processingCostCents: integer('processing_cost_cents').default(0),
  processingTimeMs: integer('processing_time_ms'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;
