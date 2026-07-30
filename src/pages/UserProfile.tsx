import React, { useState, useEffect } from "react";
import { HomeLayout } from "@/components/layout/HomeLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card, CardContent, CardDescription,
  CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Bell, Shield, Settings, Save, Loader2, KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function UserProfile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "",
    email: user?.email ?? "",
    bio: "",
    avatar_url: "",
  });

  const [preferences, setPreferences] = useState({
    email_notifications: true,
    ai_suggestions: true,
    font_size: [16] as number[],
    auto_save: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) { setIsLoading(false); return; }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          full_name: data.full_name ?? user.user_metadata?.full_name ?? "",
          email: user.email ?? "",
          bio: data.bio ?? "",
          avatar_url: data.avatar_url ?? "",
        });
        setPreferences({
          email_notifications: data.email_notifications ?? true,
          ai_suggestions: data.ai_suggestions ?? true,
          font_size: [data.font_size ?? 16],
          auto_save: data.auto_save ?? true,
        });
      } else if (error) {
        console.error("Error fetching profile:", error);
      }
      setIsLoading(false);
    };
    fetchProfile();
  }, [user?.id]);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      full_name: profile.full_name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated", description: "Your profile has been saved successfully." });
    }
    setIsSaving(false);
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setIsSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email_notifications: preferences.email_notifications,
      ai_suggestions: preferences.ai_suggestions,
      font_size: preferences.font_size[0],
      auto_save: preferences.auto_save,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      toast({ title: "Error saving preferences", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Preferences updated", description: "Your preferences have been saved successfully." });
    }
    setIsSaving(false);
  };

  const togglePref = (key: "email_notifications" | "ai_suggestions" | "auto_save") => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChangePassword = async () => {
    const { newPassword, confirmPassword } = passwordForm;
    if (!newPassword || !confirmPassword) {
      toast({ title: "Missing fields", description: "Please fill in both password fields.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "New password and confirmation must match.", variant: "destructive" });
      return;
    }
    setIsChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Error updating password", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "Your password has been changed successfully." });
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    }
    setIsChangingPassword(false);
  };

  if (isLoading) {
    return (
      <HomeLayout showWelcomeBanner={false}>
        <div className="flex items-center justify-center h-64 font-mono text-xs text-zinc-500 uppercase">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-black dark:text-white" />
          Loading Profile...
        </div>
      </HomeLayout>
    );
  }

  return (
    <HomeLayout showWelcomeBanner={false}>
      <div className="max-w-2xl mx-auto py-6 font-sans space-y-6">
        <div className="border-b border-black dark:border-zinc-800 pb-4">
          <span className="mono-badge mb-2">Researcher Credentials</span>
          <h1 className="text-2xl font-extrabold tracking-tight text-black dark:text-white mt-1">Researcher Profile & Preferences</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Manage personal academic identity, editor configuration, and authentication credentials.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full grid grid-cols-3 rounded-none border border-black dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 p-1 font-mono text-xs">
            <TabsTrigger value="profile" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black uppercase tracking-wider font-bold">
              <User className="h-3.5 w-3.5 mr-1.5" /> Profile
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black uppercase tracking-wider font-bold">
              <Settings className="h-3.5 w-3.5 mr-1.5" /> Preferences
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-none data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black uppercase tracking-wider font-bold">
              <Shield className="h-3.5 w-3.5 mr-1.5" /> Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black shadow-none">
              <CardHeader className="border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-black dark:text-white uppercase font-mono">
                  <User className="h-4 w-4" /> Academic Identity
                </CardTitle>
                <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400">Update researcher name and academic bio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <label htmlFor="full_name" className="text-xs font-mono uppercase font-bold text-black dark:text-white">Full Name</label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={profile.full_name}
                    onChange={handleProfileChange}
                    placeholder="Dr. Jane Doe"
                    className="rounded-none border-black dark:border-zinc-800 text-xs font-mono bg-white dark:bg-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-mono uppercase font-bold text-black dark:text-white">Email Address</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="rounded-none border-zinc-300 dark:border-zinc-800 text-xs font-mono bg-zinc-100 dark:bg-zinc-900 opacity-70"
                  />
                  <p className="text-[11px] text-zinc-500 font-mono">Email authentication key is tied to your login identity.</p>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="bio" className="text-xs font-mono uppercase font-bold text-black dark:text-white">Research Focus / Bio</label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profile.bio}
                    onChange={handleProfileChange}
                    placeholder="e.g. Quantitative Researcher in Behavioral Economics & Empirical Finance..."
                    className="rounded-none border-black dark:border-zinc-800 text-xs font-mono min-h-[100px] bg-white dark:bg-black"
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t border-black dark:border-zinc-800 pt-4 flex justify-end">
                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isSaving}
                  className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider px-6 border border-black dark:border-white"
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                  Save Profile
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card className="rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black shadow-none">
              <CardHeader className="border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-black dark:text-white uppercase font-mono">
                  <Settings className="h-4 w-4" /> Canvas & Notification Options
                </CardTitle>
                <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400">Configure editor parameters and automated alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="space-y-3">
                  <span className="mono-badge">Notifications</span>
                  <div className="flex items-center justify-between p-3 border border-black dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-zinc-500" />
                      <span className="text-xs font-mono">Email Report Digest</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`rounded-none font-mono text-xs uppercase ${preferences.email_notifications ? "bg-black text-white dark:bg-white dark:text-black" : ""}`}
                      onClick={() => togglePref("email_notifications")}
                    >
                      {preferences.email_notifications ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="mono-badge">Editor Environment</span>
                  <div className="space-y-2 p-3 border border-black dark:border-zinc-800">
                    <span className="text-xs font-mono uppercase font-bold">Editor Font Size ({preferences.font_size[0]}px)</span>
                    <Slider
                      defaultValue={preferences.font_size}
                      max={24}
                      min={12}
                      step={1}
                      onValueChange={v => setPreferences(p => ({ ...p, font_size: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border border-black dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-zinc-500" />
                      <span className="text-xs font-mono">Real-time Grammar Guidance</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`rounded-none font-mono text-xs uppercase ${preferences.ai_suggestions ? "bg-black text-white dark:bg-white dark:text-black" : ""}`}
                      onClick={() => togglePref("ai_suggestions")}
                    >
                      {preferences.ai_suggestions ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-black dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4 text-zinc-500" />
                      <span className="text-xs font-mono">Auto-Save Document Canvas</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`rounded-none font-mono text-xs uppercase ${preferences.auto_save ? "bg-black text-white dark:bg-white dark:text-black" : ""}`}
                      onClick={() => togglePref("auto_save")}
                    >
                      {preferences.auto_save ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-black dark:border-zinc-800 pt-4 flex justify-end">
                <Button 
                  onClick={handleSavePreferences} 
                  disabled={isSaving}
                  className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider px-6 border border-black dark:border-white"
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black shadow-none">
              <CardHeader className="border-b border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-black dark:text-white uppercase font-mono">
                  <Shield className="h-4 w-4" /> Password & Access Control
                </CardTitle>
                <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400">Update workspace authentication password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <label htmlFor="new-password" className="text-xs font-mono uppercase font-bold text-black dark:text-white">New Password</label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Minimum 8 characters..."
                    className="rounded-none border-black dark:border-zinc-800 text-xs font-mono bg-white dark:bg-black"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="confirm-password" className="text-xs font-mono uppercase font-bold text-black dark:text-white">Confirm New Password</label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Re-enter new password..."
                    className="rounded-none border-black dark:border-zinc-800 text-xs font-mono bg-white dark:bg-black"
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t border-black dark:border-zinc-800 pt-4 flex justify-end">
                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider px-6 border border-black dark:border-white"
                >
                  {isChangingPassword ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5 mr-1.5" />}
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </HomeLayout>
  );
}
