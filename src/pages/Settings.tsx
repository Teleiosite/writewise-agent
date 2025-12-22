import * as React from "react";
import { HomeLayout } from "@/components/layout/HomeLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

const AIPROVIDER_OPTIONS = ["OpenAI", "DeepSeek", "Grok", "Gemini"];

export default function Settings() {
  const [apiProvider, setApiProvider] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const { logout } = useAuth();

  React.useEffect(() => {
    const savedApiProvider = localStorage.getItem("apiProvider");
    const savedApiKey = localStorage.getItem("apiKey");

    if (savedApiProvider) {
      setApiProvider(savedApiProvider);
    }

    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleProviderChange = (value: string) => {
    setApiProvider(value);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiProvider || !apiKey) {
      toast({
        title: "Missing information",
        description: "Please select an AI provider and enter your API key.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      localStorage.setItem("apiProvider", apiProvider);
      localStorage.setItem("apiKey", apiKey);
      
      setIsSubmitting(false);
      
      toast({
        title: "Settings saved",
        description: "Your API settings have been saved successfully.",
      });
    }, 1500);
  };

  return (
    <HomeLayout showWelcomeBanner={false}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Settings</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="apiProvider" className="block text-sm font-medium mb-1">
                AI Provider
              </label>
              <Select onValueChange={handleProviderChange} value={apiProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an AI Provider" />
                </SelectTrigger>
                <SelectContent>
                  {AIPROVIDER_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium mb-1">
                API Key
              </label>
              <Input
                id="apiKey"
                name="apiKey"
                type="password"
                value={apiKey}
                onChange={handleApiKeyChange}
                required
              />
            </div>
          </div>
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving..." : "Save Settings"}
          </Button>
        </form>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Authentication</h2>
          <div className="p-6 border rounded-lg">
            <p className="mb-4">
              You are currently logged in. Click the button below to log out.
            </p>
            <Button onClick={logout} variant="destructive">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}
