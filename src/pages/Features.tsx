
import React from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, FileText, Star, Shield } from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "AI-Powered Writing Assistant",
      description: "Get real-time suggestions to improve your academic writing style, clarity, and coherence.",
      icon: <Star className="h-12 w-12 text-primary" />
    },
    {
      title: "Smart Citation Manager",
      description: "Automatically format citations in any academic style and create perfect bibliographies.",
      icon: <FileText className="h-12 w-12 text-primary" />
    },
    {
      title: "Research Integration",
      description: "Seamlessly integrate research papers and resources directly into your writing workflow.",
      icon: <Home className="h-12 w-12 text-primary" />
    },
    {
      title: "Grammar & Style Checker",
      description: "Advanced grammar and style checking designed specifically for academic writing.",
      icon: <Shield className="h-12 w-12 text-primary" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Features</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover how our AI-powered tools can transform your academic writing experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all">
                <CardHeader className="pb-2">
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="bg-muted p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-center">Ready to elevate your academic writing?</h2>
            <p className="text-center mb-6">Join thousands of students and researchers who've improved their writing with our platform.</p>
            <div className="flex justify-center">
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
                Get Started Free
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
