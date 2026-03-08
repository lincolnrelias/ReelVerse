import fs from "fs";
import OpenAI from "openai";
import type { TranscriptionData } from "@reelverse/shared";
import { env } from "../env.js";

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 2000;

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function transcribeAudio(
  audioPath: string,
): Promise<TranscriptionData> {
  const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
    timeout: 5 * 60 * 1000, // 5 min — uploads de áudio grandes precisam de mais tempo
    maxRetries: 0, // controle manual de retry abaixo
  });

  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: fs.createReadStream(audioPath) as unknown as File,
        response_format: "verbose_json",
        timestamp_granularities: ["segment"],
      });

      const text = (response as { text?: string }).text ?? "";
      const segments = (
        (
          response as {
            segments?: Array<{ start: number; end: number; text: string }>;
          }
        ).segments ?? []
      ).map((s) => ({
        start: s.start,
        end: s.end,
        text: (s.text ?? "").trim(),
      }));
      const language =
        (response as { language?: string }).language ?? "unknown";

      return {
        fullText: text,
        segments,
        language,
        hasVoiceover: text.trim().length > 10,
      };
    } catch (err) {
      lastError = err;
      const isConnectionError =
        err instanceof OpenAI.APIConnectionError ||
        (err instanceof Error &&
          "code" in err &&
          (err as NodeJS.ErrnoException).code === "ECONNRESET");

      if (!isConnectionError || attempt === MAX_RETRIES) {
        throw err;
      }

      const delay = INITIAL_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(
        `Transcrição: tentativa ${attempt}/${MAX_RETRIES} falhou (${err instanceof Error ? err.message : err}). Retentando em ${delay}ms...`,
      );
      await sleep(delay);
    }
  }

  throw lastError;
}
