# ReelVerse

Plataforma de análise de engenharia reversa para YouTube Shorts. Cole o link de um Short e receba um relatório com scores, narrativa, copy, edição, áudio e CTA.

## Pré-requisitos

- **Node.js** 20+
- **Docker** (PostgreSQL 16 e Redis 7)
- **yt-dlp** instalado no sistema ([instalação](https://github.com/yt-dlp/yt-dlp))
- **FFmpeg** 6+ instalado no sistema ([instalação](https://ffmpeg.org/download.html))
- Chaves de API: **OpenAI** (Whisper), **Anthropic** (Claude)

## Configuração

### 1. Variáveis de ambiente

**Backend (`apps/api`)**

Crie `apps/api/.env` (use `apps/api/.env.example` como base):

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/reelverse
REDIS_URL=redis://localhost:6379
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
TEMP_DIR=/tmp/reelverse
PORT=3001
NODE_ENV=development
```

**Frontend (`apps/web`)**

Crie `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Infraestrutura

```bash
docker compose up -d
```

Isso sobe PostgreSQL na porta 5432 e Redis na 6379.

### 3. Banco de dados

```bash
cd apps/api && npx drizzle-kit push
```

### 4. Instalação e execução

```bash
# Na raiz do monorepo
npm install
npm run dev
```

- **Web:** http://localhost:3000  
- **API:** http://localhost:3001  

Para processar as análises em background, rode o worker em outro terminal:

```bash
cd apps/api && npm run dev:worker
```

## Estrutura

- `apps/web` — Next.js 14 (App Router), Tailwind, página inicial + relatório com polling
- `apps/api` — Fastify, REST, BullMQ, Drizzle, worker de análise (yt-dlp → FFmpeg → Whisper → Claude)
- `packages/shared` — Tipos e schemas Zod compartilhados

## Endpoints (API)

- `POST /api/analysis` — Cria análise (body: `{ "videoUrl": "https://..." }`). Rate limit: 5/hora por IP.
- `GET /api/analysis/:id` — Status da análise (polling a cada 2s no frontend).
- `GET /api/analysis/cache-check?videoUrl=...` — Verifica se o mesmo URL já foi analisado nas últimas 24h.

## Scripts úteis

| Comando | Descrição |
|--------|-----------|
| `npm run dev` | Sobe web + API (Turborepo) |
| `npm run build` | Build de todos os pacotes |
| `cd apps/api && npm run dev:worker` | Sobe o worker de análise |
| `cd apps/api && npx drizzle-kit push` | Aplica schema no PostgreSQL |
