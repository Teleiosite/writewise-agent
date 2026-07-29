# WriteWise

> **The academic integrity layer for AI-assisted research.**
> Research you can defend. Results a supervisor can verify. A platform institutions can endorse.

[![Live App](https://img.shields.io/badge/Live-writewise--app.vercel.app-brightgreen)](https://writewise-app.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11-yellow)](https://python.org/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-green)](https://supabase.com/)

---

## The Problem

Every AI writing tool currently on the market is fighting the institution.

Their message is: *"Let AI write your research faster."*
Universities hear: *"Let AI help your students cheat more efficiently."*

This is not a winnable fight. And it is not the fight WriteWise is in.

Universities are not trying to stop AI. They are trying to **preserve academic integrity** in an environment where AI has made it trivially easy to produce competent-looking research that cannot be verified, reproduced, or defended.

That is a governance problem. Not a writing problem.

WriteWise answers a different question:

> **How do we help universities trust AI-assisted research?**

---

## What WriteWise Is

WriteWise is an **Academic Research Platform** built on a single architectural principle:

> **Python computes. AI explains. The platform verifies the link between them.**

Statistical analysis is performed by Python (Pandas + SciPy) — not by an LLM. The AI receives only the verified numerical outputs and writes the academic interpretation. Every result is linked back to the original dataset via a cryptographic hash. Every significant research action is recorded in an immutable, append-only event log.

The result is research that students can defend, supervisors can verify, and institutions can endorse.

### What Makes WriteWise Different

| Capability | ChatGPT | Grammarly | SPSS | Zotero | WriteWise |
|---|---|---|---|---|---|
| Real statistical computation | ❌ | ❌ | ✅ | ❌ | ✅ |
| SPSS syntax for reproducibility | ❌ | ❌ | ✅ | ❌ | ✅ |
| Dataset authentication (SHA-256) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Immutable research provenance chain | ❌ | ❌ | ❌ | ❌ | ✅ |
| AI-assisted chapter generation | ✅ | ❌ | ❌ | ❌ | ✅ |
| Chapter claims verified against outputs | ❌ | ❌ | ❌ | ❌ | ✅ |
| Supervisor verification workflow | ❌ | ❌ | ❌ | ❌ | 🚧 |
| Institutional governance dashboard | ❌ | ❌ | ❌ | ❌ | 🚧 |

---

## What WriteWise Is Not

- **Not an AI essay writer.** WriteWise does not write your research. It helps you produce research you can stand behind.
- **Not a grammar checker.** Grammarly solves that problem. WriteWise solves a different one.
- **Not a citation manager.** Zotero exists. WriteWise integrates with your sources, it doesn't replace them.
- **Not SPSS.** WriteWise uses the same statistical methods as SPSS and generates SPSS syntax so your supervisor can reproduce every result. You don't need an SPSS licence.

---

## Core Design Philosophy

### The Separation of Concerns

```
Python computes.   →   Deterministic. Reproducible. Identical to SPSS.
AI explains.       →   Natural language. Context-aware. Clearly labelled.
Platform verifies. →   Cryptographic links between data, output, and interpretation.
```

This separation is the foundation of every architectural decision in this project. Violating it — allowing an LLM to generate or modify statistical outputs — breaks the integrity guarantee the entire platform rests on.

### The Provenance Principle

Every significant research action creates an immutable event. Nothing is overwritten. The history cannot be edited.

A supervisor challenging a dissertation can see:

```
2027-03-14 10:15  DATASET_UPLOADED    survey_data.xlsx  SHA-256: 6A8D3B1C...
2027-03-14 10:18  ANALYSIS_EXECUTED   Python 3.11 · Pandas 2.1.0 · SciPy 1.11.0
2027-03-14 10:19  RESULT_GENERATED    Pearson r = 0.72 · p = 0.003
2027-03-14 10:21  NARRATIVE_GENERATED Claude Sonnet · inputs: verified stats only
2027-03-14 14:31  DATASET_REPLACED    old SHA-256: 6A8D3B1C · new SHA-256: 2F9C4E7A
2027-03-14 14:33  ANALYSIS_RERUN      Pearson r = 0.81 · p = 0.001
2027-03-14 15:02  SUPERVISOR_REVIEWED confirmed
```

Nothing was hidden. Nothing was fabricated. The chain of custody is complete.

This is to academic research what Git is to software development.

---

## System Architecture

```
Browser (Student)
        │
        │  Upload dataset (Excel / CSV / SPSS .sav)
        ▼
WriteWise Frontend
(React 19 + TypeScript on Vercel)
        │
        ├─────────────────────────────────────┐
        │                                     │
        │  POST /analyse                      │  POST /api/generate-narrative
        │  { data, codebook, context }        │  { stats_json, context, model }
        ▼                                     ▼
Python Statistics Service            AI Router (Vercel Serverless)
(FastAPI · Railway)                  (Claude / GPT-4o / Gemini)
Pandas + SciPy                               │
        │                                    │
        │  Returns verified stats_json       │  Returns academic narrative
        │                                    │
        └──────────────┬─────────────────────┘
                       │
                       ▼
              Research Integrity Engine
         ┌─────────────────────────────────┐
         │  · Dataset hash recorded        │
         │  · Events appended (immutable)  │
         │  · Stats linked to narrative    │
         │  · SPSS syntax generated        │
         │  · Integrity Report assembled   │
         └─────────────────────────────────┘
                       │
                       ▼
              Supabase (PostgreSQL)
         ┌─────────────────┬───────────────────┐
         │  Business DB    │  Integrity Engine  │
         │  (mutable)      │  (append-only)     │
         │  users          │  analysis_events   │
         │  projects       │  dataset_hashes    │
         │  subscriptions  │  verification_logs │
         │  notifications  │  ai_generation_logs│
         └─────────────────┴───────────────────┘
                       │
                       ▼
              WriteWise Editor
         (inject narrative + tables into document)
         + DOCX Export
         + Supervisor Share Link (read-only)
```

---

## Database Architecture

WriteWise uses two distinct database worlds on the same Supabase project.

### Mutable Business Tables (standard SaaS)

These tables behave like any normal web application. Rows can be updated and deleted.

```sql
users          -- Managed by Supabase Auth
projects       -- Research projects
documents      -- Written content, autosaved drafts
citations      -- Reference library
notifications  -- User alerts
subscriptions  -- Billing and plan state
```

### Immutable Integrity Tables (append-only, never updated)

These tables form the Research Integrity Engine. Rows are never modified after creation. Row-level database rules enforce this.

```sql
research_identities   -- Pseudonymised identity layer (GDPR compliance)
analysis_events       -- Append-only event log (the provenance chain)
dataset_hashes        -- Cryptographic fingerprints of uploaded files
verification_logs     -- Results of claim-verification checks
ai_generation_logs    -- AI model, inputs, token count per generation
supervisor_reviews    -- Supervisor actions, timestamps, decisions
research_receipts     -- Assembled integrity reports (generated, never edited)
```

#### Why Two Worlds?

Supervisors, ethics committees, and institutions need to trust that research records cannot be retroactively altered. The append-only integrity tables make this a technical guarantee, not a policy promise.

For implementation details, see [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.5 | Type safety |
| Tailwind CSS | 3.4 | Styling |
| shadcn/ui | latest | Component library |
| TipTap | 3.22 | Rich text editor |
| Recharts | 2.x | Data visualisation |
| pdfjs-dist | 5.x | PDF rendering |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Supabase | 2.x | PostgreSQL + Auth + Storage |
| Vercel Serverless | latest | API proxy, AI router |
| FastAPI | latest | Python statistics service |

### Statistics Engine (Python)
| Library | Version | Purpose |
|---|---|---|
| Pandas | 2.1 | Data manipulation |
| SciPy | 1.11 | Statistical tests |
| NumPy | 1.26 | Numerical computation |
| openpyxl | 3.x | Excel file parsing |

### AI Models
| Model | Provider | Role |
|---|---|---|
| Claude Sonnet | Anthropic | Academic narrative (default) |
| GPT-4o | OpenAI | Academic narrative (alternative) |
| Gemini 1.5 Pro | Google | Academic narrative (alternative) |

---

## Development Roadmap

### Phase 0 — Foundation (Do This Before Everything Else)

These are not features. They are architectural decisions that cannot be added retroactively.

**Every analysis that runs before this is in place will have an incomplete provenance chain — permanently.**

| Task | Why It Cannot Wait | Estimated Effort |
|---|---|---|
| Implement `analysis_events` append-only table | Foundation of all future verification features | 1 day |
| Implement `dataset_hashes` table with SHA-256 | Dataset authentication; fabrication detection | 0.5 day |
| Implement `research_identities` pseudonymisation | GDPR compliance; required before collecting user data at scale | 1 day |
| Remove Text Humanizer from all public routes | Fatal positioning contradiction; institutional trust blocker | 0.5 day |
| Fix Tailwind dynamic class purge bug | Feature icons invisible in production build | 2 hours |
| `logResearchEvent()` service in frontend | Ties all future features to the event chain | 1 day |

**Success criterion:** Every analysis run after Phase 0 has a complete, immutable provenance chain stored in Supabase. Zero exceptions.

---

### Phase 1 — MVP: The Core Loop

**Objective:** Prove that a student can run a complete analysis, receive a verified output, and share it with a supervisor — all in one session.

**Features to build:**

- [ ] **Public landing page** with reproducibility as the hero message
- [ ] **New user onboarding wizard** (3 screens: what WriteWise is, how analysis works, first project)
- [ ] **Sample dataset** with pre-populated codebook (zero-friction first run, no jargon)
- [ ] **Research Integrity Report v1** — assembled PDF/HTML including:
  - Statistical tables (Python-computed)
  - SPSS syntax (one-click copy)
  - Dataset hash and timestamp
  - AI model and inputs declaration
  - WriteWise version used
- [ ] **Supervisor share link** — read-only, no login required, shows full Integrity Report
- [ ] **DOCX export** with publication-ready table formatting (APA style)
- [ ] **"Verified by WriteWise" badge** on all analysis outputs

**Architectural decisions for Phase 1:**

- The `analysis_events` table must be in place (Phase 0)
- The Supervisor Share link reads from `research_receipts` (immutable), not the live analysis state
- DOCX export uses the same verified data as the Integrity Report — not regenerated

**Database changes:**

```sql
-- research_receipts: generated at analysis completion, never modified
CREATE TABLE research_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES data_analyses(id),
  receipt_version VARCHAR(10) NOT NULL,   -- e.g. "1.0"
  payload JSONB NOT NULL,                 -- full structured receipt data
  share_token VARCHAR(64) UNIQUE,         -- for supervisor share links
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- No updated_at — immutable
);
```

**Success criteria:**

- 100 users complete a full analysis (upload → compute → report → share)
- 5 supervisors independently verify results using generated SPSS syntax
- Zero analysis errors due to Python service downtime (requires paid Railway tier)

---

### Phase 2 — Version 1: Claim Verification

**Objective:** WriteWise can audit a student's written chapter against the verified statistical outputs — the "auditor" capability.

**Features to build:**

- [ ] **Chapter Claim Verification** — paste or upload Chapter 4, WriteWise checks:
  - Statistical claims against computed outputs (e.g. "Pearson r = 0.71" vs. actual r = 0.72)
  - P-value claims against computed significance
  - Descriptive claims (mean, SD) against demographic tables
  - Flags inconsistencies with exact evidence and line references
- [ ] **Citation verification v1** — DOI resolution, checks citations exist in reference list
- [ ] **Methodology validation** — confirms test selection is appropriate for variable types
- [ ] **Expanded statistical tests** — ANOVA, Chi-square, Factor Analysis
- [ ] **Full provenance timeline UI** — student sees their complete research history

**Architectural decisions for Phase 2:**

- Claim verification runs against the `computed_stats` JSONB stored in `data_analyses`
- The engine can only verify claims for analyses that originated in WriteWise (this is intentional — it is the lock-in mechanism)
- Verification results are stored in `verification_logs` (immutable)

**Technical considerations:**

- Claim extraction from chapter text uses structured NLP (pattern matching for statistical notation, not LLM extraction — LLM extraction introduces hallucination into the verification layer, which defeats the purpose)
- Tolerance thresholds for numerical matching must be configurable (rounding differences between software)

**Success criteria:**

- Claim verification catches ≥95% of deliberate numerical inconsistencies in test datasets
- False positive rate < 5% on legitimate research
- 500 paying subscribers

---

### Phase 3 — Version 2: Supervisor Surface

**Objective:** Supervisors adopt WriteWise not because students use it, but because it saves them review time and increases their confidence in submitted work.

**Features to build:**

- [ ] **Supervisor dashboard** — see all students who have shared analyses, status at a glance
- [ ] **Structured verification workflow** — supervisor marks claims as verified, requests corrections, adds comments
- [ ] **Correction tracking** — student corrections create new events; supervisor is notified; correction delta is recorded
- [ ] **Department pilot packaging** — onboarding materials for department-level adoption
- [ ] **Examination report** — structured PDF for external examiners, including complete provenance chain

**Architectural decisions for Phase 3:**

- Supervisors have read-only access to student analyses via share links, or full access if students invite them explicitly
- Supervisor actions are logged in `supervisor_reviews` (immutable)
- Correction requests create a new `CORRECTION_REQUESTED` event; student corrections create `CORRECTION_SUBMITTED` events — the full dialogue is preserved

**Business model change at Phase 3:**

- Supervisor accounts: **free permanently** — supervisors are the distribution channel into departments
- Student accounts: subscription tiers based on analyses per month
- Department pilot: paid, negotiated

**Success criteria:**

- 1 department (10+ supervisors, 50+ students) on a paid pilot
- 1 published case study with named institution and supervisor
- Average supervisor review time reduced by ≥50% (self-reported)

---

### Phase 4 — Enterprise: Institutional Surface

**Objective:** University IT departments and research offices pay for WriteWise as academic integrity infrastructure.

**Features to build:**

- [ ] **SSO** via Google Workspace / Microsoft 365 (`.edu` accounts)
- [ ] **University governance dashboard** — aggregate metrics by department, cohort, supervisor
- [ ] **Policy configuration** — institution sets AI use rules; WriteWise enforces them
- [ ] **Admin roles** — department head, faculty admin, IT administrator
- [ ] **IRB/ethics committee compliance kit** — documentation package for ethics applications
- [ ] **Department template library** — upload methodology guide; WriteWise checks submissions against it
- [ ] **Audit export** — full institution-level export for accreditation review
- [ ] **SLA documentation and uptime commitment**
- [ ] **Data Processing Agreement** (GDPR/FERPA compliant)

**Architectural decisions for Phase 4:**

- Multi-tenancy: each institution is isolated at the RLS policy level
- Data residency controls: allow institutions to specify which Supabase region stores their data
- All institutional data is exportable in standard formats (JSON, CSV) — no vendor lock-in at the data layer

**Success criteria:**

- 3 paying institutional contracts ($5K–$50K/year)
- Mentioned in at least one university AI use policy as an approved tool
- 15,000 active student users

---

## Repository Structure

```
writewise-agent/
│
├── src/                              # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── analysis/                 # Research Integrity Engine UI
│   │   │   ├── FileUploader.tsx      # Dataset upload with hash computation
│   │   │   ├── CodebookEditor.tsx    # Variable type assignment
│   │   │   ├── ContextForm.tsx       # Research background input
│   │   │   ├── StatisticsPanel.tsx   # Verified output display
│   │   │   ├── NarrativeStream.tsx   # AI narrative streaming
│   │   │   ├── SyntaxPanel.tsx       # SPSS syntax output
│   │   │   └── IntegrityReport.tsx   # 🚧 Assembled receipt display
│   │   ├── editor/                   # Document editor
│   │   ├── dashboard/                # Project management
│   │   ├── citations/                # Reference management
│   │   └── layout/                   # Navigation, headers, footers
│   │
│   ├── pages/
│   │   ├── Landing.tsx               # 🚧 Public homepage (does not exist yet)
│   │   ├── DataAnalysis.tsx          # Statistical analysis workflow
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── [other pages]
│   │
│   ├── services/
│   │   ├── analysisService.ts        # Python stats API + narrative generation
│   │   ├── eventLog.ts               # 🚧 Append-only event logging service
│   │   ├── datasetHash.ts            # 🚧 SHA-256 hashing at upload time
│   │   └── integrityReport.ts        # 🚧 Receipt assembly
│   │
│   ├── hooks/
│   │   ├── useAnalysis.ts            # Analysis state management
│   │   └── useDashboardTabs.ts       # Tab state
│   │
│   ├── contexts/                     # React Context providers
│   ├── types/                        # TypeScript type definitions
│   │   ├── analysis.types.ts         # Statistical types
│   │   └── events.types.ts           # 🚧 Event log types
│   └── lib/
│       └── supabase.ts               # Supabase client
│
├── api/                              # Vercel serverless functions
│   └── generate-narrative.ts         # AI model router (Claude/GPT-4o/Gemini)
│
├── writewise-stats-api/              # Python microservice (FastAPI)
│   ├── main.py                       # Statistical computation engine
│   ├── requirements.txt              # Python dependencies
│   └── Procfile                      # Railway deployment config
│
├── supabase/                         # Database migrations
│   └── migrations/                   # SQL migration files (chronological)
│
├── docs/                             # 🚧 Extended documentation
│   ├── ARCHITECTURE.md               # Technical architecture decisions
│   ├── EVENTS.md                     # Event type catalogue
│   ├── STATISTICS.md                 # Statistical methods reference
│   └── CONTRIBUTING.md               # Contribution guidelines
│
├── README.md                         # This file
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

Items marked 🚧 do not yet exist. They are planned for Phase 0 or Phase 1.

---

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- Python 3.11+
- A Supabase project (free tier sufficient for development)
- A Railway account (for Python statistics service)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Teleiosite/writewise-agent.git
cd writewise-agent

# 2. Install frontend dependencies
npm install --legacy-peer-deps
# Note: --legacy-peer-deps resolves next-themes peer conflict with React 19.
# This will be resolved when next-themes releases React 19 support.

# 3. Set up environment variables
cp .env.example .env
# Add your credentials (see Environment Variables section)

# 4. Run database migrations
# Open your Supabase SQL editor and run files in supabase/migrations/ in order

# 5. Start the development server
npm run dev

# 6. In a separate terminal, start the Python statistics service
cd writewise-stats-api
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Environment Variables

```env
# Frontend (Vite)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STATS_API_URL=http://localhost:8000    # Local dev; Railway URL in production

# Vercel Serverless Functions (set in Vercel dashboard for production)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
```

---

## Contributing

WriteWise is approaching a pivotal phase of development. Contributions that strengthen the Research Integrity Engine are most valuable right now.

### High-Priority Contributions

1. **`eventLog.ts` service** — append-only event logging for all research actions
2. **`datasetHash.ts` service** — SHA-256 computation on file upload
3. **`IntegrityReport.tsx` component** — assembled verification report
4. **Supervisor share link** — read-only report page (no login required)
5. **Database migrations** — Phase 0 immutable table schema

### The One Rule

> **Never allow an AI model to generate, modify, or influence statistical outputs.**

AI receives verified Python outputs. It explains them. It does not produce them. Every engineering decision must preserve this separation.

### Development Standards

- TypeScript strict mode — no `any` types in the integrity engine layer
- All new Supabase tables affecting research integrity are append-only by default
- Event types must be defined in `types/events.types.ts` before implementation
- Functions that write to integrity tables must never fail silently — log errors, but do not throw in a way that breaks the main research workflow

---

## Known Issues

| Issue | Severity | Status |
|---|---|---|
| Tailwind dynamic class strings (`bg-${color}-100`) purged in production build — feature icons invisible | 🔴 Critical | Open |
| `next-themes` peer dependency conflict with React 19 | 🟡 Medium | Workaround: `--legacy-peer-deps` |
| Python stats API on Railway free tier — cold start delays of 30–60 seconds | 🟡 Medium | Move to paid tier (planned Phase 1) |
| No test suite (`npm run test` script exists but no tests written) | 🟠 High | Open |
| No rate limiting on AI API endpoints | 🟠 High | Open |

---

## Author

**Abomide Oluwaseye**

- GitHub: [@Teleiosite](https://github.com/Teleiosite)
- Email: abosey23@gmail.com
- Live App: [writewise-app.vercel.app](https://writewise-app.vercel.app)

---

## License

MIT License. See [LICENSE](LICENSE) for details.

> **Note on open-source licensing:** WriteWise's core Research Integrity Engine — particularly the append-only event architecture and dataset authentication layer — may be subject to a more restrictive licence in future versions as the platform moves toward institutional contracts. Contributors acknowledge this possibility.
