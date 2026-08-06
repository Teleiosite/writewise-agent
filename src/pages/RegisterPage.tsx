import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Logo } from "@/components/Logo";
import { ShieldCheck, Cpu, Code2, CheckCircle2, Key } from "lucide-react";

const RegisterPage: React.FC = () => {
  const { register, loginAsDemo } = useAuth();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    await register(name, email, password);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-black text-black dark:text-white font-sans">
      {/* Left Column: Brand Hero */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-black text-white border-r border-zinc-800 bg-grid-pattern">
        <div>
          <Logo size="lg" />
        </div>

        <div className="max-w-lg">
          <div className="mono-badge mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Research Starter Tier — Free Forever</span>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight mb-6 leading-tight">
            Join postgrads producing <span className="font-serif-italic font-normal">verifiable</span> research
          </h2>

          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            Create an account to run Python-powered statistical analyses and generate reproducible SPSS syntax.
          </p>

          <div className="space-y-3 pt-6 border-t border-zinc-800 font-mono text-xs text-zinc-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>3 full statistical analyses per month on free tier</span>
            </div>
            <div className="flex items-center gap-3">
              <Cpu className="w-4 h-4 text-white shrink-0" />
              <span>Python SciPy engine & automatic SPSS syntax export</span>
            </div>
            <div className="flex items-center gap-3">
              <Code2 className="w-4 h-4 text-white shrink-0" />
              <span>Chapter 1–5 academic drafting workspace</span>
            </div>
            <div className="flex items-center gap-3">
              <Key className="w-4 h-4 text-white shrink-0" />
              <span>Bring your own AI API key — your data, your provider</span>
            </div>
          </div>
        </div>

        <div className="font-mono text-xs text-zinc-500">
          © {new Date().getFullYear()} WriteWise Agent. Built for research integrity.
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 border border-black dark:border-zinc-800 p-8 rounded-none bg-white dark:bg-black">
          <div>
            <div className="lg:hidden flex justify-center mb-6">
              <Logo size="md" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Create Workspace Account</h1>
            <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-wider">Free Researcher Tier</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Dr. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-11 text-sm rounded-none border-black dark:border-zinc-800 focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Academic Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="alex.morgan@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-11 text-sm rounded-none border-black dark:border-zinc-800 focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-11 text-sm rounded-none border-black dark:border-zinc-800 focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <Button type="submit" className="w-full h-11 font-mono text-xs uppercase tracking-wider bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-none border border-black dark:border-white mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Free Account'}
            </Button>
          </form>

          {/* BYOK Notice — set expectation before first use */}
          <div className="p-4 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <div className="flex items-start gap-2">
              <Key className="w-3.5 h-3.5 shrink-0 mt-0.5 text-black dark:text-white" />
              <div>
                <span className="font-bold text-black dark:text-white uppercase tracking-wider">You'll need an AI API key</span> to generate Chapter 4 & 5 narrative. The Python statistics engine is free with no key. Get a free{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline text-black dark:text-white hover:no-underline">Google Gemini key</a>{' '}in 60 seconds — no credit card required.
              </div>
            </div>
          </div>

          {/* Demo Mode Action */}
          <div className="pt-2 text-center space-y-3">
            <p className="text-[11px] text-zinc-500 font-mono">Want to explore without registering?</p>
            <Button
              type="button"
              variant="outline"
              onClick={loginAsDemo}
              className="w-full h-11 font-mono text-xs uppercase tracking-wider rounded-none border border-black dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            >
              Continue as Demo Researcher →
            </Button>
          </div>

          <div className="text-center text-xs font-mono text-zinc-500 pt-3 border-t border-black dark:border-zinc-800">
            Already have an account?{" "}
            <Link to="/login" className="text-black dark:text-white font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
