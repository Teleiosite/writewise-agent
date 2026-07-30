import { HomeLayout } from "@/components/layout/HomeLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export default function FAQ() {
  const faqs = [
    {
      question: "How does WriteWise differ from standard AI writing assistants?",
      answer: "Unlike general text generation tools, WriteWise features a 100% deterministic Python statistical engine (SciPy/Pandas). Statistical tests, correlation matrices, and regression outputs are calculated numerically first. The AI is only used to interpret and draft Chapter 4 & 5 narrative descriptions grounded directly in those verified mathematical results."
    },
    {
      question: "Can I generate SPSS syntax for university committee submission?",
      answer: "Yes. Every statistical test executed in WriteWise automatically generates exact, copy-pasteable SPSS command syntax (DESCRIPTIVES, CORRELATIONS, REGRESSION, ONEWAY ANOVA). You can paste this syntax directly into IBM SPSS Statistics to prove full calculation reproducibility."
    },
    {
      question: "What file formats can I upload for statistical analysis?",
      answer: "WriteWise supports CSV files, Microsoft Excel spreadsheets (.xlsx), and native SPSS data files (.sav). The engine auto-detects variable names, measurement scales (Nominal, Ordinal, Scale), and identifies Independent/Dependent variables."
    },
    {
      question: "How is academic data privacy and integrity handled?",
      answer: "WriteWise computes SHA-256 cryptographic hashes for every uploaded dataset on your local browser using the Web Crypto API. An append-only audit log records analysis events without storing raw patient or participant survey records on remote AI servers."
    },
    {
      question: "Do I need my own API keys?",
      answer: "You can supply your own API key (Google Gemini, OpenAI GPT-4o, Anthropic Claude, or DeepSeek) in Settings for custom control and zero rate limits. If no API key is provided, WriteWise automatically falls back to an included free execution engine."
    },
    {
      question: "Which citation styles are supported?",
      answer: "WriteWise supports major academic citation formats including APA 7th Edition, MLA 9th Edition, Chicago Manual of Style, Harvard, and IEEE."
    },
    {
      question: "Is there a limit on dataset row sizes?",
      answer: "The browser-based Python execution engine handles datasets up to 100,000 rows and 500 variables seamlessly."
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
