import React, { useState } from "react";
import { HomeLayout } from "@/components/layout/HomeLayout";
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
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Support ticket registered",
        description: "A research engineer will review your issue shortly.",
      });
    }, 1200);
  };

  return (
    <HomeLayout showWelcomeBanner={false}>
      <div className="max-w-4xl mx-auto py-6 font-sans space-y-6">
        <div className="border-b border-black dark:border-zinc-800 pb-4">
          <span className="mono-badge mb-2">Helpdesk & Verification Support</span>
          <h1 className="text-2xl font-extrabold tracking-tight text-black dark:text-white mt-1">Research Support & Verification Desk</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Submit technical inquiries regarding Python statistical calculations, dataset parsing, or SPSS script compatibility.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card className="rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black shadow-none font-sans">
              <CardHeader className="border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <CardTitle className="text-sm font-mono uppercase font-bold text-black dark:text-white">Submit Support Ticket</CardTitle>
                <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400">
                  Please specify dataset structure or calculation behavior details
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="uppercase font-bold text-black dark:text-white">
                        Researcher Name
                      </label>
                      <Input id="name" required className="rounded-none border-black dark:border-zinc-800 text-xs font-mono bg-white dark:bg-black" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="uppercase font-bold text-black dark:text-white">
                        Academic Email
                      </label>
                      <Input id="email" type="email" required className="rounded-none border-black dark:border-zinc-800 text-xs font-mono bg-white dark:bg-black" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="issue-type" className="uppercase font-bold text-black dark:text-white">
                      Inquiry Category
                    </label>
                    <Select>
                      <SelectTrigger id="issue-type" className="rounded-none border-black dark:border-zinc-800 text-xs font-mono">
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-black dark:border-zinc-800 font-mono text-xs">
                        <SelectItem value="technical">Python Statistics Execution</SelectItem>
                        <SelectItem value="billing">SPSS Syntax Exporting</SelectItem>
                        <SelectItem value="feature">Dataset Parsing Issue</SelectItem>
                        <SelectItem value="account">Workspace Account</SelectItem>
                        <SelectItem value="other">General Query</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="uppercase font-bold text-black dark:text-white">
                      Subject
                    </label>
                    <Input id="subject" required className="rounded-none border-black dark:border-zinc-800 text-xs font-mono bg-white dark:bg-black" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="uppercase font-bold text-black dark:text-white">
                      Detailed Trace / Message
                    </label>
                    <Textarea 
                      id="message" 
                      rows={5} 
                      placeholder="Include error codes, statistical test name, or variable types..." 
                      required 
                      className="rounded-none border-black dark:border-zinc-800 text-xs font-mono bg-white dark:bg-black min-h-[120px]"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider py-3 border border-black dark:border-white" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Transmitting Ticket..." : "Submit Ticket to Engineering"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black shadow-none font-sans">
              <CardHeader className="border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <CardTitle className="flex items-center gap-2 text-sm font-mono uppercase font-bold text-black dark:text-white">
                  <HelpCircle className="h-4 w-4" />
                  Support Desk
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 text-xs font-mono">
                <div>
                  <h3 className="font-bold uppercase text-black dark:text-white mb-1">Hours of Operation</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Mon – Fri: 08:00 – 18:00 UTC<br />
                    Sat – Sun: Automated Engine Monitoring
                  </p>
                </div>
                
                <div>
                  <h3 className="font-bold uppercase text-black dark:text-white mb-1">Response SLA</h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Standard technical queries are answered within 12 hours.
                  </p>
                </div>
                
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Review <a href="/faq" className="underline font-bold text-black dark:text-white">Documentation FAQ</a>
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Email direct: <span className="font-bold text-black dark:text-white">support@writewise.ac</span>
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full rounded-none border-black dark:border-zinc-800 font-mono text-xs uppercase" asChild>
                    <a href="/help">Browse Knowledge Base</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
