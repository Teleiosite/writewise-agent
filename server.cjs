/**
 * server.js — Express wrapper for WriteWise Vercel API handlers
 * Replaces Vercel Serverless Functions for self-hosted Oracle Cloud deployment.
 *
 * Routes:
 *   POST /api/generate-narrative  → api/generate-narrative.ts
 *   POST /api/chat                → api/chat.ts
 *   POST /api/generate-syntax     → api/generate-syntax.ts
 *   POST /api/detect-codebook     → api/detect-codebook.ts
 *   GET  /health                  → 200 OK
 */

require('ts-node').register({
  transpileOnly: true,
  compilerOptions: { module: 'commonjs', esModuleInterop: true }
});

const express = require('express');
const cors = require('cors');

// Import Vercel API handlers (ts-node transpiles on the fly)
const generateNarrative = require('./api/generate-narrative').default;
const chat              = require('./api/chat').default;
const generateSyntax    = require('./api/generate-syntax').default;
const detectCodebook    = require('./api/detect-codebook').default;

const app = express();
const PORT = process.env.API_PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'writewise-api', ts: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
/**
 * Adapter: wraps a Vercel handler (VercelRequest, VercelResponse) to Express
 * req/res objects. The Vercel types are duck-compatible with Express for our
 * use case — body, method, headers are identical.
 */
function adapt(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error('[API Error]', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error', detail: err.message });
      }
    }
  };
}

app.post('/api/generate-narrative', adapt(generateNarrative));
app.post('/api/chat',               adapt(chat));
app.post('/api/generate-syntax',    adapt(generateSyntax));
app.post('/api/detect-codebook',    adapt(detectCodebook));

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[WriteWise API] Listening on http://0.0.0.0:${PORT}`);
});
