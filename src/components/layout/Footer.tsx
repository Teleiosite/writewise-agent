import { Logo } from "@/components/Logo";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs text-zinc-600 dark:text-zinc-400 py-12">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Logo size="md" />
            <p className="mt-3 text-xs text-zinc-500 max-w-sm font-sans leading-relaxed">
              WriteWise is the academic integrity layer for AI-assisted research — combining Python statistics, SPSS syntax generation, and transparent audit trails.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-black dark:text-white uppercase mb-3 tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/app" className="hover:text-black dark:hover:text-white">Workspace</Link></li>
              <li><Link to="/data-analysis" className="hover:text-black dark:hover:text-white">Data Engine</Link></li>
              <li><Link to="/features" className="hover:text-black dark:hover:text-white">Capabilities</Link></li>
              <li><Link to="/pricing" className="hover:text-black dark:hover:text-white">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-black dark:text-white uppercase mb-3 tracking-wider">Legal & Trust</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-black dark:hover:text-white">About Us</Link></li>
              <li><Link to="/privacy" className="hover:text-black dark:hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-black dark:hover:text-white">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-black dark:hover:text-white">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-black/10 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} WriteWise Agent. All rights reserved.</p>
          <div className="mono-badge-outline text-[10px]">
            <span>Verified Research Operating System</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
