
import React, { useState } from "react";
import { Navigation } from "@/components/layout/Navigation";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { HelpCircle } from "lucide-react";

export default function ContactSupport() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Support request submitted",
        description: "We'll get back to you as soon as possible.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Contact Support</h1>
            <p className="text-muted-foreground">
              We're here to help with any questions or issues you might have.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Support Request</CardTitle>
                  <CardDescription>
                    Please provide as much detail as possible so we can help you more effectively.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Your Name
                        </label>
                        <Input id="name" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email Address
                        </label>
                        <Input id="email" type="email" required />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="issue-type" className="text-sm font-medium">
                        Issue Type
                      </label>
                      <Select>
                        <SelectTrigger id="issue-type">
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical Issue</SelectItem>
                          <SelectItem value="billing">Billing Question</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="account">Account Help</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </label>
                      <Input id="subject" required />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message
                      </label>
                      <Textarea 
                        id="message" 
                        rows={5} 
                        placeholder="Please describe your issue in detail..." 
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="attachment" className="text-sm font-medium">
                        Attachment (optional)
                      </label>
                      <Input id="attachment" type="file" />
                      <p className="text-xs text-muted-foreground">
                        Max file size: 10MB. Accepted formats: PDF, JPG, PNG
                      </p>
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit Support Request"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Quick Help
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Support Hours</h3>
                    <p className="text-sm text-muted-foreground">
                      Monday - Friday: 9am - 5pm EST<br />
                      Saturday - Sunday: Limited support
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Response Time</h3>
                    <p className="text-sm text-muted-foreground">
                      We aim to respond to all inquiries within 24 hours during business days.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Alternative Support</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        Check our <a href="/faq" className="text-blue-600 dark:text-blue-400 hover:underline">FAQ</a> for quick answers
                      </p>
                      <p className="text-muted-foreground">
                        Email us directly: support@writewise.com
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/help">Visit Help Center</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
