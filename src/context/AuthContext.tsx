import * as React from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const { toast } = useToast();

  const getSiteUrl = () => {
    return window.location.origin;
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();
      
      if (roleError) throw roleError;

      if (profileData && roleData) {
        setProfile({
          id: profileData.id,
          full_name: profileData.full_name,
          username: profileData.username,
          avatar_url: profileData.avatar_url,
          role: roleData.role
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  React.useEffect(() => {
    setIsLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchUserProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({
        title: 'Login successful',
        description: `Welcome back!`,
      });
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
      return false;
    } finally {
      // The onAuthStateChange listener will handle setting isLoading to false
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong during logout',
        variant: 'destructive',
      });
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
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
      toast({
        title: 'Registration error',
        description: error.message || 'An error occurred during registration',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      session, 
      isLoading, 
      login, 
      logout, 
      register,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}
