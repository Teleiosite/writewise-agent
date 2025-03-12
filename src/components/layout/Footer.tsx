
import React from "react";
import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-16 pt-8 pb-6 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-4/12 mb-8 md:mb-0">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">
              Writewise helps academic writers with AI-powered tools for 
              research, editing, and citation management.
            </p>
            <div className="flex mt-4 space-x-3">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="w-full md:w-2/12 mb-8 md:mb-0">
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary">Features</Link></li>
              <li><Link to="/pricing" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
              <li><Link to="/testimonials" className="text-muted-foreground hover:text-primary">Testimonials</Link></li>
              <li><Link to="/wallet" className="text-muted-foreground hover:text-primary">Token Wallet</Link></li>
            </ul>
          </div>
          
          <div className="w-full md:w-2/12 mb-8 md:mb-0">
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div className="w-full md:w-2/12">
            <h4 className="text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
              <li><Link to="/help" className="text-muted-foreground hover:text-primary">Help Center</Link></li>
              <li><a href="mailto:support@writewise.com" className="text-muted-foreground hover:text-primary">Contact Support</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Writewise. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
