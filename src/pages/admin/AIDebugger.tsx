import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bug, Search, Zap, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ReactMarkdown from "react-markdown";

export default function AIDebugger() {
  const [analysisType, setAnalysisType] = useState<string>("full_scan");
  const [customQuery, setCustomQuery] = useState("");
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const gatherContext = async () => {
    const context: any = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Try to gather console logs from performance
    try {
      const perfEntries = performance.getEntriesByType("navigation");
      context.performance = perfEntries;
    } catch (e) {
      console.error("Could not gather performance data:", e);
    }

    return context;
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysis("");

    try {
      const context = await gatherContext();
      
      if (analysisType === "custom" && customQuery) {
        context.query = customQuery;
      }

      const { data, error } = await supabase.functions.invoke("ai-code-analyzer", {
        body: {
          analysisType,
          context,
        },
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Analysis Failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "AI has finished analyzing your application",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to run analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">AI Code Analyzer & Debugger</h1>
        <p className="text-muted-foreground">
          AI-powered tool to find bugs, diagnose issues, and suggest fixes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analysis Configuration</CardTitle>
          <CardDescription>
            Select the type of analysis you want to perform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Analysis Type</label>
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_scan">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Full Application Scan
                  </div>
                </SelectItem>
                <SelectItem value="error_diagnosis">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4" />
                    Error Diagnosis
                  </div>
                </SelectItem>
                <SelectItem value="missing_features">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Find Missing Features
                  </div>
                </SelectItem>
                <SelectItem value="custom">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Custom Query
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {analysisType === "custom" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Query</label>
              <Textarea
                placeholder="Describe what you want the AI to analyze..."
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                rows={4}
              />
            </div>
          )}

          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing || (analysisType === "custom" && !customQuery)}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Run Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isAnalyzing && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            AI is analyzing your application. This may take a minute...
          </AlertDescription>
        </Alert>
      )}

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Review the findings and suggested fixes below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
