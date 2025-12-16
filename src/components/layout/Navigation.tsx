
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Wallet, User } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  return (
    <nav className="flex items-center justify-between py-4 px-6 w-full">
      <div className="flex items-center">
        <Logo size="md" />
      </div>
      
      <div className="hidden md:flex items-center space-x-6">
        <Link to="/" className="text-foreground hover:text-primary transition-colors">
          Home
        </Link>
        <Link to="/about" className="text-foreground hover:text-primary transition-colors">
          About Us
        </Link>
        <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
          Contact Us
        </Link>
        <Link to="/testimonials" className="text-foreground hover:text-primary transition-colors">
          Testimonials
        </Link>
        <Link to="/wallet" className="flex items-center gap-1 text-foreground hover:text-primary transition-colors">
          <Wallet className="h-4 w-4" />
          <span>Token Wallet</span>
        </Link>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/profile" className="w-full cursor-pointer">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/wallet" className="w-full cursor-pointer">Wallet</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="w-full cursor-pointer">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="md:hidden">
          <Button variant="ghost" size="sm">
            Menu
          </Button>
        </div>
      </div>
    </nav>
  );
}
