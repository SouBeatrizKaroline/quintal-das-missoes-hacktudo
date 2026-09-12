import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { serveStatic } from './src/http.js';
const root = fileURLToPath(new URL('./public', import.meta.url));
const port = Number(process.env.PORT || 3000);
createServer((req, res) => serveStatic(req, res, root)).listen(port, process.env.GAME_HOST || '127.0.0.1', () => {
  console.log(`Quintal das Missões: http://localhost:${port}`);
});
