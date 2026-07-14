import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

const port = Number(process.env.PORT ?? 4175);
const outputRoot = path.resolve('out');

const contentTypes = {
  '.avif': 'image/avif',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.vtt': 'text/vtt; charset=utf-8',
  '.webp': 'image/webp',
};

async function sendFile(response, filePath, statusCode = 200) {
  const contents = await fs.readFile(filePath);
  const contentType = contentTypes[path.extname(filePath)] ??
    'application/octet-stream';

  response.writeHead(statusCode, {
    'Content-Length': contents.byteLength,
    'Content-Type': contentType,
  });
  response.end(contents);
}

function resolveRequestPath(requestUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(
      new URL(requestUrl ?? '/', 'http://localhost').pathname,
    );
  } catch {
    return null;
  }

  const withoutLeadingSlash = pathname.slice(1);
  const relativePath = pathname === '/'
    ? 'index.html'
    : pathname.endsWith('/') || path.extname(pathname) === ''
      ? `${withoutLeadingSlash.replace(/\/$/, '')}/index.html`
      : withoutLeadingSlash;
  const filePath = path.resolve(outputRoot, relativePath);

  return filePath.startsWith(`${outputRoot}${path.sep}`) ? filePath : null;
}

const server = http.createServer(async (request, response) => {
  try {
    const filePath = resolveRequestPath(request.url);
    if (filePath) {
      await sendFile(response, filePath);
      return;
    }
  } catch {
    // Missing, malformed, and unsafe requests all use the exported 404.
  }

  try {
    await sendFile(response, path.join(outputRoot, '404.html'), 404);
  } catch {
    response.writeHead(500).end('Run npm run build before the export server.');
  }
});

server.listen(port, 'localhost');

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
