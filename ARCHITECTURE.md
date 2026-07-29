# WriteWise — Architecture Document

> **Living document.** Updated as architectural decisions are made.
> Last updated: July 2026

This document records the technical architecture of WriteWise, the reasoning behind each major decision, and the constraints that future engineers must respect. It is not a tutorial. It is a decision log.

---

## Table of Contents

1. [Core Principle](#1-core-principle)
2. [The Two Database Worlds](#2-the-two-database-worlds)
3. [Event Architecture](#3-event-architecture)
4. [Dataset Authentication](#4-dataset-authentication)
5. [GDPR Compliance Design](#5-gdpr-compliance-design)
6. [Python Statistics Service](#6-python-statistics-service)
7. [AI Narrative Router](#7-ai-narrative-router)
8. [Verification Pipeline](#8-verification-pipeline)
9. [Security Architecture](#9-security-architecture)
10. [Scalability Considerations](#10-scalability-considerations)
11. [Known Technical Debt](#11-known-technical-debt)

---

## 1. Core Principle

> **Python computes. AI explains. The platform verifies the link between them.**

This is not a design preference. It is the product's entire value proposition.

An LLM-generated statistical mean of 3.22 when the real mean is 3.07 is not a minor UX bug. It is the reason a student fails their dissertation defence. Python with Pandas computes with identical precision to SPSS. The results are always correct because they are calculated, not generated.

Any engineering decision that allows an AI model to influence statistical outputs violates this principle and breaks the trust guarantee the platform is built on.

### Responsibility Matrix

| Layer | Technology | Constraint |
|---|---|---|
| Statistical computation | Python (Pandas + SciPy) | Must match SPSS output exactly |
| Academic narrative | AI model (user-selectable) | Receives only verified stats — never raw data |
| Data storage | Supabase (PostgreSQL) | Integrity tables are append-only |
| File parsing | SheetJS (browser) | Client-side — raw data never sent to AI |
| Event logging | Supabase append-only | No UPDATE or DELETE — ever |
| Dataset authentication | SHA-256 (client-side) | Hash computed before upload, stored immutably |

---

## 2. The Two Database Worlds

WriteWise uses a single Supabase project but two conceptually separate database worlds. This is the most important architectural decision in the project.

### World 1 — Mutable Business Tables

Standard SaaS tables. Rows are updated and deleted normally.

```sql
users               -- Auth-managed by Supabase
projects            -- Research projects
documents           -- Written content
citations           -- Reference library  
notifications       -- User alerts
subscriptions       -- Billing state
profiles            -- User preferences and metadata
```

These tables power the product's day-to-day workflow. They are not part of the trust layer.

### World 2 — Immutable Integrity Tables

These tables form the Research Integrity Engine. They are **append-only**. Rows are inserted once and never modified. Database-level rules enforce this — it is not a convention that can be accidentally broken.

```sql
research_identities    -- Pseudonymised identity layer
analysis_events        -- Append-only provenance event log
dataset_hashes         -- Cryptographic file fingerprints
verification_logs      -- Claim-verification results
ai_generation_logs     -- Model, inputs, and token counts
supervisor_reviews     -- Supervisor actions and decisions
research_receipts      -- Assembled integrity reports
```

### Full Schema — Integrity Tables

```sql
-- ============================================================
-- PHASE 0 MIGRATION — Run before any user data is collected
-- ============================================================

-- Pseudonymised identity layer for GDPR compliance
-- Separates the person from their research history
CREATE TABLE research_identities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  -- CASCADE: when the user deletes their account, this row is deleted.
  -- All events referencing this identity become anonymised (SET NULL).
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE research_identities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own identity" ON research_identities
  FOR ALL USING (auth.uid() = user_id);


-- The append-only provenance event log
-- This is the central table of the Research Integrity Engine
CREATE TABLE analysis_events (
  id BIGSERIAL PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES data_analyses(id) ON DELETE CASCADE,
  research_identity_id UUID REFERENCES research_identities(id) ON DELETE SET NULL,
  -- SET NULL on delete: event survives account deletion (anonymised) — GDPR compliant

  event_type VARCHAR(100) NOT NULL,
  -- See Event Catalogue below for all valid event_type values

  payload JSONB NOT NULL DEFAULT '{}',
  -- Structured data relevant to this specific event type

  dataset_hash VARCHAR(64),
  -- SHA-256 of dataset file — populated for DATASET_UPLOADED and DATASET_REPLACED

  python_version VARCHAR(20),
  library_versions JSONB,
  -- Populated for ANALYSIS_EXECUTED events
  -- e.g. { "pandas": "2.1.0", "scipy": "1.11.0", "numpy": "1.26.0" }

  ai_model VARCHAR(100),
  ai_inputs_summary JSONB,
  -- Populated for NARRATIVE_GENERATED events
  -- Documents exactly what the AI received (never includes raw dataset)

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- NO updated_at — this table is append-only
);

-- Enforce append-only at the database level
CREATE RULE no_update_analysis_events AS
  ON UPDATE TO analysis_events DO INSTEAD NOTHING;

CREATE RULE no_delete_analysis_events AS
  ON DELETE TO analysis_events DO INSTEAD NOTHING;

CREATE INDEX idx_events_analysis ON analysis_events(analysis_id);
CREATE INDEX idx_events_type ON analysis_events(event_type);
CREATE INDEX idx_events_created ON analysis_events(created_at DESC);

ALTER TABLE analysis_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own events" ON analysis_events
  FOR SELECT USING (
    analysis_id IN (SELECT id FROM data_analyses WHERE user_id = auth.uid())
  );
CREATE POLICY "Users insert own events" ON analysis_events
  FOR INSERT WITH CHECK (
    analysis_id IN (SELECT id FROM data_analyses WHERE user_id = auth.uid())
  );
-- Deliberately: no UPDATE or DELETE policy


-- Cryptographic fingerprints of uploaded datasets
CREATE TABLE dataset_hashes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES data_analyses(id) ON DELETE CASCADE,
  sha256_hash VARCHAR(64) NOT NULL,
  filename VARCHAR(255),
  file_size_bytes BIGINT,
  row_count INTEGER,
  column_count INTEGER,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- No updated_at — immutable
);

CREATE UNIQUE INDEX idx_hashes_unique ON dataset_hashes(sha256_hash, analysis_id);
CREATE INDEX idx_hashes_analysis ON dataset_hashes(analysis_id);

ALTER TABLE dataset_hashes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own hashes" ON dataset_hashes
  FOR ALL USING (
    analysis_id IN (SELECT id FROM data_analyses WHERE user_id = auth.uid())
  );


-- AI generation audit log
CREATE TABLE ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES data_analyses(id) ON DELETE CASCADE,
  research_identity_id UUID REFERENCES research_identities(id) ON DELETE SET NULL,
  ai_model VARCHAR(100) NOT NULL,
  input_type VARCHAR(100) NOT NULL DEFAULT 'verified_statistical_outputs',
  -- CONSTRAINT: must always be 'verified_statistical_outputs'
  -- AI must never receive raw dataset rows
  input_token_count INTEGER,
  output_token_count INTEGER,
  writewise_engine_version VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE RULE no_update_ai_logs AS
  ON UPDATE TO ai_generation_logs DO INSTEAD NOTHING;

ALTER TABLE ai_generation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own ai logs" ON ai_generation_logs
  FOR SELECT USING (
    analysis_id IN (SELECT id FROM data_analyses WHERE user_id = auth.uid())
  );


-- Supervisor review actions
CREATE TABLE supervisor_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES data_analyses(id) ON DELETE CASCADE,
  share_token VARCHAR(64) NOT NULL,
  action VARCHAR(100) NOT NULL,
  -- VIEWED, VERIFIED, CORRECTION_REQUESTED, APPROVED
  notes TEXT,
  supervisor_email VARCHAR(255),
  -- May be null if supervisor reviewed anonymously via share link
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE RULE no_update_supervisor_reviews AS
  ON UPDATE TO supervisor_reviews DO INSTEAD NOTHING;

CREATE INDEX idx_supervisor_analysis ON supervisor_reviews(analysis_id);


-- Assembled integrity reports (generated once, never modified)
CREATE TABLE research_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES data_analyses(id) ON DELETE CASCADE,
  receipt_version VARCHAR(10) NOT NULL DEFAULT '1.0',
  -- Semantic version of the receipt format
  payload JSONB NOT NULL,
  -- Full structured receipt: stats, hashes, model info, event summary
  share_token VARCHAR(64) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  -- Token for supervisor share links — collision probability negligible
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- No updated_at — immutable
);

CREATE RULE no_update_receipts AS
  ON UPDATE TO research_receipts DO INSTEAD NOTHING;

CREATE INDEX idx_receipts_analysis ON research_receipts(analysis_id);
CREATE INDEX idx_receipts_token ON research_receipts(share_token);
```

---

## 3. Event Architecture

### Event Catalogue

Every event type stored in `analysis_events.event_type` is documented here. Adding a new event type requires updating this document first.

| Event Type | Trigger | Key Payload Fields |
|---|---|---|
| `DATASET_UPLOADED` | User uploads first file | `filename`, `row_count`, `column_count` |
| `DATASET_REPLACED` | User uploads a replacement file | `previous_hash`, `new_hash`, `reason` |
| `CODEBOOK_CONFIGURED` | User assigns variable types | `variable_count`, `iv_count`, `dv_count` |
| `ANALYSIS_EXECUTED` | Python stats service returns results | `tests_run`, `n_respondents`, `duration_ms` |
| `ANALYSIS_RERUN` | User re-executes analysis | `previous_result_summary`, `delta_summary` |
| `RESULT_GENERATED` | Statistical outputs stored | `test_types`, `key_findings_summary` |
| `NARRATIVE_GENERATED` | AI returns chapter text | `model`, `input_type`, `word_count` |
| `NARRATIVE_REGENERATED` | User requests new AI generation | `model`, `previous_word_count` |
| `SPSS_SYNTAX_GENERATED` | SPSS syntax produced | `test_count`, `syntax_line_count` |
| `CLAIM_VERIFICATION_RUN` | Chapter text verified against outputs | `claims_checked`, `inconsistencies_found` |
| `INTEGRITY_REPORT_GENERATED` | Receipt assembled | `receipt_version`, `share_token` |
| `SUPERVISOR_SHARE_CREATED` | Share link generated | `share_token`, `expiry` |
| `SUPERVISOR_VIEWED` | Supervisor opens share link | `share_token` |
| `SUPERVISOR_VERIFIED` | Supervisor marks as verified | `share_token`, `comment` |
| `CORRECTION_REQUESTED` | Supervisor requests change | `share_token`, `field`, `note` |
| `CORRECTION_SUBMITTED` | Student makes correction | `correction_type`, `previous_value` |
| `SUBMISSION_LOCKED` | Analysis marked as final | `locked_by`, `lock_reason` |

### The `logResearchEvent` Service

All event logging routes through a single service that is designed to fail silently — the audit log must never break the main research workflow.

```typescript
// src/services/eventLog.ts

import { supabase } from '@/lib/supabase';

export type AnalysisEventType =
  | 'DATASET_UPLOADED'
  | 'DATASET_REPLACED'
  | 'CODEBOOK_CONFIGURED'
  | 'ANALYSIS_EXECUTED'
  | 'ANALYSIS_RERUN'
  | 'RESULT_GENERATED'
  | 'NARRATIVE_GENERATED'
  | 'NARRATIVE_REGENERATED'
  | 'SPSS_SYNTAX_GENERATED'
  | 'CLAIM_VERIFICATION_RUN'
  | 'INTEGRITY_REPORT_GENERATED'
  | 'SUPERVISOR_SHARE_CREATED'
  | 'SUPERVISOR_VIEWED'
  | 'SUPERVISOR_VERIFIED'
  | 'CORRECTION_REQUESTED'
  | 'CORRECTION_SUBMITTED'
  | 'SUBMISSION_LOCKED';

export interface LogEventParams {
  analysisId: string;
  eventType: AnalysisEventType;
  payload?: Record<string, unknown>;
  datasetHash?: string;
  pythonVersion?: string;
  libraryVersions?: Record<string, string>;
  aiModel?: string;
  aiInputsSummary?: Record<string, unknown>;
}

export async function logResearchEvent(params: LogEventParams): Promise<void> {
  try {
    const { error } = await supabase
      .from('analysis_events')
      .insert({
        analysis_id: params.analysisId,
        event_type: params.eventType,
        payload: params.payload ?? {},
        dataset_hash: params.datasetHash ?? null,
        python_version: params.pythonVersion ?? null,
        library_versions: params.libraryVersions ?? null,
        ai_model: params.aiModel ?? null,
        ai_inputs_summary: params.aiInputsSummary ?? null,
        // created_at is set by the database — never passed from the client
      });

    if (error) {
      // Silent failure: log to console but NEVER throw
      // The main research workflow must not fail because of audit logging
      console.error('[ResearchEvent] Failed to log event:', {
        eventType: params.eventType,
        analysisId: params.analysisId,
        error: error.message,
      });
    }
  } catch (err) {
    // Belt-and-suspenders catch: never propagate
    console.error('[ResearchEvent] Unexpected error:', err);
  }
}
```

### Usage Pattern

```typescript
// In analysisService.ts — after Python computation completes:
await logResearchEvent({
  analysisId,
  eventType: 'ANALYSIS_EXECUTED',
  pythonVersion: stats.meta.python_version,
  libraryVersions: stats.meta.library_versions,
  payload: {
    testsRun: stats.meta.tests_run,
    nRespondents: stats.n_total,
    durationMs: stats.meta.duration_ms,
  },
});

// After AI narrative is generated:
await logResearchEvent({
  analysisId,
  eventType: 'NARRATIVE_GENERATED',
  aiModel: selectedModel,
  aiInputsSummary: {
    inputType: 'verified_statistical_outputs',  // NEVER 'raw_dataset'
    statsJsonSize: JSON.stringify(computedStats).length,
  },
  payload: { wordCount: narrative.split(' ').length },
});
```

---

## 4. Dataset Authentication

### SHA-256 Hashing

Every dataset uploaded to WriteWise is hashed in the browser before the data is sent to the statistics service. The hash is stored in `dataset_hashes` and referenced in `analysis_events`.

```typescript
// src/services/datasetHash.ts

/**
 * Computes SHA-256 hash of a file in the browser using the Web Crypto API.
 * Called immediately when a file is selected, before any data transmission.
 */
export async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function registerDatasetHash(
  analysisId: string,
  file: File,
  hash: string,
  rowCount: number,
  columnCount: number
): Promise<void> {
  const { error } = await supabase
    .from('dataset_hashes')
    .insert({
      analysis_id: analysisId,
      sha256_hash: hash,
      filename: file.name,
      file_size_bytes: file.size,
      row_count: rowCount,
      column_count: columnCount,
    });

  if (error) {
    console.error('[DatasetHash] Failed to register hash:', error);
  }
}
```

### What the Hash Proves

Given a stored hash `6A8D3B1C...` for analysis `WW-023918`:

1. **That the analysis came from this exact file** — any bit-level change to the dataset produces a different hash
2. **That the file was not modified after upload** — the hash was computed client-side before transmission
3. **That fabricated data would be detectable** — if a student submits one dataset but claims to have used another, the hashes will not match

This is the foundation of WriteWise's dataset authentication capability.

---

## 5. GDPR Compliance Design

### The Right to Erasure Problem

GDPR Article 17 grants users the right to have their personal data deleted. An append-only event log and a deletion right are in direct conflict.

WriteWise resolves this through **pseudonymisation** — not by deleting events, but by severing the link between events and the person who created them.

### The Research Identity Pattern

```
User Account (user_id)
       │
       │  1-to-1 mapping
       ▼
Research Identity (research_identity_id)
       │
       │  referenced by all research events
       ▼
analysis_events, ai_generation_logs, etc.
```

When a user deletes their account:
1. `user_id` in `users` table is deleted (Supabase Auth cascade)
2. The `research_identities` row is deleted (ON DELETE CASCADE from `users`)
3. All `analysis_events` rows have their `research_identity_id` set to NULL (ON DELETE SET NULL)
4. The events survive. The person is gone. GDPR compliant.

### What Remains After Account Deletion

- All events remain in `analysis_events` — but `research_identity_id` is NULL
- `dataset_hashes` remain — linked to `analysis_id`, not to the person
- `research_receipts` remain — these may be relied upon by supervisors and institutions
- The provenance chain is intact, but not attributable to a named individual

This is the correct balance: institutional trust (provenance survives) and individual privacy (identity is erasable).

### Data Residency

Currently WriteWise uses Supabase's default region. For institutional adoption, data residency controls will be required. See Phase 4 roadmap.

---

## 6. Python Statistics Service

### Deployment

- **Runtime:** FastAPI on Railway
- **Current tier:** Free (cold starts of 30–60 seconds — unacceptable for production; move to paid in Phase 1)
- **Repository location:** `writewise-stats-api/`

### Supported Statistical Tests

| Test | Function | When Used |
|---|---|---|
| Frequencies & percentages | `compute_demographics()` | Nominal variables |
| Descriptive statistics | `compute_section_stats()` | Ordinal/scale variables |
| Cronbach's Alpha | `compute_reliability()` | Scale reliability per item group |
| Pearson Correlation | `compute_correlation()` | IV/DV relationship |
| Simple Linear Regression | `compute_regression()` | Predictive model |

**Planned additions (Phase 2):** ANOVA, Chi-square, Factor Analysis, Structural Equation Modelling

### Variable Type System

The codebook assigns each variable one of three types:

| Type | Meaning | Tests Applied |
|---|---|---|
| `nominal` | Category (Gender, Department) | Frequencies, percentages |
| `ordinal` | Likert scale items | Descriptives, reliability, section means |
| `scale` | Continuous measure (Age, GPA) | Descriptives, mean, SD |

Variables are also assigned roles (`IV` or `DV`) for correlation and regression.

### SPSS Syntax Generation

The Python service generates SPSS syntax that exactly reproduces its outputs. This is not approximate — the syntax uses the same parameters, the same variable lists, and the same test specifications as the Python computation.

A supervisor with SPSS can paste this syntax, run it, and receive identical results. Any discrepancy indicates the student modified something — a detectable integrity violation.

### Security Considerations

- CORS: restricted to `writewise-app.vercel.app` and `localhost:5173` only
- No raw dataset is stored on the Railway server — computation is stateless
- Input validation required before Phase 1 launch: maximum file size, maximum variable count, malformed data handling

---

## 7. AI Narrative Router

The AI router (`api/generate-narrative.ts`) is a Vercel serverless function that accepts verified statistical outputs and returns an academic narrative.

### Non-Negotiable Constraints

1. **The AI receives only `stats_json`, `codebook`, and `context`.** It never receives raw dataset rows. This is enforced at the router level.
2. **The AI model is logged** in `ai_generation_logs` for every generation.
3. **The model name is stored** in `data_analyses.ai_model_used` for display in the Integrity Report.

### Model Selection Principle

The model selector exists to serve power users. The default experience uses a single curated model (currently Claude Sonnet). The selector is accessible in the "Configure" stage of the analysis wizard but is not prominently featured in the UI.

Rationale: a stressed postgraduate student asked to choose between "Claude Sonnet" and "DeepSeek Chat" has no basis for the decision and experiences anxiety, not empowerment. The platform makes an intelligent default choice.

### Streaming Architecture

All AI generation is streamed via Server-Sent Events. The Vercel serverless function time limit (60s default, 300s on Pro) is a constraint for very long narratives. If this becomes an issue, move generation to a persistent background job rather than a serverless function.

---

## 8. Verification Pipeline (Phase 2)

The claim verification pipeline checks a student's written chapter against the verified statistical outputs stored in the analysis.

### How It Works

1. Student pastes or uploads Chapter 4 text
2. A pattern extraction layer identifies statistical claims:
   - Numerical values with statistical notation (r = 0.72, p < 0.05, α = 0.83)
   - Descriptive claims ("mean score of 3.4", "42% of respondents")
   - Significance claims ("statistically significant", "no significant relationship")
3. Each extracted claim is matched against `computed_stats` in `data_analyses`
4. Mismatches are flagged with: the claim as written, the verified value, and the difference
5. Results are stored in `verification_logs` (immutable)

### Critical Implementation Rule

**Pattern matching, not LLM extraction.**

Using an LLM to extract statistical claims from chapter text introduces hallucination into the verification layer. The extracted claim might not match what the student actually wrote. Pattern matching is deterministic — it either finds a value or it doesn't.

For numerical tolerance: values are matched within a configurable rounding tolerance (default ±0.01) to account for legitimate software rounding differences.

---

## 9. Security Architecture

### API Key Management

All AI API keys are stored as Vercel environment variables and accessed only by serverless functions. They are never exposed to the frontend.

⚠️ **Known gap:** There is currently no rate limiting on AI endpoints. A single user can exhaust the entire API budget. Rate limiting must be implemented before Phase 1 launch. Recommended: per-user token budget enforced in Supabase, checked before AI generation begins.

### Supabase Row-Level Security

All tables have RLS enabled. Users can only access their own data. Supervisor access to analyses is via share tokens, not via RLS policies — share tokens are validated by the application layer before querying the integrity tables.

### Authentication

Supabase Auth with email/password. JWT tokens with 1-hour expiry and automatic refresh.

Future: SSO via Google Workspace / Microsoft 365 (Phase 4 prerequisite).

---

## 10. Scalability Considerations

### The Append-Only Tables

`analysis_events` will grow without bound. At scale, this requires:
- Partitioning by `created_at` (PostgreSQL range partitioning)
- An archival strategy for events older than N years
- Read replicas for supervisor and institutional dashboard queries

These are not immediate concerns at current scale. They should be evaluated before reaching 100,000 analyses.

### The Python Statistics Service

The current stateless FastAPI service scales horizontally — multiple instances can run concurrently with no shared state. Railway's paid tier supports auto-scaling. This is the correct architecture for the computation layer.

### The AI Router

Vercel serverless functions scale automatically but have execution time limits. At high volume, the streaming pattern (Server-Sent Events through a serverless function) may require migration to a persistent compute layer (Railway or similar).

---

## 11. Known Technical Debt

| Item | Description | Priority |
|---|---|---|
| **Tailwind dynamic classes** | `bg-${color}-100` strings are purged by the CSS compiler. Safelist these classes or replace with style objects. Feature icons are invisible in production. | 🔴 Fix immediately |
| **No test suite** | Zero tests written. The statistics engine, event logging, and hash computation are all untested. | 🔴 Before Phase 1 |
| **No rate limiting** | AI API endpoints have no per-user request limits. Single point of budget exhaustion. | 🔴 Before Phase 1 |
| **Railway free tier** | 30–60 second cold starts on the Python service. Unacceptable for a user-facing research workflow. | 🟠 Phase 1 |
| **No error monitoring** | No Sentry, no Vercel Analytics, no alerting. Failures are invisible. | 🟠 Phase 1 |
| **`--legacy-peer-deps`** | `next-themes` peer conflict with React 19. Upstream fix expected when next-themes releases React 19 support. | 🟡 Monitor |
| **No circuit breaker on Python service** | If the stats API is down, the entire analysis workflow fails with a generic error toast. Needs retry logic and a user-facing fallback message. | 🟠 Phase 1 |
| **Missing `package.json` name** | `"name": "vite_react_shadcn_ts"` — still using the scaffolding template name. | 🟢 Low |
| **No migration versioning** | Supabase migrations are not tracked in source control. Any schema change requires manual coordination. | 🟠 Phase 1 |

---

## Architectural Decision Log

| Decision | Rationale | Alternatives Rejected |
|---|---|---|
| Python for statistics, not LLM | Deterministic accuracy; LLMs hallucinate numbers | LLM-only computation |
| Append-only event tables | Provenance cannot be retrofitted; trust requires immutable history | Mutable records with change history column |
| SHA-256 client-side | Hash computed before transmission; proves the original file was used | Server-side hashing (can't prove pre-transmission state) |
| Pseudonymisation for GDPR | Preserves provenance chain after account deletion | Cascading deletes (destroys institutional records) |
| Supervisor accounts free permanently | Supervisors are distribution channel, not buyers | Charging supervisors (kills adoption) |
| Single default AI model | Reduces cognitive load for academic users | Always showing model selector |
| Separate `research_identities` table | Clean separation of personal identity from research records | Storing user_id directly in event tables |
