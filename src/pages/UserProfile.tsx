
import React, { useState } from "react";
import { HomeLayout } from "@/components/layout/HomeLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { User, Mail, Bell, Shield, Settings, Save } from "lucide-react";

export default function UserProfile() {
  const { toast } = useToast();
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    bio: "I'm a writer and researcher using Writewise to improve my academic papers.",
    avatar: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    aiSuggestions: true,
    fontSize: [16],
    autoSave: true,
  });

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    // In a real app, this would save to a backend
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleFontSizeChange = (value: number[]) => {
    setPreferences(prev => ({ ...prev, fontSize: value }));
  };

  const togglePreference = (key: keyof typeof preferences) => {
    if (typeof preferences[key] === 'boolean') {
      setPreferences(prev => ({ 
        ...prev, 
        [key]: !prev[key] 
      }));
    }
  };

  const handleSavePreferences = () => {
    // In a real app, this would save to a backend
    toast({
      title: "Preferences updated",
      description: "Your preferences have been saved successfully.",
    });
  };

  return (
    <HomeLayout showWelcomeBanner={false}>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">User Profile</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={user.name}
                    onChange={handleUserChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={user.email}
                    onChange={handleUserChange}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    Bio
                  </label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={user.bio}
                    onChange={handleUserChange}
                    placeholder="Tell us about yourself"
                    className="min-h-[120px]"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveProfile} className="ml-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Application Preferences
                </CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Notifications</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>Email Notifications</span>
                    </div>
                    <Button 
                      variant={preferences.emailNotifications ? "default" : "outline"}
                      onClick={() => togglePreference('emailNotifications')}
                    >
                      {preferences.emailNotifications ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Editor Settings</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Font Size ({preferences.fontSize[0]}px)</span>
                    </div>
                    <Slider
                      defaultValue={preferences.fontSize}
                      max={24}
                      min={12}
                      step={1}
                      onValueChange={handleFontSizeChange}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span>AI Writing Suggestions</span>
                    </div>
                    <Button 
                      variant={preferences.aiSuggestions ? "default" : "outline"}
                      onClick={() => togglePreference('aiSuggestions')}
                    >
                      {preferences.aiSuggestions ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Save className="h-4 w-4 text-muted-foreground" />
                      <span>Auto-Save Documents</span>
                    </div>
                    <Button 
                      variant={preferences.autoSave ? "default" : "outline"}
                      onClick={() => togglePreference('autoSave')}
                    >
                      {preferences.autoSave ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSavePreferences} className="ml-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="current-password" className="text-sm font-medium">
                    Current Password
                  </label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm font-medium">
                    New Password
                  </label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <Input id="confirm-password" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="mr-2">
                  Cancel
                </Button>
                <Button>
                  Update Password
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </HomeLayout>
  );
}
