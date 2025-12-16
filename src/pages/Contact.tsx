
import React, { useState } from "react";
import { HomeLayout } from "@/components/layout/HomeLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Mail, MessageSquare, Clock, MapPin } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      
      toast({
        title: "Message sent",
        description: "We've received your message and will get back to you soon.",
      });
    }, 1500);
  };

  return (
    <HomeLayout showWelcomeBanner={false}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Contact Us</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-primary" />
                Email Us
              </h3>
              <p className="text-muted-foreground">
                <a href="mailto:support@writewise.com" className="hover:text-primary">
                  support@writewise.com
                </a>
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-primary" />
                Live Chat
              </h3>
              <p className="text-muted-foreground">
                Available on our website during business hours
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Business Hours
              </h3>
              <p className="text-muted-foreground">
                Monday - Friday: 9am - 5pm EST<br />
                Saturday - Sunday: Closed
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                Location
              </h3>
              <p className="text-muted-foreground">
                123 Academic Lane<br />
                Cambridge, MA 02138<br />
                United States
              </p>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Send Us a Message</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
