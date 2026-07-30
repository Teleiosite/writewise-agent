import * as React from "react";
import { HomeLayout } from "@/components/layout/HomeLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Key, Cpu, ExternalLink, Trash2 } from "lucide-react";

interface ProviderMeta {
  label: string;
  code: string;
  docsUrl: string;
  models: { value: string; label: string }[];
}

const PROVIDERS: Record<string, ProviderMeta> = {
  OpenAI: {
    label: "OpenAI",
    code: "GPT",
    docsUrl: "https://platform.openai.com/api-keys",
    models: [
      { value: "gpt-4o-mini",   label: "GPT-4o Mini (fast · recommended)" },
      { value: "gpt-4o",        label: "GPT-4o (most capable)" },
      { value: "gpt-4-turbo",   label: "GPT-4 Turbo" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (legacy)" },
    ],
  },
  Gemini: {
    label: "Google Gemini",
    code: "GEM",
    docsUrl: "https://aistudio.google.com/apikey",
    models: [
      { value: "gemini-3.1-flash-preview",      label: "Gemini 3.1 Flash (Preview) · Recommended" },
      { value: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash-Lite (Preview)" },
      { value: "gemini-2.5-flash",              label: "Gemini 2.5 Flash (Stable)" },
      { value: "gemini-2.5-pro",                label: "Gemini 2.5 Pro (Experimental)" },
      { value: "gemini-1.5-flash",              label: "Gemini 1.5 Flash (Legacy)" },
    ],
  },
  Claude: {
    label: "Anthropic Claude",
    code: "ANT",
    docsUrl: "https://console.anthropic.com/settings/keys",
    models: [
      { value: "claude-3-5-haiku-20241022",  label: "Claude 3.5 Haiku (fast · recommended)" },
      { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (most capable)" },
      { value: "claude-3-haiku-20240307",    label: "Claude 3 Haiku (legacy)" },
    ],
  },
  Grok: {
    label: "xAI Grok",
    code: "GROK",
    docsUrl: "https://console.x.ai",
    models: [
      { value: "grok-2-latest", label: "Grok 2 (recommended)" },
      { value: "grok-beta",     label: "Grok Beta (legacy)" },
    ],
  },
  DeepSeek: {
    label: "DeepSeek",
    code: "DS",
    docsUrl: "https://platform.deepseek.com/api_keys",
    models: [
      { value: "deepseek-chat",     label: "DeepSeek Chat (recommended)" },
      { value: "deepseek-reasoner", label: "DeepSeek Reasoner (CoT)" },
    ],
  },
};

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

  const isGeminiKeyFormatValid = apiProvider === "Gemini" ? apiKey.trim().startsWith("AIza") : true;

  React.useEffect(() => {
    const savedProvider = localStorage.getItem("apiProvider") ?? "";
    const savedModel    = localStorage.getItem("apiModel")    ?? "";
    const savedKey      = localStorage.getItem("apiKey")      ?? "";
    setApiProvider(savedProvider);
    setApiModel(savedModel);
    setApiKey(savedKey);
  }, []);

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
      
      let displayMessage = result.message;
      if (!result.success && result.message.includes("limit: 0") && apiModel.includes("2.0")) {
        displayMessage += "\n\n💡 TIP: Your account may have a '0' rate limit for Gemini 2.0. Switch to 'Gemini 1.5 Flash' above.";
      }

      setTestStatus({
        status: result.success ? "success" : "error",
        message: displayMessage
      });

      if (!result.success) {
        toast({
          title: "Connection Failed",
          description: "See the error message below for details.",
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
    setApiKey(apiKey.trim());
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
      <div className="max-w-2xl mx-auto py-6 space-y-8 font-sans">

        {/* Header */}
        <div className="border-b border-black dark:border-zinc-800 pb-4">
          <span className="mono-badge mb-2">Workspace Configuration</span>
          <h1 className="text-2xl font-extrabold tracking-tight text-black dark:text-white mt-1">AI Engine Settings</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
            Configure the LLM engine for Python narrative generation, literature synthesis, and statistical explanations.
          </p>
        </div>

        {/* Current status badge */}
        {isConfigured && (
          <div className="flex items-center gap-3 p-4 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-mono text-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="uppercase tracking-wider font-bold">
              Active Engine: {PROVIDERS[localStorage.getItem("apiProvider")!]?.label ?? localStorage.getItem("apiProvider")}
              {" · "}
              <code className="text-zinc-300 dark:text-zinc-700">{localStorage.getItem("apiModel")}</code>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-zinc-400 hover:text-white dark:hover:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-7 px-2 font-mono text-xs uppercase"
              onClick={handleClearSettings}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          </div>
        )}

        {/* Config form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6 border border-black dark:border-zinc-800 bg-white dark:bg-black">

          {/* Provider selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 text-black dark:text-white">
              <Cpu className="h-4 w-4" />
              1. Select AI Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
              {Object.entries(PROVIDERS).map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleProviderChange(key)}
                  className={`flex items-center gap-2.5 p-3 border text-left transition-all ${
                    apiProvider === key
                      ? "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-bold"
                      : "border-zinc-300 dark:border-zinc-800 bg-white dark:bg-black text-black dark:text-white hover:border-black dark:hover:border-white"
                  }`}
                >
                  <span className={`text-[10px] px-1.5 py-0.5 border ${
                    apiProvider === key
                      ? "border-white dark:border-black bg-white text-black dark:bg-black dark:text-white"
                      : "border-black dark:border-white bg-black text-white dark:bg-white dark:text-black"
                  }`}>
                    {meta.code}
                  </span>
                  <span className="text-xs truncate">{meta.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Model selector */}
          {selectedProvider && (
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider font-bold text-black dark:text-white">
                2. Model Engine Architecture
              </label>
              <Select value={apiModel} onValueChange={setApiModel}>
                <SelectTrigger className="rounded-none border-black dark:border-zinc-800 font-mono text-xs">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-black dark:border-zinc-800 font-mono text-xs">
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 text-black dark:text-white">
                <Key className="h-4 w-4" />
                3. API Credentials
              </label>
              {selectedProvider && (
                <a
                  href={selectedProvider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-zinc-600 dark:text-zinc-400 flex items-center gap-1 hover:underline uppercase"
                >
                  Get API Key
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <Input
              id="apiKey"
              type="password"
              placeholder={selectedProvider ? `Paste ${selectedProvider.label} API Key...` : "Select a provider first"}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestStatus({ status: "idle" });
              }}
              disabled={!apiProvider}
              className="rounded-none border-black dark:border-zinc-800 font-mono text-xs focus:ring-1 focus:ring-black dark:focus:ring-white bg-white dark:bg-black"
            />
            {!isGeminiKeyFormatValid && (
              <p className="text-xs text-orange-600 font-mono">
                Note: Google Gemini API keys typically begin with "AIza".
              </p>
            )}
            {testStatus.status === "error" && (
              <div className="p-3 border border-red-600 bg-red-50 dark:bg-red-950/40 text-xs text-red-900 dark:text-red-200 font-mono">
                <p className="font-bold uppercase">Connection Failure:</p>
                <p className="mt-1 whitespace-pre-wrap">{testStatus.message}</p>
              </div>
            )}
            <p className="text-[11px] text-zinc-500 font-mono">
              Your API keys are stored strictly in client browser memory (localStorage) and never transmitted to third-party databases.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 font-mono">
            <Button
              type="button"
              variant="outline"
              disabled={testStatus.status === "testing" || !apiProvider || !apiKey}
              onClick={handleTestConnection}
              className="flex-1 rounded-none border-black dark:border-zinc-800 text-xs uppercase tracking-wider"
            >
              {testStatus.status === "testing" ? "Testing..." : 
               testStatus.status === "success" ? "Verified ✓" : 
               "Test Connection"}
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting || !apiProvider || !apiKey || !apiModel}
              className="flex-1 rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs uppercase tracking-wider border border-black dark:border-white"
            >
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>

        {/* Auth section */}
        <div className="border border-black dark:border-zinc-800 p-6 bg-white dark:bg-black font-sans">
          <span className="mono-badge mb-2">Account Management</span>
          <h2 className="text-lg font-bold text-black dark:text-white mt-1">Session & Authentication</h2>
          <p className="my-2 text-xs text-zinc-600 dark:text-zinc-400">
            You are currently authenticated in WriteWise Workspace.
          </p>
          <Button 
            onClick={logout} 
            variant="outline" 
            className="rounded-none border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 font-mono text-xs uppercase tracking-wider"
          >
            Log Out Account
          </Button>
        </div>
      </div>
    </HomeLayout>
  );
}
