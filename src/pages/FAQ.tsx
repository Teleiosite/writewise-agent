import { HomeLayout } from "@/components/layout/HomeLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export default function FAQ() {
  const faqs = [
    {
      question: "How does WriteWise differ from standard AI writing assistants?",
      answer: "Unlike general text generation tools, WriteWise features a 100% deterministic Python statistical engine (SciPy/Pandas). Statistical tests, correlation matrices, and regression outputs are calculated numerically first. The AI is only used to interpret and draft Chapter 4 & 5 narrative descriptions grounded directly in those verified mathematical results — not to guess or fabricate numbers."
    },
    {
      question: "How does the supervisor verification link work?",
      answer: "When you complete an analysis and click 'Share Verification Link', WriteWise creates a permanent research receipt stored in our database. This receipt contains the exact statistical tests run, the SHA-256 fingerprint of your dataset, the SPSS syntax needed to reproduce the results, and the AI model used for narration. Your supervisor can open the link without a WriteWise account and independently verify every claim. The link never expires unless you explicitly delete the analysis."
    },
    {
      question: "Can I generate SPSS syntax for university committee submission?",
      answer: "Yes. Every statistical test executed in WriteWise automatically generates exact, copy-pasteable SPSS command syntax (DESCRIPTIVES, CORRELATIONS, REGRESSION, ONEWAY ANOVA, RELIABILITY, FACTOR). You can paste this syntax directly into IBM SPSS Statistics to prove full calculation reproducibility to your department or ethics committee."
    },
    {
      question: "What file formats can I upload for statistical analysis?",
      answer: "WriteWise supports CSV files, Microsoft Excel spreadsheets (.xlsx), and native SPSS data files (.sav). The engine auto-detects variable names, measurement scales (Nominal, Ordinal, Scale), and identifies Independent/Dependent variables through the codebook configuration step."
    },
    {
      question: "How is academic data privacy and integrity handled?",
      answer: "WriteWise computes SHA-256 cryptographic hashes for every uploaded dataset on your local browser using the Web Crypto API — your raw data never leaves your machine unencrypted. An append-only audit log records analysis events. We do not store raw participant survey records on AI servers. For institutional deployments, a GDPR Data Processing Agreement is available."
    },
    {
      question: "Do I need my own API key to use WriteWise?",
      answer: "No — WriteWise includes a default high-speed Google Gemini 2.5 Flash AI compute engine on all accounts at zero extra charge. You can upload data, execute Python statistical analyses, generate SPSS syntax, and stream Chapter 4 & 5 narratives immediately. If you want to use external premium models (such as Anthropic Claude 3.5 Sonnet, OpenAI GPT-4o, DeepSeek, or Grok), you can easily connect your personal API key in Settings with zero compute markup."
    },
    {
      question: "Which AI models can I use for narrative generation?",
      answer: "WriteWise supports Google Gemini 1.5 Pro / Flash, OpenAI GPT-4o / GPT-4o-mini, Anthropic Claude 3.5 Sonnet, and DeepSeek V2. You can switch models per analysis session. The model choice is recorded in your research receipt, so supervisors can see exactly which AI assisted in drafting the narrative. Statistical outputs are identical regardless of the model chosen — the AI only explains, never computes."
    },
    {
      question: "Is WriteWise suitable for ethical or IRB submission?",
      answer: "WriteWise generates an audit trail that documents: the exact dataset hash (preventing post-hoc data modification), all statistical tests run with their parameters, the AI model and inputs used for narrative generation, and timestamps for each step. This is designed to support — not replace — your institution's ethics approval process. We recommend attaching your WriteWise integrity report as a methodological appendix."
    },
    {
      question: "Could using WriteWise constitute academic misconduct?",
      answer: "WriteWise is a statistical analysis and writing assistance tool, not a ghostwriting service. It is analogous to using SPSS for computation or Grammarly for editing — both widely accepted. The key distinction: WriteWise produces a verifiable audit trail proving which computations were done, which AI model explained them, and what the original dataset fingerprint was. You declare AI assistance in your methodology section as you would any tool. We recommend checking your institution's specific AI use policy."
    },
    {
      question: "Which citation styles are supported?",
      answer: "WriteWise supports major academic citation formats including APA 7th Edition, MLA 9th Edition, Chicago Manual of Style, Harvard, and IEEE. Citations can be inserted directly into the Chapter editor or exported in DOCX format with properly formatted reference lists."
    },
    {
      question: "Is there a limit on dataset row sizes?",
      answer: "The statistics engine (running on Railway) handles datasets up to approximately 50,000 rows and 200 variables in a standard analysis. Very large datasets (100k+ rows) may require longer processing time. The engine operates server-side in Python — your browser performance does not limit analysis speed."
    },
    {
      question: "Can I cancel or refund my subscription?",
      answer: "You can cancel at any time from Settings → Subscription. Your Pro access continues until the end of your billing period. Refund requests within 7 days of your first charge are handled individually — email hello@writewise.app with your receipt and we'll process it promptly."
    },
    {
      question: "How do I delete my data?",
      answer: "You can delete any individual analysis from your workspace dashboard. To delete your entire account and all associated data, go to Settings → Account → Delete Account. This permanently removes all stored analyses, audit logs, and your profile within 30 days, in compliance with GDPR Article 17 (Right to Erasure)."
    }
  ];

  return (
    <HomeLayout showWelcomeBanner={false}>
      <div className="max-w-3xl mx-auto py-6 font-sans space-y-8">
        <div className="text-center border-b border-black dark:border-zinc-800 pb-6">
          <span className="mono-badge mb-3">Academic FAQ</span>
          <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white mt-1">Frequently Asked Questions</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 max-w-md mx-auto leading-relaxed">
            Everything you need to know about Python statistical processing, SPSS syntax generation, and academic verification.
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full font-mono text-xs space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border border-black dark:border-zinc-800 bg-white dark:bg-black px-4">
              <AccordionTrigger className="text-left font-bold text-black dark:text-white uppercase tracking-tight py-4 hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-zinc-600 dark:text-zinc-400 font-sans text-xs leading-relaxed pb-4 pt-1 border-t border-zinc-200 dark:border-zinc-900 mt-1">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        <div className="p-6 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-center font-sans">
          <h2 className="text-sm font-mono font-bold text-black dark:text-white uppercase mb-1">Have an Unanswered Question?</h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-4 max-w-sm mx-auto">Contact our technical research helpdesk directly.</p>
          <Button className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider px-6 border border-black dark:border-white" asChild>
            <a href="/contact-support">Contact Support</a>
          </Button>
        </div>
      </div>
    </HomeLayout>
  );
}
