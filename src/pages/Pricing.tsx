import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function Pricing() {
  const plans = [
    {
      name: "Research Starter",
      price: "$0",
      period: "Free forever",
      description: "For exploring initial dataset analyses",
      features: [
        "3 statistical analyses / month",
        "Python SciPy compute engine",
        "SPSS syntax generation",
        "Chapter 4 & 5 drafting",
        "APA Citation manager"
      ],
      buttonText: "Start Free",
      popular: false
    },
    {
      name: "Researcher Pro",
      price: "$19",
      period: "per month",
      description: "For Master's & PhD dissertation candidates",
      features: [
        "Unlimited statistical analyses",
        "Multi-AI router (Claude, GPT-4o, Gemini)",
        "Academic DOCX & PDF Export",
        "Dataset SHA-256 authentication",
        "Supervisor 1-click verification links",
        "Priority support"
      ],
      buttonText: "Get Pro Access",
      popular: true
    },
    {
      name: "Department License",
      price: "$499",
      period: "per month",
      description: "For university faculties & research groups",
      features: [
        "10 researcher workspace seats",
        "Supervisor verification dashboard",
        "Batch SPSS & R syntax export",
        "Department template enforcement",
        "GDPR & Data Processing agreement",
        "Dedicated onboarding"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-black dark:text-white font-sans">
      <Navigation />
      
      <main className="flex-grow container mx-auto py-16 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto">
          
          <div className="mono-badge-outline mb-4">Pricing Architecture</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            Analysis-based pricing
          </h1>
          <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-xl mb-16">
            Priced on completed research analyses — not arbitrary word count limits.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`p-8 border flex flex-col justify-between ${
                  plan.popular 
                    ? "border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black shadow-none" 
                    : "border-black dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white"
                }`}
              >
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider mb-2 opacity-70">Tier 0{index + 1}</div>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-xs opacity-80 mb-6">{plan.description}</p>
                  
                  <div className="mb-8 font-mono">
                    <span className="text-4xl font-extrabold">{plan.price}</span>
                    <span className="text-xs ml-1 opacity-70">{plan.period}</span>
                  </div>

                  <ul className="space-y-3 mb-8 text-xs">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to="/register">
                  <Button className={`w-full font-mono text-xs uppercase tracking-wider h-12 rounded-none ${
                    plan.popular 
                      ? "bg-white text-black hover:bg-zinc-200 dark:bg-black dark:text-white dark:hover:bg-zinc-800" 
                      : "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                  }`}>
                    {plan.buttonText}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
          
          {/* FAQ */}
          <div className="pt-12 border-t border-black dark:border-zinc-800">
            <div className="mono-badge-outline mb-3">FAQ</div>
            <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed">
              <div className="p-6 border border-black dark:border-zinc-800">
                <h3 className="font-bold text-base mb-2">Why price on analyses instead of words?</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs">Academic papers require iterative draft revisions. Word-count limits penalize editing. We measure completed statistical analyses so you can write without word caps.</p>
              </div>
              <div className="p-6 border border-black dark:border-zinc-800">
                <h3 className="font-bold text-base mb-2">How do supervisors verify results?</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-xs">Every analysis generates downloadable SPSS syntax and a 1-click verification link. Supervisors can copy the syntax and reproduce identical numbers in SPSS.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
