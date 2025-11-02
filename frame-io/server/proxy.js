#!/usr/bin/env node
import http from 'http';
import { URL } from 'url';
import { Readable } from 'stream';

const PORT = process.env.PORT || 3001;

async function handler(req, res) {
  try {
    const fullUrl = new URL(req.url, `http://${req.headers.host}`);
    if (fullUrl.pathname !== '/proxy') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const target = fullUrl.searchParams.get('url');
    if (!target) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing url query parameter');
      return;
    }

    // CORS: allow browser to fetch proxied responses
    // Also handle preflight requests
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS',
        'Access-Control-Allow-Headers': 'Range,Content-Type',
        'Access-Control-Max-Age': '86400'
      });
      res.end();
      return;
    }

    // Forward Range header for seeking support
    const fetchHeaders = {};
    if (req.headers.range) fetchHeaders['range'] = req.headers.range;
    fetchHeaders['user-agent'] = req.headers['user-agent'] || 'NodeProxy/1.0';

    const fetchRes = await fetch(target, {
      method: 'GET',
      headers: fetchHeaders,
      redirect: 'follow',
    });

    // Forward selected headers and ensure CORS is allowed for the browser
    const forward = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control', 'last-modified', 'etag'];
    forward.forEach((h) => {
      const v = fetchRes.headers.get(h);
      if (v) res.setHeader(h, v);
    });

    // Allow CORS for any origin (development proxy)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range,Accept-Ranges,Content-Length,Content-Type');

    res.writeHead(fetchRes.status);

    const body = fetchRes.body;
    if (body) {
      // fetch returns a WHATWG ReadableStream in Node ESM; convert to Node stream
      const nodeStream = Readable.fromWeb(body);
      nodeStream.pipe(res);
      nodeStream.on('error', (err) => {
        console.error('Stream error:', err);
        try { res.destroy(err); } catch (e) {}
      });
    } else {
      res.end();
    }
  } catch (err) {
    console.error('Proxy error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(String(err));
  }
}

const server = http.createServer(handler);
server.listen(PORT, () => console.log(`Proxy server listening on http://localhost:${PORT}`));

// graceful shutdown
process.on('SIGINT', () => process.exit());
process.on('SIGTERM', () => process.exit());
