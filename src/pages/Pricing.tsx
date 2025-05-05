
import React from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Basic features for students",
      features: [
        "1,000 words per month",
        "Basic grammar checking",
        "5 citations per document",
        "Standard support"
      ],
      buttonText: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$12",
      period: "per month",
      description: "Advanced features for serious writers",
      features: [
        "Unlimited words",
        "Advanced style suggestions",
        "Unlimited citations",
        "AI content generation",
        "Priority support"
      ],
      buttonText: "Get Pro",
      popular: true
    },
    {
      name: "Team",
      price: "$49",
      period: "per month",
      description: "For research groups and departments",
      features: [
        "Everything in Pro",
        "5 user accounts",
        "Collaborative editing",
        "Team analytics",
        "Admin dashboard",
        "24/7 dedicated support"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that's right for your academic writing needs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`flex flex-col ${plan.popular ? "border-primary shadow-lg relative" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 text-center">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
                  </div>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <button className={`w-full py-2 rounded-md font-medium ${
                    plan.popular 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  } transition-colors`}>
                    {plan.buttonText}
                  </button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 text-left max-w-3xl mx-auto">
              <div>
                <h3 className="text-lg font-semibold mb-2">Can I cancel at any time?</h3>
                <p className="text-muted-foreground">Yes, you can cancel your subscription at any time with no questions asked.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Is there a student discount?</h3>
                <p className="text-muted-foreground">Yes, we offer a 50% discount for verified students. Contact our support team for details.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
