import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";

const DEMO_USER: User = {
  id: 'demo-researcher-id',
  email: 'demo@writewise.app',
  app_metadata: { provider: 'email' },
  user_metadata: { full_name: 'Demo Researcher' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemo: boolean;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  loginAsDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const demoActive = localStorage.getItem('writewise_demo_mode') === 'true';

    if (demoActive) {
      setUser(DEMO_USER);
      setIsDemo(true);
      setLoading(false);
    } else {
      supabase.auth.getSession()
        .then(({ data: { session } }) => {
          setUser(session?.user ?? null);
          setLoading(false);
        })
        .catch((err) => {
          console.warn('Supabase auth session check failed:', err);
          setLoading(false);
        });
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (localStorage.getItem('writewise_demo_mode') !== 'true') {
          setUser(session?.user ?? null);
          setIsDemo(false);
        }
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const loginAsDemo = () => {
    localStorage.setItem('writewise_demo_mode', 'true');
    setUser(DEMO_USER);
    setIsDemo(true);
    toast({
      title: 'Demo Workspace Activated',
      description: 'You are signed in as a Demo Researcher with full workspace access.',
    });
  };

  const logout = async () => {
    localStorage.removeItem('writewise_demo_mode');
    setIsDemo(false);
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
  };
  
  const getSiteUrl = () => {
    return window.location.origin;
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const siteUrl = getSiteUrl();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            avatar_url: null,
          },
          emailRedirectTo: `${siteUrl}/login`,
        }
      });
      if (error) throw error;
      toast({
        title: 'Registration successful',
        description: `Welcome, ${name}! Please check your email to verify your account.`,
      });
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      const isFetchError = error.message?.includes('Failed to fetch') || error.message?.includes('fetch');
      toast({
        title: isFetchError ? 'Authentication Server Unavailable' : 'Registration Error',
        description: isFetchError
          ? 'Could not connect to Supabase authentication server. Click "Continue as Demo Researcher" below to test the platform.'
          : error.message || 'An error occurred during registration',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setLoading(true);
    try {
      const siteUrl = getSiteUrl();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/reset-password`,
      });
      if (error) throw error;
      toast({
        title: 'Reset link sent',
        description: 'If an account exists with that email, you will receive a password reset link shortly.',
      });
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send reset link',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    isDemo,
    logout,
    register,
    resetPassword,
    loginAsDemo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};