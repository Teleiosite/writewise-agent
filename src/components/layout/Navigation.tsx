import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { User, FlaskConical, LayoutDashboard } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const { logout, user } = useAuth();

  return (
    <nav className="flex items-center justify-between py-4 px-6 w-full border-b border-black dark:border-zinc-800 bg-white dark:bg-black font-sans transition-colors">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <Logo size="md" />
        </Link>
        <div className="hidden md:flex items-center space-x-6 font-mono text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          <Link to="/app" className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5 font-bold text-black dark:text-white">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Workspace
          </Link>
          <Link to="/data-analysis" className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Data Engine
          </Link>
          <Link to="/features" className="hover:text-black dark:hover:text-white transition-colors">
            Features
          </Link>
          <Link to="/pricing" className="hover:text-black dark:hover:text-white transition-colors">
            Pricing
          </Link>
          <Link to="/about" className="hover:text-black dark:hover:text-white transition-colors">
            About
          </Link>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <ThemeToggle />
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-none border-black dark:border-zinc-800 font-mono text-xs gap-2">
                <User className="h-3.5 w-3.5" />
                <span>Account</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-none border-black dark:border-zinc-800 font-mono text-xs">
              <DropdownMenuLabel className="uppercase text-zinc-500">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="w-full cursor-pointer">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="w-full cursor-pointer">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600 dark:text-red-400">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2 font-mono text-xs">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="uppercase tracking-wider">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-none border border-black dark:border-white uppercase tracking-wider">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
