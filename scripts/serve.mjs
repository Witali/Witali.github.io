import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import './build.mjs';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT ?? 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/atom+xml; charset=utf-8' };
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost');
    const target = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!target.startsWith(root)) { response.writeHead(403).end(); return; }
    const data = await readFile(target);
    response.writeHead(200, { 'Content-Type': mime[path.extname(target)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }).end(data);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Страница не найдена');
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/`));
process.on('SIGINT', () => server.close(() => process.exit()));
