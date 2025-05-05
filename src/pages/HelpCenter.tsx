
import React from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, HelpCircle, Users, Shield } from "lucide-react";

export default function HelpCenter() {
  const helpCategories = [
    {
      title: "Getting Started",
      description: "Learn the basics and set up your account",
      icon: <HelpCircle className="h-8 w-8 text-primary" />,
      topics: [
        "Creating an account",
        "Dashboard overview",
        "Setting up your first project",
        "Understanding the editor"
      ]
    },
    {
      title: "Writing Tools",
      description: "Maximize your writing efficiency",
      icon: <FileText className="h-8 w-8 text-primary" />,
      topics: [
        "Using the AI assistant",
        "Grammar and style checking",
        "Content generation",
        "Document templates"
      ]
    },
    {
      title: "Citations & References",
      description: "Master academic citations",
      icon: <Users className="h-8 w-8 text-primary" />,
      topics: [
        "Adding citations",
        "Changing citation styles",
        "Managing bibliographies",
        "Importing references"
      ]
    },
    {
      title: "Account & Billing",
      description: "Manage your subscription and tokens",
      icon: <Shield className="h-8 w-8 text-primary" />,
      topics: [
        "Subscription plans",
        "Token purchases",
        "Billing history",
        "Account security"
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-4">Help Center</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find guides, tutorials, and answers to common questions about using our platform.
            </p>
            
            <div className="mt-6 max-w-xl mx-auto">
              <div className="flex gap-2">
                <Input 
                  placeholder="Search help articles..." 
                  className="flex-grow"
                />
                <Button>Search</Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4">
                  {category.icon}
                  <div>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.topics.map((topic, topicIndex) => (
                      <li key={topicIndex}>
                        <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
                          {topic}
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-8 text-center bg-muted p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Need personalized help?</h2>
            <p className="mb-6 max-w-2xl mx-auto">
              Our support team is available to assist you with any questions or issues that aren't covered in our help articles.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild variant="default">
                <a href="/support">Contact Support</a>
              </Button>
              <Button asChild variant="outline">
                <a href="/faq">View FAQs</a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
