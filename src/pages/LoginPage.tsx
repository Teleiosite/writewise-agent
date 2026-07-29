import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Logo } from "@/components/Logo";
import { ShieldCheck, Cpu, Code2, CheckCircle2 } from "lucide-react";

const LoginPage = () => {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white font-mono text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <p>Initialising Workspace...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app" />;
  }

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
            <span>Academic Research Operating System</span>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight mb-6 leading-tight">
            Workstation for <span className="font-serif-italic font-normal">verifiable</span> research
          </h2>

          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            Access your Python-powered statistical engine, SPSS syntax generator, and structured academic workspace.
          </p>

          <div className="space-y-3 pt-6 border-t border-zinc-800 font-mono text-xs text-zinc-300">
            <div className="flex items-center gap-3">
              <Cpu className="w-4 h-4 text-white shrink-0" />
              <span>100% deterministic Python (Pandas + SciPy) statistics</span>
            </div>
            <div className="flex items-center gap-3">
              <Code2 className="w-4 h-4 text-white shrink-0" />
              <span>Automatic SPSS syntax for supervisor verification</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
              <span>Chapter 4 & 5 prose generated from verified outputs</span>
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
            <h1 className="text-2xl font-bold tracking-tight">Sign in to WriteWise</h1>
            <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-wider">Academic Research Workspace</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Academic Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-11 text-sm rounded-none border-black dark:border-zinc-800 focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Password
                </label>
                <Link to="/reset-password" tabIndex={-1} className="text-xs font-mono text-zinc-500 hover:text-black dark:hover:text-white underline">
                  Forgot?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-11 text-sm rounded-none border-black dark:border-zinc-800 focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <Button type="submit" className="w-full h-11 font-mono text-xs uppercase tracking-wider bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 rounded-none border border-black dark:border-white" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In to Workspace'}
            </Button>
          </form>

          <div className="text-center text-xs font-mono text-zinc-500 pt-4 border-t border-black dark:border-zinc-800">
            Don't have an account?{" "}
            <Link to="/register" className="text-black dark:text-white font-bold hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
