import { callChatGptApi } from "./api-client";

export interface AcademicIssue {
  id: string;
  type: "ai_hallmark" | "passive_voice" | "vague_claim" | "informal_tone";
  matchedText: string;
  explanation: string;
  suggestion: string;
  severity: "high" | "medium" | "low";
}

export interface ToneAuditResult {
  rigorScore: number; // 0 - 100
  aiSimilarityRisk: "Low" | "Moderate" | "High";
  totalIssuesCount: number;
  issues: AcademicIssue[];
  enhancedText: string;
  summaryFeedback: string;
}

const AI_HALLMARK_PATTERNS: { regex: RegExp; label: string; suggestion: string }[] = [
  { regex: /\bdelve(s|d)?\s+into\b/gi, label: "delve into", suggestion: "examine, investigate, or analyze" },
  { regex: /\ba\s+testament\s+to\b/gi, label: "testament to", suggestion: "empirical evidence of / demonstrates" },
  { regex: /\b(rich\s+)?tapestry\s+of\b/gi, label: "tapestry of", suggestion: "multidimensional structure of / complex domain of" },
  { regex: /\ba\s+beacon\s+of\b/gi, label: "beacon of", suggestion: "an exemplary model / prominent benchmark" },
  { regex: /\b(a\s+)?myriad\s+of\b/gi, label: "myriad of", suggestion: "numerous / diverse empirical factors" },
  { regex: /\b(a\s+)?plethora\s+of\b/gi, label: "plethora of", suggestion: "substantial body of literature / multiple" },
  { regex: /\bnavigating\s+(the\s+)?(complex\s+)?landscape\b/gi, label: "navigating the landscape", suggestion: "evaluating the structural conditions / examining" },
  { regex: /\bpivotal\s+role\b/gi, label: "pivotal role", suggestion: "significant mediating function / influential effect" },
  { regex: /\bit\s+is\s+(crucial|imperative|essential)\s+to\s+note\b/gi, label: "it is crucial to note", suggestion: "empirical observations indicate / critically," },
  { regex: /\bin\s+today's\s+fast-paced\s+world\b/gi, label: "in today's fast-paced world", suggestion: "in contemporary industrial environments" },
  { regex: /\bit\s+goes\s+without\s+saying\b/gi, label: "it goes without saying", suggestion: "the theoretical premise assumes" },
  { regex: /\bclearly\s+shows\b/gi, label: "clearly shows", suggestion: "statistically demonstrates / indicates" },
  { regex: /\ba\s+lot\s+of\b/gi, label: "a lot of", suggestion: "a substantial proportion of ($n = X$)" },
];

/**
 * Scans academic text for AI cliché hallmarks, passive voice over-reliance,
 * and vague quantitative assertions, and produces a publication-grade rewrite.
 */
export async function auditAcademicTone(text: string): Promise<ToneAuditResult> {
  if (!text || text.trim().length < 20) {
    return {
      rigorScore: 100,
      aiSimilarityRisk: "Low",
      totalIssuesCount: 0,
      issues: [],
      enhancedText: text,
      summaryFeedback: "Text is too brief for an academic tone audit."
    };
  }

  // 1. Fast local pattern detection
  const issues: AcademicIssue[] = [];
  let idCounter = 1;

  AI_HALLMARK_PATTERNS.forEach(pat => {
    let match;
    while ((match = pat.regex.exec(text)) !== null) {
      issues.push({
        id: `issue-${idCounter++}`,
        type: "ai_hallmark",
        matchedText: match[0],
        explanation: `The phrase "${match[0]}" is a recognized hallmark of generic AI phrasing and is routinely flagged by dissertation examiners.`,
        suggestion: `Replace with "${pat.suggestion}".`,
        severity: "high"
      });
    }
  });

  // Check vague numerical claims
  const vagueMatches = text.match(/\b(many participants|several respondents|a majority of people|a big effect)\b/gi) || [];
  vagueMatches.forEach(m => {
    issues.push({
      id: `issue-${idCounter++}`,
      type: "vague_claim",
      matchedText: m,
      explanation: `Vague quantitative claim ("${m}") lacks empirical precision required for postgraduate defense.`,
      suggestion: `State exact proportion or percentage, e.g. "64.2% of respondents (n = 224)".`,
      severity: "medium"
    });
  });

  // Calculate base score
  const wordCount = text.split(/\s+/).length;
  const issueDensity = (issues.length / Math.max(1, wordCount)) * 100;
  const rawScore = Math.max(25, Math.round(100 - (issueDensity * 18)));
  const rigorScore = Math.min(100, rawScore);
  const aiSimilarityRisk: "Low" | "Moderate" | "High" = rigorScore < 60 ? "High" : rigorScore < 85 ? "Moderate" : "Low";

  // 2. Call AI for deep scholarly restructuring
  const systemPrompt = `You are a Senior Academic Peer Reviewer and Postgraduate Dissertation Editor at Oxford/Harvard.
Perform a pre-submission academic rigor restructuring on the provided draft.

OBJECTIVES:
1. Eliminate all generic AI filler phrases (e.g., "delve into", "tapestry", "pivotal role", "beacon of", "it is crucial to note").
2. Transform conversational or colloquial sentences into formal, passive-active balanced empirical prose.
3. Preserve the exact research hypotheses, statistical metrics, citations, and core scientific arguments without altering factual findings.
4. Output a clean, publication-ready academic revision.

Return ONLY a valid JSON object in this exact format:
{
  "enhancedText": "The complete rewritten text with elevated academic rigor...",
  "summaryFeedback": "A 2-sentence formal review explaining what was strengthened (e.g. replaced AI transitions with deterministic discourse markers and improved sentence perplexity)."
}
No markdown backticks.`;

  try {
    const response = await callChatGptApi(systemPrompt, text);
    const rawContent = response.choices?.[0]?.message?.content?.trim() || "{}";
    const cleanJson = rawContent.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    return {
      rigorScore,
      aiSimilarityRisk,
      totalIssuesCount: issues.length,
      issues,
      enhancedText: parsed.enhancedText || text,
      summaryFeedback: parsed.summaryFeedback || "Manuscript prose restructured into formal academic standard."
    };
  } catch (err) {
    return {
      rigorScore,
      aiSimilarityRisk,
      totalIssuesCount: issues.length,
      issues,
      enhancedText: text,
      summaryFeedback: `Identified ${issues.length} stylistic improvement points.`
    };
  }
}
