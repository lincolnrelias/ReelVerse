import Anthropic from '@anthropic-ai/sdk';
import type { VideoMeta, TranscriptionData, FrameAnalysisData, AnalysisResult } from '@reelverse/shared';
import { analysisResultSchema } from '@reelverse/shared';
import { env } from '../env.js';
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt } from '../prompts/analysis.js';

export async function analyzeWithAI(params: {
  meta: VideoMeta;
  transcription: TranscriptionData;
  frameAnalysis: FrameAnalysisData;
  language?: 'pt' | 'en';
}): Promise<AnalysisResult> {
  const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const prompt = buildAnalysisPrompt(params);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
    system: ANALYSIS_SYSTEM_PROMPT,
  });

  const block = response.content[0];
  const text = block.type === 'text' ? block.text : '';
  const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('Resposta da IA não é JSON válido: ' + (e instanceof Error ? e.message : String(e)));
  }

  const result = analysisResultSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error('JSON da IA não segue o schema: ' + result.error.message);
  }
  return result.data;
}
