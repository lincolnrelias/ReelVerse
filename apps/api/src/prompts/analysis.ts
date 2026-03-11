import type { VideoMeta, TranscriptionData, FrameAnalysisData } from '@reelverse/shared';

export const ANALYSIS_SYSTEM_PROMPT = `Você é um especialista em análise de vídeos curtos para redes sociais, com profundo conhecimento em copywriting, storytelling, edição de vídeo, estratégias de crescimento no YouTube Shorts, TikTok e Instagram Reels.

Sua tarefa é realizar uma engenharia reversa completa de um vídeo curto com base nos dados fornecidos. Você deve analisar CADA dimensão criteriosamente e retornar APENAS um JSON válido (sem markdown, sem explicações fora do JSON) seguindo EXATAMENTE o schema especificado.

REGRAS DE SCORE:
- Scores de 0 a 100, onde 0 = péssimo e 100 = excepcional
- Seja RIGOROSO: poucos vídeos merecem score acima de 90
- Use dados concretos do vídeo para justificar cada score

REGRAS DE ANÁLISE E ADAPTAÇÃO AO NICHO (CRÍTICO):
- PASSO 1: Identifique o nicho e o público-alvo exato do vídeo (ex: "Empreendedores", "Gamers de FPS", "Mães de primeira viagem", "Devs Sênior").
- PASSO 2: Adapte 100% da sua linguagem, tom de voz e vocabulário para ressoar com ESTE PÚBLICO ESPECÍFICO.
- A análise deve parecer feita por um especialista que respira esse nicho todos os dias. Fale a língua da audiência.
- verdictSummary: 1-2 frases diretas dizendo se o vídeo é bom ou ruim e porquê, na voz de um mentor focado no nicho.
- Cada dimensão deve ter análise HIPER-ESPECÍFICA ao tema do vídeo e às dores do público, NUNCA genérica.
- improvementTip deve ser uma ação CONCRETA e cirúrgica para aquele nicho.

REGRAS DE IMPROVEMENTS (CRÍTICO):
- Gere de 3 a 6 melhorias ordenadas por impacto (alto primeiro)
- Cada melhoria deve ser uma AÇÃO ESPECÍFICA E EXECUTÁVEL pensada para a retenção do público-alvo
- "action" deve ser uma instrução direta focada no nicho: "Adicione X nos primeiros Y segundos para fisgar a dor Z da audiência" e não "Melhore o hook"
- "currentScore" é o score atual da dimensão, "projectedScore" é a projeção REALISTA após aplicar a melhoria
- "example" deve ser um exemplo prático, escrito usando as GÍRIAS, TERMOS e o TOM EXATO da audiência alvo. Não use tom robótico ou corporativo se não for esse o nicho.
- "effort": fácil = resolve re-editando, moderado = precisa regravar parte, avançado = requer nova abordagem
- "impact": alto = melhoria de 15+ pontos, médio = 5-15 pontos, baixo = 1-5 pontos

REGRAS DE ÁUDIO (CRÍTICO):
- A transcrição vem do Whisper, que SOMENTE transcreve fala — NÃO detecta música
- Você receberá dados de "cobertura de fala" (% do vídeo coberto por fala)
- Se a cobertura de fala for < 80%, é MUITO PROVÁVEL que haja música de fundo
- YouTube Shorts quase sempre têm música — na dúvida, hasMusic = true
- Analise o título, descrição e hashtags para pistas sobre a música usada
- "musicMood" deve descrever o mood MESMO que você não saiba o nome da música
- Se não há fala alguma mas o vídeo tem áudio, 100% tem música

REGRAS DE REPLICAÇÃO:
- templateScript deve ser um roteiro COMPLETO, frase a frase, escrito do zero utilizando o LINGUAJAR EXATO e os mesmos atalhos mentais do nicho estudado.
- keyTakeaways devem ser os padrões psicológicos e visuais replicáveis para capturar a DESSE público.

Retorne APENAS o JSON, sem nenhum texto antes ou depois.`;

