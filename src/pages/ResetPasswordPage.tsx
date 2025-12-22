import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const ResetPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email is required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    await resetPassword(email);
    setIsSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card text-card-foreground rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Forgot Password?</h1>
          <p className="text-muted-foreground">Enter your email to receive a reset link</p>
        </div>
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
          </Button>
        </form>
        <div className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
