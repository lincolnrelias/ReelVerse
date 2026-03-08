import path from 'path';
import fs from 'fs/promises';
import Anthropic from '@anthropic-ai/sdk';
import type { FrameAnalysisData } from '@reelverse/shared';
import { env } from '../env.js';

function selectKeyFrames(
  frameFiles: string[],
  cutTimestamps: number[],
  duration: number,
  maxFrames: number = 10
): string[] {
  if (frameFiles.length <= maxFrames) return frameFiles;
  const selected: string[] = [];
  const first = frameFiles[0];
  const last = frameFiles[frameFiles.length - 1];
  if (first) selected.push(first);
  if (last && last !== first) selected.push(last);
  const midIdx = Math.floor(frameFiles.length / 2);
  const mid = frameFiles[midIdx];
  if (mid && !selected.includes(mid)) selected.push(mid);

  for (const t of cutTimestamps) {
    if (selected.length >= maxFrames) break;
    const idx = Math.min(Math.floor(t), frameFiles.length - 1);
    const f = frameFiles[idx];
    if (f && !selected.includes(f)) selected.push(f);
  }

  const remaining = frameFiles.filter((f) => !selected.includes(f));
  while (selected.length < maxFrames && remaining.length > 0) {
    selected.push(remaining.shift()!);
  }
  return selected.slice(0, maxFrames).sort((a, b) => frameFiles.indexOf(a) - frameFiles.indexOf(b));
}

type ImageBlock = { type: 'image'; source: { type: 'base64'; media_type: 'image/jpeg'; data: string } };
type TextBlock = { type: 'text'; text: string };

export async function analyzeFrames(
  framesDir: string,
  cutTimestamps: number[],
  duration: number
): Promise<FrameAnalysisData> {
  const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const frameFiles = (await fs.readdir(framesDir))
    .filter((f) => f.endsWith('.jpg'))
    .sort();
  const selected = selectKeyFrames(frameFiles, cutTimestamps, duration, 10);

  const imageBlocks: ImageBlock[] = await Promise.all(
    selected.map(async (f) => {
      const buf = await fs.readFile(path.join(framesDir, f));
      const base64 = buf.toString('base64');
      return {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: 'image/jpeg' as const,
          data: base64,
        },
      };
    })
  );

  const textBlock: TextBlock = {
    type: 'text',
    text: `Estes são ${selected.length} frames-chave de um vídeo curto (YouTube Short), extraídos a 1fps.

Analise e retorne APENAS um JSON com:
{
  "textOverlays": [{ "frameIndex": number, "text": "texto detectado", "position": "top|center|bottom" }],
  "visualElements": ["lista de elementos visuais dominantes identificados"],
  "framingPatterns": ["lista de padrões: close-up, medium-shot, wide-shot, etc"],
  "hasPersonFacing": boolean,
  "dominantColors": ["cores dominantes"],
  "sceneChanges": ["descrição breve de cada mudança de cena"]
}`,
  };

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [...imageBlocks, textBlock],
      },
    ],
  });

  const block = response.content[0];
  const rawText = block.type === 'text' ? block.text : '';
  const jsonStr = rawText.replace(/```json\n?|\n?```/g, '').trim();
  let parsed: {
    textOverlays?: Array<{ frameIndex?: number; text?: string; position?: string }>;
    visualElements?: string[];
    framingPatterns?: string[];
  };
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    parsed = {};
  }

  const textOverlays = (parsed.textOverlays ?? []).map((t) => ({
    timestamp: (t.frameIndex ?? 0) * 1,
    text: t.text ?? '',
    position: t.position ?? 'center',
  }));

  return {
    totalFramesAnalyzed: frameFiles.length,
    cutTimestamps,
    cutFrequencyPerSecond: duration > 0 ? cutTimestamps.length / duration : 0,
    textOverlays,
    visualElements: Array.isArray(parsed.visualElements) ? parsed.visualElements : [],
    framingPatterns: Array.isArray(parsed.framingPatterns) ? parsed.framingPatterns : [],
  };
}