export function buildAnalysisPrompt(params: {
  meta: VideoMeta;
  transcription: TranscriptionData;
  frameAnalysis: FrameAnalysisData;
  language?: 'pt' | 'en';
}): string {
  const { meta, transcription, frameAnalysis, language = 'en' } = params;

  return `Analise o seguinte YouTube Short e retorne o JSON de engenharia reversa:

<video_metadata>
Título: ${meta.title}
Canal: ${meta.channelName}
Descrição: ${meta.description}
Hashtags: ${meta.hashtags.join(', ') || 'Nenhuma'}
Duração: ${meta.duration} segundos
Views: ${meta.viewCount.toLocaleString()}
Likes: ${meta.likeCount.toLocaleString()}
Comentários: ${meta.commentCount.toLocaleString()}
Data de publicação: ${meta.publishDate}
</video_metadata>

<transcription>
Idioma detectado: ${transcription.language}
Tem voiceover/narração: ${transcription.hasVoiceover ? 'Sim' : 'Não'}

Transcrição completa com timestamps:
${transcription.segments.map((s) => `[${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s] ${s.text}`).join('\n')}

Texto completo: ${transcription.fullText}
</transcription>

<audio_analysis>
${(() => {
  const speechDuration = transcription.segments.reduce((sum, s) => sum + (s.end - s.start), 0);
  const coveragePercent = meta.duration > 0 ? Math.round((speechDuration / meta.duration) * 100) : 0;
  const silentGaps: string[] = [];
  const sorted = [...transcription.segments].sort((a, b) => a.start - b.start);
  if (sorted.length > 0 && sorted[0].start > 1) silentGaps.push(`0s-${sorted[0].start.toFixed(1)}s`);
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].start - sorted[i - 1].end;
    if (gap > 1) silentGaps.push(`${sorted[i - 1].end.toFixed(1)}s-${sorted[i].start.toFixed(1)}s`);
  }
  if (sorted.length > 0 && sorted[sorted.length - 1].end < meta.duration - 1) {
    silentGaps.push(`${sorted[sorted.length - 1].end.toFixed(1)}s-${meta.duration.toFixed(1)}s`);
  }
  return `Duração do vídeo: ${meta.duration}s
Duração total da fala detectada: ${speechDuration.toFixed(1)}s
Cobertura de fala: ${coveragePercent}% do vídeo
Trechos SEM fala (provável música/efeitos): ${silentGaps.length > 0 ? silentGaps.join(', ') : 'Nenhum — fala cobre quase todo o vídeo'}

NOTA: O Whisper só transcreve fala. Os trechos sem fala quase certamente contêm música de fundo ou efeitos sonoros.`;
})()}
</audio_analysis>

<visual_analysis>
Total de frames analisados: ${frameAnalysis.totalFramesAnalyzed}
Frequência de cortes: ${frameAnalysis.cutFrequencyPerSecond.toFixed(2)} cortes/segundo
Timestamps dos cortes: ${frameAnalysis.cutTimestamps.map((t) => t.toFixed(1) + 's').join(', ')}

Textos sobrepostos no vídeo:
${frameAnalysis.textOverlays.map((t) => `[${t.timestamp.toFixed(1)}s] "${t.text}" (${t.position})`).join('\n') || 'Nenhum texto sobreposto detectado'}

Elementos visuais dominantes: ${frameAnalysis.visualElements.join(', ')}
Padrões de enquadramento: ${frameAnalysis.framingPatterns.join(', ')}
</visual_analysis>

Retorne o JSON seguindo EXATAMENTE este schema TypeScript (sem campos extras, sem campos faltando):

{
  overallScore: number,
  verdictSummary: string, // 1-2 frases na voz de mentor: "Seu vídeo tem X mas precisa de Y"
  improvements: Array<{
    dimension: string, // "hook" | "narrative" | "copy" | "editing" | "audio" | "cta"
    action: string, // Instrução direta e executável
    impact: "alto" | "médio" | "baixo",
    currentScore: number, // Score atual da dimensão
    projectedScore: number, // Projeção realista pós-melhoria
    effort: "fácil" | "moderado" | "avançado",
    example: string // Exemplo concreto aplicado a este vídeo
  }>, // 3-6 itens, ordenados por impacto
  hookScore: number,
  narrativeScore: number,
  copyScore: number,
  editingScore: number,
  audioScore: number,
  ctaScore: number,
  hook: { type: string, description: string, textUsed: string | null, effectiveness: string, improvementTip: string },
  narrative: { structure: string, phases: [{ name: string, startTime: number, endTime: number, description: string }], pacing: string, effectiveness: string },
  copy: { mainMessage: string, toneOfVoice: string, copyFormulas: string[], powerWords: string[], hashtagStrategy: string, captionAnalysis: string },
  editing: { totalCuts: number, avgCutDuration: number, transitionTypes: string[], visualEffects: string[], pacing: string, standoutTechnique: string },
  audio: { hasMusic: boolean, musicMood: string | null, hasVoiceover: boolean, voiceoverStyle: string | null, soundEffects: string[], audioVideoSync: string },
  cta: { hasCta: boolean, type: string | null, placement: string | null, text: string | null, effectiveness: string },
  replication: { summary: string, keyTakeaways: string[], templateScript: string, whatToAvoid: string[] }
}

IMPORTANT LANGUAGE RULE (CRITICAL):
${language === 'pt' ? 'Responda SEMPRE em Português Brasileiro (pt-BR).' : 'Answer ALWAYS in English (en). Do not use Portuguese.'}
Retorne APENAS o JSON, sem nenhum texto antes ou depois.`;
}
