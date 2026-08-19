/**
 * server.js — Express wrapper for WriteWise API handlers
 * ES Module version — runs via `tsx server.js` in Docker.
 *
 * Routes:
 *   POST /api/generate-narrative  → api/generate-narrative.ts
 *   POST /api/chat                → api/chat.ts
 *   POST /api/generate-syntax     → api/generate-syntax.ts
 *   POST /api/detect-codebook     → api/detect-codebook.ts
 *   GET  /health                  → 200 OK
 */

import express from 'express';
import cors from 'cors';

// Dynamic imports let tsx transpile TypeScript handlers on the fly
const { default: generateNarrative } = await import('./api/generate-narrative.ts');
const { default: chat }              = await import('./api/chat.ts');
const { default: generateSyntax }    = await import('./api/generate-syntax.ts');
const { default: detectCodebook }    = await import('./api/detect-codebook.ts');

const app = express();
const PORT = process.env.API_PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'writewise-api', ts: new Date().toISOString() });
});

// ─── Adapter: Vercel handler → Express ────────────────────────────────────────
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

// ─── Routes ───────────────────────────────────────────────────────────────────
app.post('/api/generate-narrative', adapt(generateNarrative));
app.post('/api/chat',               adapt(chat));
app.post('/api/generate-syntax',    adapt(generateSyntax));
app.post('/api/detect-codebook',    adapt(detectCodebook));

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[WriteWise API] Listening on http://0.0.0.0:${PORT}`);
});
