import { SUBJECTS, TOPICS, validateMission } from '../public/schema.js';
export function validateRequest(body) {
  return body && SUBJECTS.includes(body.subject) && TOPICS[body.subject].includes(body.topic) && ['6º ano', '7º ano', '8º ano', '9º ano'].includes(body.grade) && [10, 15, 20].includes(body.minutes) && ['Um aparelho por grupo', 'Apenas o aparelho do educador'].includes(body.resources);
}
export const missionSchema = {
  type: 'OBJECT', required: ['title', 'objective', 'materials', 'offline', 'reflection', 'steps'],
  properties: {
    title: { type: 'STRING' }, objective: { type: 'STRING' }, materials: { type: 'STRING' }, offline: { type: 'STRING' }, reflection: { type: 'STRING' },
    steps: { type: 'ARRAY', minItems: 3, maxItems: 3, items: { type: 'OBJECT', required: ['title', 'text', 'mode'], properties: { title: { type: 'STRING' }, text: { type: 'STRING' }, mode: { type: 'STRING', enum: ['screen', 'away', 'together'] } } } }
  }
};
export async function generateMission(input, { apiKey, model = 'gemini-3.6-flash', fetcher = fetch } = {}) {
  if (!validateRequest(input)) throw Object.assign(new Error('Escolha as opções disponíveis na oficina.'), { status: 400 });
  if (!apiKey) throw Object.assign(new Error('A chave Gemini ainda não foi configurada no servidor da oficina.'), { status: 503 });
  if (!/^[a-zA-Z0-9.-]+$/.test(model)) throw Object.assign(new Error('Modelo inválido na configuração.'), { status: 503 });
  // Reconstrói exclusivamente os campos permitidos. Não encaminha texto livre ou dados de alunos.
  const context = Object.fromEntries(['subject', 'topic', 'grade', 'minutes', 'resources'].map(k => [k, input[k]]));
  let response;
  try {
    response = await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({ systemInstruction: { parts: [{ text: 'Você prepara rascunhos didáticos exclusivamente para um educador adulto. Crie uma missão cooperativa segura em português brasileiro, com linguagem concreta. Não use travessão. Título até 80 caracteres; demais textos até 600. Exatamente 3 etapas: ler um desafio no aparelho (screen), observar ou criar fora da tela (away), conversar e explicar uma evidência (together). O tempo de tela deve ser no máximo um terço do tempo total. Não peça fotos, nomes, contas, localização, links, instalação de apps, compras, dados pessoais ou pesquisa na internet. Não invente códigos BNCC, fontes, resultados ou notas. Nenhuma atividade perigosa, coleta de animais ou contato com água imprópria. Traga alternativa equivalente em papel, materiais comuns e uma pergunta de reflexão. Incentive divisão de papéis e argumentação. A resposta será revisada pelo educador antes de qualquer uso.' }] }, contents: [{ role: 'user', parts: [{ text: JSON.stringify(context) }] }], generationConfig: { responseMimeType: 'application/json', responseSchema: missionSchema, temperature: 0.7, maxOutputTokens: 2500 } })
    });
  } catch { throw Object.assign(new Error('O Gemini não respondeu a tempo. Tente novamente ou use a missão pronta.'), { status: 504 }); }
  if (!response.ok) {
    const status = response.status === 429 ? 429 : 502;
    const message = response.status === 429 ? 'Limite do Gemini atingido. Aguarde ou use a missão pronta.' : [400,401,403,404].includes(response.status) ? 'O Google não aceitou a configuração da API. Verifique chave, acesso e modelo na oficina.' : 'O Gemini está indisponível. Use a missão pronta e tente depois.';
    throw Object.assign(new Error(message), { status });
  }
  try {
    const data = await response.json();
    const raw = JSON.parse(data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '{}');
    const mission = { ...raw, id: `gemini-${Date.now()}`, character: 'cat', minutes: input.minutes };
    if (!validateMission(mission)) throw new Error('schema');
    return { mission, source: 'gemini', model, reviewed: false };
  } catch { throw Object.assign(new Error('O rascunho veio incompleto. Gere novamente ou use a missão pronta.'), { status: 502 }); }
}
