/**
 * api/research-fulltext.ts
 * POST /api/research/fetch-fulltext
 *
 * Connects to the Obscura headless browser (CDP) and fetches
 * full text from an open-access PDF or HTML paper page.
 *
 * Body: { url: string }
 * Returns: { text: string | null, method: string, error?: string }
 */

import type { Request, Response } from 'express';

const OBSCURA_CDP = process.env.OBSCURA_CDP_URL || 'ws://obscura:9222';
const OBSCURA_ENABLED = process.env.OBSCURA_ENABLED !== 'false';

/** Maximum characters to return (keeps Claude context manageable) */
const MAX_CHARS = 12_000;

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body as { url?: string };

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url is required' });
  }

  // Basic SSRF guard — only allow http/https to public addresses
  let parsed: URL;
  try {
    parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return res.status(400).json({ error: 'Only http/https URLs are allowed' });
    }
    // Block private ranges
    const host = parsed.hostname;
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.startsWith('172.')
    ) {
      return res.status(400).json({ error: 'Private network URLs are not allowed' });
    }
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  // ── Method 1: Try Obscura CDP browser ──────────────────────────────────────
  if (OBSCURA_ENABLED) {
    try {
      const text = await fetchWithObscura(url);
      if (text && text.trim().length > 200) {
        return res.json({ text: text.substring(0, MAX_CHARS), method: 'obscura' });
      }
    } catch (err) {
      console.warn('[research-fulltext] Obscura failed, falling back:', (err as Error).message);
    }
  }

  // ── Method 2: Direct HTTP fetch (works for many open-access sources) ────────
  try {
    const text = await fetchDirectHttp(url);
    if (text && text.trim().length > 200) {
      return res.json({ text: text.substring(0, MAX_CHARS), method: 'direct-http' });
    }
  } catch (err) {
    console.warn('[research-fulltext] Direct HTTP failed:', (err as Error).message);
  }

  // ── Nothing worked ──────────────────────────────────────────────────────────
  return res.json({
    text: null,
    method: 'failed',
    error: 'Could not extract text — paper may be paywalled or requires authentication',
  });
}

// ─── Obscura CDP fetcher ───────────────────────────────────────────────────────

async function fetchWithObscura(url: string): Promise<string> {
  // Dynamic import — puppeteer-core only available at runtime in the API container
  const puppeteer = await import('puppeteer-core');

  const browser = await puppeteer.connect({
    browserWSEndpoint: OBSCURA_CDP,
  });

  const page = await browser.newPage();

  try {
    // Set academic user agent
    await page.setUserAgent(
      'Mozilla/5.0 (compatible; WriteWise Academic Research Bot/1.0; +https://writewise.ai/bot)'
    );

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 25_000,
    });

    // Extract readable text — prefer body text over raw HTML
    const text = await page.evaluate(() => {
      // Remove nav, header, footer, scripts, ads
      const remove = document.querySelectorAll(
        'nav, header, footer, script, style, noscript, iframe, .ad, .ads, .advertisement, .sidebar, .navigation'
      );
      remove.forEach(el => el.remove());

      // Try to find article/main content first
      const articleEl =
        document.querySelector('article') ||
        document.querySelector('main') ||
        document.querySelector('.paper-content') ||
        document.querySelector('#abstract') ||
        document.querySelector('.abstract') ||
        document.body;

      return (articleEl as HTMLElement)?.innerText || document.body.innerText || '';
    });

    return text;
  } finally {
    await page.close();
    await browser.disconnect();
  }
}

// ─── Direct HTTP fetcher (for plain HTML pages) ────────────────────────────────

async function fetchDirectHttp(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; WriteWise Academic Research Bot/1.0; +https://writewise.ai/bot)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const contentType = res.headers.get('content-type') || '';

  // For plain text or JSON (some APIs return text directly)
  if (contentType.includes('text/plain') || contentType.includes('application/json')) {
    return await res.text();
  }

  // For HTML — strip tags naively
  if (contentType.includes('text/html')) {
    const html = await res.text();
    // Strip HTML tags, collapse whitespace
    return html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  throw new Error(`Unsupported content type: ${contentType}`);
}
