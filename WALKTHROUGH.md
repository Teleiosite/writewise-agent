# WriteWise Research Pipeline — Implementation Walkthrough

**Build status:** ✅ `npm run build` — Exit code 0 · 2,291 modules · 46s

---

## What Was Built

### 1. Infrastructure

| File | Change |
|---|---|
| [`docker-compose.yml`](docker-compose.yml) | Added `obscura` service (`h4ckf0r0day/obscura`, 512MB RAM, 4 workers, stealth CDP mode) |
| [`package.json`](package.json) | Added `puppeteer-core` (CDP client to connect to Obscura) & `@types/express` |

### 2. Backend API (3 new routes in `server.js`)

| File | Route | Purpose |
|---|---|---|
| [`api/research-search.ts`](api/research-search.ts) | `POST /api/research/search` | Multi-database discovery — Semantic Scholar, OpenAlex, CrossRef, EuropePMC, CORE, and ERIC queried in parallel with research field auto-detection. Deduplicates by DOI and enriches via Unpaywall. |
| [`api/research-fulltext.ts`](api/research-fulltext.ts) | `POST /api/research/fetch-fulltext` | Connects to Obscura via CDP to fetch open-access PDF URLs and extract full readable text. Falls back gracefully to direct HTTP fetch. |
| [`api/research-synthesise.ts`](api/research-synthesise.ts) | `POST /api/research/synthesise` | Multi-provider synthesis supporting **Gemini (free default)**, **Claude**, **OpenAI**, **DeepSeek**, and **Grok**. Reuses keys from user Settings or falls back to server env. Produces 4 complete research outputs. |

### 3. Frontend Services

| File | Purpose |
|---|---|
| [`src/services/researchPipelineService.ts`](src/services/researchPipelineService.ts) | Frontend orchestrator: handles multi-database search → full-text batch fetching → synthesis. Computes literature coverage metrics. |
| [`src/services/universityResolver.ts`](src/services/universityResolver.ts) | 60+ universities mapped to EZProxy/OpenURL resolvers to provide one-click institutional access by DOI. |

### 4. UI Components

| File | Purpose |
|---|---|
| [`src/components/research/ResearchPipelinePanel.tsx`](src/components/research/ResearchPipelinePanel.tsx) | Main UI panel with 3 tabs: **Results**, **Library Queue**, and **Review** (with AI provider transparency badge & 1-click editor inserts). |
| [`src/components/research/LibraryQueuePanel.tsx`](src/components/research/LibraryQueuePanel.tsx) | Prioritised list of paywalled papers with direct download links (DOI, Google Scholar, Semantic Scholar, ResearchGate, Library Resolver) and PDF upload dropzones. |
| [`src/components/research/CoverageIndicator.tsx`](src/components/research/CoverageIndicator.tsx) | Visual coverage progress bar with breakdown of Full Text vs Abstract vs Paywalled papers. |

### 5. Integration Point

[`src/components/matrix/LiteratureMatrixModal.tsx`](src/components/matrix/LiteratureMatrixModal.tsx) includes a top mode switcher:
- **Research Pipeline** (new default mode with full database search and library queue)
- **Classic AI Matrix** (existing functionality preserved)

---

## How the Pipeline Works End-to-End

```
1. User enters topic in Research Pipeline tab
        ↓
2. Field auto-detected (CS / Engineering / Medicine / Education / Law / Business / etc.)
        ↓
3. 6 databases queried in parallel (~3-5 seconds total)
   Semantic Scholar + OpenAlex + CrossRef + EuropePMC + CORE + ERIC
        ↓
4. Results deduplicated by DOI + normalised title
        ↓
5. Unpaywall queried for each paper with a DOI → resolves free open-access PDF URLs
        ↓
6. Obscura fetches full text from open-access PDFs (batches of 3)
        ↓
7. Papers categorised: 🟢 Full text / 🟡 Abstract only / 🔴 Paywalled
        ↓
8. Library Queue built — paywalled papers ranked by citation count
   Each gets: DOI link, Semantic Scholar, Google Scholar, ResearchGate,
   + university library deep link (if user selected their university)
        ↓
9. User optionally uploads PDFs from Library Queue
        ↓
10. AI synthesises all content (Gemini / Claude / OpenAI / DeepSeek / Grok):
    - Annotated Bibliography table
    - Empirical Literature Matrix table
    - 4-6 paragraph thematic narrative
    - Research gap summary (for Chapter 1)
```

---

## The 4 Synthesised Outputs

1. **Annotated Bibliography Table**
   - Columns: `S/N`, `Author(s) & Year`, `Article Title`, `Problem Statement`, `Methodology`, `Findings`, `Research Gaps`.
2. **Empirical Literature Matrix Table**
   - Columns: `Author(s) & Year`, `Sample Size & Population`, `Methodology & Model`, `Key Empirical Findings`, `Research Gap / Limitation`.
3. **4–6 Paragraph Thematic Narrative**
   - Covers: scope & sources, methodological approaches, consensus themes, debates & contradictions, literature gaps, and study positioning.
4. **Research Gap Summary**
   - 2–3 structured paragraphs ready for Chapter 1 of a thesis/dissertation.

---

## Field Coverage

| Research Area | Databases Used |
|---|---|
| Computer Science | Semantic Scholar, OpenAlex, CrossRef, arXiv, CORE |
| Engineering (EE/ME/CE/ChE) | Semantic Scholar, OpenAlex, CrossRef, engrXiv/ChemRxiv, CORE |
| Medicine / Biology | EuropePMC, Semantic Scholar, OpenAlex, CrossRef, CORE |
| Education | ERIC, Semantic Scholar, OpenAlex, CrossRef, CORE |
| Business / Economics / Finance | Semantic Scholar, OpenAlex, CrossRef, CORE |
| Law | Semantic Scholar, OpenAlex, CrossRef, CORE |
| All fields | + Unpaywall (always active for open access) |

---

## Deploying to Oracle Cloud

```bash
# On your Oracle Cloud server:
cd /path/to/writewise-agent

# Pull the new Obscura image
docker compose pull obscura

# Rebuild and restart all services
docker compose up -d --build

# Verify Obscura is healthy
docker exec writewise-obscura wget -qO- http://localhost:9222/json/version

# Check logs
docker compose logs obscura --tail=50
docker compose logs writewise-api --tail=50
```

---

## Testing Locally

```bash
# Test search endpoint
curl -X POST http://localhost:3001/api/research/search \
  -H "Content-Type: application/json" \
  -d '{"topic":"impact of social media on academic performance","targetCount":20}'

# Test full-text extraction (arXiv is always free)
curl -X POST http://localhost:3001/api/research/fetch-fulltext \
  -H "Content-Type: application/json" \
  -d '{"url":"https://arxiv.org/abs/2301.00001"}'
```
