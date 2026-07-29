import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Logo } from "@/components/Logo";
import { ShieldCheck, Cpu, Code2, CheckCircle2 } from "lucide-react";

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
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
            <span>Research Starter Plan — Free Forever</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-white leading-tight">
            Start Your Verifiable Research Journey
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Join researchers and postgraduates using Python-verified statistics and SPSS syntax for transparent dissertations.
          </p>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>3 full statistical analyses per month on free tier</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Cpu className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Full Python SciPy engine & automatic SPSS syntax</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-300">
              <Code2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Chapter 1–5 academic drafting workstation</span>
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Account</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Get started with WriteWise in 60 seconds</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                className="h-10 text-sm border-slate-300 dark:border-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Academic / Institution Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="alex.morgan@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
                className="h-10 text-sm border-slate-300 dark:border-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
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
                className="h-10 text-sm border-slate-300 dark:border-slate-800"
              />
            </div>

            <Button type="submit" className="w-full h-10 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 mt-2" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Workspace Account...' : 'Create Free Account'}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
