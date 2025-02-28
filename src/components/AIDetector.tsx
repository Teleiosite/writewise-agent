
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle, CheckCircle, AlertCircle, Copy, FileUp, Loader2 } from "lucide-react";

export function AIDetector() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    aiProbability: number;
    confidence: number;
    explanation: string;
  } | null>(null);
  const { toast } = useToast();

  const analyzeText = async () => {
    if (text.trim().length < 50) {
      toast({
        title: "Text too short",
        description: "Please enter at least 50 characters for accurate analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // In a real app, this would call an AI service API
      // For demo purposes, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate random result for demo
      const aiProbability = Math.random() * 100;
      
      setResult({
        aiProbability,
        confidence: 75 + Math.random() * 20, // High confidence between 75-95%
        explanation: aiProbability > 70 
          ? "This text shows multiple indicators of AI generation, including unnatural phrasing, consistent tone throughout, and lack of personal perspective."
          : "This text appears to be mostly human-written, with natural language patterns, varied sentence structures, and authentic expression of ideas."
      });
      
      toast({
        title: "Analysis complete",
        description: "Text has been analyzed for AI detection.",
      });
    } catch (error) {
      console.error('Error analyzing text:', error);
      toast({
        title: "Analysis failed",
        description: "An error occurred while analyzing the text.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyResult = () => {
    if (!result) return;
    
    const resultText = `
AI Detection Result:
AI Probability: ${result.aiProbability.toFixed(1)}%
Confidence: ${result.confidence.toFixed(1)}%
Analysis: ${result.explanation}
    `.trim();
    
    navigator.clipboard.writeText(resultText);
    
    toast({
      title: "Copied to clipboard",
      description: "The analysis result has been copied to your clipboard.",
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
      setText(content);
    };
    reader.readAsText(file);
  };

  const renderResultIndicator = () => {
    if (!result) return null;
    
    if (result.aiProbability > 70) {
      return (
        <div className="flex items-center p-3 bg-red-50 rounded-md text-red-800 border border-red-200 mb-4 animate-fade-in">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
          <span className="font-medium">High probability of AI-generated content</span>
        </div>
      );
    } else if (result.aiProbability > 30) {
      return (
        <div className="flex items-center p-3 bg-amber-50 rounded-md text-amber-800 border border-amber-200 mb-4 animate-fade-in">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
          <span className="font-medium">Moderate probability of AI-generated content</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center p-3 bg-green-50 rounded-md text-green-800 border border-green-200 mb-4 animate-fade-in">
          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
          <span className="font-medium">Likely human-written content</span>
        </div>
      );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="animate-fadeIn">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              AI Content Detector
            </CardTitle>
            <CardDescription>
              Analyze text to determine if it was likely created by AI. Useful for educators, reviewers, and content verifiers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste text to analyze for AI detection (minimum 50 characters for accurate results)..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px]"
            />
            
            <div className="flex flex-col sm:flex-row gap-2 justify-between">
              <div className="flex gap-2">
                <Button 
                  onClick={analyzeText} 
                  disabled={isAnalyzing || text.trim().length < 50}
                  className="w-full sm:w-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Text"
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setText("")}
                  disabled={isAnalyzing || text.trim().length === 0}
                  className="w-full sm:w-auto"
                >
                  Clear
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
            
            {result && (
              <div className="mt-6 space-y-4 animate-fade-in">
                {renderResultIndicator()}
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">AI Probability</span>
                      <span className="text-sm font-medium">{result.aiProbability.toFixed(1)}%</span>
                    </div>
                    <Progress value={result.aiProbability} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Confidence Score</span>
                      <span className="text-sm font-medium">{result.confidence.toFixed(1)}%</span>
                    </div>
                    <Progress value={result.confidence} className="h-2" />
                  </div>
                </div>
                
                <Card className="p-4 bg-gray-50 border-gray-200">
                  <h3 className="font-medium mb-2">Analysis</h3>
                  <p className="text-sm text-gray-700">{result.explanation}</p>
                </Card>
                
                <div className="flex justify-end">
                  <Button variant="outline" onClick={handleCopyResult}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Results
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-1">
        <Card className="animate-fadeIn">
          <CardHeader>
            <CardTitle className="text-lg">About AI Detection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">How it Works</h3>
              <p className="text-sm text-gray-600">
                Our AI detector analyzes text patterns, word choice, consistency, and stylistic elements 
                to determine the probability that content was generated by AI like ChatGPT, Bard, or Claude.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Accuracy Limitations</h3>
              <p className="text-sm text-gray-600">
                Detection is not 100% accurate. Results should be considered as a probability rather than a 
                definitive assessment. Shorter texts and heavily edited AI content may be harder to detect.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Use Cases</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
                <li>Educators verifying student work</li>
                <li>Publishers screening submissions</li>
                <li>Researchers validating content authenticity</li>
                <li>Content managers ensuring original material</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> For best results, analyze text segments of at least 150-200 words. 
                The longer the text, the more accurate the detection.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
