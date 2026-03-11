// Metadados extraídos do YouTube Short
export interface VideoMeta {
  title: string;
  description: string;
  channelName: string;
  channelUrl: string;
  publishDate: string;
  duration: number; // segundos
  viewCount: number;
  likeCount: number;
  commentCount: number;
  hashtags: string[];
  thumbnailUrl: string;
  videoId: string;
}

// Dados de transcrição (Whisper)
export interface TranscriptionData {
  fullText: string;
  segments: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  language: string;
  hasVoiceover: boolean;
}

// Análise dos frames (Vision AI)
export interface FrameAnalysisData {
  totalFramesAnalyzed: number;
  cutTimestamps: number[];
  cutFrequencyPerSecond: number;
  textOverlays: Array<{
    timestamp: number;
    text: string;
    position: string;
  }>;
  visualElements: string[];
  framingPatterns: string[];
}

// Melhoria acionável gerada pela IA
export interface Improvement {
  dimension: string;
  action: string;
  impact: 'alto' | 'médio' | 'baixo';
  currentScore: number;
  projectedScore: number;
  effort: 'fácil' | 'moderado' | 'avançado';
  example: string;
}

// Resultado final da análise IA (output do Claude)
export interface AnalysisResult {
  overallScore: number;
  verdictSummary: string;
  improvements: Improvement[];
  hookScore: number;
  narrativeScore: number;
  copyScore: number;
  editingScore: number;
  audioScore: number;
  ctaScore: number;
  hook: {
    type: string;
    description: string;
    textUsed: string | null;
    effectiveness: string;
    improvementTip: string;
  };
  narrative: {
    structure: string;
    phases: Array<{
      name: string;
      startTime: number;
      endTime: number;
      description: string;
    }>;
    pacing: string;
    effectiveness: string;
  };
  copy: {
    mainMessage: string;
    toneOfVoice: string;
    copyFormulas: string[];
    powerWords: string[];
    hashtagStrategy: string;
    captionAnalysis: string;
  };
  editing: {
    totalCuts: number;
    avgCutDuration: number;
    transitionTypes: string[];
    visualEffects: string[];
    pacing: string;
    standoutTechnique: string;
  };
  audio: {
    hasMusic: boolean;
    musicMood: string | null;
    hasVoiceover: boolean;
    voiceoverStyle: string | null;
    soundEffects: string[];
    audioVideoSync: string;
  };
  cta: {
    hasCta: boolean;
    type: string | null;
    placement: string | null;
    text: string | null;
    effectiveness: string;
  };
  replication: {
    summary: string;
    keyTakeaways: string[];
    templateScript: string;
    whatToAvoid: string[];
  };
}

export type AnalysisStatusEnum =
  | 'pending'
  | 'extracting'
  | 'processing_video'
  | 'transcribing'
  | 'analyzing'
  | 'completed'
  | 'failed';

// Status tracking para o frontend
export interface AnalysisStatus {
  id: string;
  status: AnalysisStatusEnum;
  errorMessage?: string;
  videoMeta?: VideoMeta;
  result?: AnalysisResult;
  processingTimeMs?: number;
  createdAt: string;
  completedAt?: string;
}

// Input validation
export interface CreateAnalysisInput {
  videoUrl: string;
  language?: 'pt' | 'en';
}
