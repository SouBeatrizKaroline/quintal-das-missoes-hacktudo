import { createServer } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { serveStatic, json, readJson } from './src/http.js';
import { generateMission } from './src/gemini.js';
const root = fileURLToPath(new URL('./teacher', import.meta.url));
const port = Number(process.env.TEACHER_PORT || 3001);
const token = process.env.TEACHER_TOKEN || '';
// Janela global e limite de concorrência. Sem identificador de pessoa ou IP persistido.
let windowStart = Date.now(), calls = 0, active = false;
function authorized(req) {
  const actual = Buffer.from(req.headers.authorization?.replace(/^Bearer /, '') || '');
  const expected = Buffer.from(token);
  return expected.length >= 20 && actual.length === expected.length && timingSafeEqual(actual, expected);
}
createServer(async (req, res) => {
  const allowedHosts = [`localhost:${port}`, `127.0.0.1:${port}`];
  if (!allowedHosts.includes(req.headers.host)) return json(res, 403, { error: 'A oficina está disponível apenas neste computador.' });
  if (req.url === '/api/mission') {
    if (req.method !== 'POST') return json(res, 405, { error: 'Método não permitido.' });
    if (req.headers.origin && !allowedHosts.map(h => `http://${h}`).includes(req.headers.origin)) return json(res, 403, { error: 'Origem não permitida.' });
    if (!authorized(req)) return json(res, 401, { error: 'Informe a senha da oficina definida em TEACHER_TOKEN.' });
    if (Date.now() - windowStart > 60000) { calls = 0; windowStart = Date.now(); }
    if (active || calls >= 5) return json(res, 429, { error: 'Uma pausa para a oficina: aguarde um minuto e tente de novo.' });
    active = true; calls++;
    try {
      const body = await readJson(req);
      const result = await generateMission(body, { apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_MODEL || 'gemini-3.6-flash' });
      json(res, 200, result);
    } catch (e) { json(res, e.status || 500, { error: e.status ? e.message : 'Não foi possível criar a missão.' }); }
    finally { active = false; }
    return;
  }
  if (req.url === '/schema.js' || req.url === '/data.js' || ['/assets/hen.svg','/assets/favicon.svg','/assets/fonts.css','/assets/nunito-regular.ttf','/assets/nunito-extrabold.ttf'].includes(req.url)) return serveStatic(req, res, fileURLToPath(new URL('./public', import.meta.url)));
  return serveStatic(req, res, root);
}).listen(port, '127.0.0.1', () => console.log(`Oficina do educador adulto: http://localhost:${port}. A senha fica somente em .env.`));
