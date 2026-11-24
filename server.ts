import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;

function getConfiguredApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return key;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      aiConfigured: Boolean(getConfiguredApiKey()),
    });
  });

  app.post('/api/ai/describe-dish', async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as {
      name?: unknown;
      ingredients?: unknown;
      category?: unknown;
    };

    const dishName = typeof body.name === 'string' ? body.name.trim() : '';
    const ingredients =
      typeof body.ingredients === 'string' ? body.ingredients.trim() : '';
    const category =
      typeof body.category === 'string' ? body.category.trim() : '';

    if (!dishName || !ingredients) {
      res.status(400).json({
        error:
          'Informe o nome do prato e os ingredientes principais para gerar uma descrição.',
      });
      return;
    }

    const apiKey = getConfiguredApiKey();
    if (!apiKey) {
      res.status(503).json({
        error:
          'Assistente de IA indisponível no momento: nenhuma chave GEMINI_API_KEY está configurada no servidor. Você pode escrever a descrição manualmente.',
      });
      return;
    }

    try {
      const prompt = [
        `Prato: ${dishName}`,
        category ? `Categoria: ${category}` : '',
        `Ingredientes principais: ${ingredients}`,
      ]
        .filter(Boolean)
        .join('\n');

      const systemInstruction =
        'Você é um assistente de cardápio para uma marmitaria brasileira acolhedora. Escreva apenas UMA descrição comercial curta (1 a 2 frases, no máximo 220 caracteres), em português brasileiro natural, apetitosa, simples e honesta, destacando apenas os ingredientes informados. Não invente ingredientes novos, não use emojis, não use aspas e não inclua preços.';

      const attempts: Array<{
        model: string;
        timeoutMs: number;
      }> = [
        {
          model: 'gemini-4-hydrogen',
          timeoutMs: 10000,
        },
        {
          model: 'gemini-3.1-flash-lite',
          timeoutMs: 12000,
        },
      ];

      let description = '';
      let lastError: unknown = null;

      for (let i = 0; i < attempts.length; i += 1) {
        const { model, timeoutMs } = attempts[i];
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            timeout: timeoutMs,
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction,
            },
          });
          description = response.text?.trim().replace(/^["']|["']$/g, '') ?? '';
          if (description) {
            break;
          }
        } catch (attemptErr: unknown) {
          lastError = attemptErr;
          const errMsg =
            attemptErr instanceof Error ? attemptErr.message : String(attemptErr);
          const errStatus =
            typeof (attemptErr as { status?: unknown })?.status === 'number'
              ? (attemptErr as { status: number }).status
              : 500;

          const isAuthFailure =
            errStatus === 401 ||
            errStatus === 403 ||
            errMsg.includes('API_KEY') ||
            errMsg.toLowerCase().includes('api key');

          if (isAuthFailure || i === attempts.length - 1) {
            throw attemptErr;
          }

          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }

      if (!description) {
        if (lastError) {
          throw lastError;
        }
        res.status(502).json({
          error:
            'Não foi possível gerar uma sugestão agora. Tente novamente ou preencha manualmente.',
        });
        return;
      }

      res.json({ description });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erro desconhecido ao consultar IA.';
      const status =
        typeof (err as { status?: unknown })?.status === 'number'
          ? (err as { status: number }).status
          : 500;

      console.warn('[AI describe-dish]', status, message);

      if (
        status === 401 ||
        status === 403 ||
        message.includes('API_KEY') ||
        message.toLowerCase().includes('api key')
      ) {
        res.status(502).json({
          error:
            'A chave da API de IA configurada no servidor foi recusada. Verifique as configurações no painel Secrets ou escreva a descrição manualmente.',
        });
        return;
      }

      if (status === 400) {
        res.status(400).json({
          error:
            'Não foi possível processar o pedido para a IA agora. Tente novamente ou escreva a descrição manualmente.',
        });
        return;
      }

      if (status === 404) {
        res.status(502).json({
          error:
            'O modelo de IA configurado não foi encontrado ou não está liberado para esta chave.',
        });
        return;
      }

      if (status === 429) {
        res.status(429).json({
          error:
            'Limite temporário de solicitações à IA atingido. Aguarde alguns instantes ou escreva manualmente.',
        });
        return;
      }

      if (status === 503) {
        res.status(503).json({
          error:
            'Serviço de IA temporariamente sobrecarregado. Tente novamente em instantes ou preencha manualmente.',
        });
        return;
      }

      if (
        status === 504 ||
        message.toLowerCase().includes('timeout') ||
        message.toLowerCase().includes('aborted')
      ) {
        res.status(504).json({
          error:
            'O assistente de IA demorou para responder. Tente novamente ou preencha a descrição manualmente.',
        });
        return;
      }

      res.status(500).json({
        error: `Falha de comunicação com o assistente de IA (código ${status}). Você pode tentar novamente ou digitar a descrição manualmente.`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`iFoome Delivery ativo em http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Erro ao iniciar servidor:', error);
  process.exit(1);
});
