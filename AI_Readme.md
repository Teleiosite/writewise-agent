# WriteWise Agent
## AI Data Analysis Feature — Complete Design & Implementation Document

**Version:** 1.0  
**Author:** Abomide Oluwaseye (Teleiosite)  
**Repository:** https://github.com/Teleiosite/writewise-agent  
**Live App:** https://writewise-app.vercel.app  

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Core Design Philosophy](#2-core-design-philosophy)
3. [System Architecture](#3-system-architecture)
4. [Multi-AI Model Layer](#4-multi-ai-model-layer)
5. [Data Models & Database Schema](#5-data-models--database-schema)
6. [Python Microservice (Statistics Engine)](#6-python-microservice-statistics-engine)
7. [Frontend Components](#7-frontend-components)
8. [API Endpoints](#8-api-endpoints)
9. [User Intake Flow (Smart Excel Upload)](#9-user-intake-flow-smart-excel-upload)
10. [AI Prompt Architecture](#10-ai-prompt-architecture)
11. [File & Folder Structure](#11-file--folder-structure)
12. [Implementation Steps](#12-implementation-steps)
13. [Environment Variables](#13-environment-variables)
14. [Deployment](#14-deployment)

---

## 1. Feature Overview

The AI Data Analysis feature allows researchers and students to upload a raw dataset (Excel, CSV, or SPSS .sav), optionally provide a codebook and research context, and receive:

- Fully computed statistical tables (frequencies, descriptives, correlation, reliability, regression)
- A complete academic narrative (Chapter 4 and Chapter 5 style) written by an AI model of the user's choice
- Reproducible SPSS syntax matching the analysis
- A downloadable DOCX/PDF report

The feature integrates into the existing WriteWise editor so that generated chapters appear directly in the user's active document.

---

## 2. Core Design Philosophy

### Separation of Concerns — The Golden Rule

> **Python computes. AI writes. Never mix the two.**

| Responsibility | Tool | Reason |
|---|---|---|
| Statistical computation | Python (Pandas + SciPy) | 100% accurate, reproducible, verifiable |
| Academic narrative | AI model (user's choice) | Natural language, context-aware interpretation |
| Data storage | Supabase (PostgreSQL) | Persistent, secure, user-scoped |
| File parsing | SheetJS (frontend) | Client-side, fast, no server upload needed for small files |
| Report assembly | Vercel serverless function | Merges stats JSON + AI narrative into final output |

### Why Not Let AI Do the Statistics?

AI models can hallucinate numbers, round inconsistently, and produce figures that do not match the actual dataset. A student submitting an AI-generated mean of 3.22 when the real mean is 3.07 to a supervisor would face serious academic consequences. Python with Pandas computes with the same precision as SPSS — the numbers are always correct because they are calculated, not generated.

---

## 3. System Architecture

```
User (Browser)
     │
     │  Upload Excel/CSV
     ▼
WriteWise Frontend (React + TypeScript on Vercel)
     │
     ├──────────────────────────────────┐
     │  POST /api/analyse               │  POST /api/generate-narrative
     │  { dataset, codebook, context }  │  { stats_json, context, model }
     ▼                                  ▼
Python Microservice               AI Router (Vercel Serverless)
(FastAPI on Railway/Render)            │
Pandas + SciPy                    ┌────┴────┬──────────┬───────────┬──────────┐
     │                            │         │          │           │          │
     │  Returns stats_json    Claude    Gemini     GPT-4o      Grok    DeepSeek
     │                            │
     └──────────────┬─────────────┘
                    │
                    ▼
           Report Assembler
     (stats tables + narrative + syntax)
                    │
                    ▼
        Supabase (save analysis)
                    │
                    ▼
      WriteWise Editor (inject into document)
      + DOCX/PDF Export
```

---

## 4. Multi-AI Model Layer

The feature is model-agnostic. Users select their preferred AI model from a dropdown. All models receive the same structured prompt containing the computed statistics and research context. The router selects the correct API endpoint based on user selection.

### Supported Models

| Model | Provider | API Endpoint | Best For |
|---|---|---|---|
| Claude Sonnet | Anthropic | `/v1/messages` | Nuanced academic prose, long-form narrative |
| Gemini 1.5 Pro | Google | `/v1beta/models/gemini-1.5-pro` | Fast generation, strong reasoning |
| GPT-4o | OpenAI | `/v1/chat/completions` | Widely trusted, strong academic writing |
| Grok | xAI | `/v1/chat/completions` (compatible) | Alternative perspective |
| DeepSeek | DeepSeek | `/v1/chat/completions` (compatible) | Cost-effective, strong multilingual |

### AI Router — Vercel Serverless Function

**File:** `api/generate-narrative.ts`

```typescript
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const { stats_json, context, model, codebook } = req.body;

  const systemPrompt = buildSystemPrompt(context, codebook);
  const userPrompt = buildUserPrompt(stats_json);

  switch (model) {
    case "claude":
      return handleClaude(systemPrompt, userPrompt, res);
    case "gemini":
      return handleGemini(systemPrompt, userPrompt, res);
    case "gpt4o":
      return handleGPT4o(systemPrompt, userPrompt, res);
    case "grok":
      return handleGrok(systemPrompt, userPrompt, res);
    case "deepseek":
      return handleDeepSeek(systemPrompt, userPrompt, res);
    default:
      return handleClaude(systemPrompt, userPrompt, res);
  }
}

async function handleClaude(system, user, res) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const stream = await client.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    system,
    messages: [{ role: "user", content: user }],
  });
  res.setHeader("Content-Type", "text/event-stream");
  for await (const chunk of stream) {
    if (chunk.type === "content_block_delta") {
      res.write(`data: ${chunk.delta.text}\n\n`);
    }
  }
  res.end();
}

async function handleGPT4o(system, user, res) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const stream = await client.chat.completions.create({
    model: "gpt-4o",
    stream: true,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  res.setHeader("Content-Type", "text/event-stream");
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || "";
    if (text) res.write(`data: ${text}\n\n`);
  }
  res.end();
}

async function handleGemini(system, user, res) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  const result = await model.generateContentStream(system + "\n\n" + user);
  res.setHeader("Content-Type", "text/event-stream");
  for await (const chunk of result.stream) {
    res.write(`data: ${chunk.text()}\n\n`);
  }
  res.end();
}

// Grok and DeepSeek use OpenAI-compatible SDK with custom baseURL
async function handleGrok(system, user, res) {
  const client = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: "https://api.x.ai/v1",
  });
  const stream = await client.chat.completions.create({
    model: "grok-2-latest",
    stream: true,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  res.setHeader("Content-Type", "text/event-stream");
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || "";
    if (text) res.write(`data: ${text}\n\n`);
  }
  res.end();
}

async function handleDeepSeek(system, user, res) {
  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  });
  const stream = await client.chat.completions.create({
    model: "deepseek-chat",
    stream: true,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  res.setHeader("Content-Type", "text/event-stream");
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content || "";
    if (text) res.write(`data: ${text}\n\n`);
  }
  res.end();
}
```

---

## 5. Data Models & Database Schema

### New Supabase Tables

Run these SQL migrations in your Supabase SQL editor:

```sql
-- Analysis sessions
CREATE TABLE data_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  -- Input
  raw_filename VARCHAR(255),
  codebook JSONB,
  research_context JSONB,
  -- Computed
  computed_stats JSONB,
  -- Generated
  generated_tables TEXT,
  generated_narrative TEXT,
  generated_syntax TEXT,
  ai_model_used VARCHAR(100),
  -- Meta
  n_respondents INTEGER,
  n_variables INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row-level security
ALTER TABLE data_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own analyses" ON data_analyses
  FOR ALL USING (auth.uid() = user_id);

-- Index for fast project-level lookups
CREATE INDEX idx_data_analyses_project ON data_analyses(project_id);
CREATE INDEX idx_data_analyses_user ON data_analyses(user_id);
```

### TypeScript Types

**File:** `src/types/analysis.types.ts`

```typescript
export interface CodebookVariable {
  column: string;           // Raw column name from dataset
  label: string;            // Human-readable label
  type: "nominal" | "ordinal" | "scale";
  values: Record<string, string> | null; // e.g. { "1": "Male", "2": "Female" }
  missing_code: number | null;
}

export interface ResearchContext {
  title: string;
  objectives: string[];
  research_questions: string[];
  hypothesis: string | null;
  theoretical_framework: string | null;
  institution: string | null;
}

export interface DescriptiveStats {
  variable: string;
  label: string;
  n: number;
  mean: number;
  std_dev: number;
  min: number;
  max: number;
  frequencies: Record<string, number>;
  percentages: Record<string, number>;
}

export interface ComputedStats {
  n_total: number;
  n_valid: number;
  response_rate: number;
  demographics: DescriptiveStats[];
  section_stats: Record<string, SectionStats>;
  correlation: CorrelationResult | null;
  reliability: ReliabilityResult[];
  regression: RegressionResult | null;
}

export interface SectionStats {
  section_name: string;
  variables: DescriptiveStats[];
  section_mean: number;
  section_std: number;
}

export interface CorrelationResult {
  r: number;
  p_value: number;
  n: number;
  iv_label: string;
  dv_label: string;
  significant: boolean;
}

export interface ReliabilityResult {
  scale_name: string;
  variables: string[];
  cronbach_alpha: number;
  n_items: number;
}

export interface RegressionResult {
  r_squared: number;
  f_statistic: number;
  p_value: number;
  beta: number;
  significant: boolean;
}

export interface DataAnalysis {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  status: "pending" | "computing" | "generating" | "complete" | "error";
  raw_filename: string;
  codebook: CodebookVariable[];
  research_context: ResearchContext;
  computed_stats: ComputedStats;
  generated_tables: string;
  generated_narrative: string;
  generated_syntax: string;
  ai_model_used: string;
  n_respondents: number;
  n_variables: number;
  created_at: string;
}
```

---

## 6. Python Microservice (Statistics Engine)

Deploy this as a standalone FastAPI service on Railway or Render (free tier is sufficient).

### Setup

```bash
mkdir writewise-stats-api
cd writewise-stats-api
pip install fastapi uvicorn pandas scipy numpy openpyxl python-multipart
```

### Main Application

**File:** `main.py`

```python
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
from scipy import stats
from scipy.stats import pearsonr
import json
import io

app = FastAPI(title="WriteWise Statistics Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://writewise-app.vercel.app", "http://localhost:5173"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

@app.post("/analyse")
async def analyse(payload: dict):
    data = payload["data"]          # List of row dicts
    codebook = payload["codebook"]  # List of CodebookVariable
    context = payload.get("context", {})
    
    df = pd.DataFrame(data)
    
    # Apply missing value codes
    for var in codebook:
        col = var["column"]
        if col in df.columns and var.get("missing_code"):
            df[col] = df[col].replace(var["missing_code"], np.nan)
    
    n_total = len(df)
    n_valid = int(df.dropna().shape[0])
    
    # Separate variable groups
    nominal_vars = [v["column"] for v in codebook if v["type"] == "nominal"]
    ordinal_vars = [v["column"] for v in codebook if v["type"] == "ordinal"]
    scale_vars   = [v["column"] for v in codebook if v["type"] == "scale"]
    
    result = {
        "n_total": n_total,
        "n_valid": n_valid,
        "response_rate": round((n_valid / n_total) * 100, 1),
        "demographics": compute_demographics(df, codebook, nominal_vars + scale_vars),
        "section_stats": compute_section_stats(df, codebook, ordinal_vars),
        "correlation": None,
        "reliability": compute_reliability(df, codebook, ordinal_vars),
        "regression": None,
    }
    
    # Correlation if IV and DV sections are identifiable
    iv_cols = [v["column"] for v in codebook if v.get("role") == "IV"]
    dv_cols = [v["column"] for v in codebook if v.get("role") == "DV"]
    if iv_cols and dv_cols:
        result["correlation"] = compute_correlation(df, iv_cols, dv_cols, codebook)
        result["regression"]  = compute_regression(df, iv_cols, dv_cols)
    
    return JSONResponse(content=result)


def compute_demographics(df, codebook, cols):
    out = []
    cb_map = {v["column"]: v for v in codebook}
    for col in cols:
        if col not in df.columns:
            continue
        var = cb_map.get(col, {})
        series = df[col].dropna()
        freq = series.value_counts().to_dict()
        pct  = (series.value_counts(normalize=True) * 100).round(1).to_dict()
        out.append({
            "variable": col,
            "label": var.get("label", col),
            "type": var.get("type", "scale"),
            "n": int(series.count()),
            "mean": round(float(series.mean()), 2) if var.get("type") == "scale" else None,
            "std_dev": round(float(series.std()), 3) if var.get("type") == "scale" else None,
            "min": float(series.min()),
            "max": float(series.max()),
            "frequencies": {str(k): int(v) for k, v in freq.items()},
            "percentages": {str(k): float(v) for k, v in pct.items()},
            "value_labels": var.get("values", {}),
        })
    return out


def compute_section_stats(df, codebook, ordinal_cols):
    # Group ordinal variables by prefix (e.g. UTIL_1-7, STRAT_1-16)
    prefixes = {}
    for col in ordinal_cols:
        if col not in df.columns:
            continue
        prefix = "_".join(col.split("_")[:-1]) if "_" in col else col
        prefixes.setdefault(prefix, []).append(col)
    
    cb_map = {v["column"]: v for v in codebook}
    sections = {}
    for prefix, cols in prefixes.items():
        section_label = cb_map.get(cols[0], {}).get("section_label", prefix)
        items = []
        for col in cols:
            series = df[col].dropna()
            freq = series.value_counts().sort_index().to_dict()
            pct  = (series.value_counts(normalize=True, sort=False).sort_index() * 100).round(1).to_dict()
            items.append({
                "variable": col,
                "label": cb_map.get(col, {}).get("label", col),
                "n": int(series.count()),
                "mean": round(float(series.mean()), 2),
                "std_dev": round(float(series.std()), 3),
                "frequencies": {str(k): int(v) for k, v in freq.items()},
                "percentages": {str(k): float(v) for k, v in pct.items()},
            })
        all_vals = df[cols].values.flatten()
        all_vals = all_vals[~np.isnan(all_vals.astype(float))]
        sections[prefix] = {
            "section_name": section_label,
            "variables": items,
            "section_mean": round(float(np.mean(all_vals)), 2),
            "section_std": round(float(np.std(all_vals)), 3),
        }
    return sections


def compute_reliability(df, codebook, ordinal_cols):
    # Group by prefix and compute Cronbach's Alpha per group
    prefixes = {}
    for col in ordinal_cols:
        if col not in df.columns:
            continue
        prefix = "_".join(col.split("_")[:-1]) if "_" in col else col
        prefixes.setdefault(prefix, []).append(col)
    
    results = []
    for prefix, cols in prefixes.items():
        sub = df[cols].dropna()
        if sub.shape[1] < 2:
            continue
        alpha = cronbach_alpha(sub)
        results.append({
            "scale_name": prefix,
            "variables": cols,
            "n_items": len(cols),
            "cronbach_alpha": round(alpha, 3),
        })
    return results


def cronbach_alpha(df_sub):
    k = df_sub.shape[1]
    item_vars = df_sub.var(axis=0, ddof=1).sum()
    total_var = df_sub.sum(axis=1).var(ddof=1)
    return (k / (k - 1)) * (1 - item_vars / total_var)


def compute_correlation(df, iv_cols, dv_cols, codebook):
    iv_composite = df[iv_cols].mean(axis=1)
    dv_composite = df[dv_cols].mean(axis=1)
    valid = pd.concat([iv_composite, dv_composite], axis=1).dropna()
    r, p = pearsonr(valid.iloc[:, 0], valid.iloc[:, 1])
    return {
        "r": round(float(r), 3),
        "p_value": round(float(p), 4),
        "n": int(valid.shape[0]),
        "significant": bool(p < 0.05),
        "iv_label": "Social Media & Marketing Strategies",
        "dv_label": "Entrepreneurship Success",
    }


def compute_regression(df, iv_cols, dv_cols):
    iv = df[iv_cols].mean(axis=1)
    dv = df[dv_cols].mean(axis=1)
    valid = pd.concat([iv, dv], axis=1).dropna()
    slope, intercept, r, p, se = stats.linregress(valid.iloc[:, 0], valid.iloc[:, 1])
    return {
        "r_squared": round(float(r**2), 3),
        "beta": round(float(slope), 3),
        "p_value": round(float(p), 4),
        "significant": bool(p < 0.05),
    }
```

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Set environment variable `PORT=8000`. Railway gives you a public URL like `https://writewise-stats.railway.app`.

---

## 7. Frontend Components

### New Files to Create

```
src/
├── pages/
│   └── DataAnalysis.tsx          # Main analysis page
├── components/
│   └── analysis/
│       ├── FileUploader.tsx       # Drag-and-drop Excel/CSV upload
│       ├── CodebookEditor.tsx     # Editable codebook table
│       ├── ContextForm.tsx        # Research questions, objectives
│       ├── ModelSelector.tsx      # AI model dropdown
│       ├── StatisticsPanel.tsx    # Computed stats display
│       ├── NarrativeStream.tsx    # Streaming AI narrative
│       └── SyntaxPanel.tsx        # SPSS syntax output
├── services/
│   └── analysisService.ts         # API calls to stats + AI
├── hooks/
│   └── useAnalysis.ts             # Analysis state management
└── types/
    └── analysis.types.ts          # All TS types (see Section 5)
```

### FileUploader Component

**File:** `src/components/analysis/FileUploader.tsx`

```tsx
import { useState, useCallback } from "react";
import * as XLSX from "xlsx";

interface Props {
  onDataParsed: (data: Record<string, unknown>[], headers: string[]) => void;
}

export function FileUploader({ onDataParsed }: Props) {
  const [dragging, setDragging] = useState(false);
  const [filename, setFilename] = useState<string | null>(null);

  const parseFile = useCallback((file: File) => {
    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
      const headers = Object.keys(json[0] || {});
      onDataParsed(json, headers);
    };
    reader.readAsArrayBuffer(file);
  }, [onDataParsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  }, [parseFile]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      style={{
        border: `1.5px dashed var(--color-border-${dragging ? "primary" : "secondary"})`,
        borderRadius: "var(--border-radius-lg)",
        padding: "2.5rem",
        textAlign: "center",
        background: dragging ? "var(--color-background-info)" : "var(--color-background-secondary)",
        transition: "all 0.2s",
        cursor: "pointer",
      }}
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <input
        id="file-input"
        type="file"
        accept=".xlsx,.xls,.csv,.sav"
        style={{ display: "none" }}
        onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])}
      />
      {filename ? (
        <p style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>{filename}</p>
      ) : (
        <>
          <p style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>
            Drop your dataset here
          </p>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 13, marginTop: 4 }}>
            Excel (.xlsx), CSV, or SPSS (.sav)
          </p>
        </>
      )}
    </div>
  );
}
```

### ModelSelector Component

**File:** `src/components/analysis/ModelSelector.tsx`

```tsx
const MODELS = [
  { id: "claude",   label: "Claude Sonnet",  provider: "Anthropic" },
  { id: "gpt4o",    label: "GPT-4o",          provider: "OpenAI" },
  { id: "gemini",   label: "Gemini 1.5 Pro",  provider: "Google" },
  { id: "grok",     label: "Grok 2",          provider: "xAI" },
  { id: "deepseek", label: "DeepSeek Chat",   provider: "DeepSeek" },
];

interface Props {
  value: string;
  onChange: (model: string) => void;
}

export function ModelSelector({ value, onChange }: Props) {
  return (
    <div>
      <label style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
        AI model for narrative generation
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        {MODELS.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--border-radius-md)",
              border: `${value === m.id ? "1.5px" : "0.5px"} solid var(--color-border-${value === m.id ? "info" : "secondary"})`,
              background: value === m.id ? "var(--color-background-info)" : "transparent",
              color: value === m.id ? "var(--color-text-info)" : "var(--color-text-secondary)",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: value === m.id ? 500 : 400,
            }}
          >
            {m.label}
            <span style={{ fontSize: 11, marginLeft: 4, opacity: 0.7 }}>
              {m.provider}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Analysis Service

**File:** `src/services/analysisService.ts`

```typescript
import { ComputedStats, CodebookVariable, ResearchContext } from "../types/analysis.types";

const STATS_API = import.meta.env.VITE_STATS_API_URL;

export async function computeStatistics(
  data: Record<string, unknown>[],
  codebook: CodebookVariable[],
  context: ResearchContext
): Promise<ComputedStats> {
  const res = await fetch(`${STATS_API}/analyse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, codebook, context }),
  });
  if (!res.ok) throw new Error("Statistics computation failed");
  return res.json();
}

export async function generateNarrative(
  stats: ComputedStats,
  codebook: CodebookVariable[],
  context: ResearchContext,
  model: string,
  onChunk: (text: string) => void
): Promise<void> {
  const res = await fetch("/api/generate-narrative", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stats_json: stats, codebook, context, model }),
  });
  
  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        onChunk(line.slice(6));
      }
    }
  }
}

export async function detectCodebookFromHeaders(
  headers: string[],
  sampleRows: Record<string, unknown>[]
): Promise<CodebookVariable[]> {
  const res = await fetch("/api/detect-codebook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ headers, sample: sampleRows.slice(0, 5) }),
  });
  return res.json();
}
```

---

## 8. API Endpoints

### Vercel Serverless Functions (in `/api` folder)

| File | Method | Purpose |
|---|---|---|
| `api/generate-narrative.ts` | POST | Route to selected AI model, stream narrative |
| `api/detect-codebook.ts` | POST | AI auto-detects variable types from headers |
| `api/generate-syntax.ts` | POST | Generate SPSS syntax from codebook + stats |
| `api/export-report.ts` | POST | Assemble DOCX report from all outputs |

### Python Microservice Endpoints

| Endpoint | Method | Input | Output |
|---|---|---|---|
| `/analyse` | POST | `{ data, codebook, context }` | `ComputedStats` JSON |
| `/health` | GET | — | `{ status: "ok" }` |

---

## 9. User Intake Flow (Smart Excel Upload)

This covers the case where the user has **only an Excel file** and no codebook.

### Step 1 — File Upload
User drops an Excel file. SheetJS parses it client-side into a JSON array. No server upload required for files under 10MB.

### Step 2 — AI Header Detection
The column headers and first 5 rows are sent to `/api/detect-codebook`. The AI returns a proposed codebook.

**File:** `api/detect-codebook.ts`

```typescript
export default async function handler(req, res) {
  const { headers, sample } = req.body;

  const prompt = `You are a research data analyst.

Here are the column headers and first 5 rows of a dataset:

HEADERS: ${headers.join(", ")}

SAMPLE DATA:
${JSON.stringify(sample, null, 2)}

For each column return a JSON array. Each object must have:
- column: exact column name
- label: readable label (e.g. "Gender of Respondent")
- type: "nominal" | "ordinal" | "scale"
- values: object mapping numeric codes to labels if categorical, null if continuous
- missing_code: most likely missing value (e.g. 99 or 999), null if none
- section_label: group name if multiple columns share a prefix (e.g. "Social Media Utilisation")

Return ONLY a valid JSON array. No explanation. No markdown.`;

  // Use Claude by default for codebook detection
  const Anthropic = require("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].text;
  const json = JSON.parse(text.replace(/```json|```/g, "").trim());
  res.json(json);
}
```

### Step 3 — Codebook Review UI
The `CodebookEditor` component renders the AI-proposed codebook as an editable table. Users confirm, rename, or correct any field.

### Step 4 — Optional Research Context
A simple form asks for the research topic, objectives, and research questions. Users can skip this and the AI will still generate a valid but more generic narrative.

### Step 5 — Model Selection & Run
User selects their preferred AI model and clicks Run Analysis. The app calls the Python microservice for statistics, then streams the AI narrative into the editor.

---

## 10. AI Prompt Architecture

### System Prompt (injected for all models)

```typescript
function buildSystemPrompt(context: ResearchContext, codebook: CodebookVariable[]): string {
  return `You are an expert academic research writer specialising in quantitative social science research. 

Your task is to write a complete Chapter 4 (Data Analysis, Presentation and Discussion of Findings) and Chapter 5 (Summary, Conclusion, and Recommendations) for a research project.

WRITING RULES:
- Write in formal academic prose. No bullet points in narrative sections.
- Each research question must have its own dedicated table and interpretation paragraph.
- Tables must be referenced by number (Table 4.1, Table 4.2, etc.)
- Every finding must be interpreted using mean score decision rules.
- Discussion must cite the theoretical framework and at least 3 empirical studies per section.
- Chapter 5 must restate each objective, summarise findings, draw conclusions, and give numbered recommendations.
- Never invent statistics. Use only the numbers provided in the computed stats JSON.

RESEARCH CONTEXT:
Title: ${context.title || "Not provided"}
Institution: ${context.institution || "Not provided"}
Objectives: ${context.objectives?.join("; ") || "Not provided"}
Research Questions: ${context.research_questions?.join("; ") || "Not provided"}
Hypothesis: ${context.hypothesis || "Not provided"}
Theoretical Framework: ${context.theoretical_framework || "Not provided"}

CODEBOOK SUMMARY:
${codebook.map(v => `${v.column}: ${v.label} (${v.type})`).join("\n")}`;
}
```

### User Prompt (contains all computed statistics)

```typescript
function buildUserPrompt(stats: ComputedStats): string {
  return `Here are the fully computed statistics from the dataset. 
Use ONLY these numbers. Do not calculate or estimate any values yourself.

RESPONSE RATE:
Total distributed: ${stats.n_total}
Valid responses: ${stats.n_valid}
Response rate: ${stats.response_rate}%

DEMOGRAPHIC FREQUENCIES:
${JSON.stringify(stats.demographics, null, 2)}

SECTION DESCRIPTIVES:
${JSON.stringify(stats.section_stats, null, 2)}

CORRELATION RESULT:
${JSON.stringify(stats.correlation, null, 2)}

RELIABILITY (CRONBACH'S ALPHA):
${JSON.stringify(stats.reliability, null, 2)}

REGRESSION:
${JSON.stringify(stats.regression, null, 2)}

Now write the complete Chapter 4 and Chapter 5 following all academic writing rules in your system instructions. 
Format tables using markdown. Write all narrative in flowing academic prose.`;
}
```

---

## 11. File & Folder Structure

The complete updated structure after adding this feature:

```
writewise-agent/
├── api/                              # Vercel serverless functions
│   ├── generate-narrative.ts         # Multi-model AI router
│   ├── detect-codebook.ts            # AI header detection
│   ├── generate-syntax.ts            # SPSS syntax generation
│   └── export-report.ts              # DOCX/PDF assembler
│
├── writewise-stats-api/              # Python microservice (separate repo/service)
│   ├── main.py                       # FastAPI + Pandas + SciPy
│   ├── requirements.txt
│   └── Procfile                      # For Railway deployment
│
├── src/
│   ├── components/
│   │   ├── analysis/                 # NEW
│   │   │   ├── FileUploader.tsx
│   │   │   ├── CodebookEditor.tsx
│   │   │   ├── ContextForm.tsx
│   │   │   ├── ModelSelector.tsx
│   │   │   ├── StatisticsPanel.tsx
│   │   │   ├── NarrativeStream.tsx
│   │   │   └── SyntaxPanel.tsx
│   │   ├── dashboard/
│   │   ├── editor/
│   │   └── ui/
│   │
│   ├── pages/
│   │   ├── DataAnalysis.tsx          # NEW — main analysis page
│   │   ├── Dashboard.tsx
│   │   ├── Editor.tsx
│   │   └── [existing pages]
│   │
│   ├── services/
│   │   ├── analysisService.ts        # NEW
│   │   ├── projectService.ts
│   │   └── documentService.ts
│   │
│   ├── hooks/
│   │   ├── useAnalysis.ts            # NEW
│   │   └── [existing hooks]
│   │
│   └── types/
│       ├── analysis.types.ts         # NEW
│       └── [existing types]
│
├── .env                              # Environment variables
├── package.json
└── vite.config.ts
```

---

## 12. Implementation Steps

Follow these steps in order. Each step is independently testable before moving to the next.

### Step 1 — Database Migration
Run the SQL in Section 5 in your Supabase SQL editor. Verify the `data_analyses` table appears in the Table Editor.

### Step 2 — TypeScript Types
Create `src/types/analysis.types.ts` with all types from Section 5. This will cause TypeScript errors everywhere until the components are built — that is expected.

### Step 3 — Python Microservice
Create the `writewise-stats-api` folder, copy `main.py` from Section 6, create `requirements.txt`:
```
fastapi
uvicorn
pandas
scipy
numpy
openpyxl
python-multipart
```
Test locally: `uvicorn main:app --reload`. Test with Postman on `POST http://localhost:8000/analyse`. Deploy to Railway.

### Step 4 — Vercel Serverless Functions
Create the four files in `/api`. Install dependencies:
```bash
npm install @anthropic-ai/sdk openai @google/generative-ai
```
Test `/api/detect-codebook` first — it is the simplest and validates your AI API keys.

### Step 5 — Analysis Service
Create `src/services/analysisService.ts` from Section 7. Add `VITE_STATS_API_URL` to your `.env` file pointing to your Railway deployment.

### Step 6 — FileUploader Component
Install SheetJS if not already present: `npm install xlsx`. Build and test the FileUploader in isolation — it should parse an Excel file and log the headers and rows to console.

### Step 7 — CodebookEditor Component
Build the editable table. Populate it initially from the AI detection result. Each row should be fully editable inline.

### Step 8 — ModelSelector + ContextForm
Simple UI components. Wire ModelSelector to a state variable and ContextForm to the research context state.

### Step 9 — StatisticsPanel
Receives `ComputedStats` JSON and renders it as readable tables. Start with just showing means and standard deviations in a simple HTML table — polish later.

### Step 10 — NarrativeStream
Receives streaming text chunks from `/api/generate-narrative` and appends them to a textarea or rich text display. Test streaming before wiring to the editor.

### Step 11 — DataAnalysis Page
Assemble all components in `src/pages/DataAnalysis.tsx`. The page has four stages: Upload → Review Codebook → Configure → Results.

### Step 12 — Router Integration
Add the new route in `App.tsx`:
```tsx
<Route path="/analysis" element={<DataAnalysis />} />
```
Add a link to DataAnalysis in the navigation header.

### Step 13 — Supabase Save
After analysis is complete, save the result to the `data_analyses` table using the Supabase client. Allow users to retrieve and view past analyses from their project.

### Step 14 — Editor Injection
Add a button "Insert into Document" that appends the generated narrative to the active TipTap editor document.

### Step 15 — Export
Implement `api/export-report.ts` using `docx` npm package to assemble the tables and narrative into a downloadable DOCX file.

---

## 13. Environment Variables

Add all of these to your `.env` file and to Vercel project settings:

```env
# Existing
VITE_SUPABASE_URL=your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# New — Statistics microservice
VITE_STATS_API_URL=https://your-app.railway.app

# New — AI model API keys (server-side only, no VITE_ prefix)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AI...
GROK_API_KEY=xai-...
DEEPSEEK_API_KEY=sk-...
```

---

## 14. Deployment

### Frontend (Vercel — existing)
No changes needed. Push to main branch and Vercel auto-deploys. Ensure all new environment variables are added in Vercel Dashboard → Settings → Environment Variables.

### Python Microservice (Railway)

```bash
cd writewise-stats-api

# Create Procfile
echo "web: uvicorn main:app --host 0.0.0.0 --port $PORT" > Procfile

# Deploy
railway login
railway init
railway up
```

After deployment, copy the Railway public URL and set it as `VITE_STATS_API_URL` in both your local `.env` and Vercel environment variables.

### CORS
Update the `allow_origins` list in `main.py` to include your production Vercel URL before deploying the Python service.

---

## Quick Reference — Key Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| Who computes statistics | Python/Pandas | Accuracy — AI must never calculate |
| Who writes narrative | Selected AI model | Natural language is AI's strength |
| File parsing | Client-side (SheetJS) | No server upload for small datasets |
| AI model routing | Vercel serverless | Single codebase, all models |
| Streaming | Server-Sent Events | Real-time narrative generation feels fast |
| Database | Supabase (existing) | No new infrastructure needed |
| Microservice hosting | Railway free tier | Zero cost, sufficient for research scale |
| SPSS syntax | AI-generated | Template-based, accurate when stats are pre-computed |

---

*Document generated for WriteWise Agent v1.0 — AI Data Analysis Feature*  
*Abomide Oluwaseye · abosey23@gmail.com · github.com/Teleiosite*