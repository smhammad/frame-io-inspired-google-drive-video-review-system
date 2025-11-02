import { Readable } from 'stream';

// Vercel Serverless Function: proxy remote files and stream them to the client with CORS and Range support.
export default async function handler(req, res) {
  try {
    // Allow CORS from anywhere (adjust to restrict in production)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range,Accept-Ranges,Content-Length,Content-Type');

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Range,Content-Type');
      res.status(204).end();
      return;
    }

    // Accept url as query param: /api/proxy?url=ENCODED_URL
    const url = req.query?.url || (req.url && new URL(req.url, `http://${req.headers.host}`).searchParams.get('url'));
    if (!url) {
      res.status(400).send('Missing url parameter');
      return;
    }

    // Forward Range header for seeking support
    const headers = {};
    if (req.headers.range) headers.range = req.headers.range;
    headers['user-agent'] = req.headers['user-agent'] || 'VercelProxy/1.0';

    const fetchRes = await fetch(url, { method: 'GET', headers, redirect: 'follow' });

    // Forward selected headers
    const forward = ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control', 'last-modified', 'etag'];
    forward.forEach((h) => {
      const v = fetchRes.headers.get(h);
      if (v) res.setHeader(h, v);
    });

    // Ensure CORS is allowed for the browser
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range,Accept-Ranges,Content-Length,Content-Type');

    res.status(fetchRes.status);

    const body = fetchRes.body;
    if (!body) return res.end();

    // Convert WHATWG ReadableStream to Node Readable and pipe
    const nodeStream = Readable.fromWeb(body);
    nodeStream.pipe(res);
    nodeStream.on('error', (err) => {
      console.error('stream error', err);
      try { res.destroy(err); } catch (e) {}
    });
  } catch (err) {
    console.error('proxy error', err);
    try { res.status(500).send(String(err)); } catch (e) { /* ignore */ }
  }
}
