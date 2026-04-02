import * as React from "react";
import { HomeLayout } from "@/components/layout/HomeLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Key, Cpu, ExternalLink, Trash2 } from "lucide-react";

// ─── Provider / Model catalogue ─────────────────────────────────────────────

interface ProviderMeta {
  label: string;
  color: string;
  docsUrl: string;
  models: { value: string; label: string }[];
}

const PROVIDERS: Record<string, ProviderMeta> = {
  OpenAI: {
    label: "OpenAI",
    color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    docsUrl: "https://platform.openai.com/api-keys",
    models: [
      { value: "gpt-4o-mini",   label: "GPT-4o Mini  (fast · recommended)" },
      { value: "gpt-4o",        label: "GPT-4o  (most capable)" },
      { value: "gpt-4-turbo",   label: "GPT-4 Turbo" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo  (legacy)" },
    ],
  },
  Gemini: {
    label: "Google Gemini",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    docsUrl: "https://aistudio.google.com/apikey",
    models: [
      { value: "gemini-2.0-flash",   label: "Gemini 2.0 Flash  (fast · recommended)" },
      { value: "gemini-1.5-flash",   label: "Gemini 1.5 Flash" },
      { value: "gemini-1.5-pro",     label: "Gemini 1.5 Pro  (most capable)" },
    ],
  },
  Claude: {
    label: "Anthropic Claude",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    docsUrl: "https://console.anthropic.com/settings/keys",
    models: [
      { value: "claude-3-5-haiku-20241022",  label: "Claude 3.5 Haiku  (fast · recommended)" },
      { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet  (most capable)" },
      { value: "claude-3-haiku-20240307",    label: "Claude 3 Haiku  (legacy)" },
    ],
  },
  Grok: {
    label: "xAI Grok",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    docsUrl: "https://console.x.ai",
    models: [
      { value: "grok-2-latest", label: "Grok 2  (recommended)" },
      { value: "grok-beta",     label: "Grok Beta  (legacy)" },
    ],
  },
  DeepSeek: {
    label: "DeepSeek",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    docsUrl: "https://platform.deepseek.com/api_keys",
    models: [
      { value: "deepseek-chat",     label: "DeepSeek Chat  (recommended)" },
      { value: "deepseek-reasoner", label: "DeepSeek Reasoner  (CoT)" },
    ],
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function Settings() {
  const { toast } = useToast();
  const { logout } = useAuth();

  const [apiProvider, setApiProvider] = React.useState("");
  const [apiModel, setApiModel]       = React.useState("");
  const [apiKey, setApiKey]           = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [testStatus, setTestStatus] = React.useState<{
    status: "idle" | "testing" | "success" | "error";
    message?: string;
  }>({ status: "idle" });

  // Help detect suspicious key formats
  const isGeminiKeyFormatValid = apiProvider === "Gemini" ? apiKey.trim().startsWith("AIza") : true;

  // Load saved settings on mount
  React.useEffect(() => {
    const savedProvider = localStorage.getItem("apiProvider") ?? "";
    const savedModel    = localStorage.getItem("apiModel")    ?? "";
    const savedKey      = localStorage.getItem("apiKey")      ?? "";
    setApiProvider(savedProvider);
    setApiModel(savedModel);
    setApiKey(savedKey);
  }, []);

  // When provider changes, reset model to the first option for that provider
  const handleProviderChange = (value: string) => {
    setApiProvider(value);
    setApiModel(PROVIDERS[value]?.models[0]?.value ?? "");
  };

  const handleClearSettings = () => {
    localStorage.removeItem("apiProvider");
    localStorage.removeItem("apiModel");
    localStorage.removeItem("apiKey");
    setApiProvider("");
    setApiModel("");
    setApiKey("");
    setTestStatus({ status: "idle" });
    toast({ title: "Settings cleared", description: "Your AI configuration has been removed." });
  };

  const handleTestConnection = async () => {
    if (!apiProvider || !apiKey || !apiModel) {
      toast({
        title: "Missing information",
        description: "Please select a provider and model, and enter your API key to test.",
        variant: "destructive",
      });
      return;
    }

    setTestStatus({ status: "testing" });
    
    try {
      const { testAiConnection } = await import("@/services/api-client");
      const result = await testAiConnection(apiProvider, apiKey, apiModel);
      
      setTestStatus({
        status: result.success ? "success" : "error",
        message: result.message
      });

      if (!result.success) {
        toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Your API key is valid and working!",
        });
      }
    } catch (err: any) {
      setTestStatus({ status: "error", message: err.message });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!apiProvider || !apiKey || !apiModel) {
      toast({
        title: "Missing information",
        description: "Please select a provider, model, and enter your API key.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    localStorage.setItem("apiProvider", apiProvider.trim());
    localStorage.setItem("apiModel",    apiModel.trim());
    localStorage.setItem("apiKey",      apiKey.trim());
    setApiKey(apiKey.trim()); // update display
    setIsSubmitting(false);

    toast({
      title: "Settings saved",
      description: `Using ${PROVIDERS[apiProvider]?.label} · ${apiModel}`,
    });
  };

  const selectedProvider = PROVIDERS[apiProvider];
  const isConfigured = !!(localStorage.getItem("apiProvider") && localStorage.getItem("apiKey"));

  return (
    <HomeLayout showWelcomeBanner={false}>
      <div className="max-w-2xl mx-auto py-4 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-1">AI Settings</h1>
          <p className="text-muted-foreground text-sm">
            Configure which AI provider and model powers your writing assistant, AI Detector, Text Humanizer, and all other AI features.
            {" "}No key? The app uses a free fallback automatically.
          </p>
        </div>

        {/* Current status badge */}
        {isConfigured && (
          <div className="flex items-center gap-2 p-3 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <span className="text-sm text-green-800 dark:text-green-300">
              Active: <strong>{PROVIDERS[localStorage.getItem("apiProvider")!]?.label ?? localStorage.getItem("apiProvider")}</strong>
              {" · "}
              <code className="text-xs">{localStorage.getItem("apiModel")}</code>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-green-700 hover:text-red-600 h-7 px-2"
              onClick={handleClearSettings}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          </div>
        )}

        {/* Config form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6 border rounded-xl bg-card shadow-sm">

          {/* Provider selector */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Cpu className="h-4 w-4" />
              AI Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(PROVIDERS).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleProviderChange(key)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all
                    ${apiProvider === key
                      ? "border-primary ring-1 ring-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/40"}`}
                >
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${meta.color}`}>
                    {key === "OpenAI" ? "GPT" : key === "DeepSeek" ? "DS" : key.slice(0, 2)}
                  </span>
                  <span className="text-sm font-medium truncate">{meta.label}</span>
                  {apiProvider === key && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary ml-auto shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Model selector — only shown once provider is picked */}
          {selectedProvider && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Model</label>
              <Select value={apiModel} onValueChange={setApiModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProvider.models.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Key className="h-4 w-4" />
                API Key
              </label>
              {selectedProvider && (
                <a
                  href={selectedProvider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                >
                  Get API key
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <Input
              id="apiKey"
              type="password"
              placeholder={selectedProvider ? `Paste your ${selectedProvider.label} key here` : "Select a provider first"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestStatus({ status: "idle" }); // reset test status on change
              }}
              disabled={!apiProvider}
              className={!isGeminiKeyFormatValid ? "border-orange-500 focus-visible:ring-orange-500" : ""}
            />
            {!isGeminiKeyFormatValid && (
              <p className="text-xs text-orange-600 font-medium">
                Note: Gemini keys usually start with "AIza". Please double check your key.
              </p>
            )}
            {testStatus.status === "error" && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 mt-2">
                <p className="text-xs text-red-600 dark:text-red-400 font-mono whitespace-pre-wrap">
                  Error: {testStatus.message}
                </p>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Your key is stored only in your browser's localStorage and is sent server-side through our secure proxy — never exposed in the browser.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={testStatus.status === "testing" || !apiProvider || !apiKey}
              onClick={handleTestConnection}
              className="flex-1"
            >
              {testStatus.status === "testing" ? "Testing..." : 
               testStatus.status === "success" ? "Connection Verified!" : 
               "Test Connection"}
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting || !apiProvider || !apiKey || !apiModel}
              className="flex-1"
            >
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>

        {/* Free fallback info */}
        <div className="p-4 rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">No API key? No problem.</p>
          <p>
            WriteWise automatically falls back to a free AI service (Pollinations.ai) when no key is configured.
            It's slower and less capable, but requires zero setup.
          </p>
        </div>

        {/* Auth section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Authentication</h2>
          <div className="p-6 border rounded-xl bg-card">
            <p className="mb-4 text-sm text-muted-foreground">
              You are currently logged in. Click below to sign out.
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
