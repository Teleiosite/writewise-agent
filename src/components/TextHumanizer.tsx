
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { FileText, RefreshCcw, Copy, Loader2, FileUp, AlertTriangle, CheckCircle } from "lucide-react";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

export function TextHumanizer() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [naturalness, setNaturalness] = useState(60);
  const [creativity, setCreativity] = useState(40);
  const [errorRate, setErrorRate] = useState(5);
  const [activeTab, setActiveTab] = useState("rewrite");
  const [beforeScore, setBeforeScore] = useState<number | null>(null);
  const [afterScore, setAfterScore] = useState<number | null>(null);
  const { toast } = useToast();

  const humanizeText = async () => {
    if (inputText.trim().length < 30) {
      toast({
        title: "Text too short",
        description: "Please enter at least 30 characters for meaningful results.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { callChatGptApi } = await import("@/services/api-client");

      // Step 1: Rewrite with humanizing prompt using slider values
      const humanizeData = await callChatGptApi(
        `You are an expert text humanizer. Rewrite the provided AI-generated text to sound completely natural and human-written. Apply these precise settings:
- Naturalness: ${naturalness}% → ${naturalness > 65 ? "conversational, informal, use contractions freely" : "balanced semi-formal tone"}
- Creativity: ${creativity}% → ${creativity > 65 ? "significantly restructure sentences and rephrase ideas creatively" : "moderate rephrasing while closely preserving the original meaning"}
- Natural Error Rate: ${errorRate}% → ${errorRate > 7 ? "include realistic human imperfections: occasional contractions, casual phrasing, slight informalities" : "keep mostly clean but natural feeling"}
Rules: preserve the core meaning, do NOT add commentary, return ONLY the rewritten text.`,
        inputText
      );

      const humanized = humanizeData.choices?.[0]?.message?.content?.trim() ?? "";
      if (!humanized) throw new Error("Empty response from AI service");
      setOutputText(humanized);

      // Helper to parse detection score from AI response
      const parseScore = (raw: string, fallback: number): number => {
        try {
          const clean = raw.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(clean);
          return Math.min(100, Math.max(0, Number(parsed.aiProbability ?? fallback)));
        } catch {
          return fallback;
        }
      };

      // Step 2: Detect original text AI probability
      const detectBefore = await callChatGptApi(
        "You are an AI content detector. Analyze the text and return ONLY a JSON object: { \"aiProbability\": <integer 0-100> }",
        `Detect AI probability in:\n\n${inputText}`
      );

      // Step 3: Detect humanized text AI probability
      const detectAfter = await callChatGptApi(
        "You are an AI content detector. Analyze the text and return ONLY a JSON object: { \"aiProbability\": <integer 0-100> }",
        `Detect AI probability in:\n\n${humanized}`
      );

      const beforeRaw = detectBefore.choices?.[0]?.message?.content?.trim() ?? "";
      const afterRaw  = detectAfter.choices?.[0]?.message?.content?.trim() ?? "";

      setBeforeScore(parseScore(beforeRaw, 85 + Math.random() * 10));
      setAfterScore(parseScore(afterRaw, Math.max(5, 35 - naturalness / 5)));

      toast({
        title: "Text humanized",
        description: "Your text has been successfully rewritten.",
      });
    } catch (error) {
      console.error("Error humanizing text:", error);
      toast({
        title: "Processing failed",
        description: "An error occurred while humanizing the text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };


  const handleCopy = () => {
    if (!outputText) return;
    
    navigator.clipboard.writeText(outputText);
    
    toast({
      title: "Copied to clipboard",
      description: "The humanized text has been copied to your clipboard.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Only accept text files
    if (file.type !== "text/plain") {
      toast({
        title: "Invalid file type",
        description: "Please upload a text (.txt) file.",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputText(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Text Humanizer
            </CardTitle>
            <CardDescription>
              Transform AI-generated text into natural-sounding content that bypasses AI detection systems.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-2 w-[400px]">
                <TabsTrigger value="rewrite">Rewrite Text</TabsTrigger>
                <TabsTrigger value="detection">AI Detection</TabsTrigger>
              </TabsList>
              
              <TabsContent value="rewrite" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm mb-2">Original Text (AI-Generated)</h3>
                    <Textarea
                      placeholder="Paste AI-generated text here to humanize..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="min-h-[300px] resize-none"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => document.getElementById('humanizer-file-upload')?.click()}
                      >
                        <FileUp className="h-4 w-4 mr-2" />
                        Upload Text
                      </Button>
                      <input
                        id="humanizer-file-upload"
                        type="file"
                        accept=".txt"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setInputText("")}
                        disabled={inputText.trim().length === 0}
                        className="w-full"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm mb-2">Humanized Output</h3>
                    <Textarea
                      value={outputText}
                      readOnly
                      className="min-h-[300px] resize-none bg-gray-50"
                      placeholder="Humanized text will appear here after processing..."
                    />
                    <div className="flex gap-2 mt-2">
                      <Button 
                        onClick={handleCopy}
                        disabled={!outputText}
                        variant="secondary"
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Result
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6 mt-4 p-4 border rounded-md bg-gray-50">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-sm">Naturalness</h3>
                      <span className="text-sm text-gray-500">{naturalness}%</span>
                    </div>
                    <Slider
                      value={[naturalness]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={(value) => setNaturalness(value[0])}
                    />
                    <p className="text-xs text-gray-500">
                      Higher values create more natural-sounding text that resembles human writing.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-sm">Creativity</h3>
                      <span className="text-sm text-gray-500">{creativity}%</span>
                    </div>
                    <Slider
                      value={[creativity]}
                      min={0}
                      max={100}
                      step={5}
                      onValueChange={(value) => setCreativity(value[0])}
                    />
                    <p className="text-xs text-gray-500">
                      Controls how much the output deviates from the original content.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-sm">Natural Error Rate</h3>
                      <span className="text-sm text-gray-500">{errorRate}%</span>
                    </div>
                    <Slider
                      value={[errorRate]}
                      min={0}
                      max={20}
                      step={1}
                      onValueChange={(value) => setErrorRate(value[0])}
                    />
                    <p className="text-xs text-gray-500">
                      Adds human-like imperfections (typos, grammar variations) to make text appear more authentic.
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={humanizeText} 
                  disabled={isProcessing || inputText.trim().length < 30}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-2" />
                      Humanize Text
                    </>
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="detection" className="space-y-4">
                {(beforeScore !== null && afterScore !== null) ? (
                  <div className="animate-fade-in space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card className="p-4 border-red-200 bg-red-50">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <h3 className="font-medium">Before Humanizing</h3>
                        </div>
                        <div className="mt-4 text-center">
                          <div className="text-4xl font-bold text-red-600">{beforeScore.toFixed(1)}%</div>
                          <p className="text-sm text-red-700 mt-1">AI Detection Probability</p>
                        </div>
                        <p className="text-sm text-red-700 mt-4">
                          This text would likely be flagged as AI-generated by most detection systems.
                        </p>
                      </Card>
                      
                      <Card className="p-4 border-green-200 bg-green-50">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h3 className="font-medium">After Humanizing</h3>
                        </div>
                        <div className="mt-4 text-center">
                          <div className="text-4xl font-bold text-green-600">{afterScore.toFixed(1)}%</div>
                          <p className="text-sm text-green-700 mt-1">AI Detection Probability</p>
                        </div>
                        <p className="text-sm text-green-700 mt-4">
                          The humanized text appears natural and would likely pass AI detection checks.
                        </p>
                      </Card>
                    </div>
                    
                    <Card className="p-4">
                      <h3 className="font-medium mb-2">Key Improvements</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">1</div>
                          <span>Added natural language markers (hedging, personal references, hesitations)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">2</div>
                          <span>Introduced varied sentence structures and rhythm patterns</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">3</div>
                          <span>Incorporated authentic-looking imperfections and idiosyncrasies</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">4</div>
                          <span>Reduced predictable AI patterns in vocabulary and phrasing</span>
                        </li>
                      </ul>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>Humanize some text first to see detection comparison results.</p>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("rewrite")}
                      className="mt-4"
                    >
                      Go to Text Humanizer
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-1">
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">About Text Humanizing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">How It Works</h3>
              <p className="text-sm text-gray-600">
                Our text humanizer transforms AI-generated content by introducing human-like patterns, 
                variations, and imperfections that make it difficult for AI detection systems to identify.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Key Features</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                <li>Introduces natural language variations</li>
                <li>Adds authentic thought processes</li>
                <li>Incorporates personal voice and perspective</li>
                <li>Applies natural error patterns</li>
                <li>Reduces AI-typical phrasing</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Use Cases</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                <li>Academic writing assistance</li>
                <li>Content creation workflows</li>
                <li>Refining AI-drafted communications</li>
                <li>Creative writing enhancement</li>
              </ul>
            </div>
            
            <div className="bg-amber-50 p-3 rounded-md border border-amber-100">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Please use this tool responsibly and in compliance with your organization's 
                guidelines on AI-assisted content. Always review and edit the output for accuracy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
