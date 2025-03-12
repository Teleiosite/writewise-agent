
import React from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  institution: string;
  quote: string;
  avatar?: string;
}

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Professor of Biology",
      institution: "Stanford University",
      quote: "Writewise transformed my research paper writing process. The AI-powered suggestions helped me refine my arguments and the citation manager saved me countless hours of formatting references."
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "PhD Candidate",
      institution: "MIT",
      quote: "As a non-native English speaker, Writewise has been invaluable for polishing my academic writing. The grammar suggestions and style recommendations have significantly improved the quality of my dissertation."
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Undergraduate Student",
      institution: "UCLA",
      quote: "I used to struggle with properly citing sources in my papers. The citation manager in Writewise makes it effortless to generate accurate citations in any format my professors require."
    },
    {
      id: 4,
      name: "Prof. James Wilson",
      role: "Department Chair",
      institution: "University of Oxford",
      quote: "I recommend Writewise to all my students. It helps them focus on developing their ideas rather than getting bogged down in formatting and citation details."
    },
    {
      id: 5,
      name: "Dr. Lisa Zhang",
      role: "Research Scientist",
      institution: "Harvard Medical School",
      quote: "The AI-powered suggestions for improving clarity and conciseness have been remarkably helpful for my scientific papers. Writewise understands the conventions of academic writing in my field."
    },
    {
      id: 6,
      name: "Thomas Brown",
      role: "Master's Student",
      institution: "University of Chicago",
      quote: "Writewise helped me meet tight deadlines for my thesis. The progress tracking feature kept me accountable, and the writing suggestions improved my work significantly."
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">What Our Users Say</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover how Writewise has helped academics at all levels improve their writing 
              and streamline their research process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-primary opacity-50 mb-2" />
                  <p className="text-sm italic mb-4">{testimonial.quote}</p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.role}, {testimonial.institution}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
