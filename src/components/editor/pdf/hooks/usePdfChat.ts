import { useState, useEffect, useRef } from "react";
import { ChatMessage, PdfDocumentMeta, PdfPageData } from "../types";
import { toast } from "sonner";
import { callChatGptApi } from "@/services/api-client";
import { AcademicCitation } from "@/services/citationEngine";

export function usePdfChat(initialDocMeta?: PdfDocumentMeta | null) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [docMeta, setDocMeta] = useState<PdfDocumentMeta | null>(initialDocMeta || null);
  const [activeCitationJump, setActiveCitationJump] = useState<number | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Sync docMeta when prop changes
  useEffect(() => {
    if (initialDocMeta) {
      setDocMeta(initialDocMeta);
      initializeChat(initialDocMeta);
    }
  }, [initialDocMeta]);

  // Load chat history from localStorage
  useEffect(() => {
    if (docMeta?.name) {
      const storageKey = `writewise_pdf_chat_${docMeta.name}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setChatMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
        } catch {
          initializeChat(docMeta);
        }
      } else {
        initializeChat(docMeta);
      }
    }
  }, [docMeta?.name]);

  // Save chat history
  useEffect(() => {
    if (chatMessages.length > 0 && docMeta?.name) {
      localStorage.setItem(`writewise_pdf_chat_${docMeta.name}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, docMeta?.name]);

  const initializeChat = (doc: PdfDocumentMeta) => {
    const welcome: ChatMessage = {
      id: Date.now().toString(),
      content: `I've indexed all **${doc.numPages} pages** of **"${doc.name}"**.\n\nYou can ask deep questions about this research paper, request page-cited explanations, or use the **1-Click Academic Extractors** below to pull methodology, statistical findings, and literature summaries.`,
      role: "assistant",
      timestamp: new Date(),
    };
    setChatMessages([welcome]);
    generateSuggestedQuestions(doc);
  };

  // Find most relevant pages based on query
  const findRelevantContext = (query: string, pages: PdfPageData[], maxPages = 5): { contextText: string; pageNumbers: number[] } => {
    if (!pages || pages.length === 0) return { contextText: "", pageNumbers: [] };

    const queryWords = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2);

    // Score pages
    const scored = pages.map(p => {
      let score = 0;
      const lowerText = p.text.toLowerCase();
      queryWords.forEach(w => {
        const regex = new RegExp(`\\b${w}`, 'gi');
        const matches = (lowerText.match(regex) || []).length;
        score += matches;
      });
      // Boost page 1 and 2 for general/methodology queries
      if (p.pageNumber <= 2) score += 2;
      return { ...p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topPages = scored.slice(0, maxPages).sort((a, b) => a.pageNumber - b.pageNumber);

    const contextText = topPages.map(p => `[PAGE ${p.pageNumber}]\n${p.text.substring(0, 2500)}`).join("\n\n---\n\n");
    const pageNumbers = topPages.map(p => p.pageNumber);

    return { contextText, pageNumbers };
  };

  // Generate Suggested Questions
  const generateSuggestedQuestions = async (doc: PdfDocumentMeta) => {
    try {
      const firstPages = doc.pages.slice(0, 3).map(p => p.text).join(" ").substring(0, 3000);
      const res = await callChatGptApi(
        `Generate 3 distinct, intellectually sharp academic research questions based on this paper. Return ONLY a JSON array of 3 strings. No markdown backticks.`,
        firstPages
      );
      const raw = res.choices?.[0]?.message?.content?.trim() || "[]";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed)) {
        setGeneratedQuestions(parsed);
      }
    } catch {
      setGeneratedQuestions([
        "What is the core empirical methodology and sample size?",
        "What are the main regression/ANOVA statistical findings?",
        "What theoretical limitations and research gaps are stated?"
      ]);
    }
  };

  // Send User Chat Query
  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputMessage;
    if (!promptToSend.trim() || !docMeta) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: promptToSend,
      role: "user",
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    if (!customPrompt) setInputMessage("");
    setIsLoading(true);

    try {
      const { contextText, pageNumbers } = findRelevantContext(promptToSend, docMeta.pages, 6);

      const systemPrompt = `You are a world-class academic research peer reviewer and literature analysis AI.
Answer the question rigorously based on the following indexed pages from the research paper "${docMeta.name}".

RULES:
1. Always cite exact page numbers where you found evidence (e.g. "[Page 4]", "[Page 12, Table 2]").
2. If exact numbers, sample sizes, or p-values are stated in the text, report them precisely.
3. If an answer cannot be determined from the document, state that transparently.`;

      const response = await callChatGptApi(
        systemPrompt,
        `Document Pages Context:\n${contextText}\n\nResearcher Question: ${promptToSend}`
      );

      const content = response.choices?.[0]?.message?.content?.trim() || "Could not generate response.";

      // Extract cited pages from response e.g. [Page 4], [page 12]
      const citedMatches = content.match(/\[Page\s*(\d+)\]/gi) || [];
      const extractedPages = Array.from(new Set(citedMatches.map(m => {
        const num = m.match(/\d+/);
        return num ? parseInt(num[0], 10) : null;
      }).filter((n): n is number => n !== null)));

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content,
        role: "assistant",
        timestamp: new Date(),
        citedPages: extractedPages.length > 0 ? extractedPages : pageNumbers.slice(0, 2)
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      toast.error(`Analysis failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 1-Click Extractor: Methodology
  const handleExtractMethodology = () => {
    handleSendMessage("Please extract and synthesize the full empirical research methodology: (1) Research Design, (2) Population & Sample Size (N), (3) Data Collection Instruments/Scales, and (4) Statistical Analysis Techniques used.");
  };

  // 1-Click Extractor: Key Findings & Statistics
  const handleExtractFindings = () => {
    handleSendMessage("Please extract the primary statistical findings and empirical results: list all reported regression coefficients (β), effect sizes, F/t statistics, correlations (r), and p-values with exact page citations.");
  };

  // 1-Click Extractor: Limitations & Gaps
  const handleExtractLimitations = () => {
    handleSendMessage("Extract all stated methodological limitations, sample constraints, and suggested future research directions to help justify a dissertation research gap.");
  };

  // 1-Click Extractor: Chapter 2 Literature Synthesis
  const handleExtractChapter2Summary = () => {
    handleSendMessage("Synthesize this paper into a formal, two-paragraph APA 7th literature review summary suitable for insertion directly into Chapter 2 (Literature Review). Include formal parenthetical and narrative in-text citations.");
  };

  // 1-Click Extractor: Citation Metadata
  const handleExtractCitationMetadata = async (): Promise<AcademicCitation | null> => {
    if (!docMeta) return null;
    try {
      const headerText = docMeta.pages.slice(0, 2).map(p => p.text).join(" ").substring(0, 2500);
      const res = await callChatGptApi(
        `Extract academic bibliographic metadata from this research paper header. Return ONLY a valid JSON object with keys: "title" (string), "authors" (array of {family: string, given: string}), "year" (string), "source" (journal/conference name), "volume" (string or null), "issue" (string or null), "pages" (string or null), "doi" (string or null). No markdown backticks.`,
        headerText
      );
      const raw = res.choices?.[0]?.message?.content?.trim() || "{}";
      const clean = raw.replace(/```json|```/g, "").trim();
      const meta = JSON.parse(clean);

      const citation: AcademicCitation = {
        id: `pdf-${Date.now()}`,
        title: meta.title || docMeta.name.replace(/\.pdf$/i, ''),
        authors: Array.isArray(meta.authors) && meta.authors.length > 0 ? meta.authors : [{ name: 'Unknown Author' }],
        year: meta.year || String(new Date().getFullYear()),
        source: meta.source || 'Research Document',
        volume: meta.volume || undefined,
        issue: meta.issue || undefined,
        pages: meta.pages || undefined,
        doi: meta.doi || undefined,
        type: 'journal',
        sourceDatabase: 'Manual'
      };

      return citation;
    } catch {
      return null;
    }
  };

  const handleClearHistory = () => {
    if (!docMeta) return;
    localStorage.removeItem(`writewise_pdf_chat_${docMeta.name}`);
    initializeChat(docMeta);
    toast.success("Chat history cleared");
  };

  return {
    chatMessages,
    inputMessage,
    setInputMessage,
    generatedQuestions,
    isLoading,
    docMeta,
    setDocMeta,
    activeCitationJump,
    setActiveCitationJump,
    handleSendMessage,
    handleExtractMethodology,
    handleExtractFindings,
    handleExtractLimitations,
    handleExtractChapter2Summary,
    handleExtractCitationMetadata,
    handleClearHistory,
    scrollAreaRef
  };
}
