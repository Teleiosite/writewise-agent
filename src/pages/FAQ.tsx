
import React from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQ() {
  const faqs = [
    {
      question: "What is Writewise?",
      answer: "Writewise is an AI-powered academic writing assistant designed to help students, researchers, and academics produce high-quality written work with less effort and more confidence. Our platform offers features like AI writing suggestions, citation management, grammar checking, and more."
    },
    {
      question: "How does the token system work?",
      answer: "Our platform uses a token-based system to provide access to AI features. You can purchase tokens and spend them on various AI-powered features like document analysis, citation generation, and content suggestions. Different features cost different amounts of tokens, and you can view your token balance in your wallet."
    },
    {
      question: "Is my content secure and private?",
      answer: "Yes, we take data privacy very seriously. Your documents and content are encrypted and stored securely. We do not share or sell your content to third parties. You can read more about our data practices in our Privacy Policy."
    },
    {
      question: "Can I use Writewise for collaborative projects?",
      answer: "Currently, our Team plan offers collaborative editing features that allow multiple users to work on the same document. Team members can leave comments, make suggestions, and track changes in real-time."
    },
    {
      question: "Which citation styles are supported?",
      answer: "Writewise supports all major citation styles including APA, MLA, Chicago, Harvard, IEEE, and many more. Our citation manager can automatically format citations and bibliographies according to the style guide of your choice."
    },
    {
      question: "How accurate is the AI writing assistant?",
      answer: "Our AI writing assistant has been trained on millions of academic papers and documents. While it provides high-quality suggestions most of the time, we always recommend reviewing and editing the AI-generated content to ensure it meets your specific requirements and academic standards."
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer: "Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access to the service until the end of your current billing period. We do not offer refunds for partial subscription periods."
    },
    {
      question: "Is there a limit to how many documents I can create?",
      answer: "There are no limits on the number of documents you can create with our paid plans. However, the free plan has limitations on the number of words and documents you can process each month."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h1>
          
          <p className="text-center text-muted-foreground mb-8">
            Find answers to common questions about our platform, features, and services.
          </p>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="mt-12 bg-muted p-6 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
            <p className="mb-4">Our support team is here to help you with any questions or concerns.</p>
            <a href="/support" className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors">
              Contact Support
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
