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
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Key, Cpu, ExternalLink, Trash2, Sparkles, ShieldCheck } from "lucide-react";

interface ProviderMeta {
  label: string;
  code: string;
  docsUrl: string;
  models: { value: string; label: string }[];
}

const PROVIDERS: Record<string, ProviderMeta> = {
  Gemini: {
    label: "Google Gemini",
    code: "GEM",
    docsUrl: "https://aistudio.google.com/apikey",
    models: [
      { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Fast · Recommended · Default)" },
      { value: "gemini-2.5-pro",   label: "Gemini 2.5 Pro (Deep Reasoning)" },
      { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
      { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
      { value: "gemini-1.5-pro",   label: "Gemini 1.5 Pro" },
    ],
  },
  Claude: {
    label: "Anthropic Claude",
    code: "ANT",
    docsUrl: "https://console.anthropic.com/settings/keys",
    models: [
      { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (Most Capable Academic Prose)" },
      { value: "claude-3-5-haiku-20241022",  label: "Claude 3.5 Haiku (Fast)" },
      { value: "claude-3-haiku-20240307",    label: "Claude 3 Haiku (Legacy)" },
    ],
  },
  OpenAI: {
    label: "OpenAI",
    code: "GPT",
    docsUrl: "https://platform.openai.com/api-keys",
    models: [
      { value: "gpt-4o",        label: "GPT-4o (Multimodal & Analytical)" },
      { value: "gpt-4o-mini",   label: "GPT-4o Mini (Fast)" },
      { value: "gpt-4-turbo",   label: "GPT-4 Turbo" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Legacy)" },
    ],
  },
  DeepSeek: {
    label: "DeepSeek",
    code: "DS",
    docsUrl: "https://platform.deepseek.com/api_keys",
    models: [
      { value: "deepseek-chat",     label: "DeepSeek Chat (Recommended)" },
      { value: "deepseek-reasoner", label: "DeepSeek Reasoner (Chain-of-Thought)" },
    ],
  },
  Grok: {
    label: "xAI Grok",
    code: "GROK",
    docsUrl: "https://console.x.ai",
    models: [
      { value: "grok-2-latest", label: "Grok 2 (Recommended)" },
      { value: "grok-beta",     label: "Grok Beta (Legacy)" },
    ],
  },
};

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [apiProvider, setApiProvider] = React.useState("");
  const [apiModel, setApiModel]       = React.useState("");
  const [apiKey, setApiKey]           = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [testStatus, setTestStatus] = React.useState<{
    status: "idle" | "testing" | "success" | "error";
    message?: string;
  }>({ status: "idle" });

  const isGeminiKeyFormatValid = apiProvider === "Gemini" ? apiKey.trim().startsWith("AIza") : true;

  // Load settings on mount (from Supabase if user exists, else fallback to localStorage)
  React.useEffect(() => {
    const loadSettings = async () => {
      let savedProvider = localStorage.getItem("apiProvider") ?? "";
      let savedModel    = localStorage.getItem("apiModel")    ?? "";
      let savedKey      = localStorage.getItem("apiKey")      ?? "";

      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_api_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (data && !error) {
            savedProvider = data.provider || savedProvider;
            savedModel = data.model || savedModel;
            savedKey = data.api_key || savedKey;
          }
        } catch {
          // fallback to localStorage
        }
      }

      setApiProvider(savedProvider);
      setApiModel(savedModel);
      setApiKey(savedKey);
    };

    loadSettings();
  }, [user]);

  const handleProviderChange = (value: string) => {
    setApiProvider(value);
    setApiModel(PROVIDERS[value]?.models[0]?.value ?? "");
  };

  const handleClearSettings = async () => {
    localStorage.removeItem("apiProvider");
    localStorage.removeItem("apiModel");
    localStorage.removeItem("apiKey");
    setApiProvider("");
    setApiModel("");
    setApiKey("");
    setTestStatus({ status: "idle" });

    if (user) {
      try {
        await supabase
          .from('user_api_settings')
          .delete()
          .eq('user_id', user.id);
      } catch {
        // ignore
      }
    }

    toast({ 
      title: "Custom Key Cleared", 
      description: "Workspace reverted to WriteWise default Google Gemini engine." 
    });
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
          description: "See the error message below for details.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Verified",
          description: `Your ${PROVIDERS[apiProvider]?.label || apiProvider} key is authenticated and working!`,
        });
      }
    } catch (err: any) {
      setTestStatus({ status: "error", message: err.message });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    const cleanProvider = apiProvider.trim();
    const cleanModel = apiModel.trim();
    const cleanKey = apiKey.trim();

    localStorage.setItem("apiProvider", cleanProvider);
    localStorage.setItem("apiModel",    cleanModel);
    localStorage.setItem("apiKey",      cleanKey);

    if (user) {
      try {
        await supabase
          .from('user_api_settings')
          .upsert({
            user_id: user.id,
            provider: cleanProvider,
            model: cleanModel,
            api_key: cleanKey,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      } catch (err: any) {
        console.warn('Supabase sync warning:', err);
      }
    }

    setIsSubmitting(false);

    toast({
      title: "AI Engine Configured",
      description: `Active model: ${PROVIDERS[cleanProvider]?.label ?? cleanProvider} · ${cleanModel}`,
    });
  };

  const isCustomConfigured = !!(apiKey && apiProvider);
  const selectedProvider = PROVIDERS[apiProvider];

  return (
    <HomeLayout showWelcomeBanner={false}>
      <div className="max-w-2xl mx-auto py-6 space-y-8 font-sans">

        {/* Header */}
        <div className="border-b border-black dark:border-zinc-800 pb-4">
          <span className="mono-badge mb-2">Workspace Configuration</span>
          <h1 className="text-2xl font-extrabold tracking-tight text-black dark:text-white mt-1">AI Engine & Model Routing</h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
            Configure the LLM engine for Python narrative generation, literature synthesis, and statistical explanations.
          </p>
        </div>

        {/* Current status banner */}
        {isCustomConfigured ? (
          <div className="flex items-center gap-3 p-4 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black font-mono text-xs">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="uppercase tracking-wider font-bold">
              Custom Key Active: {PROVIDERS[apiProvider]?.label ?? apiProvider}
              {" · "}
              <code className="text-zinc-300 dark:text-zinc-700">{apiModel}</code>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-zinc-400 hover:text-white dark:hover:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-none h-7 px-2 font-mono text-xs uppercase"
              onClick={handleClearSettings}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Revert to Default
            </Button>
          </div>
        ) : (
          <div className="p-4 border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-black dark:text-white uppercase">
              <Sparkles className="h-4 w-4" />
              <span>Default Active Engine: Google Gemini 2.5 Flash</span>
            </div>
            <p className="text-[11px] font-sans text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Your workspace is automatically connected to WriteWise's complimentary hosted Gemini 2.5 Flash engine. No API key setup is required to run statistical analyses or write dissertation chapters.
            </p>
          </div>
        )}

        {/* Config form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6 border border-black dark:border-zinc-800 bg-white dark:bg-black">
          <div>
            <span className="mono-badge-outline mb-2">Bring Your Own Key (Optional)</span>
            <h2 className="text-sm font-bold uppercase font-mono tracking-wider text-black dark:text-white">Connect Custom Provider</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Want to use Anthropic Claude 3.5 Sonnet, OpenAI GPT-4o, DeepSeek, or Grok? Select your provider below.
            </p>
          </div>

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
          {apiProvider && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider font-bold flex items-center gap-1.5 text-black dark:text-white">
                  <Key className="h-4 w-4" />
                  3. {selectedProvider?.label} API Key
                </label>
                {selectedProvider?.docsUrl && (
                  <a
                    href={selectedProvider.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-1"
                  >
                    Get API Key <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <Input
                type="password"
                placeholder={apiProvider === "Gemini" ? "AIzaSy..." : "sk-..."}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestStatus({ status: "idle" });
                }}
                className="font-mono text-xs rounded-none border-black dark:border-zinc-800 bg-white dark:bg-black focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
              {!isGeminiKeyFormatValid && (
                <p className="text-[11px] font-mono text-amber-600 dark:text-amber-400">
                  Google Gemini keys typically start with "AIza". Check your key from Google AI Studio.
                </p>
              )}
            </div>
          )}

          {/* Test Status Banner */}
          {testStatus.status !== "idle" && (
            <div
              className={`p-3 border font-mono text-xs whitespace-pre-line ${
                testStatus.status === "testing"
                  ? "border-zinc-400 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                  : testStatus.status === "success"
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200"
                  : "border-red-600 bg-red-50 dark:bg-red-950 text-red-800 dark:text-red-200"
              }`}
            >
              {testStatus.status === "testing" && "Testing API connection with selected model..."}
              {testStatus.status === "success" && (testStatus.message || "Connection verified successfully!")}
              {testStatus.status === "error" && (testStatus.message || "Connection failed. Please check your credentials.")}
            </div>
          )}

          {/* Action buttons */}
          {apiProvider && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={testStatus.status === "testing" || !apiKey}
                className="rounded-none border-black dark:border-zinc-800 font-mono text-xs uppercase tracking-wider flex-1"
              >
                Test Connection
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !apiKey}
                className="rounded-none bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-mono text-xs uppercase tracking-wider border border-black dark:border-white flex-1"
              >
                Save Configuration
              </Button>
            </div>
          )}
        </form>

        {/* Security & Data Integrity Note */}
        <div className="p-4 border border-black dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold uppercase text-black dark:text-white">
            <ShieldCheck className="h-4 w-4" />
            <span>Academic Data Integrity Guarantee</span>
          </div>
          <p className="text-[11px] font-sans text-zinc-600 dark:text-zinc-400 leading-relaxed">
            WriteWise never sends raw participant survey rows or identifiable dataset rows to any LLM. Only aggregated, Python-computed statistical summary metrics (means, standard deviations, F-statistics, r-coefficients) are provided to the model strictly for Chapter 4 & 5 academic prose formulation.
          </p>
        </div>

      </div>
    </HomeLayout>
  );
}
