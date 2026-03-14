import { z } from 'zod';

// YouTube Short URL validation (reuse in API)
// YouTube URL validation (shorts, watch, mobile, etc.)
export const youtubeShortRegex =
  /^(?:https?:\/\/)?(?:(?:www|m)\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]{11}(?:\S+)?$/;

export const createAnalysisSchema = z.object({
  videoUrl: z
    .string()
    .url()
    .regex(youtubeShortRegex, 'URL deve ser um YouTube Short válido'),
  language: z.enum(['en', 'pt']).default('en').optional(),
});

export type CreateAnalysisSchema = z.infer<typeof createAnalysisSchema>;

// AnalysisResult Zod schema for validating Claude output
const narrativePhaseSchema = z.object({
  name: z.string(),
  startTime: z.number(),
  endTime: z.number(),
  description: z.string(),
});

const improvementSchema = z.object({
  dimension: z.string(),
  action: z.string(),
  impact: z.enum(['alto', 'médio', 'baixo']),
  currentScore: z.number().min(0).max(100),
  projectedScore: z.number().min(0).max(100),
  effort: z.enum(['fácil', 'moderado', 'avançado']),
  example: z.string(),
});

export const analysisResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  verdictSummary: z.string(),
  improvements: z.array(improvementSchema),
  hookScore: z.number().min(0).max(100),
  narrativeScore: z.number().min(0).max(100),
  copyScore: z.number().min(0).max(100),
  editingScore: z.number().min(0).max(100),
  audioScore: z.number().min(0).max(100),
  ctaScore: z.number().min(0).max(100),
  hook: z.object({
    type: z.string(),
    description: z.string(),
    textUsed: z.string().nullable(),
    effectiveness: z.string(),
    improvementTip: z.string(),
  }),
  narrative: z.object({
    structure: z.string(),
    phases: z.array(narrativePhaseSchema),
    pacing: z.string(),
    effectiveness: z.string(),
  }),
  copy: z.object({
    mainMessage: z.string(),
    toneOfVoice: z.string(),
    copyFormulas: z.array(z.string()),
    powerWords: z.array(z.string()),
    hashtagStrategy: z.string(),
    captionAnalysis: z.string(),
  }),
  editing: z.object({
    totalCuts: z.number(),
    avgCutDuration: z.number(),
    transitionTypes: z.array(z.string()),
    visualEffects: z.array(z.string()),
    pacing: z.string(),
    standoutTechnique: z.string(),
  }),
  audio: z.object({
    hasMusic: z.boolean(),
    musicMood: z.string().nullable(),
    hasVoiceover: z.boolean(),
    voiceoverStyle: z.string().nullable(),
    soundEffects: z.array(z.string()),
    audioVideoSync: z.string(),
  }),
  cta: z.object({
    hasCta: z.boolean(),
    type: z.string().nullable(),
    placement: z.string().nullable(),
    text: z.string().nullable(),
    effectiveness: z.string(),
  }),
  replication: z.object({
    summary: z.string(),
    keyTakeaways: z.array(z.string()),
    templateScript: z.string(),
    whatToAvoid: z.array(z.string()),
  }),
});

export type AnalysisResultSchema = z.infer<typeof analysisResultSchema>;
