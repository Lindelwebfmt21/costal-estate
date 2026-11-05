import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 5500);
const clients = new Set();

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

const reloadScript = `<script>
(() => {
  const es = new EventSource("/__reload");
  es.onmessage = () => location.reload();
})();
</script>`;

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function injectReload(html) {
  if (html.includes('</body>')) {
    return html.replace('</body>', `${reloadScript}</body>`);
  }
  return html + reloadScript;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);

  if (url.pathname === '/__reload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });
    res.write('\n');
    clients.add(res);
    req.on('close', () => clients.delete(res));
    return;
  }

  let rel = decodeURIComponent(url.pathname);
  if (rel === '/') rel = '/index.html';

  const filePath = path.normalize(path.join(root, rel));
  if (!filePath.startsWith(root)) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      send(res, 404, 'Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || 'application/octet-stream';

    if (ext === '.html') {
      fs.readFile(filePath, 'utf8', (readErr, html) => {
        if (readErr) {
          send(res, 500, 'Unable to read file');
          return;
        }
        send(res, 200, injectReload(html), { 'Content-Type': type });
      });
      return;
    }

    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(res);
  });
});

function broadcastReload() {
  for (const client of clients) client.write('data: reload\n\n');
}

let reloadTimer = null;
fs.watch(root, { recursive: true }, (_event, filename) => {
  if (!filename) return;
  const name = String(filename).replaceAll('\\', '/');
  if (name.startsWith('.vscode/') || name.startsWith('Your Site Title_files/')) return;
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(broadcastReload, 120);
});

console.log('Starting live server');
server.listen(port, '127.0.0.1', () => {
  console.log(`Live at http://127.0.0.1:${port}/`);
});
