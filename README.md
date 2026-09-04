# WriteWise

> **The Academic Integrity & Research Intelligence Platform**  
> *Research you can defend. Results a supervisor can verify. A platform institutions can endorse.*

[![Live App](https://img.shields.io/badge/Production-writewise.duckdns.org-brightgreen)](https://writewise.duckdns.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react&logoColor=black)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-3776ab?logo=python&logoColor=white)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ed?logo=docker&logoColor=white)](https://www.docker.com/)
[![Obscura](https://img.shields.io/badge/Headless_Browser-Obscura_CDP-ff6f00)](https://github.com/h4ckf0r0day/obscura)
[![Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com/)

---

## Table of Contents
1. [The Paradigm](#the-paradigm)
2. [Core Design Philosophy](#core-design-philosophy)
3. [Comprehensive Feature Matrix](#comprehensive-feature-matrix)
   - [1. Multi-Field Literature Discovery & Synthesis Pipeline](#1-multi-field-literature-discovery--synthesis-pipeline)
   - [2. Deterministic Statistical Computing Engine (Python)](#2-deterministic-statistical-computing-engine-python)
   - [3. Academic Integrity, Provenance & Claim Auditor](#3-academic-integrity-provenance--claim-auditor)
   - [4. Professional Manuscript Editor & Writing Suite](#4-professional-manuscript-editor--writing-suite)
   - [5. Interactive PDF Reader & In-Manuscript PDF Chat](#5-interactive-pdf-reader--in-manuscript-pdf-chat)
   - [6. Citation Engine & Reference Management](#6-citation-engine--reference-management)
   - [7. Defense Deck Presentation Generator](#7-defense-deck-presentation-generator)
   - [8. Multi-Format Publication & Export Suite](#8-multi-format-publication--export-suite)
4. [System Architecture](#system-architecture)
5. [API & Services Reference](#api--services-reference)
6. [Technology Stack](#technology-stack)
7. [Getting Started (Local Development)](#getting-started-local-development)
8. [Production Deployment (Docker & Oracle Cloud)](#production-deployment-docker--oracle-cloud)
9. [Environment Configuration](#environment-configuration)
10. [Academic Ethics & Institutional Compliance](#academic-ethics--institutional-compliance)

---

## The Paradigm

Every standard AI writing tool fights the academic institution. Their message is *"let AI write your dissertation faster"*, which universities interpret as *"let students cheat more efficiently"*.

Universities are not trying to ban technology; they are trying to **preserve academic integrity**. In an era where generative AI can fabricate convincing references, plausible statistics, and non-existent empirical models, how can universities trust student submissions?

**WriteWise answers that question with a rigorous governance and provenance model:**

> **Python computes. AI explains. The platform cryptographically verifies the link between them.**

Statistical computation is strictly delegated to Python (Pandas, SciPy, Statsmodels) — **never an LLM**. The AI receives only verified mathematical results and drafts the academic commentary. Every dataset is fingerprinted with a cryptographic SHA-256 hash, every test is logged to an append-only provenance trail, and supervisors can independently replicate every claim with one click.

---

## Core Design Philosophy

```
  ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
  │   PYTHON COMPUTES    │  ──► │      AI EXPLAINS     │  ──► │  PLATFORM VERIFIES   │
  │ Deterministic SciPy  │      │ Formal prose based   │      │ Cryptographic links, │
  │ & SPSS equivalence   │      │ ONLY on real numbers │      │ receipts & audit log │
  └──────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

1. **The Separation of Concerns**: Violating this boundary — such as letting an LLM generate or alter numbers — destroys academic credibility. Numbers originate exclusively from deterministic mathematical libraries.
2. **The Provenance Principle**: Every upload, execution, narrative generation, and supervisor review is recorded as an immutable event.
3. **Institutional Defensibility**: Students can walk into thesis defense committees with an immutable **Research Integrity Receipt** and executable **SPSS Syntax** that reproduces every single finding in their manuscript.

---

## Comprehensive Feature Matrix

### 1. Multi-Field Literature Discovery & Synthesis Pipeline

A universal research discovery and synthesis system capable of reviewing literature across all academic disciplines (Computer Science, Engineering, Medicine, Education, Law, Business, Humanities, and Natural Sciences).

* **Multi-Database Federation**: Concurrently queries 7+ premier academic databases:
  * **Semantic Scholar** (Cross-discipline AI & Citations)
  * **OpenAlex** (Comprehensive global scientific graph)
  * **CrossRef** (Official DOI registry & publisher records)
  * **EuropePMC** (Biomedical, Life Sciences & Clinical Trials)
  * **CORE** (Open Access papers across all faculties)
  * **ERIC** (Education, Curriculum & Pedagogy)
  * **Unpaywall** (Automated legal open-access PDF locator)
* **Automated Research Field Detection**: Dynamically classifies the research topic and prioritises discipline-specific databases and preprints (e.g., engrXiv, ChemRxiv, arXiv, PubMed).
* **Stealth Full-Text Extraction via Obscura**:
  * Employs [Obscura](https://github.com/h4ckf0r0day/obscura), a lightweight headless browser engine written in Rust, communicating over the Chrome DevTools Protocol (CDP).
  * Safely bypasses aggressive anti-bot protections and anti-scraping walls on open-access repositories.
  * Downloads and extracts readable full text from open-access PDFs in managed batches.
  * Graceful HTTP streaming fallback if headless browser mode is unavailable.
* **Smart Library Queue & Access Resolvers**:
  * Identifies paywalled papers and ranks them by academic priority and citation count.
  * Automatically generates deep links for **DOI**, **Google Scholar**, **Semantic Scholar**, and **ResearchGate**.
  * **60+ Global University EZProxy/OpenURL Resolvers**: Students select their university (e.g., Oxford, Cambridge, UNILAG, UI, UCT, Nairobi, Toronto, Melbourne) to generate 1-click library proxy login links.
  * **Drag & Drop PDF Intake**: Researchers download paywalled papers via their university library and drag them directly into the Library Queue dropzone to upgrade abstract-level reviews into full-text accuracy.
* **Flexible Multi-Provider AI Synthesis (Free & Paid Tiers)**:
  * **Google Gemini** (`gemini-2.5-flash`, `gemini-1.5-pro`): Free-tier default with zero setup required.
  * **Anthropic Claude** (`claude-3-5-sonnet-20241022`): Premier academic prose synthesis.
  * **OpenAI** (`gpt-4o`, `gpt-4o-mini`): State-of-the-art reasoning models.
  * **DeepSeek** (`deepseek-chat`): High-performance, cost-effective inference.
  * **xAI Grok** (`grok-2-latest`): Cutting-edge reasoning engine.
  * Reuses user API keys configured in client settings or transparently falls back to server keys.
* **Four Complete Academic Synthesis Outputs**:
  1. **Annotated Bibliography Table**: S/N, Author(s) & Year, Article Title, Problem Statement, Methodology, Findings, Research Gaps.
  2. **Empirical Literature Matrix Table**: Author & Year, Sample Size & Population, Methodology & Model, Key Empirical Findings, Limitations.
  3. **4–6 Paragraph Thematic Narrative**: Academic prose synthesizing literature scope, methodological paradigms, consensus findings, debates, and research gaps.
  4. **Research Gap Summary (Chapter 1)**: Structured 2–3 paragraph justification for dissertation introductory chapters.
  * **1-Click Insertion**: Each section can be inserted directly into the active document editor.

---

### 2. Deterministic Statistical Computing Engine (Python)

A Python microservice powered by **FastAPI**, **Pandas**, **SciPy**, and **Statsmodels** that performs exact calculations matching IBM SPSS Statistics:

* **SPSS File Ingestion**: Direct binary parsing of SPSS `.sav` files via `pyreadstat` with automated variable and value label extraction.
* **Descriptive Statistics**: Mean, Median, Mode, Standard Deviation, Variance, Skewness, Kurtosis, Min/Max, and Quartiles.
* **Reliability Analysis**: Scale and item-level Cronbach’s Alpha ($\alpha$) with "Alpha if item deleted" calculations.
* **Normality Testing**: Shapiro-Wilk test, Kolmogorov-Smirnov test, and distribution assessment.
* **Bivariate & Correlation Tests**: Pearson product-moment ($r$), Spearman rank ($\rho$), Kendall’s Tau ($\tau$), and Point-Biserial correlation.
* **Group Comparisons & Mean Differences**:
  * Independent Samples $t$-test, Paired Samples $t$-test, One-Sample $t$-test.
  * Non-parametric equivalents: Mann-Whitney $U$, Wilcoxon Signed-Rank.
  * One-Way ANOVA with Tukey HSD post-hoc pairwise comparisons.
  * Repeated Measures ANOVA, Kruskal-Wallis $H$, and Friedman tests.
* **Categorical & Contingency Analysis**: Pearson Chi-Square ($\chi^2$) test of independence and Fisher's Exact test with contingency tables.
* **Advanced Regression Models**:
  * Simple and Multiple Linear Regression (OLS) with $R^2$, adjusted $R^2$, $F$-test, ANOVA tables, and collinearity diagnostics.
  * Binary Logistic Regression and Multinomial Logistic Regression.
* **Factor Analysis & Structural Models**:
  * Exploratory Factor Analysis (EFA) via `factor-analyzer` with KMO and Bartlett's test of sphericity.
  * Mediation and Structural Equation Modeling (SEM) via `semopy`.
* **Survival Analysis**: Kaplan-Meier survival curves and Cox Proportional Hazards models via `lifelines`.
* **Automated SPSS Syntax Generator (`.sps`)**: Every analysis generates executable SPSS syntax so supervisors can reproduce the exact results in SPSS with zero discrepancy.

---

### 3. Academic Integrity, Provenance & Claim Auditor

* **Cryptographic Dataset Hashing**: Computes SHA-256 fingerprints of raw datasets at upload time to guarantee data authenticity and prevent retrofitted or manipulated data.
* **Chapter 4 Claim Auditor**:
  * Deterministic NLP pattern matcher (regex-based, avoiding LLM hallucination) that scans empirical chapters.
  * Automatically extracts statistical claims ($r$, $p$-values, Cronbach’s $\alpha$, Mean $M$, Standard Deviation $SD$, Sample Size $N$, $t$-statistics, $F$-statistics).
  * Cross-checks each claim against the computed Python output and highlights verified statements vs numerical discrepancies with line numbers.
* **Research Integrity Receipts**:
  * Generates an immutable, timestamped verification receipt containing the dataset hash, statistical tables, AI model parameters, and complete SPSS syntax.
  * Produces a unique share token (e.g. `/verify/:token`) for supervisors, university departments, and external examiners.
* **Supervisor Verification Portal**:
  * Clean, public, read-only interface (no login required for examiners) to inspect the complete research provenance chain.
  * Allows examiners to copy SPSS syntax to their clipboard for instant replication.
* **Supervisor Email Dispatch**: Built-in modal to draft and dispatch verification links directly to supervisors.

---

### 4. Professional Manuscript Editor & Writing Suite

* **TipTap Rich Text Engine**: Full academic formatting, headings, bulleted/ordered lists, blockquotes, code blocks, and rich tables.
* **Academic Tone Auditor**:
  * Audits manuscripts for scholarly tone, academic formality, vocabulary level, active/passive voice balance, and hedging phrases.
  * Identifies informal language, colloquialisms, and hyperbolic claims, offering 1-click academic replacements.
* **Document Structure & Templates**:
  * Pre-structured templates for Dissertation Proposals, Empirical Chapters (Introduction, Literature Review, Methodology, Results, Discussion), and Journal Articles.
* **AI Prompt Bar & Assistant**: In-editor streaming assistant that contextualizes edits, clarifies arguments, and provides academic feedback.
* **AI Text Detection & Analysis**: Checks writing against stylistic markers and provides metrics on perplexity and burstiness.

---

### 5. Interactive PDF Reader & In-Manuscript PDF Chat

* **Side-by-Side Reference Viewer**: Embedded PDF visual viewer built on `pdfjs-dist` to read research papers alongside your manuscript.
* **AI-Powered PDF Chat**:
  * Chat with uploaded research papers directly within the editor.
  * Ask questions about methodology, sample size, theoretical frameworks, or statistical results.
  * Extract verified quotations and citations directly from the document into the editor.

---

### 6. Citation Engine & Reference Management

* **Multi-Style Citation Formatter**:
  * **APA 7th Edition**
  * **MLA 9th Edition**
  * **Chicago 17th Edition (Author-Date & Notes-Bibliography)**
  * **Harvard**
  * **IEEE**
  * **Vancouver**
* **Instant DOI & CrossRef Search**: Enter any DOI or search by title to auto-populate complete bibliographic metadata.
* **In-Text Citation Auto-Insertion**: Click any reference to insert parenthetical (e.g., `(Smith, 2024)`) or narrative (e.g., `Smith (2024)`) citations at the cursor.
* **BibTeX Import & Export**: Full compatibility with Zotero, Mendeley, EndNote, and Overleaf.

---

### 7. Defense Deck Presentation Generator

* **Automated Dissertation Deck Creation**: Translates project context, problem statements, methodologies, and findings into structured defense slides.
* **Slide Outline Builder**:
  * Slide 1: Title, Degree, Candidate, Institution
  * Slide 2: Research Problem & Significance
  * Slide 3: Theoretical & Conceptual Framework
  * Slide 4: Empirical Methodology & Sampling
  * Slide 5: Key Statistical Findings & Evidence
  * Slide 6: Discussion, Limitations & Future Research
  * Slide 7: Scholarly & Practical Contributions
* **1-Click PowerPoint Export (`.pptx`)**: Generates fully formatted, styled Microsoft PowerPoint slide decks via `pptxgenjs`.

---

### 8. Multi-Format Publication & Export Suite

* **Microsoft Word (`.docx`)**: Generates formatted Word documents via `docx` with native tables and APA styling.
* **Adobe PDF (`.pdf`)**: Formatted document export with clean pagination and headers.
* **LaTeX & BibTeX (`.tex` / `.bib`)**: Produces structured LaTeX source code with standard packages, mathematical formatting, and BibTeX bibliographies.
* **Microsoft PowerPoint (`.pptx`)**: Defense presentations ready for projection.
* **Excel & CSV (`.xlsx` / `.csv`)**: Statistical tables and literature matrices exported via SheetJS.
* **SPSS Syntax (`.sps`)**: Script files ready to open in IBM SPSS Statistics.

---

## System Architecture

```
                                    ┌────────────────────────────────────────────────────────┐
                                    │                   CLIENT BROWSER                       │
                                    │       React 19 + TypeScript + TipTap + Tailwind        │
                                    └──────────────────────────┬─────────────────────────────┘
                                                               │
                                                   HTTPS / Port 443 / WSS
                                                               │
                                                               ▼
                                    ┌────────────────────────────────────────────────────────┐
                                    │                    NGINX REVERSE PROXY                 │
                                    │             SSL Termination + Rate Limiting            │
                                    └────────────┬─────────────────────────────┬─────────────┘
                                                 │                             │
                                  /api/*         │                             │  /stats/*
                                                 ▼                             ▼
                          ┌──────────────────────────────┐           ┌──────────────────────┐
                          │     NODE.JS EXPRESS API      │           │ PYTHON STATS ENGINE  │
                          │        (Port 3001)           │           │   (FastAPI / 8000)   │
                          ├──────────────────────────────┤           ├──────────────────────┤
                          │ • Multi-Database Search      │           │ • Pandas & NumPy     │
                          │ • Multi-Provider AI Router   │           │ • SciPy & Statsmodels│
                          │ • Literature Synthesiser     │           │ • Pingouin & Semopy  │
                          │ • Unpaywall & Metadata Cache │           │ • Lifelines Survival │
                          │ • Obscura CDP Client         │           │ • Pyreadstat (.sav)  │
                          └──────────────┬───────────────┘           └──────────────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │   OBSCURA HEADLESS BROWSER   │
                          │  (Rust CDP Server / 9222)    │
                          ├──────────────────────────────┤
                          │ • Stealth Anti-Detection     │
                          │ • Headless PDF Scraping      │
                          │ • Chrome DevTools Protocol   │
                          └──────────────────────────────┘
                                         │
                                         ▼
                          ┌──────────────────────────────┐
                          │      EXTERNAL AI & APIS      │
                          ├──────────────────────────────┤
                          │ • Google Gemini (Default)    │
                          │ • Anthropic Claude           │
                          │ • OpenAI GPT-4o              │
                          │ • DeepSeek & xAI Grok        │
                          │ • Semantic Scholar, OpenAlex │
                          │ • CrossRef, EuropePMC, CORE  │
                          └──────────────────────────────┘
```

---

## API & Services Reference

### Node.js API Service (`server.js` · Port 3001)

| Endpoint | Method | Description |
|---|---|---|
| `/health` | `GET` | API health check and uptime verification |
| `/api/research/search` | `POST` | Multi-database federated literature search with field detection |
| `/api/research/fetch-fulltext` | `POST` | Fetches open-access PDF content via Obscura CDP or direct HTTP |
| `/api/research/synthesise` | `POST` | Multi-provider literature synthesis (Gemini/Claude/OpenAI/DeepSeek/Grok) |
| `/api/generate-narrative` | `POST` | Streams academic commentary based strictly on verified Python stats |
| `/api/generate-syntax` | `POST` | Generates reproducible SPSS syntax scripts for computed models |
| `/api/detect-codebook` | `POST` | Automatically detects variable types and measurement scales |
| `/api/chat` | `POST` | Streaming AI research assistant endpoint |

### Python Statistics Service (`writewise-stats-api/main.py` · Port 8000)

| Endpoint | Method | Description |
|---|---|---|
| `/health` | `GET` | Health check and installed scientific libraries inventory |
| `/parse-sav` | `POST` | Parses binary SPSS `.sav` files and extracts codebook metadata |
| `/compute-full-stats` | `POST` | Computes full-suite statistics from JSON/tabular dataset |
| `/run-test` | `POST` | Executes specific statistical tests (t-test, ANOVA, Regression, etc.) |

---

## Technology Stack

* **Frontend Framework**: React 19, TypeScript 5.5, Vite 5.4
* **UI & Styling**: Tailwind CSS 3.4, shadcn/ui, Radix UI primitives, Lucide Icons
* **Document & PDF Processing**: TipTap 3.22, `pdfjs-dist` 5.6, `docx` 9.7, `jspdf` 3.0, `pptxgenjs` 4.0, `xlsx` (SheetJS)
* **Backend Runtime**: Node.js 20, Express 4.21, `@vercel/node`
* **Headless Browser Automation**: Obscura (Rust CDP engine), `puppeteer-core` 25.10
* **Data Science & Statistics**: Python 3.11, FastAPI, Pandas 2.1, NumPy 1.26, SciPy 1.11, Statsmodels, Pingouin, Semopy, Lifelines, Pyreadstat
* **Database & Authentication**: Supabase (PostgreSQL, Row-Level Security, Auth, Storage)
* **Containerization & Reverse Proxy**: Docker, Docker Compose, Nginx 1.27 Alpine, Let's Encrypt Certbot

---

## Getting Started (Local Development)

### Prerequisites
* **Node.js**: v20.19.0+ or v22+
* **Python**: v3.11+ (with `pip` and virtual environment support)
* **Docker Desktop** (optional, for running Obscura and containerized stack)

### 1. Clone the Repository
```bash
git clone https://github.com/Teleiosite/writewise-agent.git
cd writewise-agent
```

### 2. Install Frontend & Node API Dependencies
```bash
npm install
```

### 3. Setup Python Statistics Service
```bash
cd writewise-stats-api
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

### 4. Configure Environment Variables
```bash
cp .env.example .env
```
Fill in your `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and optional AI keys (e.g. `DEFAULT_GEMINI_KEY`).

### 5. Launch Development Servers
In separate terminals:
```bash
# Terminal 1: Frontend (Vite)
npm run dev

# Terminal 2: Node.js API Server
node server.js

# Terminal 3: Python Statistics Engine
cd writewise-stats-api
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Production Deployment (Docker & Oracle Cloud)

WriteWise is fully containerized and production-ready for deployment on **Oracle Cloud Free Tier** (2 OCPU / 12GB RAM) or any Linux VPS.

```bash
# 1. Clone on your production server
git clone https://github.com/Teleiosite/writewise-agent.git /opt/writewise
cd /opt/writewise

# 2. Copy and configure production environment
cp .env.example .env
nano .env

# 3. Pull Obscura and build all services
docker compose pull obscura
docker compose up -d --build

# 4. Verify deployment health
docker compose ps
docker exec writewise-api wget -qO- http://obscura:9222/json/version
```

---

## Environment Configuration

Create a `.env` file in the root directory:

```env
# ── Supabase Database & Auth ──────────────────────────────────────────────────
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# ── API Networking ────────────────────────────────────────────────────────────
API_PORT=3001
VITE_STATS_API_URL=/stats

# ── Headless Browser (Obscura) ────────────────────────────────────────────────
OBSCURA_CDP_URL=ws://obscura:9222
OBSCURA_ENABLED=true

# ── AI API Keys (Optional Server Fallbacks) ───────────────────────────────────
DEFAULT_GEMINI_KEY=your-gemini-api-key
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key
GROK_API_KEY=your-grok-api-key
```

---

## Academic Ethics & Institutional Compliance

WriteWise is engineered in strict compliance with university academic integrity frameworks:

1. **No Ghostwriting**: The platform does not generate research from whole cloth; it synthesises actual papers and writes commentary based solely on computed dataset numbers.
2. **Transparent Provenance**: Every output is traceable to raw data via SHA-256 fingerprints and immutable audit logs.
3. **Reproducibility Guarantee**: Every analysis includes executable SPSS syntax so examiners can independently reproduce findings.
4. **GDPR / Privacy Compliance**: Datasets are processed securely, and research identities can be pseudonymised at the database layer.

---

## License

Copyright © 2026 WriteWise. All rights reserved. Distributed under the proprietary license of WriteWise Academic Technologies.
