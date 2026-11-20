export interface GenerateDishDescriptionInput {
  name: string;
  ingredients: string;
  category?: string;
}

export interface GenerateDishDescriptionResult {
  ok: boolean;
  description?: string;
  error?: string;
}

export async function generateDishDescription(
  input: GenerateDishDescriptionInput
): Promise<GenerateDishDescriptionResult> {
  try {
    const response = await fetch('/api/ai/describe-dish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const data = (await response.json().catch(() => ({}))) as {
      description?: string;
      error?: string;
    };

    if (!response.ok || !data.description) {
      return {
        ok: false,
        error:
          data.error ||
          'Não foi possível gerar a descrição com IA no momento. Você pode escrever manualmente.',
      };
    }

    return {
      ok: true,
      description: data.description,
    };
  } catch {
    return {
      ok: false,
      error:
        'Erro de conexão ao consultar o assistente de IA. Verifique sua internet ou escreva manualmente.',
    };
  }
}
