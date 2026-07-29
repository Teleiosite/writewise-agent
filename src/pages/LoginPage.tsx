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
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading WriteWise Workspace...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app" />;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Column: Brand Hero */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10">
          <Logo size="lg" />
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold accent-badge mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Academic Research Operating System</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-white leading-tight">
            Workstation for Verifiable Academic Research
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Access your Python-powered statistical engine, SPSS syntax generator, and structured academic workspace.
          </p>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
              <span>100% deterministic Python (Pandas + SciPy) statistics</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automatic SPSS syntax for independent supervisor verification</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Chapter 4 & 5 narrative generation grounded in verified outputs</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} WriteWise Agent. Built for rigorous research integrity.
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8 glass-card p-8 rounded-2xl shadow-xl">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-6">
              <Logo size="md" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sign in to your research workspace</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                className="h-10 text-sm border-slate-300 dark:border-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link to="/reset-password" tabIndex={-1} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-10 text-sm border-slate-300 dark:border-slate-800"
              />
            </div>

            <Button type="submit" className="w-full h-10 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In to Workspace'}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
