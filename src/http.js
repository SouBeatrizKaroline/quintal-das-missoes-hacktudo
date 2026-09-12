import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"
};
export function json(res, status, body) {
  res.writeHead(status, { ...securityHeaders, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}
export async function readJson(req, max = 4096) {
  if (!req.headers['content-type']?.startsWith('application/json')) throw Object.assign(new Error('Use JSON.'), { status: 415 });
  let size = 0; const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > max) throw Object.assign(new Error('Pedido muito grande.'), { status: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString()); }
  catch { throw Object.assign(new Error('JSON inválido.'), { status: 400 }); }
}
export async function serveStatic(req, res, root) {
  if (!['GET', 'HEAD'].includes(req.method)) return json(res, 405, { error: 'Método não permitido.' });
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { return json(res, 400, { error: 'Endereço inválido.' }); }
  const file = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(resolve(root) + sep) || pathname.split(/[\\/]/).some(part => part.startsWith('.'))) return json(res, 404, { error: 'Não encontrado.' });
  try {
    const data = await readFile(file);
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
    res.writeHead(200, { ...securityHeaders, 'Content-Type': (types[extname(file)] || 'application/octet-stream') + (['.html','.css','.js','.json'].includes(extname(file)) ? '; charset=utf-8' : ''), 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { json(res, 404, { error: 'Não encontrado.' }); }
}
